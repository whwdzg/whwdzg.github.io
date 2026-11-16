/**
 * 设置上下文 / Settings context.
 *
 * 负责：
 * - 首次挂载时读取本地设置并迁移 2.0 数据；
 * - 监听系统深浅色变化；
 * - 把主题、强调色、玻璃、动效偏好同步到 <html>；
 * - 提供 update / reset 给设置面板。
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  applySettings,
  DEFAULT_SETTINGS,
  getSystemDark,
  loadSettings,
  resetSettings,
  resolveTheme,
  sanitizeSettings,
  saveSettings,
  type Settings,
} from '../lib/settings';
import { resolveWallpaper, type Wallpaper } from '../lib/wallpaper';

interface SettingsContextValue {
  settings: Settings;
  resolvedTheme: 'light' | 'dark';
  systemDark: boolean;
  wallpaper: Wallpaper | null;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function subscribeSystemTheme(callback: (dark: boolean) => void): () => void {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = (event: MediaQueryListEvent) => callback(event.matches);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [systemDark, setSystemDark] = useState<boolean>(() => getSystemDark());

  const resolvedTheme = resolveTheme(settings.theme, systemDark);

  useEffect(() => subscribeSystemTheme(setSystemDark), []);

  useEffect(() => {
    applySettings(settings, resolvedTheme);
    saveSettings(settings);
  }, [settings, resolvedTheme]);

  // 跨标签页同步：另一个标签改了设置，这里立即跟随。
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'whwdzg-site-settings-v3') return;
      setSettings(loadSettings());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((previous) => sanitizeSettings({ ...previous, ...patch }, previous));
  }, []);

  const reset = useCallback(() => {
    setSettings(resetSettings());
  }, []);

  const wallpaper = useMemo(
    () =>
      resolveWallpaper({
        wallpaper: settings.wallpaper,
        wallpaperRotation: settings.wallpaperRotation,
        wallpaperLockedIndex: settings.wallpaperLockedIndex,
        wallpaperOffset: settings.wallpaperOffset,
        theme: resolvedTheme,
      }),
    [
      settings.wallpaper,
      settings.wallpaperRotation,
      settings.wallpaperLockedIndex,
      settings.wallpaperOffset,
      resolvedTheme,
    ],
  );

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, resolvedTheme, systemDark, wallpaper, update, reset }),
    [settings, resolvedTheme, systemDark, wallpaper, update, reset],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside <SettingsProvider>');
  return value;
}

export { DEFAULT_SETTINGS };
