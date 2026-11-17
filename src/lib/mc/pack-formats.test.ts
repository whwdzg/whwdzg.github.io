import { describe, expect, it } from 'vitest';
import { parseFormat, formatRangeFromMeta, supportedVersions } from './pack-formats';

describe('Minecraft pack formats', () => {
  it('parses numbers, pairs and strings', () => {
    expect(parseFormat(48)?.label).toBe('48');
    expect(parseFormat([121, 0])?.label).toBe('121.0');
    expect(parseFormat('97.1')?.label).toBe('97.1');
  });

  it('maps pack formats to Minecraft versions', () => {
    expect(formatRangeFromMeta({ pack: { pack_format: 48 } })?.min.label).toBe('48');
    expect(supportedVersions('data', { pack: { min_format: [121, 0], max_format: [121, 99] } }).labels).toEqual(['26.3']);
    expect(supportedVersions('resource', { pack: { pack_format: 97.1 } }).labels).toEqual(['26.3']);
    const range = formatRangeFromMeta({ pack: { supported_formats: [4, 15] } });
    expect(range?.min.label).toBe('4');
    expect(range?.max.label).toBe('15');
    expect(supportedVersions('data', { pack: { supported_formats: [4, 15] } }).labels.length).toBeGreaterThan(2);
  });

  it('flags unknown formats', () => {
    expect(supportedVersions('data', { pack: { pack_format: 999 } }).labels).toEqual([]);
    expect(supportedVersions('data', {}).note).toContain('没有声明');
  });
});
