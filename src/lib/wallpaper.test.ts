import { describe, expect, it } from 'vitest';
import { dayIndex, resolveWallpaper, WALLPAPERS } from './wallpaper';

describe('wallpaper selection', () => {
  it('produces a stable day index and respects offsets', () => {
    const date = new Date(2026, 10, 16);
    expect(dayIndex(date)).toBe(dayIndex(new Date(2026, 10, 16, 23, 59)));
    expect(dayIndex(date, 3)).toBe(dayIndex(date) + 3);
  });

  it('returns null when wallpaper is disabled', () => {
    expect(
      resolveWallpaper({
        wallpaper: 'none',
        wallpaperRotation: true,
        wallpaperLockedIndex: null,
        wallpaperOffset: 0,
        theme: 'light',
      }),
    ).toBeNull();
  });

  it('returns a fixed wallpaper regardless of theme', () => {
    const result = resolveWallpaper({
      wallpaper: 'light-3',
      wallpaperRotation: true,
      wallpaperLockedIndex: null,
      wallpaperOffset: 0,
      theme: 'dark',
    });
    expect(result?.id).toBe('light-3');
  });

  it('picks a wallpaper matching the theme in auto mode', () => {
    const date = new Date(2026, 10, 16, 12);
    for (const theme of ['light', 'dark'] as const) {
      const result = resolveWallpaper(
        {
          wallpaper: 'auto',
          wallpaperRotation: true,
          wallpaperLockedIndex: null,
          wallpaperOffset: 0,
          theme,
        },
        date,
      );
      expect(result?.theme).toBe(theme);
    }
  });

  it('freezes the locked index when rotation is off', () => {
    const result = resolveWallpaper(
      {
        wallpaper: 'auto',
        wallpaperRotation: false,
        wallpaperLockedIndex: 1,
        wallpaperOffset: 0,
        theme: 'light',
      },
      new Date(2026, 10, 16),
    );
    const lightPool = WALLPAPERS.filter((item) => item.theme === 'light');
    expect(result?.id).toBe(lightPool[1 % lightPool.length].id);
  });
});
