/**
 * 抓取 MC百科数据包条目的短评 / 评论。
 *
 * MC百科页面本身不直接输出评论 HTML，短评由 /frame/comment/CommentRow/ 返回 JSON。
 * 站点是静态站，因此构建期生成快照；失败时保留上一次成功数据。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT = path.join(ROOT, 'src/data/projects/mcmod-comments.ts');
const ENTRIES = [
  { slug: 'better-crafting-recipes', id: '17614', url: 'https://www.mcmod.cn/class/17614.html' },
  { slug: 'better-enchantments', id: '22543', url: 'https://www.mcmod.cn/class/22543.html' },
  { slug: 'better-mob-drop', id: '17769', url: 'https://www.mcmod.cn/class/17769.html' },
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
  'Referer': 'https://www.mcmod.cn/',
  'X-Requested-With': 'XMLHttpRequest',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'Accept-Language': 'zh-CN,zh;q=0.9',
};

function htmlToText(value) {
  return String(value ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function fetchComments(entry, channel) {
  const body = 'data=' + encodeURIComponent(JSON.stringify({
    type: 'class',
    channel: String(channel),
    doid: entry.id,
    page: 1,
    selfonly: 0,
  }));
  const response = await fetch('https://www.mcmod.cn/frame/comment/CommentRow/', {
    method: 'POST',
    headers: { ...HEADERS, Referer: entry.url },
    body,
  });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const json = await response.json();
  if (json.state !== 0 || !json.data || json.data.is_empty === 1) return [];
  return (json.data.row ?? []).map((row) => ({
    id: String(row.id ?? ''),
    author: String(row.user?.name ?? 'MC百科用户'),
    avatar: String(row.user?.avatar?.img ?? '').replace(/^\/\//, 'https://'),
    floor: String(row.floor ?? ''),
    date: String(row.time?.source ?? ''),
    relative: String(row.time?.range ?? ''),
    channel: Number(channel),
    replyCount: Number(row.reply_count ?? 0),
    likes: Number(row.attitude?.up ?? 0),
    text: htmlToText(row.content),
  }));
}

function previous() {
  try {
    const text = readFileSync(OUTPUT, 'utf8');
    const match = text.match(/export const MCMOD_COMMENTS: McmodComments = (\{[\s\S]*?\});/);
    return match ? JSON.parse(match[1]) : {};
  } catch {
    return {};
  }
}

const old = previous();
const result = {};
for (const entry of ENTRIES) {
  try {
    const [channel1, channel2] = await Promise.all([fetchComments(entry, 1), fetchComments(entry, 2)]);
    const seen = new Set();
    result[entry.slug] = [...channel1, ...channel2].filter((comment) => {
      if (!comment.id || seen.has(comment.id)) return false;
      seen.add(comment.id);
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
    console.log('[mcmod-comments] ' + entry.slug + ': ' + result[entry.slug].length + ' comments');
  } catch (error) {
    const fallback = old[entry.slug] ?? [];
    result[entry.slug] = fallback;
    console.warn('[mcmod-comments] ' + entry.slug + ' failed, keep ' + fallback.length + ': ' + error.message);
  }
}

const content = `/* 由 scripts/sync-mcmod-comments.mjs 生成，请勿手动编辑。 */
export interface McmodComment {
  id: string;
  author: string;
  avatar: string;
  floor: string;
  date: string;
  relative: string;
  channel: number;
  replyCount: number;
  likes: number;
  text: string;
}

export type McmodComments = Record<string, McmodComment[]>;

export const MCMOD_COMMENTS_SYNCED_AT = "${new Date().toISOString()}";

export const MCMOD_COMMENTS: McmodComments = ${JSON.stringify(result, null, 2)};

export function mcmodComments(slug: string): McmodComment[] {
  return MCMOD_COMMENTS[slug] ?? [];
}
`;
writeFileSync(OUTPUT, content, 'utf8');
console.log('[mcmod-comments] written');
