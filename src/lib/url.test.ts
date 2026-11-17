import { describe, expect, it } from 'vitest';
import { cleanHtmlLocation, stripHtmlExtension } from './url';

describe('clean URLs', () => {
  it('strips index.html and file extensions', () => {
    expect(stripHtmlExtension('/')).toBe('/');
    expect(stripHtmlExtension('/index.html')).toBe('/');
    expect(stripHtmlExtension('/about/index.html')).toBe('/about/');
    expect(stripHtmlExtension('/projects/occultation.html')).toBe('/projects/occultation/');
    expect(stripHtmlExtension('/bilibili/')).toBe('/bilibili/');
  });

  it('preserves query and hash while cleaning', () => {
    const clean = cleanHtmlLocation({
      pathname: '/bilibili/index.html',
      search: '?video=12',
      hash: '#top',
    } as Location);
    expect(clean).toBe('/bilibili/?video=12#top');
  });
});
