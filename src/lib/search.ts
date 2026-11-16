/**
 * 站内搜索的纯函数 / Pure helpers for the command palette.
 *
 * 旧站的搜索是遍历页面 DOM；3.0 改为对“页面 / 视频 / 留言 / 外链”的结构化索引，
 * 因此可以在任意页面使用，也不需要 fetch 整页 HTML。
 */

/** 归一化：小写、全角标点转半角、压缩空白。 */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[，]/g, ',')
    .replace(/[。]/g, '.')
    .replace(/[！]/g, '!')
    .replace(/[？]/g, '?')
    .replace(/[；]/g, ';')
    .replace(/[：]/g, ':')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[（]/g, '(')
    .replace(/[）]/g, ')')
    .replace(/[【]/g, '[')
    .replace(/[】]/g, ']')
    .replace(/[、]/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 返回匹配分数，0 表示不匹配。
 * 精确 > 前缀 > 词首 > 包含 > 子序列。
 */
export function scoreMatch(query: string, text: string): number {
  const q = normalizeText(query);
  const t = normalizeText(text);
  if (!q || !t) return 0;
  if (t === q) return 120;
  if (t.startsWith(q)) return 100 - Math.min(20, t.length - q.length);
  const index = t.indexOf(q);
  if (index >= 0) {
    const wordStart = index === 0 || /[\s\-_/·,.!?()[\]{}]/.test(t[index - 1]);
    return (wordStart ? 80 : 60) - Math.min(20, index);
  }
  // 子序列匹配：例如输入 "bcr" 命中 "better crafting recipes"
  let cursor = 0;
  let gaps = 0;
  for (const char of q) {
    const next = t.indexOf(char, cursor);
    if (next === -1) return 0;
    gaps += next - cursor;
    cursor = next + 1;
  }
  return Math.max(12, 36 - gaps);
}

export interface SearchableItem {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string;
  group: string;
  href: string;
  external?: boolean;
  icon?: string;
  meta?: string;
}

export function searchItems(query: string, items: SearchableItem[], limit = 12): SearchableItem[] {
  const q = normalizeText(query);
  if (!q) return items.slice(0, limit);
  return items
    .map((item) => {
      const titleScore = scoreMatch(q, item.title) * 3;
      const subtitleScore = item.subtitle ? scoreMatch(q, item.subtitle) * 2 : 0;
      const keywordScore = item.keywords ? scoreMatch(q, item.keywords) : 0;
      return { item, score: Math.max(titleScore, subtitleScore, keywordScore) };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}
