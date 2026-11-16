/** 应用外壳 / Application shell: background, chrome, routed page, overlays. */
import { Component, Suspense, lazy, useEffect, useRef, type ErrorInfo, type ReactNode } from 'react';
import { RouterProvider, useRouter, Link } from './lib/router';
import { ROUTES, prefetchRoute, routeMeta } from './lib/routes';
import { SettingsProvider } from './hooks/useSettings';
import { UiProvider, useUi } from './hooks/useUi';
import { ToastProvider } from './hooks/useToast';
import { useFullscreen } from './hooks/useFullscreen';
import { Wallpaper } from './components/layout/Wallpaper';
import { ParticleField } from './components/layout/ParticleField';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { BackToTop } from './components/layout/BackToTop';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { SearchPalette } from './components/search/SearchPalette';
import { PageSkeleton } from './components/common/PageSkeleton';
import { FluentIcon } from './components/common/FluentIcon';

const PAGES = Object.fromEntries(ROUTES.map((route) => [route.path, lazy(route.load)])) as Record<
  string,
  React.LazyExoticComponent<React.ComponentType>
>;

/** 懒加载页面出错时的兜底，避免整站白屏。 */
class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[app] 页面渲染失败', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="route-error">
          <FluentIcon name="warning" size={28} aria-hidden />
          <h1>页面加载失败了</h1>
          <p>{this.state.error.message}</p>
          <button type="button" className="btn btn--primary btn--md" onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFoundPage() {
  return (
    <div className="route-error" role="status">
      <p className="eyebrow">404 · NOT FOUND</p>
      <h1>这一页不存在</h1>
      <p>链接可能来自旧版本，或者只是一个拼写错误。</p>
      <div className="route-error__actions">
        <Link className="btn btn--primary btn--md" to="/">
          回到主页
        </Link>
        <Link className="btn btn--ghost btn--md" to="/bilibili/">
          看看影像归档
        </Link>
      </div>
    </div>
  );
}

/** 路由副作用：标题、描述、锚点、空闲预取。 */
function RouteEffects() {
  const { path, hash } = useRouter();
  const prefetched = useRef(false);

  useEffect(() => {
    const meta = routeMeta(path);
    document.title = meta?.title ?? '404 · 水鱼 Blog';
    const description = document.querySelector('meta[name="description"]');
    if (description && meta) description.setAttribute('content', meta.description);
    document.documentElement.dataset.route = path;
  }, [path]);

  // 页面 chunk 可能晚于路由状态到达，锚点滚动延迟一拍。
  useEffect(() => {
    if (!hash) return;
    const timer = window.setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ block: 'start' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [path, hash]);

  // 首屏稳定后预取其他页面；每个会话只做一次。
  useEffect(() => {
    if (prefetched.current) return;
    prefetched.current = true;
    const run = () => {
      for (const route of ROUTES) {
        if (route.path !== path && route.prefetch !== false) prefetchRoute(route.path);
      }
    };
    let timer = 0;
    const supportsIdle = 'requestIdleCallback' in window;
    if (supportsIdle) timer = window.requestIdleCallback(run, { timeout: 3000 });
    else timer = window.setTimeout(run, 2200);
    return () => {
      if (supportsIdle) window.cancelIdleCallback(timer);
      else window.clearTimeout(timer);
    };
  }, [path]);

  return null;
}

/** 全局快捷键：Ctrl/Cmd+K 或 “/” 打开搜索。 */
function GlobalShortcuts() {
  const { openSearch } = useUi();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editing =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openSearch();
        return;
      }
      if (event.key === '/' && !editing && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        openSearch();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openSearch]);
  return null;
}

function Shell() {
  const { path } = useRouter();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const Page = PAGES[path];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      <Wallpaper />
      <ParticleField />
      <Header isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />
      <Sidebar />
      <RouteEffects />
      <GlobalShortcuts />
      <main id="main" className="site-main" tabIndex={-1}>
        <AppErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            {Page ? <Page /> : <NotFoundPage />}
          </Suspense>
        </AppErrorBoundary>
      </main>
      <Footer />
      <BackToTop />
      <SettingsPanel />
      <SearchPalette />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <SettingsProvider>
        <UiProvider>
          <ToastProvider>
            <Shell />
          </ToastProvider>
        </UiProvider>
      </SettingsProvider>
    </RouterProvider>
  );
}
