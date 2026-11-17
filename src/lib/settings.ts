/**
 * 站点设置 / Persisted site settings.
 *
 * 数据流：
 *   localStorage → sanitize → React context → 应用到 <html> dataset / CSS 变量
 *
 * 旧站（2.0）使用零散的 localStorage 键；这里保留了一次性迁移，避免老用户
 * 打开 3.0 后主题、壁纸、粒子等设置全部丢失。迁移只在 3.0 键不存在时发生。
 */
import { readJson, readStorage, removeStorage, writeJson } from './storage';
import { isWallpaperId, WALLPAPERS, type WallpaperId } from './wallpaper';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ParticleKind = 'off' | 'season' | 'sakura' | 'summer' | 'wutong' | 'ginkgo' | 'snow';
export type HeaderAutoHide = 'off' | 'fullscreen' | 'scroll';
export type MotionMode = 'system' | 'reduced' | 'full';

export interface Settings {
  version: 3;
  theme: ThemeMode;
  accent: string;
  glass: boolean;
  wallpaper: WallpaperId;
  wallpaperRotation: boolean;
  wallpaperLockedIndex: number | null;
  wallpaperOffset: number;
  particles: ParticleKind;
  pageProgress: boolean;
  headerAutoHide: HeaderAutoHide;
  motion: MotionMode;
}

export const SETTINGS_KEY = 'whwdzg-site-settings-v3';

export const DEFAULT_SETTINGS: Settings = {
  version: 3,
  theme: 'system',
  accent: '#0078D4',
  glass: true,
  wallpaper: 'auto',
  wallpaperRotation: true,
  wallpaperLockedIndex: null,
  wallpaperOffset: 0,
  particles: 'season',
  pageProgress: true,
  headerAutoHide: 'fullscreen',
  motion: 'system',
};

export const ACCENT_PRESETS = [
  { value: '#0078D4', label: 'Fluent 蓝' },
  { value: '#33CC99', label: '水鱼绿' },
  { value: '#8764B8', label: '紫罗兰' },
  { value: '#E3008C', label: '洋红' },
  { value: '#F50000', label: '正红' },
  { value: '#FF8C00', label: '日落橙' },
  { value: '#00B7C3', label: '青蓝' },
] as const;

const THEMES = new Set<ThemeMode>(['system', 'light', 'dark']);
const PARTICLES = new Set<ParticleKind>(['off', 'season', 'sakura', 'summer', 'wutong', 'ginkgo', 'snow']);
const HEADER_MODES = new Set<HeaderAutoHide>(['off', 'fullscreen', 'scroll']);
const MOTIONS = new Set<MotionMode>(['system', 'reduced', 'full']);

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHex(value: string): string | null {
  const trimmed = value.trim();
  if (!HEX.test(trimmed)) return null;
  if (trimmed.length === 4) {
    return `#${trimmed
      .slice(1)
      .split('')
      .map((char) => char + char)
      .join('')}`.toUpperCase();
  }
  return trimmed.toUpperCase();
}

/** 根据背景色亮度选择可读的前景色（白 / 近黑）。 */
export function contrastInk(hex: string): string {
  const normalized = normalizeHex(hex) ?? '#0078D4';
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;
  const lin = (channel: number) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return luminance > 0.45 ? '#101014' : '#FFFFFF';
}

export function resolveTheme(theme: ThemeMode, systemDark: boolean): 'light' | 'dark' {
  if (theme === 'system') return systemDark ? 'dark' : 'light';
  return theme;
}

export function getSystemDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function sanitizeSettings(value: unknown, fallback: Settings = DEFAULT_SETTINGS): Settings {
  if (!value || typeof value !== 'object') return fallback;
  const input = value as Partial<Settings>;
  const accent = typeof input.accent === 'string' ? normalizeHex(input.accent) : null;
  return {
    version: 3,
    theme: THEMES.has(input.theme as ThemeMode) ? (input.theme as ThemeMode) : fallback.theme,
    accent: accent ?? fallback.accent,
    glass: typeof input.glass === 'boolean' ? input.glass : fallback.glass,
    wallpaper: isWallpaperId(input.wallpaper) ? input.wallpaper : fallback.wallpaper,
    wallpaperRotation:
      typeof input.wallpaperRotation === 'boolean' ? input.wallpaperRotation : fallback.wallpaperRotation,
    wallpaperLockedIndex:
      typeof input.wallpaperLockedIndex === 'number' && Number.isFinite(input.wallpaperLockedIndex)
        ? input.wallpaperLockedIndex
        : null,
    wallpaperOffset:
      typeof input.wallpaperOffset === 'number' && Number.isFinite(input.wallpaperOffset)
        ? input.wallpaperOffset
        : fallback.wallpaperOffset,
    particles: PARTICLES.has(input.particles as ParticleKind) ? (input.particles as ParticleKind) : fallback.particles,
    pageProgress: typeof input.pageProgress === 'boolean' ? input.pageProgress : fallback.pageProgress,
    headerAutoHide: HEADER_MODES.has(input.headerAutoHide as HeaderAutoHide)
      ? (input.headerAutoHide as HeaderAutoHide)
      : fallback.headerAutoHide,
    motion: MOTIONS.has(input.motion as MotionMode) ? (input.motion as MotionMode) : fallback.motion,
  };
}

/** 将 2.0 的零散键迁移为 3.0 设置对象。 */
function migrateLegacy(): Settings | null {
  const hasAnyLegacy =
    readStorage('theme-color') !== null ||
    readStorage('setting-lightdarktoggle') !== null ||
    readStorage('setting-wallpaperselection') !== null ||
    readStorage('show-page-progress') !== null ||
    readStorage('setting-particleanimation') !== null ||
    readStorage('follow-system') !== null;
  if (!hasAnyLegacy) return null;

  const themeMode = readStorage('setting-lightdarktoggle');
  const theme: ThemeMode = themeMode === '1' ? 'light' : themeMode === '2' ? 'dark' : 'system';

  const accent = normalizeHex(readStorage('theme-color') ?? '') ?? DEFAULT_SETTINGS.accent;

  const wallpaperIndex = Number.parseInt(readStorage('setting-wallpaperselection') ?? '', 10);
  let wallpaper: WallpaperId = 'auto';
  if (Number.isFinite(wallpaperIndex) && wallpaperIndex > 0) {
    const fixed = WALLPAPERS[wallpaperIndex - 1];
    if (fixed) wallpaper = fixed.id;
  }

  const particleIndex = Number.parseInt(readStorage('setting-particleanimation') ?? '', 10);
  const particles = (['off', 'sakura', 'wutong', 'ginkgo', 'snow'] as ParticleKind[])[particleIndex] ?? 'off';

  return {
    ...DEFAULT_SETTINGS,
    theme,
    accent,
    wallpaper,
    wallpaperRotation: readStorage('setting-wallpaperrotation') !== 'false',
    wallpaperLockedIndex: Number.parseInt(readStorage('wallpaper-locked-index-v1') ?? '', 10) || null,
    particles,
    pageProgress: readStorage('show-page-progress') !== 'false',
  };
}

export function loadSettings(): Settings {
  const stored = readJson<Partial<Settings> | null>(SETTINGS_KEY, null);
  if (stored) return sanitizeSettings(stored, DEFAULT_SETTINGS);
  const legacy = migrateLegacy();
  if (legacy) {
    saveSettings(legacy);
    return legacy;
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: Settings): void {
  writeJson(SETTINGS_KEY, settings);
}

/** 将设置写入 DOM；resolvedTheme 已根据系统偏好解析。 */
export function applySettings(settings: Settings, resolvedTheme: 'light' | 'dark'): void {
  const root = document.documentElement;
  root.dataset.theme = resolvedTheme;
  root.dataset.glass = settings.glass ? 'on' : 'off';
  root.dataset.motion = settings.motion;
  root.style.colorScheme = resolvedTheme;
  root.style.setProperty('--accent', settings.accent);
  root.style.setProperty('--accent-ink', contrastInk(settings.accent));
  const meta = document.getElementById('theme-color-meta');
  if (meta) meta.setAttribute('content', resolvedTheme === 'dark' ? '#0f1115' : '#f3f3f3');
}

export function resetSettings(): Settings {
  removeStorage(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS };
}

