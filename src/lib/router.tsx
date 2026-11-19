/**
 * 极简 History 路由 / Tiny history router.
 *
 * 为什么不用 react-router：
 * - 站点只有 4 个页面，路由逻辑不到 100 行；
 * - 少一个运行时依赖，首屏 JS 更小；
 * - 页面本身是多入口 HTML，刷新 / 直链天然可用。
 *
 * 约定：
 * - 内部路径统一带尾斜杠（`/bilibili/`），与 Vite 的多入口输出一致；
 * - 支持 `?video=12` 这类查询参数与 `#comment-2` 锚点；
 * - 前进/后退时恢复每个路径上次的滚动位置。
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';

const KNOWN_PATHS = new Set([
  '/',
  '/bilibili/',
  '/bilibili/videos/',
  '/bilibili/dynamics/',
  '/bilibili/columns/',
  '/comments/',
  '/comments/github/',
  '/projects/modrinth/',
  '/projects/better-crafting-recipes/',
  '/projects/better-enchantments/',
  '/projects/better-mob-drop/',
  '/projects/magical-dye/',
  '/projects/only-survival-mode/',
  '/projects/glowing-players/',
  '/projects/asteria-player/',
  '/projects/life-simulation-wiki/',
  '/projects/github/',
  '/projects/occultation/',
  '/user/hxhej/',
  '/user/canghaishuiyu/',
  '/user/滄海水魚/',
  '/columns/',
  '/columns/update-2026-11/',
  '/tools/',
  '/tools/base64/',
  '/tools/basex/',
  '/tools/base-convert/',
  '/tools/unicode/',
  '/tools/calculator/',
  '/tools/mc-projection/',
  '/tools/mc-datapack/',
  '/tools/mc-resourcepack/',
  '/about/',
]);

export function normalizePath(pathname: string): string {
  let path = pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    // 非法百分号编码保持原样，避免路由直接崩溃。
  }
  path = path.replace(/\/index\.html$/i, '/');
  if (!path.startsWith('/')) path = `/${path}`;
  if (path !== '/' && !path.endsWith('/') && !/\.[a-z0-9]+$/i.test(path)) path = `${path}/`;
  return path;
}

export function isKnownPath(path: string): boolean {
  return KNOWN_PATHS.has(normalizePath(path));
}

interface RouterValue {
  path: string;
  search: string;
  hash: string;
  navigate: (to: string, options?: { replace?: boolean; scroll?: boolean }) => void;
  back: () => void;
}

const RouterContext = createContext<RouterValue | null>(null);

const scrollPositions = new Map<string, number>();

function currentLocation() {
  return {
    path: normalizePath(window.location.pathname),
    search: window.location.search,
    hash: window.location.hash,
  };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState(currentLocation);
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

    const onPopState = () => {
      const next = currentLocation();
      setLocation(next);
      // 等 React 渲染完成后再恢复滚动位置。
      window.requestAnimationFrame(() => {
        const saved = scrollPositions.get(next.path);
        if (next.hash) {
          const target = document.querySelector(next.hash);
          if (target) target.scrollIntoView({ block: 'start' });
          return;
        }
        window.scrollTo({ top: saved ?? 0, behavior: 'auto' });
      });
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean; scroll?: boolean }) => {
    const url = new URL(to, window.location.origin);
    const nextPath = normalizePath(url.pathname);
    const samePath = nextPath === locationRef.current.path;

    scrollPositions.set(locationRef.current.path, window.scrollY);

    if (samePath && url.hash) {
      const target = document.querySelector(url.hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
        setLocation({ path: nextPath, search: url.search, hash: url.hash });
        return;
      }
    }

    const state = { scroll: 0 };
    if (options?.replace) window.history.replaceState(state, '', `${url.pathname}${url.search}${url.hash}`);
    else window.history.pushState(state, '', `${url.pathname}${url.search}${url.hash}`);

    setLocation({ path: nextPath, search: url.search, hash: url.hash });

    if (options?.scroll === false) return;
    if (url.hash) {
      window.requestAnimationFrame(() => {
        const target = document.querySelector(url.hash);
        if (target) target.scrollIntoView({ block: 'start' });
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const back = useCallback(() => window.history.back(), []);

  const value = useMemo<RouterValue>(
    () => ({ ...location, navigate, back }),
    [location, navigate, back],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterValue {
  const value = useContext(RouterContext);
  if (!value) throw new Error('useRouter must be used inside <RouterProvider>');
  return value;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  children: ReactNode;
  /** 外链自动加 target/rel；内链走 pushState */
  external?: boolean;
  onNavigate?: () => void;
  prefetch?: () => void;
};

export function Link({ to, children, external, onNavigate, prefetch, onClick, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  const isExternal = external ?? /^https?:\/\//i.test(to);

  if (isExternal) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={to}
      {...rest}
      onMouseEnter={(event) => {
        prefetch?.();
        rest.onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        prefetch?.();
        rest.onFocus?.(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        onNavigate?.();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

/** 供外部（例如搜索面板）使用，不依赖组件树。 */
export function navigateTo(to: string) {
  window.location.assign(to);
}
