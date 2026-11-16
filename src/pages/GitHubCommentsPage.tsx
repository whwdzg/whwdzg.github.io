/**
 * GitHub Issue 评论区 / Issue-backed comment page.
 *
 * 页面本身是只读的：
 * - 从 whwdzg/whwdzg.github.io 的公开 issues 读取主题与回复；
 * - 头像、正文、时间、标签、reactions 都来自 GitHub；
 * - 发表 / 回复统一跳转到 GitHub，不在浏览器里保存 token。
 *
 * 数据缓存见 src/lib/github.ts；Markdown 渲染见 GitHubMarkdown。
 */
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ArrowClockwiseRegular, CommentRegular, OpenRegular } from '@fluentui/react-icons';
import '../styles/github-comments.css';
import { PageIntro } from '../components/layout/PageIntro';
import { Button } from '../components/common/Button';
import { GitHubIssueList } from '../components/comments/GitHubIssueList';
import { GitHubThread } from '../components/comments/GitHubThread';
import { useRouter } from '../lib/router';
import { useToast } from '../hooks/useToast';
import { relativeTime } from '../lib/format';
import {
  fetchGitHubComments,
  fetchGitHubIssues,
  formatGitHubError,
  GITHUB_COMMENTS_REPO,
  GITHUB_ISSUES_URL,
  GITHUB_NEW_ISSUE_URL,
  GITHUB_REPO_URL,
  type GitHubComment,
  type GitHubIssue,
  type IssueStateFilter,
} from '../lib/github';

export default function GitHubCommentsPage() {
  const { search, navigate } = useRouter();
  const { toast } = useToast();

  const [filter, setFilter] = useState<IssueStateFilter>('all');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [issueWarning, setIssueWarning] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<number | null>(null);

  const [selected, setSelected] = useState<number | null>(() => {
    const value = Number(new URLSearchParams(search).get('issue'));
    return Number.isFinite(value) && value > 0 ? value : null;
  });

  const [comments, setComments] = useState<GitHubComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentWarning, setCommentWarning] = useState<string | null>(null);
  const [commentsSynced, setCommentsSynced] = useState<number | null>(null);

  // 深链接 / 前进后退：?issue=12 直接选中对应讨论。
  useEffect(() => {
    const value = Number(new URLSearchParams(search).get('issue'));
    if (Number.isFinite(value) && value > 0) setSelected(value);
  }, [search]);

  const loadIssues = useCallback(
    async (force = false) => {
      setIssuesLoading(true);
      setIssueError(null);
      try {
        const result = await fetchGitHubIssues(filter, force);
        setIssues(result.data);
        setLastSynced(result.at);
        setIssueWarning(result.error ? formatGitHubError(result.error) : null);
      } catch (error) {
        setIssues([]);
        setIssueError(formatGitHubError(error));
        setIssueWarning(null);
      } finally {
        setIssuesLoading(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    void loadIssues(false);
  }, [loadIssues]);

  // 筛选 / 首次加载后保证有选中的讨论。
  useEffect(() => {
    if (!issues.length) return;
    if (selected != null && issues.some((issue) => issue.number === selected)) return;
    setSelected(issues[0].number);
  }, [issues, selected]);

  const loadComments = useCallback(
    async (force = false) => {
      if (selected == null) {
        setComments([]);
        setCommentsSynced(null);
        setCommentError(null);
        setCommentWarning(null);
        return;
      }
      setCommentsLoading(true);
      setCommentError(null);
      try {
        const result = await fetchGitHubComments(selected, force);
        setComments(result.data);
        setCommentsSynced(result.at);
        setCommentWarning(result.error ? formatGitHubError(result.error) : null);
      } catch (error) {
        setComments([]);
        setCommentError(formatGitHubError(error));
        setCommentWarning(null);
      } finally {
        setCommentsLoading(false);
      }
    },
    [selected],
  );

  useEffect(() => {
    setComments([]);
    setCommentsSynced(null);
    void loadComments(false);
  }, [loadComments]);

  const visibleIssues = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    if (!needle) return issues;
    return issues.filter((issue) => {
      const haystack = `${issue.number} ${issue.title} ${issue.body ?? ''} ${issue.user?.login ?? ''} ${issue.labels
        .map((label) => label.name)
        .join(' ')}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [issues, deferredQuery]);

  const activeIssue = issues.find((issue) => issue.number === selected) ?? null;
  const totalComments = issues.reduce((sum, issue) => sum + issue.comments, 0);
  const openCount = issues.filter((issue) => issue.state === 'open').length;
  const closedCount = issues.length - openCount;

  const selectIssue = (issue: GitHubIssue) => {
    setSelected(issue.number);
    navigate(`/comments/github/?issue=${issue.number}`, { replace: true, scroll: false });
    if (window.matchMedia('(max-width: 1000px)').matches) {
      window.setTimeout(() => {
        document.getElementById('gh-thread')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  const refreshAll = async () => {
    toast('正在从 GitHub 同步…', 'info');
    await loadIssues(true);
    if (selected != null) await loadComments(true);
  };

  return (
    <div className="page page--github-comments">
      <PageIntro
        eyebrow="COMMENTS · GITHUB ISSUES"
        title="GitHub 评论区"
        lead="用 GitHub Issue 当评论后端：每条 issue 是一个讨论主题，issue 下的评论就是回复。头像、正文、标签、时间和 reactions 全部来自公开仓库，本站只读展示。"
        meta={[
          { icon: 'github', label: GITHUB_COMMENTS_REPO },
          { icon: 'comment', label: `${issues.length} 个讨论` },
          { icon: 'person', label: `${totalComments} 条回复` },
          { icon: 'clock', label: lastSynced ? `同步于 ${relativeTime(lastSynced)}` : '等待同步' },
        ]}
        actions={
          <>
            <a className="btn btn--primary btn--md" href={GITHUB_NEW_ISSUE_URL} target="_blank" rel="noopener noreferrer">
              <CommentRegular aria-hidden />
              新建 Issue 留言
              <OpenRegular aria-hidden />
            </a>
            <a className="btn btn--secondary btn--md" href={GITHUB_ISSUES_URL} target="_blank" rel="noopener noreferrer">
              打开 Issues
              <OpenRegular aria-hidden />
            </a>
            <Button
              variant="ghost"
              icon={<ArrowClockwiseRegular aria-hidden />}
              onClick={() => void refreshAll()}
              disabled={issuesLoading}
            >
              刷新
            </Button>
          </>
        }
        aside={
          <div className="gh-summary">
            <div className="gh-summary__head">
              <span>GITHUB ISSUES</span>
              <span className="status-dot" aria-hidden />
            </div>
            <div className="gh-summary__stats">
              <div>
                <strong>{issues.length}</strong>
                <span>讨论</span>
              </div>
              <div>
                <strong>{totalComments}</strong>
                <span>回复</span>
              </div>
              <div>
                <strong>{openCount}</strong>
                <span>开放</span>
              </div>
              <div>
                <strong>{closedCount}</strong>
                <span>已关闭</span>
              </div>
            </div>
            <ol className="gh-steps">
              <li>
                <strong>01</strong> 使用 GitHub 账号新建 issue
              </li>
              <li>
                <strong>02</strong> 其他访客在 issue 下回复
              </li>
              <li>
                <strong>03</strong> 本页自动读取头像与内容
              </li>
            </ol>
            <p className="gh-summary__note">
              只读 · 不保存 Token · 匿名 API 有速率限制
            </p>
            <a className="gh-summary__repo" href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
              {GITHUB_COMMENTS_REPO} <OpenRegular aria-hidden />
            </a>
          </div>
        }
      />

      <div className="container gh-layout">
        <GitHubIssueList
          issues={visibleIssues}
          total={issues.length}
          selected={selected}
          filter={filter}
          query={query}
          loading={issuesLoading}
          error={issueError}
          warning={issueWarning}
          lastSynced={lastSynced}
          onFilter={setFilter}
          onQuery={setQuery}
          onSelect={selectIssue}
          onRefresh={() => void loadIssues(true)}
        />

        <div className="gh-main">
          <GitHubThread
            issue={activeIssue}
            comments={comments}
            loading={commentsLoading}
            error={commentError}
            warning={commentWarning}
            lastSynced={commentsSynced}
            onRetry={() => void loadComments(true)}
          />

          <div className="gh-notes">
            <div>
              <strong>为什么用 Issue？</strong>
              <p>静态站没有服务端，Issue 自带账号、头像、时间线与通知，也不需要把任何写权限暴露给浏览器。</p>
            </div>
            <div>
              <strong>如何回复？</strong>
              <p>点击“在 GitHub 回复”会打开 issue 的评论框；发送后回到本页点刷新即可看到新回复。</p>
            </div>
            <div>
              <strong>速率限制</strong>
              <p>未登录的 GitHub API 限制为每小时 60 次。页面会缓存 5 分钟；若遇到限流，直接打开 GitHub Issues 即可。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
