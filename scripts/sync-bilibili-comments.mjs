/**
 * 抓取最近视频的 B 站评论快照。
 * 只覆盖最近 24 条可播放视频，避免每天请求全部归档；其余视频在 B 站查看。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const VIDEO_DATA = path.join(ROOT, 'src/data/videos.ts');
const OUTPUT = path.join(ROOT, 'src/data/bilibili-comments.ts');
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
  Referer: 'https://www.bilibili.com/',
  Accept: 'application/json',
};

function parsePrevious() {
  try {
    const text = readFileSync(OUTPUT, 'utf8');
    const match = text.match(/BILIBILI_VIDEO_COMMENTS: Record<string, BilibiliComment\[\]> = (\{[\s\S]*?\});/);
    return match ? JSON.parse(match[1]) : {};
  } catch {
    return {};
  }
}

function toComment(reply) {
  return {
    id: String(reply.rpid ?? ''),
    author: String(reply.member?.uname ?? 'B 站用户'),
    avatar: String(reply.member?.avatar ?? '').replace(/^http:/, 'https:'),
    text: String(reply.content?.message ?? '').trim(),
    likes: Number(reply.like ?? 0),
    date: reply.ctime ? new Date(reply.ctime * 1000).toISOString() : '',
  };
}

async function fetchComments(video) {
  const url = 'https://api.bilibili.com/x/v2/reply?type=1&oid=' + video.aid + '&pn=1&ps=8&sort=2';
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const json = await response.json();
  if (json.code !== 0) return [];
  return (json.data?.replies ?? []).map(toComment).filter((comment) => comment.text);
}

const text = readFileSync(VIDEO_DATA, 'utf8');
const match = text.match(/videos: Video\[\] = (\[[\s\S]*?\]);/);
if (!match) throw new Error('cannot read videos');
const videos = JSON.parse(match[1])
  .filter((video) => video.aid && !video.disabled && video.status !== 'collection' && Number(video.stats?.reply ?? 0) > 0)
  .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')) || b.id - a.id)
  .slice(0, 24);
const previous = parsePrevious();
const comments = {};
for (const video of videos) {
  try {
    comments[String(video.id)] = await fetchComments(video);
    console.log('[bili-comments] ' + video.id + ': ' + comments[String(video.id)].length);
  } catch (error) {
    comments[String(video.id)] = previous[String(video.id)] ?? [];
    console.warn('[bili-comments] ' + video.id + ' failed: ' + error.message);
  }
  await new Promise((resolve) => setTimeout(resolve, 120));
}

const content = `/* 由 scripts/sync-bilibili-comments.mjs 生成，请勿手动编辑。 */
export interface BilibiliComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  date: string;
}

export const BILIBILI_COMMENTS_SYNCED_AT = "${new Date().toISOString()}";

export const BILIBILI_VIDEO_COMMENTS: Record<string, BilibiliComment[]> = ${JSON.stringify(comments, null, 2)};
`;
writeFileSync(OUTPUT, content, 'utf8');
console.log('[bili-comments] written');
