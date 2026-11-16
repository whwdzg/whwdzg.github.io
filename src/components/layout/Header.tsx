/**
 * 页眉 / Header.
 *
 * - 固定顶部，Mica / Acrylic 半透明表面；
 * - 桌面端提供主页面快捷导航，窄屏交给侧栏；
 * - 支持全屏闲置自动收起（可在设置中关闭或扩展为滚动收起）；
 * - 底部细线显示阅读进度，可在设置中关闭。
 */
import { useCallback, useState } from 'react';
import { Link, useRouter } from '../../lib/router';
import { ROUTES, prefetchRoute, routeMeta } from '../../lib/routes';
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
  const { settings, resolvedTheme, update } = useSettings();
  const progress = usePageProgress(settings.pageProgress);
  const meta = routeMeta(path);
  const [menuOpen, setMenuOpen] = useState(false);

  const blocked = sidebarOpen || settingsOpen || searchOpen || menuOpen;
  const { hidden, reveal } = useHeaderAutoHide({
    mode: settings.headerAutoHide,
    isFullscreen,
    blocked,
  });

  const toggleTheme = useCallback(() => {
    update({ theme: resolvedTheme === 'dark' ? 'light' : 'dark' });
  }, [resolvedTheme, update]);

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
              <img className="brand__logo" src="/icons/logo-192.png" alt="" width={28} height={28} />
              <span className="brand__text">
                <span className="brand__name">{SITE.name}</span>
                <span className="brand__divider" aria-hidden>
                  /
                </span>
                <span className="brand__page">{meta?.shortTitle ?? '404'}</span>
              </span>
            </Link>
          </div>

          <nav className="header-nav" aria-label="快捷导航">
            {ROUTES.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className={`header-nav__link ${path === route.path ? 'is-active' : ''}`}
                aria-current={path === route.path ? 'page' : undefined}
                prefetch={() => prefetchRoute(route.path)}
              >
                {route.shortTitle}
              </Link>
            ))}
          </nav>

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
              label={resolvedTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
              onClick={toggleTheme}
              className="header-theme-toggle"
            >
              <FluentIcon name={resolvedTheme === 'dark' ? 'sun' : 'moon'} size={20} aria-hidden />
            </IconButton>

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
