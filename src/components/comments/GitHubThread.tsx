/** Issue 详情与回复时间线 / Issue thread with body and comments. */
import {
  ArrowClockwiseRegular,
  CheckmarkCircleRegular,
  CommentRegular,
  CopyRegular,
  LinkRegular,
  OpenRegular,
  WarningRegular,
} from '@fluentui/react-icons';
import type { GitHubComment, GitHubIssue } from '../../lib/github';
import { GITHUB_ISSUES_URL, issueCommentUrl } from '../../lib/github';
import { relativeTime } from '../../lib/format';
import { copyText } from '../../lib/clipboard';
import { useToast } from '../../hooks/useToast';
import { GitHubAvatar } from './GitHubAvatar';
import { GitHubMarkdown } from './GitHubMarkdown';
import { GitHubReactions } from './GitHubReactions';

interface GitHubThreadProps {
  issue: GitHubIssue | null;
  comments: GitHubComment[];
  loading: boolean;
  error: string | null;
  warning: string | null;
  lastSynced: number | null;
  onRetry: () => void;
}

const ASSOCIATION_LABELS: Record<string, string> = {
  OWNER: '作者',
  MEMBER: '成员',
  COLLABORATOR: '协作者',
  CONTRIBUTOR: '贡献者',
  FIRST_TIMER: '初次参与',
  FIRST_TIME_CONTRIBUTOR: '初次贡献',
  MANNEQUIN: '机器人',
};

function stateLabel(issue: GitHubIssue): string {
  if (issue.state === 'open') return '开放中';
  return issue.state_reason === 'not_planned' ? '未计划关闭' : '已关闭';
}

export function GitHubThread({ issue, comments, loading, error, warning, lastSynced, onRetry }: GitHubThreadProps) {
  const { toast } = useToast();

  const copy = async (text: string, message: string) => {
    const ok = await copyText(text);
    toast(ok ? message : '复制失败，请手动选择文本', ok ? 'success' : 'error');
  };

  const reply = (comment: GitHubComment) => {
    if (!issue) return;
    // 先同步打开窗口，避免 await 剪贴板后丢失用户手势。
    window.open(issueCommentUrl(issue), '_blank', 'noopener,noreferrer');
    const quote = comment.body
      .trim()
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n');
    void copy(
      `> @${comment.user?.login ?? 'ghost'} 在 [${issue.title}](${comment.html_url}) 中写道：\n${quote}\n\n`,
      '已复制引用，粘贴到 GitHub 回复框即可',
    );
  };

  if (!issue) {
    return (
      <div className="gh-thread gh-thread--empty">
        <CommentRegular aria-hidden />
        <h2>选择一条 Issue</h2>
        <p>左侧列表中的每一条 issue 都是一个讨论主题，点击后在这里查看正文、头像与回复。</p>
        {error && <p className="gh-warning">{error}</p>}
        <a className="btn btn--secondary btn--md" href={GITHUB_ISSUES_URL} target="_blank" rel="noopener noreferrer">
          打开 GitHub Issues <OpenRegular aria-hidden />
        </a>
      </div>
    );
  }

  return (
    <article className="gh-thread" id="gh-thread">
      <header className="gh-thread__head">
        <p className="gh-thread__eyebrow">
          <span>GITHUB ISSUE</span>
          <span className="gh-thread__number">#{issue.number}</span>
          <span className={`gh-state-badge gh-state-badge--${issue.state}`}>
            {issue.state === 'open' ? <span className="gh-state-dot gh-state-dot--open" /> : <CheckmarkCircleRegular aria-hidden />}
            {stateLabel(issue)}
          </span>
        </p>
        <div className="gh-thread__title-row">
          <h2>{issue.title}</h2>
          <a className="btn btn--ghost btn--sm" href={issue.html_url} target="_blank" rel="noopener noreferrer">
            在 GitHub 打开 <OpenRegular aria-hidden />
          </a>
        </div>

        {issue.labels.length > 0 && (
          <ul className="gh-labels" aria-label="标签">
            {issue.labels.map((label) => (
              <li key={label.name} className="gh-label" title={label.description ?? label.name}>
                <span style={{ background: `#${label.color}` }} aria-hidden />
                {label.name}
              </li>
            ))}
          </ul>
        )}

        <div className="gh-thread__meta">
          <GitHubAvatar user={issue.user} size={24} />
          <a href={issue.user?.html_url ?? issue.html_url} target="_blank" rel="noopener noreferrer">
            {issue.user?.login ?? 'ghost'}
          </a>
          <span className="dot-sep" aria-hidden />
          <span>发起于 {relativeTime(issue.created_at)}</span>
          <span className="dot-sep" aria-hidden />
          <span>
            <CommentRegular aria-hidden /> {comments.length} 条回复
          </span>
          <span className="dot-sep" aria-hidden />
          <span>更新于 {relativeTime(issue.updated_at)}</span>
        </div>
      </header>

      <section className="gh-issue-body" aria-label="Issue 正文">
        <div className="gh-author-row">
          <GitHubAvatar user={issue.user} size={38} />
          <div>
            <p>
              <strong>{issue.user?.login ?? 'ghost'}</strong>
              <span className="gh-assoc">楼主</span>
            </p>
            <span className="gh-author-row__date">{relativeTime(issue.created_at)}</span>
          </div>
          <button
            type="button"
            className="gh-icon-text"
            onClick={() => void copy(issue.html_url, 'Issue 链接已复制')}
            title="复制 issue 链接"
          >
            <LinkRegular aria-hidden /> 链接
          </button>
        </div>

        <GitHubMarkdown text={issue.body} emptyText="这条 issue 没有正文。" className="gh-markdown" />
        <GitHubReactions reactions={issue.reactions} />

        <div className="gh-issue-body__actions">
          <a className="btn btn--primary btn--sm" href={issueCommentUrl(issue)} target="_blank" rel="noopener noreferrer">
            <CommentRegular aria-hidden /> 在 GitHub 回复
          </a>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => void copy(issue.html_url, '链接已复制')}>
            <CopyRegular aria-hidden /> 复制链接
          </button>
        </div>
      </section>

      <section className="gh-comments" aria-labelledby="gh-comments-title">
        <div className="gh-comments__head">
          <div>
            <p className="eyebrow">REPLIES</p>
            <h3 id="gh-comments-title">
              回复 <span>{comments.length}</span>
            </h3>
          </div>
          <div className="gh-comments__meta">
            <span>{lastSynced ? `同步于 ${relativeTime(lastSynced)}` : '尚未同步'}</span>
            <button type="button" className="gh-icon-text" onClick={onRetry} disabled={loading}>
              <ArrowClockwiseRegular aria-hidden /> 刷新
            </button>
          </div>
        </div>

        {warning && (
          <p className="gh-warning" role="status">
            <WarningRegular aria-hidden /> {warning}
          </p>
        )}

        {loading && comments.length === 0 ? (
          <div className="gh-comment-skeletons" aria-busy="true">
            {[0, 1].map((item) => (
              <div className="gh-comment gh-comment--skeleton" key={item}>
                <span className="skeleton gh-comment__avatar-skeleton" />
                <span className="gh-comment__skeleton-lines">
                  <span className="skeleton" />
                  <span className="skeleton" />
                  <span className="skeleton" />
                </span>
              </div>
            ))}
          </div>
        ) : error && comments.length === 0 ? (
          <div className="gh-error">
            <WarningRegular aria-hidden />
            <strong>无法读取回复</strong>
            <p>{error}</p>
            <div>
              <button type="button" className="btn btn--secondary btn--sm" onClick={onRetry}>
                <ArrowClockwiseRegular aria-hidden /> 重试
              </button>
              <a className="btn btn--ghost btn--sm" href={issue.html_url} target="_blank" rel="noopener noreferrer">
                打开 GitHub <OpenRegular aria-hidden />
              </a>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="gh-comments__empty">
            <CommentRegular aria-hidden />
            <p>还没有回复。第一条回复会出现在这里。</p>
            <a className="btn btn--primary btn--sm" href={issueCommentUrl(issue)} target="_blank" rel="noopener noreferrer">
              去 GitHub 回复 <OpenRegular aria-hidden />
            </a>
          </div>
        ) : (
          <ol className="gh-comment-list">
            {comments.map((comment) => (
              <li key={comment.id}>
                <article className="gh-comment">
                  <GitHubAvatar user={comment.user} size={38} />
                  <div className="gh-comment__body">
                    <header className="gh-comment__head">
                      <a href={comment.user?.html_url ?? issue.html_url} target="_blank" rel="noopener noreferrer">
                        {comment.user?.login ?? 'ghost'}
                      </a>
                      {comment.author_association && ASSOCIATION_LABELS[comment.author_association] && (
                        <span className="gh-assoc">{ASSOCIATION_LABELS[comment.author_association]}</span>
                      )}
                      <span className="gh-comment__date">{relativeTime(comment.created_at)}</span>
                      <a className="gh-comment__permalink" href={comment.html_url} target="_blank" rel="noopener noreferrer">
                        <LinkRegular aria-hidden /> 链接
                      </a>
                    </header>

                    <GitHubMarkdown text={comment.body} className="gh-markdown" />
                    <GitHubReactions reactions={comment.reactions} />

                    <footer className="gh-comment__actions">
                      <button type="button" onClick={() => reply(comment)}>
                        <CommentRegular aria-hidden /> 引用回复
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void copy(
                            `@${comment.user?.login ?? 'ghost'} ${comment.body}`.trim(),
                            '回复内容已复制',
                          )
                        }
                      >
                        <CopyRegular aria-hidden /> 复制
                      </button>
                    </footer>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}

        <div className="gh-cta">
          <div>
            <h3>继续在 GitHub 讨论</h3>
            <p>本站只读展示 issue 与回复。点击下方按钮会打开 GitHub 的回复框，发送后刷新此页即可看到。</p>
          </div>
          <a className="btn btn--primary btn--md" href={issueCommentUrl(issue)} target="_blank" rel="noopener noreferrer">
            <CommentRegular aria-hidden /> 在 GitHub 回复
          </a>
        </div>
      </section>
    </article>
  );
}
