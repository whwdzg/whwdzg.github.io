/**
 * 分批抓取 B 站视频评论快照。
 *
 * - 每次更新最多抓取 15 条视频的评论区；
 * - 只抓一级评论；接口返回的回复预览会作为楼中楼保存，不额外抓取全部分页；
 * - 表情从 content.emote 提取并渲染；
 * - 所有视频抓完后从最新视频重新开始；
 * - 失败视频不标记为已抓取，会在后续轮换中重试。
 *
 * 手动完整抓取：node scripts/sync-bilibili-comments.mjs --all
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const VIDEO_DATA = path.join(ROOT, 'src/data/videos.ts');
const OUTPUT = path.join(ROOT, 'src/data/bilibili-comments.ts');
const STATE = path.join(ROOT, 'scripts/bilibili-comments-state.json');
const BATCH = 15;
const ALL = process.argv.includes('--all');
const RETRY_FAILED = process.argv.includes('--retry-failed');
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

function emojisOf(content) {
  return Object.entries(content?.emote ?? {}).map(([token, emoji]) => ({
    token,
    url: String(emoji?.url ?? '').replace(/^http:/, 'https:'),
  })).filter((emoji) => emoji.token && emoji.url);
}

function siteAvatar(name, remote) {
  if (name === 'hxhej') return '/media/avatars/hxhej.webp';
  if (name === '沧海水鱼') return '/media/avatars/shuiyu.webp';
  return String(remote ?? '').replace(/^http:/, 'https:');
}

function toReply(reply) {
  const author = String(reply.member?.uname ?? 'B 站用户');
  return {
    id: String(reply.rpid ?? ''),
    author,
    avatar: siteAvatar(author, reply.member?.avatar),
    text: String(reply.content?.message ?? '').trim(),
    likes: Number(reply.like ?? 0),
    date: reply.ctime ? new Date(reply.ctime * 1000).toISOString() : '',
    emojis: emojisOf(reply.content),
  };
}

function toComment(reply) {
  const author = String(reply.member?.uname ?? 'B 站用户');
  return {
    id: String(reply.rpid ?? ''),
    author,
    avatar: siteAvatar(author, reply.member?.avatar),
    text: String(reply.content?.message ?? '').trim(),
    likes: Number(reply.like ?? 0),
    replyCount: Number(reply.rcount ?? reply.count ?? 0),
    date: reply.ctime ? new Date(reply.ctime * 1000).toISOString() : '',
    emojis: emojisOf(reply.content),
    replies: (reply.replies ?? []).map(toReply).filter((item) => item.text),
  };
}

async function refreshCookie() {
  try {
    const spi = await (await fetch('https://api.bilibili.com/x/frontend/finger/spi', { headers: HEADERS })).json();
    HEADERS.Cookie = 'buvid3=' + (spi.data?.b_3 ?? '') + '; buvid4=' + (spi.data?.b_4 ?? '') + ';';
  } catch {}
}
await refreshCookie();

async function fetchComments(video) {
  const url = 'https://api.bilibili.com/x/v2/reply?type=1&oid=' + video.aid + '&pn=1&ps=15&sort=2';
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { ...HEADERS, Referer: 'https://www.bilibili.com/video/' + video.bvid } });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const json = await response.json();
      if (json.code !== 0) throw new Error('Bilibili ' + json.code);
      return (json.data?.replies ?? []).map(toComment).filter((comment) => comment.text);
    } catch (error) {
      lastError = error;
      await refreshCookie();
      await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
    }
  }
  throw lastError;
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

if (ALL) {
  covered.clear();
  cursor = 0;
  console.log('[bili-comments] full scrape: ' + ordered.length + ' videos');
} else {
  const allCovered = ordered.length > 0 && ordered.every((video) => covered.has(String(video.id)));
  if (allCovered) {
    covered.clear();
    cursor = 0;
    cycle += 1;
    console.log('[bili-comments] all covered; starting a new cycle #' + cycle);
  }
}
if (!Number.isFinite(cursor) || cursor < 0) cursor = 0;

const selected = [];
if (RETRY_FAILED) {
  const failed = new Set((oldState?.failed ?? []).map(String));
  ordered.forEach((video, index) => { if (failed.has(String(video.id))) selected.push({ video, index }); });
  console.log('[bili-comments] retrying ' + selected.length + ' failed videos');
} else if (ALL) {
  ordered.forEach((video, index) => selected.push({ video, index }));
} else {
  for (let step = 0; step < ordered.length && selected.length < BATCH; step += 1) {
    const index = (cursor + step) % ordered.length;
    const video = ordered[index];
    if (!covered.has(String(video.id))) selected.push({ video, index });
  }
}

const selectedIds = new Set(selected.map(({ video }) => String(video.id)));
const comments = {};
for (const [id, value] of Object.entries(previous)) {
  if (!selectedIds.has(id)) {
    comments[id] = value.map((comment) => ({
      ...comment,
      replyCount: Number(comment.replyCount ?? 0),
      emojis: comment.emojis ?? [],
      replies: comment.replies ?? [],
    }));
  }
}

for (const { video } of selected) {
  try {
    const list = await fetchComments(video);
    comments[String(video.id)] = list;
    covered.add(String(video.id));
    console.log('[bili-comments] ' + video.id + ': ' + list.length + ' comments' + (list.some((comment) => comment.replies.length) ? ' · nested replies' : ''));
  } catch (error) {
    comments[String(video.id)] = (previous[String(video.id)] ?? []).map((comment) => ({
      ...comment,
      replyCount: Number(comment.replyCount ?? 0),
      emojis: comment.emojis ?? [],
      replies: comment.replies ?? [],
    }));
    console.warn('[bili-comments] ' + video.id + ' failed, will retry later: ' + error.message);
  }
  await new Promise((resolve) => setTimeout(resolve, ALL ? 60 : 120));
}

if (selected.length) cursor = ALL ? 0 : (selected[selected.length - 1].index + 1) % ordered.length;
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
export interface BilibiliCommentEmoji {
  token: string;
  url: string;
}

export interface BilibiliCommentReply {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  date: string;
  emojis: BilibiliCommentEmoji[];
}

export interface BilibiliComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  replyCount?: number;
  date: string;
  emojis: BilibiliCommentEmoji[];
  replies: BilibiliCommentReply[];
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
