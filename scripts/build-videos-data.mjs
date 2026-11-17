/**
 * 由抓取缓存生成前端视频数据 / Build the typed video dataset.
 *
 * 输入：
 *   scripts/bilibili-source.json —— 2.0 站点的哔哩哔哩归档（人工整理过的标题、简介、状态）
 *   scripts/bilibili-cache.json  —— fetch-covers.mjs 抓取到的 B 站元数据（时长、播放量、发布日期）
 * 输出：
 *   src/data/videos.ts
 *
 * 这样既保留了旧站的人工描述，又能用 B 站接口补全封面、时长与缺失日期。
 * 运行：node scripts/build-videos-data.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const source = JSON.parse(readFileSync(path.join(ROOT, 'scripts/bilibili-source.json'), 'utf8'));
const cache = JSON.parse(readFileSync(path.join(ROOT, 'scripts/bilibili-cache.json'), 'utf8'));

const pad = (id) => `v${String(id).padStart(2, '0')}.webp`;

function isoDate(timestamp) {
  if (!timestamp) return null;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp * 1000));
}

function bvidOf(url = '') {
  const match = url.match(/\/video\/(BV[0-9A-Za-z]+)/);
  return match ? match[1] : '';
}

const videos = source.map((video) => {
  let url = video.href || '';
  // 旧数据里的一个笔误：hhttps://
  if (url.startsWith('hhttps://')) url = url.slice(1);

  const bvid = bvidOf(url);
  const meta = bvid ? cache[bvid] : null;

  const status =
    video.badge === 'collection'
      ? 'collection'
      : video.badge === 'live'
        ? 'live'
        : video.badge === 'private'
        ? 'private'
        : video.badge === 'offline'
          ? 'offline'
          : 'public';

  // 合集封面/时长是单条视频的数据，不能直接套到合集卡片上；
  // id 3 的旧链接指向了另一条视频，也不能使用它的接口数据。
  const apiOk = Boolean(meta && meta.code === 0 && status !== 'collection' && video.id !== 3);

  const date = video.date || (apiOk ? isoDate(meta.pubdate) : null) || null;
  const endDate = video.range ? video.range.split(' ~ ')[1] : null;
  const count = video.count ? Number(video.count) : null;
  const disabled =
    status === 'offline' || /失效|丢失/.test(video.linkText || '') || !url;

  // 旧站第 3 条视频的链接实际指向了另一条「方向盘」视频。
  // 与其保留一个错误链接，不如跳到 B 站搜索，方便读者自行找到原片。
  let note;
  if (video.id === 3) {
    url = `https://search.bilibili.com/all?keyword=${encodeURIComponent(video.title)}`;
    note = '原链接指向了另一条视频，这里改为在哔哩哔哩搜索标题。';
  }
  if (video.id === 25) {
    note = '原链接已丢失，仅保留归档记录。';
  }
  if (video.id === 11) {
    note = '原链接曾在旧站中写错，此处已修正为 B 站视频地址。';
  }

  return {
    id: video.id,
    title: video.title,
    description: video.desc && video.desc !== '-' ? video.desc : '',
    cover: `/media/bilibili/${pad(video.id)}`,
    coverAlt: video.alt || video.title,
    date,
    endDate,
    count,
    status,
    bvid: video.id === 3 ? '' : bvid,
    url,
    label: video.linkText || '',
    disabled,
    durationSeconds: apiOk ? meta.duration : null,
    views: apiOk ? meta.view : null,
    note,
  };
});

// 日期倒序，没有日期的记录排在最后；同日按原有 id 排序。
videos.sort((a, b) => {
  if (a.date && b.date) return b.date.localeCompare(a.date) || a.id - b.id;
  if (a.date) return -1;
  if (b.date) return 1;
  return a.id - b.id;
});

const years = [...new Set(videos.map((video) => video.date?.slice(0, 4)).filter(Boolean))]
  .sort()
  .reverse();

const stats = {
  total: videos.length,
  collection: videos.filter((video) => video.status === 'collection').length,
  live: videos.filter((video) => video.status === 'live').length,
  private: videos.filter((video) => video.status === 'private').length,
  offline: videos.filter((video) => video.status === 'offline').length,
  public: videos.filter((video) => video.status === 'public').length,
  playable: videos.filter((video) => !video.disabled).length,
  years,
};

const header = `/**
 * 哔哩哔哩影像归档数据 / Bilibili archive dataset.
 *
 * 本文件由 scripts/build-videos-data.mjs 生成，请不要手动编辑。
 * 数据来源：2.0 站点的人工归档 + B 站公开接口（封面 / 时长 / 播放量）。
 * 封面均已落盘为 640×360 的本地 WebP，避免运行时跨域与慢速外链。
 *
 * 重新生成：node scripts/build-videos-data.mjs
 */
export type VideoStatus = 'public' | 'collection' | 'live' | 'private' | 'offline';

export interface Video {
  /** 旧站中的稳定编号，同时决定封面文件名 */
  id: number;
  title: string;
  description: string;
  cover: string;
  coverAlt: string;
  /** YYYY-MM-DD，未知时为 null */
  date: string | null;
  /** 合集结束日期，仅合集使用 */
  endDate: string | null;
  /** 合集内视频数量 */
  count: number | null;
  status: VideoStatus;
  bvid: string;
  url: string;
  /** 旧站按钮文案，用于保留「链接已失效」等状态 */
  label: string;
  disabled: boolean;
  durationSeconds: number | null;
  views: number | null;
  note?: string;
}

`;

const body = `export const videos: Video[] = ${JSON.stringify(videos, null, 2)};\n\n`;
const footer = `export const videoStats = ${JSON.stringify(stats, null, 2)} as const;\n\nexport const videosById = new Map(videos.map((video) => [video.id, video]));\n`;
writeFileSync(path.join(ROOT, 'src/data/videos.ts'), header + body + footer, 'utf8');

console.log(`[videos] ${videos.length} records · ${stats.years.join(', ')} · ${stats.playable} playable`);
