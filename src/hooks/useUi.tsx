/**
 * 全局 UI 状态 / Global overlay state.
 *
 * 侧栏、设置面板、搜索面板同一时间只保留一个，避免焦点与滚动锁冲突。
 * 路由变化时会自动关闭所有浮层。
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import { useRouter } from '../lib/router';

interface UiContextValue {
  sidebarOpen: boolean;
  settingsOpen: boolean;
  searchOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  closeAll: () => void;
}

const UiContext = createContext<UiContextValue | null>(null);

function desktopDefault(): boolean {
  // 侧栏是浮层，桌面端默认收起，避免首屏遮住主视觉；
  // 用户点击页眉左侧按钮即可展开，展开状态不跨页面保留。
  return false;
}

export function UiProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpenState] = useState(desktopDefault);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { path } = useRouter();
  const firstRender = useRef(true);

  const setSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpenState(open);
    if (open) {
      setSettingsOpen(false);
      setSearchOpen(false);
    }
  }, []);

  const closeAll = useCallback(() => {
    setSidebarOpenState(false);
    setSettingsOpen(false);
    setSearchOpen(false);
  }, []);

  // 页面切换后收起所有浮层，让新页面立即完整可见。
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    closeAll();
  }, [path, closeAll]);

  const openSettings = useCallback(() => {
    setSettingsOpen(true);
    setSearchOpen(false);
    setSidebarOpenState(false);
  }, []);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setSettingsOpen(false);
    setSidebarOpenState(false);
  }, []);

  const value = useMemo<UiContextValue>(
    () => ({
      sidebarOpen,
      settingsOpen,
      searchOpen,
      setSidebarOpen,
      toggleSidebar: () => setSidebarOpen(!sidebarOpen),
      openSettings,
      closeSettings: () => setSettingsOpen(false),
      openSearch,
      closeSearch: () => setSearchOpen(false),
      closeAll,
    }),
    [sidebarOpen, settingsOpen, searchOpen, setSidebarOpen, openSettings, openSearch, closeAll],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiContextValue {
  const value = useContext(UiContext);
  if (!value) throw new Error('useUi must be used inside <UiProvider>');
  return value;
}
