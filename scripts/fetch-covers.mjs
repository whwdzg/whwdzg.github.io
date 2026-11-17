/**
 * 抓取 B 站封面与元数据 / Refresh Bilibili covers and metadata.
 *
 * 手动运行：npm run fetch:covers
 *
 * 说明：
 * - 只抓取仍然公开的视频；已私密 / 已失效会返回 62002 / 62012，脚本会保留旧封面；
 * - 封面直接请求 `@640w_360h.webp`，B 站 CDN 返回 WebP，无需本地转码；
 * - 抓取完成后自动运行 build-videos-data.mjs，重新生成 src/data/videos.ts。
 *
 * 这是一个开发期脚本，不参与 CI 构建；构建只使用已经落盘的本地资源。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'scripts/bilibili-source.json');
const CACHE = path.join(ROOT, 'scripts/bilibili-cache.json');
const COVER_DIR = path.join(ROOT, 'public/media/bilibili');
const BUILDER = path.join(ROOT, 'scripts/build-videos-data.mjs');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
const HEADERS = { 'User-Agent': UA, Referer: 'https://www.bilibili.com/', Accept: 'application/json' };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 合集使用人工挑选的合集封面；id 3 的旧链接与视频不符，保留本地封面。
const KEEP_LOCAL_COVER = new Set([1, 3, 5]);
const source = JSON.parse(readFileSync(SOURCE, 'utf8'));
const cache = JSON.parse(readFileSync(CACHE, 'utf8'));

mkdirSync(COVER_DIR, { recursive: true });

function bvidOf(url = '') {
  const match = url.match(/\/video\/(BV[0-9A-Za-z]+)/);
  return match ? match[1] : '';
}

async function fetchOne(video) {
  const bvid = bvidOf(video.href || '');
  if (!bvid) return { id: video.id, skipped: 'no-bvid' };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
        headers: HEADERS,
      });
      const data = await response.json();
      if (data.code !== 0) {
        cache[bvid] = { code: data.code, message: data.message };
        return { id: video.id, bvid, status: data.code, message: data.message };
      }

      const detail = data.data;
      const meta = {
        code: 0,
        bvid,
        file: cache[bvid]?.file ?? `${bvid}.webp`,
        title: detail.title,
        pubdate: detail.pubdate,
        duration: detail.duration,
        view: detail.stat?.view,
        danmaku: detail.stat?.danmaku,
        owner: detail.owner?.name,
        pic: `${String(detail.pic).replace(/^http:/, 'https:')}@640w_360h.webp`,
      };

      const localFile = path.join(COVER_DIR, `v${String(video.id).padStart(2, '0')}.webp`);
      const hasLocalCover = existsSync(localFile) && statSync(localFile).size > 0;
      if (!KEEP_LOCAL_COVER.has(video.id) && !hasLocalCover) {
        const image = await fetch(meta.pic, { headers: HEADERS });
        if (!image.ok) throw new Error(`封面请求失败 HTTP ${image.status}`);
        const buffer = Buffer.from(await image.arrayBuffer());
        writeFileSync(localFile, buffer);
        meta.local = `v${String(video.id).padStart(2, '0')}.webp`;
      } else if (hasLocalCover) {
        meta.local = cache[bvid]?.local ?? `v${String(video.id).padStart(2, '0')}.webp`;
      }

      cache[bvid] = meta;
      return { id: video.id, bvid, title: detail.title, saved: meta.local ?? 'kept-local' };
    } catch (error) {
      if (attempt === 2) return { id: video.id, bvid, error: error.message };
      await sleep(500 * (attempt + 1));
    }
  }
  return { id: video.id, bvid, error: 'unknown' };
}

const queue = [...source];
let done = 0;
const results = [];

async function worker() {
  while (queue.length) {
    const video = queue.shift();
    const result = await fetchOne(video);
    done += 1;
    results.push(result);
    console.log(`[${done}/${source.length}]`, JSON.stringify(result));
    await sleep(120);
  }
}

await Promise.all([worker(), worker(), worker()]);
writeFileSync(CACHE, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
console.log('[covers] 写入 scripts/bilibili-cache.json');

// 重新生成前端数据（封面路径、时长、播放量、缺失日期）。
execFileSync(process.execPath, [BUILDER], { cwd: ROOT, stdio: 'inherit' });
console.log('[covers] 完成');
