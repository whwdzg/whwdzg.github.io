/**
 * 页眉 / Header.
 *
 * - 固定顶部，Mica / Acrylic 半透明表面；
 * - 桌面端与窄屏都通过侧栏导航，页眉只保留品牌与工具；
 * - 支持全屏闲置自动收起（可在设置中关闭或扩展为滚动收起）；
 * - 底部细线显示阅读进度，可在设置中关闭。
 */
import { useEffect, useState } from 'react';
import { Link, useRouter } from '../../lib/router';
import { routeMeta } from '../../lib/routes';
import { useUi } from '../../hooks/useUi';
import { useSettings } from '../../hooks/useSettings';
import { usePageProgress } from '../../hooks/usePageProgress';
import { useHeaderAutoHide } from '../../hooks/useHeaderAutoHide';
import { FluentIcon } from '../common/FluentIcon';
import { IconButton } from '../common/Button';
import { UserMenu } from './UserMenu';
import { SITE } from '../../data/site';

interface HeaderProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function Header({ isFullscreen, onToggleFullscreen }: HeaderProps) {
  const { path } = useRouter();
  const { sidebarOpen, settingsOpen, searchOpen, toggleSidebar, openSettings, openSearch } = useUi();
  const { settings } = useSettings();
  const progress = usePageProgress(settings.pageProgress);
  const meta = routeMeta(path);
  const [menuOpen, setMenuOpen] = useState(false);

  const blocked = sidebarOpen || settingsOpen || searchOpen || menuOpen;
  const { hidden, reveal } = useHeaderAutoHide({
    mode: settings.headerAutoHide,
    isFullscreen,
    blocked,
  });

  useEffect(() => {
    document.documentElement.dataset.headerHidden = hidden ? 'true' : 'false';
    return () => {
      document.documentElement.dataset.headerHidden = 'false';
    };
  }, [hidden]);

  return (
    <>
      <header className="site-header" data-hidden={hidden || undefined}>
        <div className="site-header__inner">
          <div className="site-header__left">
            <IconButton
              label={sidebarOpen ? '收起侧边栏' : '展开侧边栏'}
              className="header-nav-toggle"
              onClick={toggleSidebar}
              aria-expanded={sidebarOpen}
              aria-controls="site-sidebar"
            >
              <FluentIcon name="menu" size={20} aria-hidden />
            </IconButton>

            <Link to="/" className="brand" aria-label={`${SITE.name} 主页`}>
              <img className="brand__logo" src="/icons/logo-32.png" alt="" width={28} height={28} />
              <span className="brand__text">
                <span className="brand__name">{SITE.name}</span>
                <span className="brand__divider" aria-hidden>
                  /
                </span>
                <span className="brand__page">{meta?.shortTitle ?? '404'}</span>
              </span>
            </Link>
          </div>

          <div className="site-header__actions">
            <button
              type="button"
              className="header-search"
              onClick={openSearch}
              aria-label="搜索站点（Ctrl+K）"
              aria-keyshortcuts="Control+K Meta+K"
            >
              <FluentIcon name="search" size={18} aria-hidden />
              <span className="header-search__placeholder">搜索</span>
              <kbd className="header-search__kbd">Ctrl K</kbd>
            </button>

            <IconButton
              label={isFullscreen ? '退出全屏' : '进入全屏（页眉会自动收起）'}
              onClick={onToggleFullscreen}
              className="header-fullscreen"
            >
              <FluentIcon name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'} size={20} aria-hidden />
            </IconButton>

            <IconButton label="设置" onClick={openSettings} className="header-settings">
              <FluentIcon name="settings" size={20} aria-hidden />
            </IconButton>

            <UserMenu onOpenChange={setMenuOpen} />
          </div>
        </div>

        {settings.pageProgress && (
          <div className="header-progress" aria-hidden>
            <span style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
        )}
      </header>

      {/* 页眉收起时，在屏幕顶部保留一条 8px 的感应区 */}
      {hidden && <div className="header-sensor" onPointerEnter={reveal} aria-hidden />}
    </>
  );
}
