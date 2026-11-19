/**
 * 抓取哔哩哔哩个人主页公开数据。
 * 输出个人资料、直播房间、近期动态与专栏，供个人主页和子页使用。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT = path.join(ROOT, 'src/data/bilibili-profile.ts');
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

function toDynamicComment(reply) {
  return {
    id: String(reply.rpid ?? ''),
    author: String(reply.member?.uname ?? 'B 站用户'),
    avatar: String(reply.member?.avatar ?? '').replace(/^http:/, 'https:'),
    text: String(reply.content?.message ?? '').trim(),
    likes: Number(reply.like ?? 0),
    date: reply.ctime ? new Date(reply.ctime * 1000).toISOString() : '',
  };
}

async function fetchOpusDetail(id) {
  const response = await fetch('https://www.bilibili.com/opus/' + id, { headers: MOBILE_HEADERS });
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
  };
}

async function fetchDynamicComments(commentType, commentOid) {
  if (!commentType || !commentOid) return [];
  const response = await fetch('https://api.bilibili.com/x/v2/reply?type=' + commentType + '&oid=' + commentOid + '&pn=1&ps=6&sort=2', { headers: HEADERS });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const json = await response.json();
  if (json.code !== 0) return [];
  return (json.data?.replies ?? []).map(toDynamicComment).filter((comment) => comment.text);
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
  stats: {
    like: Number(item.stat?.like ?? 0),
    coin: 0,
    favorite: 0,
    share: 0,
    comment: 0,
  },
  comments: [],
}));

for (const dynamic of dynamics) {
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
    if (Number(detail.stat.comment?.count ?? 0) > 0) {
      dynamic.comments = await fetchDynamicComments(detail.basic.comment_type, detail.basic.comment_id_str);
    }
    console.log('[bilibili-profile] dynamic ' + dynamic.id + ' · like ' + dynamic.stats.like + ' · comments ' + dynamic.comments.length);
  } catch (error) {
    console.warn('[bilibili-profile] dynamic ' + dynamic.id + ' detail failed: ' + error.message);
  }
  await sleep(120);
}
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

export interface BilibiliDynamicComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  date: string;
}

export interface BilibiliDynamic {
  id: string;
  url: string;
  text: string;
  likes: number;
  cover: string;
  date: string;
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
