/**
 * 同步 Modrinth 项目快照到 src/data/projects/modrinth.ts。
 * 图标已经转换为本地 WebP，本脚本只更新数字与版本元数据。
 *
 * 运行：node --dns-result-order=ipv4first scripts/sync-modrinth.mjs
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const SITE = path.resolve(import.meta.dirname, '..');
const headers = { 'User-Agent': 'whwdzg-site/3.2 (+https://whwdzg.github.io)' };
const LOCAL = {
  'better-crafting-recipes': { localSlug: 'better-crafting-recipes', path: '/projects/better-crafting-recipes/' },
  'better-enchantment': { localSlug: 'better-enchantments', path: '/projects/better-enchantments/' },
  'better-mob-drop': { localSlug: 'better-mob-drop', path: '/projects/better-mob-drop/' },
  'only-survival-mode': { localSlug: 'only-survival-mode', path: '/projects/only-survival-mode/' },
  glowing_players: { localSlug: 'glowing-players', path: '/projects/glowing-players/' },
  magical_dye: { localSlug: 'magical-dye', path: '/projects/magical-dye/' },
};

const projects = [];
for (const [slug, local] of Object.entries(LOCAL)) {
  const [projectResponse, versionsResponse] = await Promise.all([
    fetch(`https://api.modrinth.com/v2/project/${slug}`, { headers }),
    fetch(`https://api.modrinth.com/v2/project/${slug}/version`, { headers }),
  ]);
  if (!projectResponse.ok) throw new Error(`${slug}: project ${projectResponse.status}`);
  if (!versionsResponse.ok) throw new Error(`${slug}: versions ${versionsResponse.status}`);
  const project = await projectResponse.json();
  const versions = await versionsResponse.json();
  const latest = versions[0] ?? {};
  projects.push({
    slug,
    localSlug: local.localSlug,
    path: local.path,
    icon: `/media/projects/${local.localSlug}.webp`,
    title: project.title,
    description: project.description,
    downloads: project.downloads ?? 0,
    followers: project.followers ?? 0,
    latestVersion: String(latest.version_number ?? '').replace(/\+mod$/, ''),
    latestVersionName: String(latest.name ?? ''),
    latestVersionDate: latest.date_published ?? '',
    gameVersions: project.game_versions ?? [],
    loaders: project.loaders ?? [],
    categories: project.categories ?? [],
    updated: project.updated ?? '',
    published: project.published ?? '',
    license: project.license?.id ?? '',
    sourceUrl: project.source_url ?? '',
    issuesUrl: project.issues_url ?? '',
    modrinthUrl: `https://modrinth.com/datapack/${project.slug}`,
  });
}

const totals = projects.reduce(
  (sum, project) => ({
    downloads: sum.downloads + project.downloads,
    followers: sum.followers + project.followers,
  }),
  { downloads: 0, followers: 0 },
);

const content = `/* 由 scripts/sync-modrinth.mjs 生成，请勿手动编辑。 */
export interface ModrinthProjectSnapshot {
  slug: string;
  localSlug: string;
  path: string;
  icon: string;
  title: string;
  description: string;
  downloads: number;
  followers: number;
  latestVersion: string;
  latestVersionName: string;
  latestVersionDate: string;
  gameVersions: string[];
  loaders: string[];
  categories: string[];
  updated: string;
  published: string;
  license: string;
  sourceUrl: string;
  issuesUrl: string;
  modrinthUrl: string;
}

export const MODRINTH_SYNCED_AT = ${JSON.stringify(new Date().toISOString())};

export const MODRINTH_TOTALS = ${JSON.stringify(totals, null, 2)} as const;

export const MODRINTH_PROJECTS: ModrinthProjectSnapshot[] = ${JSON.stringify(projects, null, 2)};

export function modrinthProject(slug: string): ModrinthProjectSnapshot | undefined {
  return MODRINTH_PROJECTS.find((project) => project.slug === slug || project.localSlug === slug);
}
`;

writeFileSync(path.join(SITE, 'src/data/projects/modrinth.ts'), content, 'utf8');
console.log(`[modrinth] ${projects.length} projects, ${totals.downloads} downloads`);
