import { describe, expect, it } from 'vitest';
import { formatBytes, formatDate, formatDateTime, formatDuration, formatViews, relativeTime, truncateMiddle } from './format';

describe('format helpers', () => {
  it('formats dates with a fallback', () => {
    expect(formatDate('2025-07-13')).toBe('2025-07-13');
    expect(formatDate('2025-07-13T12:00:00Z')).toBe('2025-07-13');
    expect(formatDate(null)).toBe('日期未记录');
    expect(formatDate('bad')).toBe('日期未记录');
  });

  it('formats durations as m:ss and h:mm:ss', () => {
    expect(formatDuration(13)).toBe('0:13');
    expect(formatDuration(2292)).toBe('38:12');
    expect(formatDuration(3723)).toBe('01:02:03');
    expect(formatDuration(null)).toBe('');
  });

  it('formats view counts in Chinese units', () => {
    expect(formatViews(909)).toBe('909');
    expect(formatViews(12_345)).toBe('1.2 万');
    expect(formatViews(120_000)).toBe('12 万');
    expect(formatViews(null)).toBe('');
  });

  it('computes relative time from a fixed now', () => {
    const now = new Date('2026-11-16T12:00:00Z').getTime();
    expect(relativeTime(now - 10_000, now)).toBe('刚刚');
    expect(relativeTime(now - 5 * 60_000, now)).toBe('5 分钟前');
    expect(relativeTime(now - 2 * 3600_000, now)).toBe('2 小时前');
    expect(relativeTime(now - 3 * 86_400_000, now)).toBe('3 天前');
    expect(relativeTime(now - 70 * 86_400_000, now)).toBe('2 个月前');
  });

  it('formats bytes and truncates long strings', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(12 * 1024 * 1024)).toBe('12 MB');
    expect(truncateMiddle('abcdefghij', 7)).toBe('abc…hij');
  });

  it('formats date time without throwing on empty input', () => {
    expect(formatDateTime(null)).toBe('未知');
    expect(formatDateTime('2026-11-16T12:00:00Z')).toMatch(/2026/);
  });
});
