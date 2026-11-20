/**
 * 抓取哔哩哔哩个人主页公开数据。
 * 输出个人资料、直播房间、近期动态与专栏，供个人主页和子页使用。
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT = path.join(ROOT, 'src/data/bilibili-profile.ts');
const DYNAMIC_STATE = path.join(ROOT, 'scripts/bilibili-dynamics-comments-state.json');
const ALL_DYNAMIC_COMMENTS = process.argv.includes('--all-comments');
const RETRY_DYNAMIC_FAILED = process.argv.includes('--retry-failed');
const DYNAMIC_COMMENT_BATCH = 15;
const MEDIA_DIR = path.join(ROOT, 'public/media/bilibili');
mkdirSync(MEDIA_DIR, { recursive: true });
const MID = '588003657';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
  Referer: 'https://space.bilibili.com/588003657',
};
const json = async (url) => {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const data = await response.json();
  if (data.code !== 0) throw new Error('Bilibili ' + data.code);
  return data.data;
};
const absolute = (value) => (typeof value === 'string' && value ? value.replace(/^\/\//, 'https://') : '');
async function cacheImage(url, filename) {
  if (!url) return '';
  try {
    const response = await fetch(url, { headers: { ...HEADERS, Referer: 'https://www.bilibili.com/' } });
    if (!response.ok) return url;
    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(path.join(MEDIA_DIR, filename), buffer);
    return '/media/bilibili/' + filename;
  } catch {
    return url;
  }
}

const MOBILE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36',
  Referer: 'https://www.bilibili.com/',
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function refreshCookie() {
  try {
    const spi = await (await fetch('https://api.bilibili.com/x/frontend/finger/spi', { headers: MOBILE_HEADERS })).json();
    const cookie = 'buvid3=' + (spi.data?.b_3 ?? '') + '; buvid4=' + (spi.data?.b_4 ?? '') + ';';
    MOBILE_HEADERS.Cookie = cookie;
    HEADERS.Cookie = cookie;
  } catch {}
}
await refreshCookie();

function commentEmojis(content) {
  return Object.entries(content?.emote ?? {}).map(([token, emoji]) => {
    const gif = String(emoji?.gif_url ?? '').replace(/^http:/, 'https:');
    const still = String(emoji?.url ?? '').replace(/^http:/, 'https:');
    return { token, url: gif || still, animated: Boolean(gif) };
  }).filter((emoji) => emoji.token && emoji.url);
}

function commentImages(content) {
  return (content?.pictures ?? []).map((picture) => {
    const raw = String(picture?.img_src ?? picture?.url ?? '').replace(/^http:/, 'https:');
    const format = String(picture?.img_format ?? '').toLowerCase();
    return { url: raw, width: Number(picture?.img_width ?? 0), height: Number(picture?.img_height ?? 0), animated: /gif|webp/i.test(raw) || format.includes('gif') || format.includes('webp') };
  }).filter((image) => image.url);
}

function toDynamicReply(reply) {
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
    date: reply.ctime ? new Date(reply.ctime * 1000).toISOString() : '',
    emojis: commentEmojis(reply.content),
    images: commentImages(reply.content),
  };
}

function toDynamicComment(reply) {
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
    emojis: commentEmojis(reply.content),
    images: commentImages(reply.content),
    replies: (reply.replies ?? []).map(toDynamicReply).filter((item) => item.text),
  };
}

function extractContent(detail) {
  const module = detail.modules?.find((entry) => entry.module_type === 'MODULE_TYPE_CONTENT')?.module_content;
  const paragraphs = module?.paragraphs ?? [];
  const emojis = new Map();
  const images = [];
  let text = '';
  for (const paragraph of paragraphs) {
    for (const node of paragraph.text?.nodes ?? []) {
      if (node.type === 'TEXT_NODE_TYPE_WORD') {
        text += node.word?.words ?? '';
      } else if (node.type === 'TEXT_NODE_TYPE_RICH' && node.rich) {
        const rich = node.rich;
        if (rich.type === 'RICH_TEXT_NODE_TYPE_EMOJI' && rich.emoji) {
          const token = String(rich.text ?? rich.emoji.text ?? '');
          if (token && !emojis.has(token)) {
            emojis.set(token, {
              token,
              icon: String(rich.emoji.icon_url ?? rich.icon_url ?? '').replace(/^\/\//, 'https://'),
              jump: String(rich.jump_url ?? rich.emoji.jump_url ?? '').replace(/^\/\//, 'https://'),
            });
          }
        }
        text += String(rich.text ?? '');
      }
    }
    for (const picture of paragraph.pic?.pics ?? []) {
      const url = String(picture.url ?? '').replace(/^http:/, 'https:');
      if (url) images.push({ url, width: Number(picture.width ?? 0), height: Number(picture.height ?? 0) });
    }
    text += '\n\n';
  }
  return {
    text: text.replace(/\n{3,}/g, '\n\n').trim(),
    emojis: [...emojis.values()],
    images,
  };
}

async function fetchOpusDetail(id) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await refreshCookie();
      const response = await fetch('https://www.bilibili.com/opus/' + id + '?spm_id_from=333.1007.0.0', { headers: MOBILE_HEADERS });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const html = await response.text();
      const start = html.indexOf('window.__INITIAL_STATE__=');
      if (start < 0) throw new Error('no initial state');
      const end = html.indexOf(';(function()', start);
      const state = JSON.parse(html.slice(start + 'window.__INITIAL_STATE__='.length, end).trim());
      const detail = state.opus?.detail;
      if (!detail) throw new Error('no opus detail');
      const stat = detail.modules?.find((module) => module.module_type === 'MODULE_TYPE_STAT')?.module_stat;
      const author = detail.modules?.find((module) => module.module_type === 'MODULE_TYPE_AUTHOR')?.module_author;
      const basic = detail.basic ?? {};
      return {
        stat: stat ?? {},
        basic,
        pubTs: Number(author?.pub_ts ?? 0) || null,
        content: extractContent(detail),
      };
    } catch (error) {
      lastError = error;
      await refreshCookie();
      await sleep(2200 * (attempt + 1));
    }
  }
  throw lastError;
}

async function fetchDynamicReplies(commentType, commentOid, root) {
  const response = await fetch('https://api.bilibili.com/x/v2/reply/reply?type=' + commentType + '&oid=' + commentOid + '&root=' + root + '&pn=1&ps=10&sort=2', { headers: HEADERS });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const json = await response.json();
  if (json.code !== 0) return [];
  return (json.data?.replies ?? []).map(toDynamicReply).filter((reply) => reply.text);
}

async function fetchDynamicComments(commentType, commentOid) {
  if (!commentType || !commentOid) return [];
  const response = await fetch('https://api.bilibili.com/x/v2/reply?type=' + commentType + '&oid=' + commentOid + '&pn=1&ps=10&sort=2', { headers: HEADERS });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const json = await response.json();
  if (json.code !== 0) return [];
  const list = (json.data?.replies ?? []).map(toDynamicComment).filter((comment) => comment.text);
  for (const comment of list) {
    if (comment.replyCount > 0) {
      try {
        const replies = await fetchDynamicReplies(commentType, commentOid, comment.id);
        if (replies.length) comment.replies = replies;
      } catch {}
    }
  }
  return list;
}

function readJson(file, fallback) {
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return fallback; }
}

function previousDynamics() {
  try {
    const text = readFileSync(OUTPUT, 'utf8');
    const match = text.match(/BILIBILI_DYNAMICS: BilibiliDynamic\[\] = (\[[\s\S]*?\]);/);
    return match ? JSON.parse(match[1]) : [];
  } catch {
    return [];
  }
}

const card = await json('https://api.bilibili.com/x/web-interface/card?mid=' + MID);
const nav = await json('https://api.bilibili.com/x/space/navnum?mid=' + MID);
const live = await json('https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=' + MID);
const opus = await json('https://api.bilibili.com/x/polymer/web-dynamic/v1/opus/feed/space?host_mid=' + MID + '&page=1');
const article = await json('https://api.bilibili.com/x/space/article?mid=' + MID + '&pn=1&ps=10');

const dynamics = (opus.items ?? []).map((item) => ({
  id: String(item.opus_id ?? ''),
  url: absolute(item.jump_url),
  text: String(item.content ?? '').trim(),
  likes: Number(item.stat?.like ?? 0),
  cover: absolute(item.cover ?? ''),
  date: '',
  emojis: [],
  images: [],
  stats: {
    like: Number(item.stat?.like ?? 0),
    coin: 0,
    favorite: 0,
    share: 0,
    comment: 0,
  },
  comments: [],
}));

const previousDynamicList = previousDynamics();
const previousCommentsById = new Map(previousDynamicList.map((item) => [String(item.id), item.comments ?? []]));
const previousDynamicById = new Map(previousDynamicList.map((item) => [String(item.id), item]));
const oldDynamicState = readJson(DYNAMIC_STATE, null);
const dynamicCovered = new Set(Array.isArray(oldDynamicState?.covered) ? oldDynamicState.covered.map(String) : []);
let dynamicCursor = Number(oldDynamicState?.cursor ?? 0);
let dynamicCycle = Number(oldDynamicState?.cycle ?? 1);
let selectedDynamicIds;

if (ALL_DYNAMIC_COMMENTS) {
  dynamicCovered.clear();
  dynamicCursor = 0;
  selectedDynamicIds = new Set(dynamics.map((item) => item.id));
  console.log('[bilibili-profile] full dynamic comment scrape: ' + dynamics.length);
} else if (RETRY_DYNAMIC_FAILED) {
  selectedDynamicIds = new Set(dynamics.filter((item) => !dynamicCovered.has(item.id)).map((item) => item.id));
  console.log('[bilibili-profile] retrying ' + selectedDynamicIds.size + ' dynamic comments');
} else {
  const allCovered = dynamics.length > 0 && dynamics.every((item) => dynamicCovered.has(item.id));
  if (allCovered) {
    dynamicCovered.clear();
    dynamicCursor = 0;
    dynamicCycle += 1;
    console.log('[bilibili-profile] dynamic comments all covered; cycle #' + dynamicCycle);
  }
  if (!Number.isFinite(dynamicCursor) || dynamicCursor < 0) dynamicCursor = 0;
  selectedDynamicIds = new Set();
  for (let step = 0; step < dynamics.length && selectedDynamicIds.size < DYNAMIC_COMMENT_BATCH; step += 1) {
    const item = dynamics[(dynamicCursor + step) % dynamics.length];
    if (!dynamicCovered.has(item.id)) selectedDynamicIds.add(item.id);
  }
}

for (const dynamic of dynamics) {
  const previousDynamic = previousDynamicById.get(dynamic.id);
  if (previousDynamic) {
    dynamic.text = previousDynamic.text || dynamic.text;
    dynamic.date = previousDynamic.date || '';
    dynamic.stats = previousDynamic.stats ?? dynamic.stats;
    dynamic.emojis = previousDynamic.emojis ?? [];
    dynamic.images = previousDynamic.images ?? [];
  }
  dynamic.comments = (previousCommentsById.get(dynamic.id) ?? []).map((comment) => ({
    ...comment,
    replyCount: Number(comment.replyCount ?? 0),
    emojis: comment.emojis ?? [],
    images: comment.images ?? [],
    replies: comment.replies ?? [],
  }));
  try {
    const detail = await fetchOpusDetail(dynamic.id);
    dynamic.date = detail.pubTs ? new Date(detail.pubTs * 1000).toISOString() : '';
    dynamic.stats = {
      like: Number(detail.stat.like?.count ?? dynamic.stats.like),
      coin: Number(detail.stat.coin?.count ?? 0),
      favorite: Number(detail.stat.favorite?.count ?? 0),
      share: Number(detail.stat.forward?.count ?? 0),
      comment: Number(detail.stat.comment?.count ?? 0),
    };
    if (detail.content?.text) dynamic.text = detail.content.text;
    dynamic.emojis = [];
    for (const [index, emoji] of (detail.content?.emojis ?? []).entries()) {
      dynamic.emojis.push({ ...emoji, icon: await cacheImage(emoji.icon, 'dynamic-emoji-' + dynamic.id + '-' + index + '.png') });
    }
    dynamic.images = [];
    for (const [index, image] of (detail.content?.images ?? []).entries()) {
      dynamic.images.push({ ...image, url: await cacheImage(image.url, 'dynamic-' + dynamic.id + '-' + index + '.png') });
    }
    if (selectedDynamicIds.has(dynamic.id)) {
      if (Number(detail.stat.comment?.count ?? 0) > 0) {
        dynamic.comments = await fetchDynamicComments(detail.basic.comment_type, detail.basic.comment_id_str);
      }
      dynamicCovered.add(dynamic.id);
    }
    console.log('[bilibili-profile] dynamic ' + dynamic.id + ' · like ' + dynamic.stats.like + ' · comments ' + dynamic.comments.length + (selectedDynamicIds.has(dynamic.id) ? ' · updated' : ' · kept'));
  } catch (error) {
    console.warn('[bilibili-profile] dynamic ' + dynamic.id + ' detail failed: ' + error.message);
  }
  await sleep(RETRY_DYNAMIC_FAILED ? 2200 : 120);
}

if (selectedDynamicIds.size) dynamicCursor = ALL_DYNAMIC_COMMENTS ? 0 : (() => {
  let last = dynamicCursor;
  for (let index = 0; index < dynamics.length; index += 1) {
    if (selectedDynamicIds.has(dynamics[(dynamicCursor + index) % dynamics.length].id)) {
      last = (dynamicCursor + index + 1) % dynamics.length;
    }
  }
  return last;
})();
const dynamicProgress = {
  covered: dynamicCovered.size,
  total: dynamics.length,
  cycle: dynamicCycle,
  updatedAt: new Date().toISOString(),
  failed: dynamics.filter((item) => selectedDynamicIds.has(item.id) && !dynamicCovered.has(item.id)).map((item) => item.id),
};
writeFileSync(DYNAMIC_STATE, JSON.stringify({ ...dynamicProgress, cursor: dynamicCursor, covered: [...dynamicCovered] }, null, 2) + '\n', 'utf8');

const articleList = (article.articles ?? []).map((item) => ({
  id: Number(item.id ?? 0),
  title: String(item.title ?? ''),
  summary: String(item.summary ?? '').replace(/\[图片\]/g, ' ').trim(),
  url: 'https://www.bilibili.com/read/cv' + item.id,
  cover: absolute(item.image_urls?.[0] ?? item.banner_url ?? ''),
  date: item.publish_time ? new Date(item.publish_time * 1000).toISOString() : '',
  views: Number(item.stats?.view ?? 0),
  likes: Number(item.stats?.like ?? 0),
  words: Number(item.words ?? 0),
}));
const articles = [];
for (const item of articleList) {
  item.cover = await cacheImage(item.cover, 'article-' + item.id + '.jpg');
  articles.push(item);
}
const avatar = await cacheImage(absolute(card.card?.face ?? ''), 'avatar.webp');
const liveCover = await cacheImage(absolute(live.cover ?? ''), 'live-cover.jpg');

const content = `/* 由 scripts/sync-bilibili-profile.mjs 生成，请勿手动编辑。 */
export interface BilibiliProfile {
  name: string;
  uid: string;
  avatar: string;
  sign: string;
  level: number;
  fans: number;
  following: number;
  likes: number;
  videos: number;
  articles: number;
  opus: number;
  live: {
    active: boolean;
    roomStatus: number;
    title: string;
    cover: string;
    online: number;
    roomId: number;
    url: string;
  };
}

export interface BilibiliDynamicCommentEmoji {
  token: string;
  url: string;
  animated: boolean;
}

export interface BilibiliDynamicCommentImage {
  url: string;
  width: number;
  height: number;
  animated: boolean;
}

export interface BilibiliDynamicCommentReply {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  date: string;
  emojis: BilibiliDynamicCommentEmoji[];
  images: BilibiliDynamicCommentImage[];
}

export interface BilibiliDynamicComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  replyCount?: number;
  date: string;
  emojis: BilibiliDynamicCommentEmoji[];
  images: BilibiliDynamicCommentImage[];
  replies: BilibiliDynamicCommentReply[];
}

export interface BilibiliDynamic {
  id: string;
  url: string;
  text: string;
  likes: number;
  cover: string;
  date: string;
  emojis: Array<{ token: string; icon: string; jump: string }>;
  images: Array<{ url: string; width: number; height: number }>;
  stats: {
    like: number;
    coin: number;
    favorite: number;
    share: number;
    comment: number;
  };
  comments: BilibiliDynamicComment[];
}

export interface BilibiliArticle {
  id: number;
  title: string;
  summary: string;
  url: string;
  cover: string;
  date: string;
  views: number;
  likes: number;
  words: number;
}

export const BILIBILI_PROFILE_SYNCED_AT = "${new Date().toISOString()}";

export interface BilibiliDynamicCommentProgress {
  covered: number;
  total: number;
  cycle: number;
  updatedAt: string;
  failed?: string[];
}

export const BILIBILI_DYNAMIC_COMMENT_PROGRESS: BilibiliDynamicCommentProgress = ${JSON.stringify(dynamicProgress, null, 2)};

export const BILIBILI_PROFILE: BilibiliProfile = ${JSON.stringify({
  name: card.card?.name ?? '沧海水鱼',
  uid: String(card.card?.mid ?? MID),
  avatar,
  sign: String(card.card?.sign ?? ''),
  level: Number(card.card?.level_info?.current_level ?? 0),
  fans: Number(card.follower ?? card.card?.fans ?? 0),
  following: Number(card.card?.attention || card.following || 0),
  likes: Number(card.like_num ?? 0),
  videos: Number(nav.video ?? 0),
  articles: Number(nav.article ?? 0),
  opus: Number(nav.opus ?? 0),
  live: {
    active: Number(live.liveStatus ?? 0) === 1,
    roomStatus: Number(live.roomStatus ?? 0),
    title: String(live.title ?? ''),
    cover: liveCover,
    online: Number(live.online ?? 0),
    roomId: Number(live.roomid ?? 0),
    url: String(live.url ?? ''),
  },
}, null, 2)};

export const BILIBILI_DYNAMICS: BilibiliDynamic[] = ${JSON.stringify(dynamics, null, 2)};

export const BILIBILI_ARTICLES: BilibiliArticle[] = ${JSON.stringify(articles, null, 2)};
`;
writeFileSync(OUTPUT, content, 'utf8');
console.log('[bilibili-profile] ' + dynamics.length + ' dynamics, ' + articles.length + ' articles');
