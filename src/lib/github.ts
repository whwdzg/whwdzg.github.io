/**
 * GitHub Issue 评论区数据层 / GitHub Issues API.
 *
 * 为什么用 Issue：
 * - 静态站没有服务端，Issue 自带账号、头像、时间、评论与通知；
 * - 每一条 Issue 可以是一个留言主题，Issue 下的评论就是回复；
 * - 不需要把任何 Token 放进前端，所有数据都是公开的。
 *
 * 这里只读公开 API，不包含任何写操作。请求带 5 分钟 / 2 分钟本地缓存，
 * 避免刷新页面就消耗 GitHub 的匿名额度（60 次/小时/IP）。
 */
import { readJson, writeJson } from './storage';

export const GITHUB_COMMENTS_REPO = 'whwdzg/whwdzg.github.io';
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_COMMENTS_REPO}`;
export const GITHUB_ISSUES_URL = `${GITHUB_REPO_URL}/issues`;
export const GITHUB_NEW_ISSUE_URL = `${GITHUB_REPO_URL}/issues/new?title=${encodeURIComponent(
  '留言：',
)}&body=${encodeURIComponent('## 想说的话\n\n\n\n<!-- 写下你的留言，作者或其他访客会在 GitHub 上回复。 -->')}`;

const API_ROOT = 'https://api.github.com';
const ISSUE_TTL = 5 * 60 * 1000;
const COMMENT_TTL = 2 * 60 * 1000;

export type IssueStateFilter = 'open' | 'closed' | 'all';

export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  type?: string;
}

export interface GitHubLabel {
  name: string;
  color: string;
  description?: string | null;
}

export interface GitHubReactions {
  total_count: number;
  '+1': number;
  '-1': number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  state_reason?: 'completed' | 'not_planned' | 'reopened' | null;
  html_url: string;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at?: string | null;
  user: GitHubUser | null;
  labels: GitHubLabel[];
  reactions?: GitHubReactions;
  author_association?: string;
  pull_request?: unknown;
}

export interface GitHubComment {
  id: number;
  body: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  user: GitHubUser | null;
  author_association?: string;
  reactions?: GitHubReactions;
}

export interface GitHubResult<T> {
  data: T;
  at: number;
  cached: boolean;
  error?: GitHubApiError;
}

export class GitHubApiError extends Error {
  readonly status: number;
  readonly rateLimited: boolean;
  readonly resetAt: number | null;

  constructor(message: string, status: number, rateLimited = false, resetAt: number | null = null) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
    this.rateLimited = rateLimited;
    this.resetAt = resetAt;
  }
}

interface CacheEntry<T> {
  at: number;
  data: T;
}

function issueCacheKey(state: IssueStateFilter): string {
  return `whwdzg-gh-issues-v1:${GITHUB_COMMENTS_REPO}:${state}`;
}

function commentCacheKey(issueNumber: number): string {
  return `whwdzg-gh-comments-v1:${GITHUB_COMMENTS_REPO}:${issueNumber}`;
}

function normalizeError(error: unknown): GitHubApiError {
  if (error instanceof GitHubApiError) return error;
  return new GitHubApiError(error instanceof Error ? error.message : '网络请求失败', 0);
}

async function request<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
  } catch (error) {
    throw new GitHubApiError(error instanceof Error ? error.message : '无法连接 GitHub', 0);
  }

  if (!response.ok) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    const resetSeconds = Number(response.headers.get('x-ratelimit-reset'));
    const resetAt = Number.isFinite(resetSeconds) ? resetSeconds * 1000 : null;
    const rateLimited =
      response.status === 403 &&
      (remaining === '0' || response.headers.get('x-ratelimit-resource') != null);
    const message = rateLimited
      ? 'GitHub API 达到匿名速率限制'
      : `GitHub API 返回 ${response.status} ${response.statusText}`;
    throw new GitHubApiError(message, response.status, rateLimited, resetAt);
  }

  return (await response.json()) as T;
}

function readFreshCache<T>(key: string, ttl: number): CacheEntry<T> | null {
  const cached = readJson<CacheEntry<T> | null>(key, null);
  if (!cached || typeof cached.at !== 'number' || !cached.data) return null;
  return Date.now() - cached.at <= ttl ? cached : null;
}

function readAnyCache<T>(key: string): CacheEntry<T> | null {
  const cached = readJson<CacheEntry<T> | null>(key, null);
  return cached && cached.data ? cached : null;
}

function writeCache<T>(key: string, data: T): number {
  const at = Date.now();
  writeJson(key, { at, data });
  return at;
}

/** 读取 issue 列表；自动过滤 Pull Request。 */
export async function fetchGitHubIssues(
  state: IssueStateFilter = 'all',
  force = false,
): Promise<GitHubResult<GitHubIssue[]>> {
  const key = issueCacheKey(state);
  if (!force) {
    const fresh = readFreshCache<GitHubIssue[]>(key, ISSUE_TTL);
    if (fresh) return { data: fresh.data, at: fresh.at, cached: true };
  }

  try {
    const raw = await request<Array<GitHubIssue & { pull_request?: unknown }>>(
      `${API_ROOT}/repos/${GITHUB_COMMENTS_REPO}/issues?state=${state}&per_page=100&sort=updated&direction=desc`,
    );
    const data = raw
      .filter((issue) => !issue.pull_request)
      .sort((a, b) => {
        if (a.state !== b.state) return a.state === 'open' ? -1 : 1;
        return b.updated_at.localeCompare(a.updated_at);
      });
    const at = writeCache(key, data);
    return { data, at, cached: false };
  } catch (error) {
    const stale = readAnyCache<GitHubIssue[]>(key);
    if (stale) return { data: stale.data, at: stale.at, cached: true, error: normalizeError(error) };
    throw normalizeError(error);
  }
}

/** 读取某条 issue 的全部评论（自动翻页，最多 1000 条）。 */
/** 读取留言板 issue（标题为“留言板”），用于和站内静态摘录合并。 */
export async function fetchGuestbookIssue(force = false): Promise<GitHubResult<GitHubIssue | null>> {
  const result = await fetchGitHubIssues('all', force);
  return {
    ...result,
    data: result.data.find((issue) => issue.title.trim() === '留言板') ?? null,
  };
}

export async function fetchGitHubComments(
  issueNumber: number,
  force = false,
): Promise<GitHubResult<GitHubComment[]>> {
  const key = commentCacheKey(issueNumber);
  if (!force) {
    const fresh = readFreshCache<GitHubComment[]>(key, COMMENT_TTL);
    if (fresh) return { data: fresh.data, at: fresh.at, cached: true };
  }

  try {
    const data: GitHubComment[] = [];
    for (let page = 1; page <= 10; page += 1) {
      const batch = await request<GitHubComment[]>(
        `${API_ROOT}/repos/${GITHUB_COMMENTS_REPO}/issues/${issueNumber}/comments?per_page=100&page=${page}`,
      );
      data.push(...batch);
      if (batch.length < 100) break;
    }
    data.sort((a, b) => a.created_at.localeCompare(b.created_at));
    const at = writeCache(key, data);
    return { data, at, cached: false };
  } catch (error) {
    const stale = readAnyCache<GitHubComment[]>(key);
    if (stale) return { data: stale.data, at: stale.at, cached: true, error: normalizeError(error) };
    throw normalizeError(error);
  }
}

export function formatGitHubError(error: unknown): string {
  const normalized = normalizeError(error);
  if (normalized.rateLimited) {
    const minutes = normalized.resetAt
      ? Math.max(1, Math.ceil((normalized.resetAt - Date.now()) / 60_000))
      : 10;
    return `GitHub API 暂时限流，请约 ${minutes} 分钟后重试；也可以直接打开 GitHub Issues 参与。`;
  }
  if (normalized.status === 404) return '仓库或 Issue 不存在，可能已被删除或设为私密。';
  if (normalized.status === 0) return '网络连接失败，请检查网络后重试。';
  return `GitHub API 请求失败（${normalized.status}）。可以直接打开 GitHub Issues 查看。`;
}

export function issueCommentUrl(issue: GitHubIssue): string {
  return `${issue.html_url}#new_comment_field`;
}

export function commentReplyUrl(comment: GitHubComment): string {
  return comment.html_url;
}

export function totalReactionCount(reactions: GitHubReactions | undefined): number {
  return reactions?.total_count ?? 0;
}

export interface ReactionView {
  emoji: string;
  label: string;
  count: number;
}

export function reactionViews(reactions: GitHubReactions | undefined): ReactionView[] {
  if (!reactions) return [];
  const table: Array<[keyof GitHubReactions, string, string]> = [
    ['+1', '👍', '赞'],
    ['heart', '❤️', '喜欢'],
    ['hooray', '🎉', '庆祝'],
    ['laugh', '😄', '开心'],
    ['rocket', '🚀', '火箭'],
    ['eyes', '👀', '关注'],
    ['confused', '😕', '疑惑'],
    ['-1', '👎', '踩'],
  ];
  return table
    .map(([key, emoji, label]) => ({ emoji, label, count: Number(reactions[key] ?? 0) }))
    .filter((item) => item.count > 0);
}
