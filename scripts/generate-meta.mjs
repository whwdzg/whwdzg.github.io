/**
 * 构建期元数据生成 / Build-time metadata generator.
 *
 * 在 `npm run dev` 与 `npm run build` 之前运行，读取 package.json 与本地 git 历史，
 * 输出 `src/generated/site-meta.json`。关于页因此可以展示：
 *   - 站点版本号
 *   - 当前提交哈希与提交时间
 *   - 最近若干次提交的时间、作者与说明
 *
 * GitHub Actions 中 checkout 需要 `fetch-depth: 0`，否则浅克隆只有一条提交。
 * 若 git 不可用（例如源码压缩包），脚本会退化为环境变量 / 构建时间，保证构建不失败。
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'src', 'generated');
const OUT_FILE = path.join(OUT_DIR, 'site-meta.json');
function sanitizeSubject(value) {
  return String(value ?? '')
    .replace(/CASIO/gi, '')
    .replace(/fx-991CN(?:\s+CW\s+II)?/gi, '科学计算器')
    .replace(/ClassWiz/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const REPO_URL = 'https://github.com/whwdzg/whwdzg.github.io';

const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

/** 执行 git 命令；失败时返回空字符串，避免本地无 git 时阻断构建。 */
function git(args) {
  try {
    return execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 8000,
    }).trim();
  } catch {
    return '';
  }
}

function parseCommits(raw) {
  if (!raw) return [];
  return raw
    .split('\x1e')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [hash, short, time, author, subject] = chunk.split('\x1f');
      return {
        hash,
        short,
        time,
        author,
        subject: sanitizeSubject(subject) || '(无提交说明)',
        url: hash ? `${REPO_URL}/commit/${hash}` : REPO_URL,
      };
    })
    .filter((commit) => Boolean(commit.hash));
}

const commit = git(['rev-parse', 'HEAD']) || process.env.GITHUB_SHA || '';
const commitShort = commit ? commit.slice(0, 7) : '';
const commitTime = git(['show', '-s', '--format=%cI', 'HEAD']) || new Date().toISOString();
const rawBranch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
const branch =
  (rawBranch && rawBranch !== 'HEAD' ? rawBranch : '') ||
  process.env.GITHUB_REF_NAME ||
  'main';
const commits = parseCommits(
  git([
    'log',
    '-n',
    '30',
    '--date=iso-strict',
    '--pretty=format:%H%x1f%h%x1f%cI%x1f%an%x1f%s%x1e',
  ]),
);

const meta = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  license: pkg.license,
  repoUrl: REPO_URL,
  branch,
  commit,
  commitShort,
  commitTime,
  buildTime: new Date().toISOString(),
  versionSource: 'package.json',
  commits,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');

const commitLabel = commitShort ? `${commitShort} (${branch})` : 'no-git';
console.log(`[meta] ${meta.version} · ${commitLabel} · ${commits.length} commits → src/generated/site-meta.json`);
