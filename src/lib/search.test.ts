import { describe, expect, it } from 'vitest';
import { normalizeText, scoreMatch, searchItems, type SearchableItem } from './search';

const items: SearchableItem[] = [
  { id: '1', title: '哔哩哔哩影像存档', subtitle: '43 条记录', group: '页面', href: '/bilibili/' },
  { id: '2', title: 'Better Crafting Recipes', subtitle: '更好的合成配方', group: '项目', href: 'https://modrinth.com' },
  { id: '3', title: '关于本站', subtitle: '版本与提交历史', group: '页面', href: '/about/' },
];

describe('search helpers', () => {
  it('normalizes Chinese punctuation and whitespace', () => {
    expect(normalizeText('你好，世界！  Foo')).toBe('你好,世界! foo');
    expect(normalizeText('【测试】')).toBe('[测试]');
  });

  it('scores exact, prefix, word-start and subsequence matches', () => {
    expect(scoreMatch('about', 'about')).toBeGreaterThan(scoreMatch('about', 'about page'));
    expect(scoreMatch('better', 'Better Crafting Recipes')).toBeGreaterThan(0);
    expect(scoreMatch('bcr', 'Better Crafting Recipes')).toBeGreaterThan(0);
    expect(scoreMatch('zzzz', 'Better Crafting Recipes')).toBe(0);
  });

  it('ranks title matches above subtitle matches', () => {
    const results = searchItems('关于', items);
    expect(results[0].id).toBe('3');
  });

  it('returns the first items for an empty query', () => {
    expect(searchItems('', items, 2)).toHaveLength(2);
  });

  it('finds items by Chinese subtitle', () => {
    const results = searchItems('合成', items);
    expect(results.map((item) => item.id)).toContain('2');
  });
});
