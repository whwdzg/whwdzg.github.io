/**
 * 同步 B 站空间当前公开视频到 scripts/bilibili-source.json。
 *
 * 空间列表接口容易被风控；这里使用 B 站搜索接口按 UP 主 mid 过滤，
 * 搜索接口同样需要 WBI 签名。只追加尚未出现在 source 中的 BV 号，
 * 已有条目的标题、简介与状态保持人工整理结果。
 *
 * 新条目随后由 fetch-covers.mjs 补全封面 / 时长 / 播放量。
 * 运行：node --dns-result-order=ipv4first scripts/sync-bilibili-space.mjs
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'scripts/bilibili-source.json');
const MID = 588003657;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
const HEADERS = { 'User-Agent': UA, Referer: 'https://search.bilibili.com/', Accept: 'application/json' };
const MIXIN = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
  37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isoDate(timestamp) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp * 1000));
}

let mixinKey = '';
async function initWbi() {
  const response = await fetch('https://api.bilibili.com/x/web-interface/nav', { headers: HEADERS });
  const json = await response.json();
  const img = String(json.data?.wbi_img?.img_url ?? '').split('/').pop()?.split('.')[0] ?? '';
  const sub = String(json.data?.wbi_img?.sub_url ?? '').split('/').pop()?.split('.')[0] ?? '';
  mixinKey = MIXIN.map((index) => (img + sub)[index] ?? '').join('').slice(0, 32);
  if (!mixinKey) throw new Error('WBI key unavailable');
}

function sign(params) {
  const input = { ...params, t: Math.floor(Date.now() / 1000) };
  const ordered = Object.keys(input)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(input[key]).replace(/[!'()*]/g, ''))}`)
    .join('&');
  return `${ordered}&w_rid=${createHash('md5').update(ordered + mixinKey).digest('hex')}`;
}

async function searchPage(page) {
  const query = sign({ search_type: 'video', keyword: '沧海水鱼', order: 'pubdate', page, page_size: 50 });
  const response = await fetch(`https://api.bilibili.com/x/web-interface/wbi/search/type?${query}`, {
    headers: HEADERS,
  });
  const json = await response.json();
  if (json.code !== 0) throw new Error(`search API ${json.code}: ${json.message}`);
  return json.data ?? {};
}

const source = JSON.parse(readFileSync(SOURCE, 'utf8'));
const known = new Set(
  source
    .map((video) => String(video.href ?? '').match(/\/video\/(BV[0-9A-Za-z]+)/)?.[1])
    .filter(Boolean),
);
let maxId = source.reduce((max, video) => Math.max(max, Number(video.id) || 0), 0);

await initWbi();
const found = new Map();
for (let page = 1; page <= 8; page += 1) {
  const data = await searchPage(page);
  const results = data.result ?? [];
  for (const video of results) {
    if (Number(video.mid) !== MID || !video.bvid) continue;
    found.set(video.bvid, video);
  }
  console.log(`[bilibili] page ${page}: ${results.length} results, ${found.size} own`);
  if (results.length < 50) break;
  await sleep(500);
}

const added = [];
for (const video of [...found.values()].sort((a, b) => b.pubdate - a.pubdate)) {
  if (known.has(video.bvid)) continue;
  maxId += 1;
  known.add(video.bvid);
  added.push({
    id: maxId,
    title: video.title,
    img: '',
    alt: video.title,
    badge: '',
    badgeText: '',
    desc: video.description || '-',
    date: isoDate(video.pubdate),
    range: '',
    count: '',
    href: `https://www.bilibili.com/video/${video.bvid}`,
    linkText: '在哔哩哔哩观看',
    disabled: false,
  });
}

added.sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.id - b.id);
source.push(...added);
writeFileSync(SOURCE, `${JSON.stringify(source, null, 2)}\n`, 'utf8');
console.log(`[bilibili] found=${found.size}, added=${added.length}, source=${source.length}`);
for (const video of added.slice(0, 12)) console.log(` + ${video.id} ${video.date} ${video.title}`);
