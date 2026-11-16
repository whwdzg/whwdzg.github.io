import { describe, expect, it } from 'vitest';
import {
  commentReplyUrl,
  formatGitHubError,
  GITHUB_NEW_ISSUE_URL,
  GitHubApiError,
  issueCommentUrl,
  reactionViews,
  totalReactionCount,
  type GitHubComment,
  type GitHubIssue,
} from './github';

const issue = {
  number: 12,
  title: '测试 issue',
  html_url: 'https://github.com/whwdzg/whwdzg.github.io/issues/12',
} as GitHubIssue;

const comment = {
  id: 1,
  body: 'hello',
  html_url: 'https://github.com/whwdzg/whwdzg.github.io/issues/12#issuecomment-1',
} as GitHubComment;

describe('github helpers', () => {
  it('builds issue and comment links', () => {
    expect(issueCommentUrl(issue)).toBe(`${issue.html_url}#new_comment_field`);
    expect(commentReplyUrl(comment)).toBe(comment.html_url);
    expect(GITHUB_NEW_ISSUE_URL.startsWith('https://github.com/whwdzg/whwdzg.github.io/issues/new')).toBe(true);
    expect(decodeURIComponent(GITHUB_NEW_ISSUE_URL)).toContain('留言');
  });

  it('formats rate-limit errors with a retry hint', () => {
    const error = new GitHubApiError('rate', 403, true, Date.now() + 120_000);
    const message = formatGitHubError(error);
    expect(message).toContain('限流');
    expect(message).toContain('分钟');
  });

  it('formats network and 404 errors', () => {
    expect(formatGitHubError(new GitHubApiError('offline', 0))).toContain('网络');
    expect(formatGitHubError(new GitHubApiError('missing', 404))).toContain('不存在');
  });

  it('maps non-zero reactions and omits zero counts', () => {
    const views = reactionViews({
      total_count: 4,
      '+1': 2,
      '-1': 0,
      laugh: 1,
      hooray: 1,
      confused: 0,
      heart: 0,
      rocket: 0,
      eyes: 0,
    });
    expect(views.map((view) => view.emoji)).toEqual(['👍', '🎉', '😄']);
    expect(totalReactionCount({ total_count: 4 } as never)).toBe(4);
  });
});
