import { describe, expect, it } from 'vitest';
import { contrastInk, DEFAULT_SETTINGS, normalizeHex, resolveTheme, sanitizeSettings } from './settings';

describe('settings helpers', () => {
  it('normalizes short hex colors and rejects invalid ones', () => {
    expect(normalizeHex('#abc')).toBe('#AABBCC');
    expect(normalizeHex('#33cc99')).toBe('#33CC99');
    expect(normalizeHex('red')).toBeNull();
    expect(normalizeHex('#12345')).toBeNull();
  });

  it('chooses readable ink for accent colors', () => {
    expect(contrastInk('#FFFFFF')).toBe('#101014');
    expect(contrastInk('#0078D4')).toBe('#FFFFFF');
    expect(contrastInk('#000000')).toBe('#FFFFFF');
  });

  it('resolves system theme', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('sanitizes invalid values back to defaults', () => {
    const next = sanitizeSettings({
      theme: 'neon',
      accent: 'not-a-color',
      glass: 'yes',
      wallpaper: 'missing',
      particles: 'meteor',
      headerAutoHide: 'sometimes',
      motion: 'warp',
    });
    expect(next.theme).toBe(DEFAULT_SETTINGS.theme);
    expect(next.accent).toBe(DEFAULT_SETTINGS.accent);
    expect(next.glass).toBe(DEFAULT_SETTINGS.glass);
    expect(next.wallpaper).toBe(DEFAULT_SETTINGS.wallpaper);
    expect(next.particles).toBe(DEFAULT_SETTINGS.particles);
    expect(next.headerAutoHide).toBe(DEFAULT_SETTINGS.headerAutoHide);
    expect(next.motion).toBe(DEFAULT_SETTINGS.motion);
  });

  it('keeps valid custom settings', () => {
    const next = sanitizeSettings({
      theme: 'dark',
      accent: '#33CC99',
      glass: false,
      wallpaper: 'dark-2',
      wallpaperRotation: false,
      particles: 'sakura',
      pageProgress: false,
      headerAutoHide: 'scroll',
      motion: 'reduced',
    });
    expect(next.theme).toBe('dark');
    expect(next.accent).toBe('#33CC99');
    expect(next.glass).toBe(false);
    expect(next.wallpaper).toBe('dark-2');
    expect(next.particles).toBe('sakura');
    expect(next.headerAutoHide).toBe('scroll');
    expect(next.motion).toBe('reduced');
  });
});
