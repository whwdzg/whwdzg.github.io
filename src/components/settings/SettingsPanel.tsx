/**
 * 设置面板 / Settings surface.
 *
 * 四个分区：
 * - 外观：主题、主题色、液态玻璃、壁纸、进度条、粒子、动效、页眉自动收起
 * - 性能：一键性能模式、PWA 安装、存储占用、缓存清理
 * - 数据：导出 / 导入设置、重置、清缓存
 * - 关于：版本、提交、浏览器 UA、当前时间
 *
 * 所有改动即时生效并写入 localStorage；关闭面板不需要“保存”。
 */
import { useEffect, useState } from 'react';
import {
  ArrowClockwiseRegular,
  CheckmarkRegular,
  CopyRegular,
  InfoRegular,
  OpenRegular,
  SettingsRegular,
  SparkleRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
  DatabaseRegular,
  RocketRegular,
  ColorRegular,
} from '@fluentui/react-icons';
import { Sheet } from '../common/Sheet';
import { Switch } from '../common/Switch';
import { Segmented } from '../common/Segmented';
import { FluentIcon } from '../common/FluentIcon';
import { Button, IconButton } from '../common/Button';
import { useUi } from '../../hooks/useUi';
import { useSettings } from '../../hooks/useSettings';
import { useToast } from '../../hooks/useToast';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { ACCENT_PRESETS, contrastInk, normalizeHex, sanitizeSettings, type HeaderAutoHide, type MotionMode, type ParticleKind, type ThemeMode } from '../../lib/settings';
import { WALLPAPERS, dayIndex, type WallpaperId } from '../../lib/wallpaper';
import { copyText } from '../../lib/clipboard';
import { formatBytes, formatDateTime, relativeTime, truncateMiddle } from '../../lib/format';
import { siteMeta } from '../../lib/meta';
import { LINKS } from '../../data/site';

type Tab = 'appearance' | 'performance' | 'data' | 'about';

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: 'appearance', label: '外观', icon: <ColorRegular aria-hidden /> },
  { id: 'performance', label: '性能', icon: <RocketRegular aria-hidden /> },
  { id: 'data', label: '数据', icon: <DatabaseRegular aria-hidden /> },
  { id: 'about', label: '关于', icon: <InfoRegular aria-hidden /> },
];

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string; icon: React.ReactNode }> = [
  { value: 'system', label: '跟随系统', icon: <SettingsRegular aria-hidden /> },
  { value: 'light', label: '浅色', icon: <WeatherSunnyRegular aria-hidden /> },
  { value: 'dark', label: '深色', icon: <WeatherMoonRegular aria-hidden /> },
];

const PARTICLES: Array<{ value: ParticleKind; label: string }> = [
  { value: 'off', label: '关闭' },
  { value: 'season', label: '跟随季节' },
  { value: 'sakura', label: '樱花' },
  { value: 'summer', label: '夏日' },
  { value: 'wutong', label: '梧桐' },
  { value: 'ginkgo', label: '银杏' },
  { value: 'snow', label: '雪花' },
];

const MOTIONS: Array<{ value: MotionMode; label: string }> = [
  { value: 'system', label: '跟随系统' },
  { value: 'reduced', label: '减少动画' },
  { value: 'full', label: '完整动画' },
];

const HEADER_OPTIONS: Array<{ value: HeaderAutoHide; label: string; hint: string }> = [
  { value: 'off', label: '关闭', hint: '页眉始终展开' },
  { value: 'fullscreen', label: '仅全屏', hint: '全屏闲置时自动收起（默认）' },
  { value: 'scroll', label: '全屏与滚动', hint: '全屏闲置或向下滚动时收起' },
];

export function SettingsPanel() {
  const { settingsOpen, closeSettings, closeAll } = useUi();
  const { settings, resolvedTheme, update, reset } = useSettings();
  const { toast } = useToast();
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const [tab, setTab] = useState<Tab>('appearance');
  const [confirmReset, setConfirmReset] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{ usage?: number; quota?: number; caches?: number }>({});

  useEffect(() => {
    if (settingsOpen) {
      setConfirmReset(false);
      setTab('appearance');
    }
  }, [settingsOpen]);

  useEffect(() => {
    if (tab !== 'performance' || !settingsOpen) return;
    let cancelled = false;
    const run = async () => {
      try {
        const estimate = await navigator.storage?.estimate?.();
        const keys = 'caches' in window ? await caches.keys() : [];
        if (!cancelled) setStorageInfo({ usage: estimate?.usage, quota: estimate?.quota, caches: keys.length });
      } catch {
        if (!cancelled) setStorageInfo({});
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [tab, settingsOpen]);

  const clearCache = async () => {
    try {
      const registrations = await navigator.serviceWorker?.getRegistrations?.();
      await Promise.all((registrations ?? []).map((registration) => registration.unregister()));
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      toast('缓存已清除，正在刷新页面…', 'success');
      window.setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error(error);
      toast('清理缓存失败，请手动刷新', 'error');
    }
  };

  const exportSettings = async () => {
    const ok = await copyText(JSON.stringify(settings, null, 2));
    toast(ok ? '设置 JSON 已复制' : '复制失败', ok ? 'success' : 'error');
  };

  const importSettings = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = JSON.parse(text) as unknown;
      const next = sanitizeSettings(parsed, settings);
      update(next);
      toast('设置已从剪贴板导入', 'success');
    } catch {
      toast('导入失败：剪贴板不是有效的设置 JSON', 'error');
    }
  };

  const resetAll = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      window.setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    reset();
    setConfirmReset(false);
    toast('已恢复默认设置', 'success');
  };

  const performanceMode = () => {
    update({ glass: false, particles: 'off', wallpaper: 'none', pageProgress: false, motion: 'reduced' });
    toast('已切换到性能模式：关闭玻璃、壁纸与粒子', 'success');
  };

  const install = async () => {
    const result = await promptInstall();
    if (result === 'accepted') toast('已开始安装本站', 'success');
    else if (result === 'dismissed') toast('安装已取消', 'info');
    else toast('当前浏览器没有提供安装入口（iOS 请在分享菜单选择“添加到主屏幕”）', 'info');
  };

  const resetWallpaper = () => {
    update({ wallpaperOffset: Math.floor(Math.random() * 997), wallpaperLockedIndex: null });
    toast('壁纸已重新轮换', 'success');
  };

  return (
    <Sheet
      open={settingsOpen}
      onClose={closeSettings}
      title="个性化设置"
      subtitle="所有设置保存在本地，不会上传"
      className="settings-sheet"
      footer={
        <div className="settings-foot">
          <span>
            v{siteMeta.version} · {siteMeta.commitShort || 'dev'}
          </span>
          <span>设置自动保存</span>
        </div>
      }
    >
      <div className="settings-tabs" role="tablist" aria-label="设置分区">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`settings-tab ${tab === item.id ? 'is-active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {tab === 'appearance' && (
        <div className="settings-pane" role="tabpanel" aria-label="外观">
          <section className="settings-section">
            <h3 className="settings-section__title">主题</h3>
            <Segmented value={settings.theme} options={THEME_OPTIONS} onChange={(value) => update({ theme: value })} label="主题模式" />
            <p className="settings-hint">
              当前实际显示：<strong>{resolvedTheme === 'dark' ? '深色' : '浅色'}</strong>
            </p>
          </section>

          <section className="settings-section">
            <h3 className="settings-section__title">主题色</h3>
            <div className="accent-row">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`accent-dot ${settings.accent.toUpperCase() === preset.value ? 'is-active' : ''}`}
                  style={{ background: preset.value, color: contrastInk(preset.value) }}
                  aria-label={`主题色 ${preset.label} ${preset.value}`}
                  aria-pressed={settings.accent.toUpperCase() === preset.value}
                  title={preset.label}
                  onClick={() => update({ accent: preset.value })}
                >
                  {settings.accent.toUpperCase() === preset.value && <CheckmarkRegular aria-hidden />}
                </button>
              ))}
              <label className="accent-custom" title="自定义主题色">
                <input
                  type="color"
                  value={normalizeHex(settings.accent) ?? '#0078D4'}
                  aria-label="自定义主题色"
                  onChange={(event) => {
                    const value = normalizeHex(event.target.value);
                    if (value) update({ accent: value });
                  }}
                />
                <span>{settings.accent}</span>
              </label>
            </div>
            <p className="settings-hint">主题色会同步到按钮、进度条、选中态与链接。</p>
          </section>

          <section className="settings-section">
            <Switch
              checked={settings.glass}
              onChange={(glass) => update({ glass })}
              label="液态玻璃"
              description="在页眉、侧栏、弹窗与卡片上叠加背景模糊与高光；关闭可显著降低 GPU 占用。"
            />
          </section>

          <section className="settings-section">
            <div className="settings-section__head">
              <h3 className="settings-section__title">壁纸</h3>
              <button type="button" className="text-btn" onClick={resetWallpaper}>
                <ArrowClockwiseRegular aria-hidden />
                重置轮换
              </button>
            </div>
            <div className="wallpaper-grid" role="group" aria-label="选择壁纸">
              <button
                type="button"
                className={`wallpaper-option wallpaper-option--auto ${settings.wallpaper === 'auto' ? 'is-active' : ''}`}
                aria-pressed={settings.wallpaper === 'auto'}
                onClick={() => update({ wallpaper: 'auto', wallpaperLockedIndex: null })}
              >
                <span className="wallpaper-option__preview" />
                <span className="wallpaper-option__label">每日轮换</span>
              </button>
              <button
                type="button"
                className={`wallpaper-option wallpaper-option--none ${settings.wallpaper === 'none' ? 'is-active' : ''}`}
                aria-pressed={settings.wallpaper === 'none'}
                onClick={() => update({ wallpaper: 'none' })}
              >
                <span className="wallpaper-option__preview" />
                <span className="wallpaper-option__label">纯色</span>
              </button>
              {WALLPAPERS.map((wallpaper) => (
                <button
                  key={wallpaper.id}
                  type="button"
                  className={`wallpaper-option ${settings.wallpaper === wallpaper.id ? 'is-active' : ''}`}
                  aria-pressed={settings.wallpaper === wallpaper.id}
                  aria-label={wallpaper.label}
                  title={wallpaper.label}
                  onClick={() => update({ wallpaper: wallpaper.id as WallpaperId, wallpaperLockedIndex: null })}
                >
                  <span className="wallpaper-option__preview">
                    <img src={wallpaper.src} alt="" loading="lazy" decoding="async" width={120} height={68} />
                  </span>
                  <span className="wallpaper-option__label">{wallpaper.theme === 'dark' ? '深色' : '浅色'} · {wallpaper.id.split('-')[1]}</span>
                  {settings.wallpaper === wallpaper.id && (
                    <span className="wallpaper-option__check" aria-hidden>
                      <CheckmarkRegular />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="settings-row">
              <Switch
                checked={settings.wallpaperRotation}
                onChange={(wallpaperRotation) =>
                  update(
                    wallpaperRotation
                      ? { wallpaperRotation, wallpaperLockedIndex: null }
                      : {
                          wallpaperRotation,
                          // 关闭轮换时冻结“今天”的那张，而不是回到第一张。
                          wallpaperLockedIndex: dayIndex(new Date(), settings.wallpaperOffset),
                        },
                  )
                }
                label="每日轮换"
                description="关闭后固定当前壁纸；重置轮换会重新抽取。"
              />
            </div>
          </section>

          <section className="settings-section">
            <Switch
              checked={settings.pageProgress}
              onChange={(pageProgress) => update({ pageProgress })}
              label="页眉阅读进度条"
              description="在页眉底部显示当前页面的滚动进度。"
            />
          </section>

          <section className="settings-section">
            <h3 className="settings-section__title">粒子动画</h3>
            <Segmented
              value={settings.particles}
              options={PARTICLES.map((item) => ({ value: item.value, label: item.label }))}
              onChange={(value) => update({ particles: value })}
              label="粒子动画"
            />
            <p className="settings-hint">
              <SparkleRegular aria-hidden /> 默认跟随春夏秋冬切换：春樱花、夏萤火、秋银杏、冬雪花；最多 28 个粒子，页面隐藏或减少动画时自动停止。
            </p>
          </section>

          <section className="settings-section">
            <h3 className="settings-section__title">动效</h3>
            <Segmented value={settings.motion} options={MOTIONS} onChange={(value) => update({ motion: value })} label="动效偏好" />
            <p className="settings-hint">“减少动画”会关闭滚动揭示、轮播自动播放与粒子动画。</p>
          </section>

          <section className="settings-section">
            <h3 className="settings-section__title">页眉自动收起</h3>
            <Segmented
              value={settings.headerAutoHide}
              options={HEADER_OPTIONS.map((item) => ({ value: item.value, label: item.label, hint: item.hint }))}
              onChange={(value) => update({ headerAutoHide: value })}
              label="页眉自动收起"
            />
            <p className="settings-hint">
              默认展开。全屏闲置约 2.6 秒后收起，鼠标移向屏幕顶部或键盘操作会立即恢复；选择“全屏与滚动”还会在向下滚动时收起。
            </p>
          </section>
        </div>
      )}

      {tab === 'performance' && (
        <div className="settings-pane" role="tabpanel" aria-label="性能">
          <section className="settings-section settings-callout">
            <h3 className="settings-section__title">性能模式</h3>
            <p className="settings-hint">
              一键关闭液态玻璃、壁纸、粒子与进度条，并减少动画。适合低配设备、远程桌面或省电模式。
            </p>
            <Button variant="primary" icon={<RocketRegular aria-hidden />} onClick={performanceMode}>
              启用性能模式
            </Button>
          </section>

          <section className="settings-section">
            <h3 className="settings-section__title">安装为应用</h3>
            <p className="settings-hint">
              {installed
                ? '本站已以独立应用方式运行。'
                : canInstall
                  ? '当前浏览器支持一键安装；安装后可离线打开已访问过的页面。'
                  : '当前浏览器没有提供安装入口。iOS Safari 可在分享菜单选择“添加到主屏幕”。'}
            </p>
            <Button
              variant="secondary"
              icon={<FluentIcon name="install" size={18} aria-hidden />}
              onClick={install}
              disabled={!canInstall && !installed}
            >
              {installed ? '已安装' : '安装本站'}
            </Button>
          </section>

          <section className="settings-section">
            <h3 className="settings-section__title">存储与缓存</h3>
            <dl className="settings-stats">
              <div>
                <dt>站点缓存</dt>
                <dd>{storageInfo.caches ?? '—'} 个 Cache</dd>
              </div>
              <div>
                <dt>已用空间</dt>
                <dd>{formatBytes(storageInfo.usage)}</dd>
              </div>
              <div>
                <dt>可用配额</dt>
                <dd>{formatBytes(storageInfo.quota)}</dd>
              </div>
            </dl>
            <Button variant="secondary" icon={<ArrowClockwiseRegular aria-hidden />} onClick={clearCache}>
              清除缓存并刷新
            </Button>
          </section>

          <section className="settings-section">
            <h3 className="settings-section__title">加载策略</h3>
            <ul className="settings-list">
              <li>页面按路由拆分，首页不加载哔哩哔哩数据与详情弹窗。</li>
              <li>封面统一 640×360 WebP，`loading="lazy"` + 固定宽高避免跳动。</li>
              <li>壁纸在首屏空闲后解码，不参与 LCP 竞争。</li>
              <li>Service Worker 缓存静态资源；HTML 使用 network-first。</li>
            </ul>
          </section>
        </div>
      )}

      {tab === 'data' && (
        <div className="settings-pane" role="tabpanel" aria-label="数据">
          <section className="settings-section">
            <h3 className="settings-section__title">导出与导入</h3>
            <p className="settings-hint">设置以 JSON 保存在本地，可复制到其他设备或浏览器。</p>
            <div className="settings-actions">
              <Button variant="secondary" icon={<CopyRegular aria-hidden />} onClick={exportSettings}>
                复制设置 JSON
              </Button>
              <Button variant="secondary" icon={<ArrowClockwiseRegular aria-hidden />} onClick={importSettings}>
                从剪贴板导入
              </Button>
            </div>
          </section>

          <section className="settings-section">
            <h3 className="settings-section__title">重置</h3>
            <p className="settings-hint">恢复默认主题、壁纸、粒子与页眉行为。留言草稿不会被删除。</p>
            <Button variant="danger" onClick={resetAll}>
              {confirmReset ? '再次点击确认重置' : '恢复默认设置'}
            </Button>
          </section>

          <section className="settings-section">
            <h3 className="settings-section__title">清除站点缓存</h3>
            <p className="settings-hint">注销 Service Worker、删除 Cache Storage 并重新加载当前页面。</p>
            <Button variant="secondary" icon={<ArrowClockwiseRegular aria-hidden />} onClick={clearCache}>
              清除并刷新
            </Button>
          </section>

          <section className="settings-section">
            <h3 className="settings-section__title">快捷键</h3>
            <ul className="settings-list">
              <li><kbd>Ctrl</kbd> + <kbd>K</kbd> 打开搜索</li>
              <li><kbd>Esc</kbd> 关闭浮层</li>
              <li>侧栏按钮 / 页眉按钮可随时收起浮层</li>
            </ul>
          </section>
        </div>
      )}

      {tab === 'about' && (
        <div className="settings-pane" role="tabpanel" aria-label="关于">
          <section className="settings-section">
            <h3 className="settings-section__title">站点版本</h3>
            <div className="version-block">
              <p className="version-block__number">v{siteMeta.version}</p>
              <p className="version-block__meta">
                提交 {siteMeta.commitShort || 'dev'} · {formatDateTime(siteMeta.commitTime)}
              </p>
              <p className="version-block__meta">构建 {formatDateTime(siteMeta.buildTime)}</p>
            </div>
            <div className="settings-actions">
              <Button variant="primary" icon={<FluentIcon name="info" size={18} aria-hidden />} onClick={() => { closeAll(); window.location.assign('/about/'); }}>
                打开关于页
              </Button>
              <Button variant="secondary" icon={<OpenRegular aria-hidden />} onClick={() => window.open(`${LINKS.repo}/commits/main`, '_blank', 'noopener')}>
                提交历史
              </Button>
            </div>
          </section>

          <AboutRuntimeInfo />
        </div>
      )}
    </Sheet>
  );
}

/** 运行时信息：UA 与实时时钟；独立组件避免每秒重渲染整个设置面板。 */
function AboutRuntimeInfo() {
  const [now, setNow] = useState(() => new Date());
  const { toast } = useToast();
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <section className="settings-section">
        <h3 className="settings-section__title">当前时间</h3>
        <p className="settings-value">
          {now.toLocaleString('zh-CN', { hour12: false })} <span className="settings-muted">({relativeTime(now)})</span>
        </p>
      </section>

      <section className="settings-section">
        <h3 className="settings-section__title">浏览器 UA</h3>
        <p className="settings-value settings-value--mono" title={ua}>
          {truncateMiddle(ua, 96)}
        </p>
        <IconButton
          label="复制 UA"
          size="sm"
          onClick={async () => {
            const ok = await copyText(ua);
            toast(ok ? 'UA 已复制' : '复制失败', ok ? 'success' : 'error');
          }}
        >
          <CopyRegular aria-hidden />
        </IconButton>
      </section>

      <section className="settings-section">
        <h3 className="settings-section__title">许可</h3>
        <p className="settings-hint">
          代码以 GPL-3.0 发布；文字与影像归档以 CC BY-NC-SA 4.0 授权。Fluent 图标来自 Microsoft，MIT。
        </p>
        <div className="settings-actions">
          <a className="text-link" href={LINKS.license} target="_blank" rel="noopener noreferrer">
            GPL-3.0 <OpenRegular aria-hidden />
          </a>
          <a className="text-link" href={LINKS.repo} target="_blank" rel="noopener noreferrer">
            源码 <OpenRegular aria-hidden />
          </a>
        </div>
      </section>
    </>
  );
}

