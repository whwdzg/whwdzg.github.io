/**
 * 同步 GitHub 仓库快照 / Sync GitHub repository snapshots.
 *
 * 运行：node scripts/sync-github.mjs
 * GitHub Actions 会注入 GITHUB_TOKEN；本地无 Token 时使用匿名额度。
 * 有 Token 时额外读取个人资料与 contributionsCollection。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT = path.join(ROOT, 'src/data/github.ts');
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const LOGIN = 'whwdzg';
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
  { name: 'Paligraph-Canvas', role: 'subsite', title: 'Paligraph Canvas' },
];

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'whwdzg-site/3.10 (+https://whwdzg.github.io)',
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

async function fetchProfile() {
  const [userResponse, reposResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${LOGIN}`, { headers }),
    fetch(`https://api.github.com/users/${LOGIN}/repos?per_page=100&type=owner&sort=updated`, { headers }),
  ]);
  if (!userResponse.ok) throw new Error(`user: HTTP ${userResponse.status}`);
  const user = await userResponse.json();
  let totalStars = 0;
  if (reposResponse.ok) {
    const repos = await reposResponse.json();
    totalStars = Array.isArray(repos) ? repos.reduce((sum, repo) => sum + (repo.stargazers_count ?? 0), 0) : 0;
  }
  return {
    avatar: user.avatar_url ?? '',
    name: user.name || user.login,
    login: user.login,
    bio: user.bio ?? '',
    followers: user.followers ?? 0,
    following: user.following ?? 0,
    publicRepos: user.public_repos ?? 0,
    totalStars,
    joined: user.created_at ?? '',
    location: user.location ?? '',
    blog: user.blog ?? '',
  };
}

async function fetchContributions() {
  if (!TOKEN) return null;
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount color}}}}}}`;
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { login: LOGIN } }),
  });
  if (!response.ok) throw new Error(`graphql: HTTP ${response.status}`);
  const json = await response.json();
  const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) throw new Error('graphql: no calendar');
  return {
    total: Number(calendar.totalContributions ?? 0),
    weeks: (calendar.weeks ?? []).map((week) => ({
      days: (week.contributionDays ?? []).map((day) => ({
        date: day.date,
        count: Number(day.contributionCount ?? 0),
        color: String(day.color ?? '#ebedf0'),
      })),
    })),
  };
}

function previousProfile() {
  try {
    const text = readFileSync(OUTPUT, 'utf8');
    const match = text.match(/export const GITHUB_PROFILE: GithubProfileSnapshot = (\{[\s\S]*?\});/);
    return match ? JSON.parse(match[1]) : null;
  } catch {
    return null;
  }
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
const oldProfile = previousProfile();
let profile = oldProfile ?? {
  avatar: '',
  name: 'whwdzg',
  login: LOGIN,
  bio: '',
  followers: 0,
  following: 0,
  publicRepos: 0,
  totalStars: 0,
  joined: '',
  location: '',
  blog: '',
};
try {
  profile = { ...profile, ...(await fetchProfile()) };
  console.log(`✓ profile ${profile.login} · ${profile.followers} followers · ${profile.totalStars} stars`);
} catch (error) {
  console.warn(`! profile: ${error.message}`);
}
let contributions = oldProfile?.contributions ?? { total: 0, weeks: [] };
try {
  const next = await fetchContributions();
  if (next) contributions = next;
  console.log(`✓ contributions ${contributions.total}`);
} catch (error) {
  console.warn(`! contributions: ${error.message}`);
}

const fetchedAt = new Date().toISOString();
const output = `/**
 * GitHub 仓库快照 / GitHub repository snapshot.
 *
 * 由 scripts/sync-github.mjs 通过 GitHub API 生成；
 * 每天由 GitHub Actions 同步，页面不直接依赖匿名 API。
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

export interface GithubContributionDay {
  date: string;
  count: number;
  color: string;
}

export interface GithubContributionWeek {
  days: GithubContributionDay[];
}

export interface GithubProfileSnapshot {
  avatar: string;
  name: string;
  login: string;
  bio: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  joined: string;
  location: string;
  blog: string;
  contributions: {
    total: number;
    weeks: GithubContributionWeek[];
  };
}

export const GITHUB_SYNCED_AT = ${JSON.stringify(fetchedAt)};

export const GITHUB_PROFILE: GithubProfileSnapshot = ${JSON.stringify({ ...profile, contributions }, null, 2)};

export const GITHUB_REPOS: GithubRepoSnapshot[] = ${JSON.stringify(repos, null, 2)};

export function githubRepo(name: string): GithubRepoSnapshot | undefined {
  return GITHUB_REPOS.find((repo) => repo.name.toLowerCase() === name.toLowerCase());
}
`;
writeFileSync(OUTPUT, output);
console.log(`[github] ${repos.length} repos → ${path.relative(ROOT, OUTPUT)}`);
