/**
 * 壁纸系统 / Wallpaper catalogue and daily rotation.
 *
 * 旧站的 8 张壁纸全部重新压缩为 WebP（最长边 1920px），默认在首屏渲染完成后
 * 通过 requestIdleCallback 加载，不阻塞 LCP。每日轮换使用“日期序号 + offset”
 * 计算，无需定时器，也不会在一天内反复变化。
 */
export type WallpaperTheme = 'light' | 'dark';
export type WallpaperId =
  | 'auto'
  | 'none'
  | 'light-1'
  | 'light-2'
  | 'light-3'
  | 'light-4'
  | 'light-5'
  | 'light-6'
  | 'dark-1'
  | 'dark-2';

export interface Wallpaper {
  id: Exclude<WallpaperId, 'auto' | 'none'>;
  theme: WallpaperTheme;
  label: string;
  src: string;
  /** 低饱和的占位色，在图片解码前撑住背景 */
  tint: string;
}

export const WALLPAPERS: Wallpaper[] = [
  { id: 'light-1', theme: 'light', label: '浅色壁纸 1 · 海底森林', src: '/media/wallpapers/light-1.webp', tint: '#9ec7d8' },
  { id: 'light-2', theme: 'light', label: '浅色壁纸 2', src: '/media/wallpapers/light-2.webp', tint: '#b9c6cf' },
  { id: 'light-3', theme: 'light', label: '浅色壁纸 3', src: '/media/wallpapers/light-3.webp', tint: '#a9c1c9' },
  { id: 'light-4', theme: 'light', label: '浅色壁纸 4', src: '/media/wallpapers/light-4.webp', tint: '#c7b49e' },
  { id: 'light-5', theme: 'light', label: '浅色壁纸 5', src: '/media/wallpapers/light-5.webp', tint: '#a6b8a3' },
  { id: 'light-6', theme: 'light', label: '浅色壁纸 6', src: '/media/wallpapers/light-6.webp', tint: '#b7c4d4' },
  { id: 'dark-1', theme: 'dark', label: '深色壁纸 1 · 暮色山峦', src: '/media/wallpapers/dark-1.webp', tint: '#1b2433' },
  { id: 'dark-2', theme: 'dark', label: '深色壁纸 2', src: '/media/wallpapers/dark-2.webp', tint: '#101820' },
];

export const WALLPAPER_IDS = new Set<string>(['auto', 'none', ...WALLPAPERS.map((item) => item.id)]);

export function isWallpaperId(value: unknown): value is WallpaperId {
  return typeof value === 'string' && WALLPAPER_IDS.has(value);
}

export function getWallpaper(id: WallpaperId): Wallpaper | undefined {
  return WALLPAPERS.find((item) => item.id === id);
}

/** 本地日期序号，保证同一天内稳定，跨零点自然切换。 */
export function dayIndex(date: Date = new Date(), offset = 0): number {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(utc / 86_400_000) + offset;
}

export interface WallpaperSelection {
  wallpaper: WallpaperId;
  wallpaperRotation: boolean;
  wallpaperLockedIndex: number | null;
  wallpaperOffset: number;
  theme: 'light' | 'dark';
}

/**
 * 解析当前应该显示的壁纸。
 * - auto + 轮换：每日序号
 * - auto + 不轮换：锁定序号（用户关闭轮换时的当前图）
 * - 固定壁纸：按 id 精确匹配
 */
export function resolveWallpaper(selection: WallpaperSelection, today: Date = new Date()): Wallpaper | null {
  const { wallpaper, wallpaperRotation, wallpaperLockedIndex, wallpaperOffset, theme } = selection;
  if (wallpaper === 'none') return null;
  if (wallpaper !== 'auto') {
    return getWallpaper(wallpaper) ?? null;
  }

  const pool = WALLPAPERS.filter((item) => item.theme === theme);
  if (!pool.length) return null;
  const index =
    wallpaperRotation || wallpaperLockedIndex == null
      ? dayIndex(today, wallpaperOffset)
      : wallpaperLockedIndex;
  const safe = ((index % pool.length) + pool.length) % pool.length;
  return pool[safe];
}
