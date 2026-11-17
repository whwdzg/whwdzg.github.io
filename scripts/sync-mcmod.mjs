/**
 * 抓取 MC百科（mcmod.cn）数据包条目快照。
 *
 * MC百科没有公开 JSON API，这里只解析 class 页面上的公开信息：
 * 标题、状态、总浏览、编辑次数、最后编辑、标签。解析失败时保留旧数据。
 *
 * 运行：node --dns-result-order=ipv4first scripts/sync-mcmod.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT = path.join(ROOT, 'src/data/projects/mcmod.ts');
const ENTRIES = [
  { slug: 'better-crafting-recipes', url: 'https://www.mcmod.cn/class/17614.html' },
  { slug: 'better-enchantments', url: 'https://www.mcmod.cn/class/22543.html' },
  { slug: 'better-mob-drop', url: 'https://www.mcmod.cn/class/17769.html' },
];

const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const compact = (value) => {
  if (!value) return 0;
  const number = Number.parseFloat(value);
  if (!Number.isFinite(number)) return 0;
  return value.includes('万') ? Math.round(number * 10000) : Math.round(number);
};

async function fetchEntry(entry) {
  const response = await fetch(entry.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
      'Accept-Language': 'zh-CN,zh;q=0.9',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  const titleMatch = html.match(/<div class="class-title">[\s\S]*?<h3>([\s\S]*?)<\/h3>\s*<h4>([\s\S]*?)<\/h4>/i);
  const title = strip(titleMatch?.[1] ?? '');
  const subtitle = strip(titleMatch?.[2] ?? '');
  const status = strip(html.match(/class="class-status[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? '');
  const source = strip(html.match(/class="class-source[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? '');
  const viewsLabel = html.match(/<p class="n">([^<]+)<\/p>\s*<p class="t">总浏览<\/p>/i)?.[1] ?? '';
  const views = compact(viewsLabel);
  const info = strip(html);
  const edits = Number.parseInt(info.match(/编辑次数:\s*(\d+)/)?.[1] ?? '', 10) || 0;
  const lastEdit = info.match(/最后编辑:\s*([^ ]+)/)?.[1] ?? '';
  const tags = strip(html.match(/模组标签:\s*<ul>([\s\S]*?)<\/ul>/i)?.[1] ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  return {
    slug: entry.slug,
    url: entry.url,
    title: title || entry.slug,
    subtitle,
    status: [status, source].filter(Boolean).join(' · '),
    views,
    viewsLabel,
    edits,
    lastEdit,
    tags,
    fetchedAt: new Date().toISOString(),
  };
}

const previous = (() => {
  try {
    const text = readFileSync(OUTPUT, 'utf8');
    const match = text.match(/export const MCMOD_PROJECTS: McmodEntry\[\] = (\[[\s\S]*?\]);/);
    return match ? JSON.parse(match[1]) : [];
  } catch {
    return [];
  }
})();

const projects = [];
for (const entry of ENTRIES) {
  try {
    const data = await fetchEntry(entry);
    projects.push(data);
    console.log(`[mcmod] ${entry.slug}: ${data.title} · ${data.views} views`);
  } catch (error) {
    const old = previous.find((item) => item.slug === entry.slug);
    if (old) {
      projects.push(old);
      console.warn(`[mcmod] ${entry.slug} failed, keep previous: ${error.message}`);
    } else {
      console.warn(`[mcmod] ${entry.slug} failed: ${error.message}`);
    }
  }
}

const content = `/* 由 scripts/sync-mcmod.mjs 生成，请勿手动编辑。 */
export interface McmodEntry {
  slug: string;
  url: string;
  title: string;
  subtitle: string;
  status: string;
  views: number;
  viewsLabel: string;
  edits: number;
  lastEdit: string;
  tags: string;
  fetchedAt: string;
}

export const MCMOD_PROJECTS: McmodEntry[] = ${JSON.stringify(projects, null, 2)};

export function mcmodProject(slug: string): McmodEntry | undefined {
  return MCMOD_PROJECTS.find((project) => project.slug === slug);
}
`;
writeFileSync(OUTPUT, content, 'utf8');
console.log(`[mcmod] ${projects.length} entries written`);
