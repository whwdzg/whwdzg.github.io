/** 从 git 历史生成 Modrinth 下载 / 关注趋势。 / Build Modrinth trend history from git snapshots. */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'src/data/projects/modrinth.ts');
const OUTPUT = path.join(ROOT, 'src/data/projects/modrinth-history.ts');
const CURRENT = readFileSync(SOURCE, 'utf8');
const currentMatch = CURRENT.match(/MODRINTH_PROJECTS: ModrinthProjectSnapshot\[\] = (\[[\s\S]*?\]);/);
const syncedMatch = CURRENT.match(/MODRINTH_SYNCED_AT = "([^"]+)"/);
if (!currentMatch) throw new Error('cannot read current Modrinth projects');
const currentProjects = JSON.parse(currentMatch[1]);
const currentDate = (syncedMatch?.[1] ?? new Date().toISOString()).slice(0, 10);
const series = new Map();

function add(rows, date) {
  if (!date) return;
  for (const project of rows) {
    if (!project?.localSlug) continue;
    if (!series.has(project.localSlug)) series.set(project.localSlug, new Map());
    series.get(project.localSlug).set(date, {
      date,
      downloads: Number(project.downloads ?? 0),
      followers: Number(project.followers ?? 0),
    });
  }
}

let commits = [];
try {
  commits = execFileSync('git', ['log', '--format=%H', '--', 'src/data/projects/modrinth.ts'], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
} catch {}
for (const sha of commits) {
  try {
    const date = execFileSync('git', ['show', '-s', '--format=%cI', sha], { cwd: ROOT, encoding: 'utf8' }).trim().slice(0, 10);
    const text = execFileSync('git', ['show', sha + ':src/data/projects/modrinth.ts'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    const match = text.match(/MODRINTH_PROJECTS: ModrinthProjectSnapshot\[\] = (\[[\s\S]*?\]);/);
    if (match) add(JSON.parse(match[1]), date);
  } catch {}
}
add(currentProjects, currentDate);

const history = {};
for (const [slug, points] of series) {
  history[slug] = [...points.values()].sort((a, b) => a.date.localeCompare(b.date));
}
const content = `/* 由 scripts/build-modrinth-history.mjs 生成，请勿手动编辑。 */
export interface ModrinthHistoryPoint {
  date: string;
  downloads: number;
  followers: number;
}

export const MODRINTH_HISTORY: Record<string, ModrinthHistoryPoint[]> = ${JSON.stringify(history, null, 2)};
`;
writeFileSync(OUTPUT, content, 'utf8');
for (const [slug, points] of Object.entries(history)) console.log('[modrinth-history] ' + slug + ': ' + points.length + ' points');
