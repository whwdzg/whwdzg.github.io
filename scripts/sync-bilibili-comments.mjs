/**
 * 分批抓取 B 站视频评论快照。
 *
 * - 每次更新最多抓取 12 条视频的评论区；
 * - 只抓一级评论，回复只记录条数，不抓取回复内容；
 * - 所有视频抓完后从最新视频重新开始；
 * - 失败视频不标记为已抓取，会在后续轮换中重试。
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const VIDEO_DATA = path.join(ROOT, 'src/data/videos.ts');
const OUTPUT = path.join(ROOT, 'src/data/bilibili-comments.ts');
const STATE = path.join(ROOT, 'scripts/bilibili-comments-state.json');
const BATCH = 12;
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
  Referer: 'https://www.bilibili.com/',
  Accept: 'application/json',
};

function readJson(file, fallback) {
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return fallback; }
}

function previousComments() {
  try {
    const text = readFileSync(OUTPUT, 'utf8');
    const match = text.match(/BILIBILI_VIDEO_COMMENTS: Record<string, BilibiliComment\[\]> = (\{[\s\S]*?\});/);
    return match ? JSON.parse(match[1]) : {};
  } catch { return {}; }
}

function toComment(reply) {
  const author = String(reply.member?.uname ?? 'B 站用户');
  const avatar = author === 'hxhej'
    ? '/media/avatars/hxhej.webp'
    : author === '沧海水鱼'
      ? '/media/avatars/shuiyu.webp'
      : String(reply.member?.avatar ?? '').replace(/^http:/, 'https:');
  return {
    id: String(reply.rpid ?? ''),
    author,
    avatar,
    text: String(reply.content?.message ?? '').trim(),
    likes: Number(reply.like ?? 0),
    replyCount: Number(reply.rcount ?? reply.count ?? 0),
    date: reply.ctime ? new Date(reply.ctime * 1000).toISOString() : '',
  };
}

async function fetchComments(video) {
  const url = 'https://api.bilibili.com/x/v2/reply?type=1&oid=' + video.aid + '&pn=1&ps=12&sort=2';
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const json = await response.json();
  if (json.code !== 0) throw new Error('Bilibili ' + json.code);
  return (json.data?.replies ?? []).map(toComment).filter((comment) => comment.text);
}

const text = readFileSync(VIDEO_DATA, 'utf8');
const match = text.match(/videos: Video\[\] = (\[[\s\S]*?\]);/);
if (!match) throw new Error('cannot read videos');
const ordered = JSON.parse(match[1])
  .filter((video) => video.aid && !video.disabled && video.status !== 'collection')
  .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')) || b.id - a.id);

const previous = previousComments();
const oldState = readJson(STATE, null);
const covered = new Set(Array.isArray(oldState?.covered) ? oldState.covered.map(String) : Object.keys(previous));
let cursor = Number(oldState?.cursor ?? 0);
let cycle = Number(oldState?.cycle ?? 1);

const allCovered = ordered.length > 0 && ordered.every((video) => covered.has(String(video.id)));
if (allCovered) {
  covered.clear();
  cursor = 0;
  cycle += 1;
  console.log('[bili-comments] all covered; starting a new cycle #' + cycle);
}
if (!Number.isFinite(cursor) || cursor < 0) cursor = 0;

const selected = [];
for (let step = 0; step < ordered.length && selected.length < BATCH; step += 1) {
  const index = (cursor + step) % ordered.length;
  const video = ordered[index];
  if (!covered.has(String(video.id))) selected.push({ video, index });
}
const selectedIds = new Set(selected.map(({ video }) => String(video.id)));
const comments = {};
for (const [id, value] of Object.entries(previous)) {
  if (!selectedIds.has(id)) comments[id] = value.map((comment) => ({ ...comment, replyCount: Number(comment.replyCount ?? 0) }));
}

for (const { video } of selected) {
  try {
    const list = await fetchComments(video);
    comments[String(video.id)] = list;
    covered.add(String(video.id));
    console.log('[bili-comments] ' + video.id + ': ' + list.length + ' comments' + (list.some((comment) => comment.replyCount) ? ' (replies not fetched)' : ''));
  } catch (error) {
    comments[String(video.id)] = previous[String(video.id)] ?? [];
    console.warn('[bili-comments] ' + video.id + ' failed, will retry later: ' + error.message);
  }
  await new Promise((resolve) => setTimeout(resolve, 120));
}

if (selected.length) cursor = (selected[selected.length - 1].index + 1) % ordered.length;
const progress = {
  covered: covered.size,
  total: ordered.length,
  cycle,
  cursor,
  updatedAt: new Date().toISOString(),
  failed: selected.filter(({ video }) => !covered.has(String(video.id))).map(({ video }) => String(video.id)),
};
writeFileSync(STATE, JSON.stringify({ ...progress, covered: [...covered] }, null, 2) + '\n', 'utf8');

const publicProgress = { covered: progress.covered, total: progress.total, cycle: progress.cycle, updatedAt: progress.updatedAt };
const content = `/* 由 scripts/sync-bilibili-comments.mjs 生成，请勿手动编辑。 */
export interface BilibiliComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  replyCount?: number;
  date: string;
}

export interface BilibiliCommentProgress {
  covered: number;
  total: number;
  cycle: number;
  updatedAt: string;
}

export const BILIBILI_COMMENTS_SYNCED_AT = "${new Date().toISOString()}";

export const BILIBILI_COMMENT_PROGRESS: BilibiliCommentProgress = ${JSON.stringify(publicProgress, null, 2)};

export const BILIBILI_VIDEO_COMMENTS: Record<string, BilibiliComment[]> = ${JSON.stringify(comments, null, 2)};
`;
writeFileSync(OUTPUT, content, 'utf8');
console.log('[bili-comments] ' + selected.length + ' selected · ' + covered.size + '/' + ordered.length + ' covered');
