/**
 * 同步 B 站视频合集 / Sync Bilibili UGC season episodes.
 *
 * 手动运行：node --dns-result-order=ipv4first scripts/sync-bilibili-seasons.mjs
 *
 * B 站 API 没有开放 CORS，静态站不能直接在浏览器请求；这个脚本在构建前
 * 通过公开 view 接口读取合集与全部成员视频，把封面下载到本地并生成
 * src/data/bilibili-collections.ts。运行时读取的是同一份在线 API 快照。
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'scripts/bilibili-source.json');
const COVER_ROOT = path.join(ROOT, 'public/media/bilibili/collections');
const OUTPUT = path.join(ROOT, 'src/data/bilibili-collections.ts');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
const HEADERS = { 'User-Agent': UA, Referer: 'https://www.bilibili.com/', Accept: 'application/json' };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const source = JSON.parse(readFileSync(SOURCE, 'utf8'));
const collectionEntries = source.filter((video) => video.badge === 'collection' && video.href);

function bvidOf(url = '') {
  return url.match(/\/video\/(BV[0-9A-Za-z]+)/)?.[1] ?? '';
}

function isoDate(timestamp) {
  if (!timestamp) return null;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp * 1000));
}

async function fetchJson(url) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: HEADERS });
      const json = await response.json();
      if (json.code === 0) return json.data;
      throw new Error(`${json.code}: ${json.message}`);
    } catch (error) {
      if (attempt === 3) throw error;
      await sleep(900 * (attempt + 1));
    }
  }
  throw new Error('无法读取 B 站接口');
}

async function downloadCover(url, file) {
  if (!url) return null;
  if (existsSync(file) && statSync(file).size > 0) return true;
  mkdirSync(path.dirname(file), { recursive: true });
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: HEADERS });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (!buffer.length) throw new Error('空封面');
      writeFileSync(file, buffer);
      return true;
    } catch (error) {
      if (attempt === 3) {
        console.warn(`  ! 封面失败 ${url}: ${error.message}`);
        return false;
      }
      await sleep(600 * (attempt + 1));
    }
  }
  return null;
}

async function main() {
  const collections = [];
  for (const entry of collectionEntries) {
    const videoBvid = bvidOf(entry.href);
    const data = await fetchJson(`https://api.bilibili.com/x/web-interface/view?bvid=${videoBvid}`);
    const season = data.ugc_season;
    if (!season) {
      console.warn(`! ${videoBvid} 没有 ugc_season，跳过`);
      continue;
    }

    const seasonDir = path.join(COVER_ROOT, String(season.id));
    const sections = [];
    let total = 0;
    for (const section of season.sections ?? []) {
      const episodes = [];
      for (const ep of section.episodes ?? []) {
        const episodeBvid = ep.bvid;
        const arc = ep.arc ?? {};
        const coverUrl = arc.pic ? `${String(arc.pic).replace(/^http:/, 'https:')}@640w_360h.webp` : '';
        const file = path.join(seasonDir, `${episodeBvid}.webp`);
        const localPath = `/media/bilibili/collections/${season.id}/${episodeBvid}.webp`;
        const ok = await downloadCover(coverUrl, file);
        episodes.push({
          bvid: episodeBvid,
          title: ep.title || arc.title || '未命名视频',
          cover: ok === false ? null : localPath,
          coverAlt: ep.title || arc.title || episodeBvid,
          date: isoDate(arc.pubdate),
          durationSeconds: Number(arc.duration ?? ep.page?.duration ?? 0) || null,
          views: Number(arc.stat?.view ?? 0) || null,
          section: section.title || '合集',
          url: `https://www.bilibili.com/video/${episodeBvid}/`,
        });
        total += 1;
      }
      sections.push({ title: section.title || '合集', episodes });
    }

    const cover =
      entry.id === 1
        ? '/media/bilibili/v01.webp'
        : entry.id === 5
          ? '/media/bilibili/v05.webp'
          : null;
    collections.push({
      id: entry.id,
      seasonId: season.id,
      videoBvid,
      title: season.title || entry.title,
      description: entry.desc || '',
      cover,
      coverAlt: season.title || entry.title,
      count: total,
      fetchedAt: new Date().toISOString(),
      sections,
    });
    console.log(`✓ ${season.title} (${season.id}) · ${total} 条 · ${sections.length} 个分区`);
  }

  // 内容未变化时保留旧的 fetchedAt，避免定时任务每周产生无意义提交。
  if (existsSync(OUTPUT)) {
    try {
      const old = readFileSync(OUTPUT, 'utf8');
      const oldJson = old.match(/BILIBILI_COLLECTIONS: BilibiliCollection\[\] = (\[[\s\S]*?\]);/)?.[1];
      if (oldJson) {
        const oldCollections = JSON.parse(oldJson);
        const fingerprint = (items) => JSON.stringify(items.map(({ fetchedAt, ...rest }) => rest));
        if (fingerprint(oldCollections) === fingerprint(collections)) {
          for (const collection of collections) {
            const previous = oldCollections.find((item) => item.id === collection.id);
            if (previous?.fetchedAt) collection.fetchedAt = previous.fetchedAt;
          }
        }
      }
    } catch {
      // 旧文件不可解析时直接写入新快照。
    }
  }

  const output = `/**
 * B 站视频合集数据 / Bilibili UGC season snapshot.
 *
 * 由 scripts/sync-bilibili-seasons.mjs 通过 B 站公开 view 接口生成。
 * 封面已下载到 public/media/bilibili/collections/<seasonId>/。
 * 重新生成：node --dns-result-order=ipv4first scripts/sync-bilibili-seasons.mjs
 */
export interface BilibiliCollectionEpisode {
  bvid: string;
  title: string;
  cover: string | null;
  coverAlt: string;
  date: string | null;
  durationSeconds: number | null;
  views: number | null;
  section: string;
  url: string;
}

export interface BilibiliCollectionSection {
  title: string;
  episodes: BilibiliCollectionEpisode[];
}

export interface BilibiliCollection {
  id: number;
  seasonId: number;
  videoBvid: string;
  title: string;
  description: string;
  cover: string | null;
  coverAlt: string;
  count: number;
  fetchedAt: string;
  sections: BilibiliCollectionSection[];
}

export const BILIBILI_COLLECTIONS: BilibiliCollection[] = ${JSON.stringify(collections, null, 2)};

export function collectionForBvid(bvid: string): BilibiliCollection | undefined {
  return BILIBILI_COLLECTIONS.find((collection) => collection.videoBvid === bvid);
}
`;
  writeFileSync(OUTPUT, output);
  console.log(`写入 ${path.relative(ROOT, OUTPUT)}`);
}

await main();
