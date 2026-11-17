/**
 * 同步 GitHub 仓库快照 / Sync GitHub repository snapshots.
 *
 * 运行：node scripts/sync-github.mjs
 * GitHub Actions 会注入 GITHUB_TOKEN；本地无 Token 时使用匿名额度。
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT = path.join(ROOT, 'src/data/github.ts');
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const REPOS = [
  { name: 'whwdzg.github.io', role: 'site', title: '本站源码' },
  { name: 'better-crafting-recipes', role: 'datapack', title: '更好的合成配方' },
  { name: 'better-enchantments', role: 'datapack', title: '更好附魔' },
  { name: 'better-mob-drop', role: 'datapack', title: '更好的生物掉落' },
  { name: 'Magical_Dye', role: 'datapack', title: '魔法染料' },
  { name: 'only-survival-mode', role: 'datapack', title: 'Only Survival Mode' },
  { name: 'glowing-players', role: 'datapack', title: 'Glowing Players' },
  { name: 'Asteria-Player', role: 'subsite', title: 'Asteria Player' },
  { name: 'Life-Simulation-Wiki', role: 'subsite', title: '来福 Simulation Wiki' },
];

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'whwdzg-site/3.3 (+https://whwdzg.github.io)',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function fetchRepo(name) {
  const response = await fetch(`https://api.github.com/repos/whwdzg/${name}`, { headers });
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  const repo = await response.json();
  return {
    name,
    title: '',
    role: '',
    url: repo.html_url,
    description: repo.description ?? '',
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    openIssues: repo.open_issues_count ?? 0,
    language: repo.language ?? '',
    updatedAt: repo.updated_at ?? '',
    pushedAt: repo.pushed_at ?? '',
    archived: Boolean(repo.archived),
  };
}

const repos = [];
for (const entry of REPOS) {
  try {
    const repo = await fetchRepo(entry.name);
    repos.push({ ...repo, title: entry.title, role: entry.role });
    console.log(`✓ ${entry.name} ★${repo.stars} · ${repo.updatedAt}`);
  } catch (error) {
    console.warn(`! ${entry.name}: ${error.message}`);
  }
}

if (!repos.length) throw new Error('没有获取到任何 GitHub 仓库');
const fetchedAt = new Date().toISOString();
const output = `/**
 * GitHub 仓库快照 / GitHub repository snapshot.
 *
 * 由 scripts/sync-github.mjs 通过 GitHub API 生成；
 * 每小时由 GitHub Actions 同步，页面不直接依赖匿名 API。
 */
export interface GithubRepoSnapshot {
  name: string;
  title: string;
  role: 'site' | 'datapack' | 'subsite';
  url: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  language: string;
  updatedAt: string;
  pushedAt: string;
  archived: boolean;
}

export const GITHUB_SYNCED_AT = ${JSON.stringify(fetchedAt)};

export const GITHUB_REPOS: GithubRepoSnapshot[] = ${JSON.stringify(repos, null, 2)};

export function githubRepo(name: string): GithubRepoSnapshot | undefined {
  return GITHUB_REPOS.find((repo) => repo.name.toLowerCase() === name.toLowerCase());
}
`;
writeFileSync(OUTPUT, output);
console.log(`[github] ${repos.length} repos → ${path.relative(ROOT, OUTPUT)}`);
