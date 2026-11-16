/** Issue 列表 / Issue master list with search, filters and refresh. */
import {
  ArrowClockwiseRegular,
  CommentRegular,
  DismissRegular,
  OpenRegular,
  SearchRegular,
  WarningRegular,
} from '@fluentui/react-icons';
import type { GitHubIssue, IssueStateFilter } from '../../lib/github';
import { GITHUB_ISSUES_URL, GITHUB_NEW_ISSUE_URL } from '../../lib/github';
import { relativeTime } from '../../lib/format';
import { GitHubAvatar } from './GitHubAvatar';

interface GitHubIssueListProps {
  issues: GitHubIssue[];
  total: number;
  selected: number | null;
  filter: IssueStateFilter;
  query: string;
  loading: boolean;
  error: string | null;
  warning: string | null;
  lastSynced: number | null;
  onFilter: (filter: IssueStateFilter) => void;
  onQuery: (query: string) => void;
  onSelect: (issue: GitHubIssue) => void;
  onRefresh: () => void;
}

const FILTERS: Array<{ value: IssueStateFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'open', label: '开放' },
  { value: 'closed', label: '已关闭' },
];

export function GitHubIssueList({
  issues,
  total,
  selected,
  filter,
  query,
  loading,
  error,
  warning,
  lastSynced,
  onFilter,
  onQuery,
  onSelect,
  onRefresh,
}: GitHubIssueListProps) {
  return (
    <aside className="gh-sidebar" aria-label="GitHub Issue 列表">
      <div className="gh-toolbar">
        <div className="gh-search">
          <SearchRegular aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="搜索 issue、作者、编号…"
            aria-label="搜索 GitHub issue"
          />
          {query && (
            <button type="button" className="gh-search__clear" aria-label="清空搜索" onClick={() => onQuery('')}>
              <DismissRegular aria-hidden />
            </button>
          )}
        </div>

        <div className="gh-toolbar__row">
          <div className="gh-filters" role="group" aria-label="Issue 状态筛选">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`gh-filter ${filter === item.value ? 'is-active' : ''}`}
                aria-pressed={filter === item.value}
                onClick={() => onFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`gh-refresh ${loading ? 'is-loading' : ''}`}
            aria-label="刷新 issue 列表"
            title="刷新"
            onClick={onRefresh}
            disabled={loading}
          >
            <ArrowClockwiseRegular aria-hidden />
          </button>
        </div>

        <div className="gh-toolbar__meta">
          <span>
            {issues.length} / {total} 条
          </span>
          <span>{lastSynced ? `同步于 ${relativeTime(lastSynced)}` : '尚未同步'}</span>
        </div>
      </div>

      {warning && (
        <p className="gh-warning" role="status">
          <WarningRegular aria-hidden /> {warning}
        </p>
      )}

      {loading && issues.length === 0 ? (
        <div className="gh-issue-list" aria-busy="true">
          {[0, 1, 2, 3].map((item) => (
            <div className="gh-issue gh-issue--skeleton" key={item}>
              <span className="skeleton gh-issue__skeleton-dot" />
              <span className="gh-issue__skeleton-lines">
                <span className="skeleton" />
                <span className="skeleton" />
              </span>
            </div>
          ))}
        </div>
      ) : error && issues.length === 0 ? (
        <div className="gh-error">
          <WarningRegular aria-hidden />
          <strong>无法读取 Issues</strong>
          <p>{error}</p>
          <div>
            <button type="button" className="btn btn--secondary btn--sm" onClick={onRefresh}>
              <ArrowClockwiseRegular aria-hidden /> 重试
            </button>
            <a className="btn btn--ghost btn--sm" href={GITHUB_ISSUES_URL} target="_blank" rel="noopener noreferrer">
              打开 GitHub Issues <OpenRegular aria-hidden />
            </a>
          </div>
        </div>
      ) : issues.length === 0 ? (
        query ? (
          <div className="gh-empty">
            <SearchRegular aria-hidden />
            <strong>没有匹配的 Issue</strong>
            <p>试试更短的关键词，或清空搜索查看全部讨论。</p>
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => onQuery('')}>
              清空搜索
            </button>
          </div>
        ) : (
          <div className="gh-empty">
            <CommentRegular aria-hidden />
            <strong>{filter === 'open' ? '没有开放的 Issue' : filter === 'closed' ? '没有已关闭的 Issue' : '还没有 Issue'}</strong>
            <p>
              {filter === 'all'
                ? '第一则留言会出现在这里。用 GitHub 账号新建一条 issue，就能开始讨论。'
                : '可以切换筛选查看其他状态，或新建一条 issue 开始讨论。'}
            </p>
            <a className="btn btn--primary btn--sm" href={GITHUB_NEW_ISSUE_URL} target="_blank" rel="noopener noreferrer">
              新建 Issue <OpenRegular aria-hidden />
            </a>
          </div>
        )
      ) : (
        <div className="gh-issue-list">
          {issues.map((issue) => {
            const active = selected === issue.number;
            return (
              <button
                key={issue.number}
                type="button"
                className={`gh-issue ${active ? 'is-active' : ''}`}
                aria-current={active || undefined}
                onClick={() => onSelect(issue)}
              >
                <span className={`gh-state-dot gh-state-dot--${issue.state}`} aria-hidden />
                <span className="gh-issue__main">
                  <span className="gh-issue__title">
                    <span className="gh-issue__number">#{issue.number}</span>
                    {issue.title}
                  </span>
                  <span className="gh-issue__meta">
                    {issue.user && <GitHubAvatar user={issue.user} size={16} />}
                    <span>{issue.user?.login ?? 'ghost'}</span>
                    <span className="dot-sep" aria-hidden />
                    <span>{relativeTime(issue.updated_at)}</span>
                    <span className={`gh-state-text gh-state-text--${issue.state}`}>{issue.state === 'open' ? '开放' : '已关闭'}</span>
                  </span>
                </span>
                {issue.comments > 0 && (
                  <span className="gh-issue__comments" title={`${issue.comments} 条回复`}>
                    <CommentRegular aria-hidden />
                    {issue.comments}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="gh-sidebar__foot">
        <span>数据来自 GitHub Issues · 只读</span>
        <a href={GITHUB_ISSUES_URL} target="_blank" rel="noopener noreferrer">
          打开仓库 Issues <OpenRegular aria-hidden />
        </a>
      </div>
    </aside>
  );
}
