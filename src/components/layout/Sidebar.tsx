/**
 * 侧边栏 / Floating rectangular sidebar.
 *
 * 设计要求：
 * - 直角矩形，不使用圆角卡片式外观；
 * - 收起时完全移出视口，不保留窄条或图标轨；
 * - 展开时以浮层覆盖内容（不挤压页面），点击遮罩 / 空白 / Esc 收起；
 * - 桌面默认展开，窄屏默认收起；路由切换后自动收起。
 *
 * 结构上是一个 modal 式抽屉：使用焦点陷阱与滚动锁，保证键盘用户不会
 * 把焦点移到背后的页面。
 */
import { useEffect, useRef, useState } from 'react';
import {
  DismissRegular,
  OpenRegular,
  ArrowClockwiseRegular,
  SettingsRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from '@fluentui/react-icons';
import { Link, useRouter } from '../../lib/router';
import { useUi } from '../../hooks/useUi';
import { useSettings } from '../../hooks/useSettings';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { useToast } from '../../hooks/useToast';
import { ARCHIVE_LINKS, LINKS, PRIMARY_NAV, PROJECTS, SITE, SUBSITES } from '../../data/site';
import { TOOLS } from '../../data/tools';
import { COLUMNS } from '../../data/columns';
import { siteMeta } from '../../lib/meta';
import { FluentIcon } from '../common/FluentIcon';

const GROUPS = [
  { id: 'bilibili', label: '哔哩哔哩', icon: 'tv' },
  { id: 'projects', label: '项目', icon: 'rocket' },
  { id: 'columns', label: '专栏', icon: 'document' },
  { id: 'subsites', label: '子站', icon: 'globe' },
  { id: 'tools', label: '工具', icon: 'code' },
  { id: 'archive', label: '归档', icon: 'history' },
  { id: 'external', label: '外部链接', icon: 'globe' },
] as const;

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, openSettings } = useUi();
  const { path } = useRouter();
  const { resolvedTheme, update } = useSettings();
  const { toast } = useToast();
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const ref = useRef<HTMLElement>(null);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['bilibili', 'projects', 'columns', 'subsites', 'tools']));

  const close = () => setSidebarOpen(false);
  useFocusTrap(ref, sidebarOpen, close);
  useLockBodyScroll(sidebarOpen);

  useEffect(() => {
    const node = ref.current;
    if (node) node.inert = !sidebarOpen;
  }, [sidebarOpen]);

  const toggleGroup = (id: string) => {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const install = async () => {
    const result = await promptInstall();
    if (result === 'accepted') toast('已开始安装本站', 'success');
    else if (result === 'unavailable') toast('当前浏览器没有提供安装入口，可在设置中查看说明', 'info');
  };

  return (
    <div className="sidebar-layer" data-open={sidebarOpen || undefined}>
      <div className="sidebar-scrim" onClick={close} aria-hidden />
      <aside
        id="site-sidebar"
        ref={ref}
        className="sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="站点导航"
        aria-hidden={!sidebarOpen}
        tabIndex={-1}
      >
        <div className="sidebar__brand">
          <Link to="/" className="sidebar__brand-link" onNavigate={close}>
            <img src="/icons/logo-192.png" alt="" width={32} height={32} />
            <span>
              <strong>水鱼 Blog</strong>
              <small>whwdzg.github.io</small>
            </span>
          </Link>
          <button className="icon-btn" type="button" aria-label="收起侧边栏" onClick={close}>
            <DismissRegular aria-hidden />
          </button>
        </div>

        <div className="sidebar__scroll">
          <section className="sidebar-user" aria-label="站点作者">
            <img src={SITE.avatar} alt={SITE.avatarAlt} width={48} height={48} />
            <div className="sidebar-user__text">
              <p className="sidebar-user__name">{SITE.name}</p>
              <p className="sidebar-user__handle">@{SITE.handle}</p>
            </div>
            <div className="sidebar-user__links">
              <a href={LINKS.bilibili} target="_blank" rel="noopener noreferrer" aria-label="哔哩哔哩空间" title="哔哩哔哩空间">
                <FluentIcon name="tv" size={17} aria-hidden />
              </a>
              <a href={LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
                <FluentIcon name="github" size={17} aria-hidden />
              </a>
              <a href={LINKS.modrinth} target="_blank" rel="noopener noreferrer" aria-label="Modrinth" title="Modrinth">
                <FluentIcon name="globe" size={17} aria-hidden />
              </a>
            </div>
          </section>

          <nav className="sidebar-nav" aria-label="主导航">
            <p className="sidebar-nav__title">站点</p>
            <ul className="sidebar-nav__list">
              {PRIMARY_NAV.map((item) => {
                const active = path === item.to || (item.to === '/bilibili/' && path.startsWith('/bilibili/'));
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`sidebar-nav__item ${active ? 'is-active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                      onNavigate={close}
                    >
                      <FluentIcon name={item.icon} size={19} aria-hidden />
                      <span className="sidebar-nav__label">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="sidebar-groups">
            {GROUPS.map((group) => {
              const open = openGroups.has(group.id);
              return (
                <section className="sidebar-group" key={group.id}>
                  <button
                    type="button"
                    className="sidebar-group__toggle"
                    aria-expanded={open}
                    aria-controls={`sidebar-group-${group.id}`}
                    onClick={() => toggleGroup(group.id)}
                  >
                    <FluentIcon name={group.icon} size={18} aria-hidden />
                    <span>{group.label}</span>
                    <FluentIcon name="chevron" size={16} className="sidebar-group__chevron" aria-hidden />
                  </button>
                  <div
                    id={`sidebar-group-${group.id}`}
                    className="sidebar-group__panel"
                    data-open={open || undefined}
                  >
                    <ul>
                      {group.id === 'bilibili' && (
                        <>
                          <li><Link to="/bilibili/" className="sidebar-group__link" onNavigate={close}><FluentIcon name="person" size={18} aria-hidden /><span>个人主页</span><FluentIcon name="right" size={13} className="sidebar-group__external" aria-hidden /></Link></li>
                          <li><Link to="/bilibili/videos/" className="sidebar-group__link" onNavigate={close}><FluentIcon name="play" size={18} aria-hidden /><span>视频</span><FluentIcon name="right" size={13} className="sidebar-group__external" aria-hidden /></Link></li>
                          <li><Link to="/bilibili/dynamics/" className="sidebar-group__link" onNavigate={close}><FluentIcon name="comment" size={18} aria-hidden /><span>动态</span><FluentIcon name="right" size={13} className="sidebar-group__external" aria-hidden /></Link></li>
                          <li><Link to="/bilibili/columns/" className="sidebar-group__link" onNavigate={close}><FluentIcon name="document" size={18} aria-hidden /><span>专栏</span><FluentIcon name="right" size={13} className="sidebar-group__external" aria-hidden /></Link></li>
                        </>
                      )}
                      {group.id === 'columns' && (
                        <>
                          <li>
                            <Link to="/columns/" className="sidebar-group__link" onNavigate={close}>
                              <FluentIcon name="document" size={18} aria-hidden />
                              <span>全部专栏</span>
                              <FluentIcon name="right" size={13} className="sidebar-group__external" aria-hidden />
                            </Link>
                          </li>
                          {COLUMNS.map((column) => (
                            <li key={column.slug}>
                              <Link to={`/columns/${column.slug}/`} className="sidebar-group__link" onNavigate={close}>
                                <span className="sidebar-group__number">{column.number}</span>
                                <span>{column.title}</span>
                                <FluentIcon name="right" size={13} className="sidebar-group__external" aria-hidden />
                              </Link>
                            </li>
                          ))}
                        </>
                      )}

                      {group.id === 'projects' &&
                        PROJECTS.map((project) => (
                          <li key={project.id}>
                            <Link
                              to={project.path}
                              className="sidebar-group__link"
                              onNavigate={close}
                            >
                              <img src={project.icon} alt="" width={20} height={20} loading="lazy" />
                              <span>{project.title}</span>
                              <FluentIcon name="right" size={13} className="sidebar-group__external" aria-hidden />
                            </Link>
                          </li>
                        ))}
                      {group.id === 'projects' && (
                        <li>
                          <Link to="/projects/occultation/" className="sidebar-group__link" onNavigate={close}>
                            <FluentIcon name="sparkle" size={18} aria-hidden />
                            <span>掩星</span>
                            <FluentIcon name="right" size={13} className="sidebar-group__external" aria-hidden />
                          </Link>
                        </li>
                      )}
                      {group.id === 'projects' && (
                        <li>
                          <Link
                            to="/projects/modrinth/"
                            className="sidebar-group__link sidebar-group__link--more"
                            onNavigate={close}
                          >
                            <FluentIcon name="rocket" size={18} aria-hidden />
                            <span>Modrinth 项目页</span>
                            <FluentIcon name="right" size={13} className="sidebar-group__external" aria-hidden />
                          </Link>
                        </li>
                      )}

                      {group.id === 'subsites' &&
                        SUBSITES.map((site) => (
                          <li key={site.id}>
                            <Link to={site.path} className="sidebar-group__link" onNavigate={close}>
                              <img src={site.icon} alt="" width={20} height={20} loading="lazy" />
                              <span>{site.title}</span>
                              <FluentIcon name="right" size={13} className="sidebar-group__external" aria-hidden />
                            </Link>
                          </li>
                        ))}
                      {group.id === 'projects' && (
                        <li>
                          <Link to="/projects/github/" className="sidebar-group__link sidebar-group__link--more" onNavigate={close}>
                            <FluentIcon name="github" size={18} aria-hidden />
                            <span>GitHub 项目页</span>
                            <FluentIcon name="right" size={13} className="sidebar-group__external" aria-hidden />
                          </Link>
                        </li>
                      )}

                      {group.id === 'tools' &&
                        TOOLS.map((tool) => (
                          <li key={tool.id}>
                            <Link to={tool.path} className="sidebar-group__link" onNavigate={close}>
                              <FluentIcon name={tool.icon} size={18} aria-hidden />
                              <span>{tool.title}</span>
                              <FluentIcon name="right" size={13} className="sidebar-group__external" aria-hidden />
                            </Link>
                          </li>
                        ))}

                      {group.id === 'archive' &&
                        ARCHIVE_LINKS.map((link) => (
                          <li key={link.href}>
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="sidebar-group__link"
                              title={link.description}
                            >
                              <FluentIcon name="document" size={18} aria-hidden />
                              <span>{link.label}</span>
                              <OpenRegular className="sidebar-group__external" aria-hidden />
                            </a>
                          </li>
                        ))}

                      {group.id === 'external' && (
                        <>
                          <li>
                            <a href={LINKS.bilibili} target="_blank" rel="noopener noreferrer" className="sidebar-group__link">
                              <FluentIcon name="tv" size={18} aria-hidden />
                              <span>哔哩哔哩空间</span>
                              <OpenRegular className="sidebar-group__external" aria-hidden />
                            </a>
                          </li>
                          <li>
                            <a href={LINKS.wiki} target="_blank" rel="noopener noreferrer" className="sidebar-group__link">
                              <FluentIcon name="globe" size={18} aria-hidden />
                              <span>来福 Simulation Wiki</span>
                              <OpenRegular className="sidebar-group__external" aria-hidden />
                            </a>
                          </li>
                          <li>
                            <a href={LINKS.mcmod} target="_blank" rel="noopener noreferrer" className="sidebar-group__link">
                              <FluentIcon name="shield" size={18} aria-hidden />
                              <span>MCMOD 主页</span>
                              <OpenRegular className="sidebar-group__external" aria-hidden />
                            </a>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <div className="sidebar__foot">
          <div className="sidebar-quick">
            <button
              type="button"
              className="sidebar-quick__btn"
              onClick={() => update({ theme: resolvedTheme === 'dark' ? 'light' : 'dark' })}
              title={resolvedTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            >
              {resolvedTheme === 'dark' ? <WeatherSunnyRegular aria-hidden /> : <WeatherMoonRegular aria-hidden />}
              <span>{resolvedTheme === 'dark' ? '浅色' : '深色'}</span>
            </button>
            <button type="button" className="sidebar-quick__btn" onClick={openSettings} title="打开设置">
              <SettingsRegular aria-hidden />
              <span>设置</span>
            </button>
            {canInstall && !installed && (
              <button type="button" className="sidebar-quick__btn" onClick={install} title="安装为应用">
                <ArrowClockwiseRegular aria-hidden />
                <span>安装</span>
              </button>
            )}
          </div>
          <div className="sidebar__meta">
            <span>v{siteMeta.version}</span>
            <span className="dot-sep" aria-hidden />
            <span>{siteMeta.commitShort || 'dev'}</span>
            <a href={LINKS.repo} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

