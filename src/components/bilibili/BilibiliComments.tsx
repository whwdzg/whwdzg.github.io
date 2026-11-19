/** B 站评论快照 / Snapshot comments with source link. */
import { CommentRegular, OpenRegular } from '@fluentui/react-icons';
import type { BilibiliComment } from '../../data/bilibili-comments';
import { formatDate, formatViews } from '../../lib/format';

export function BilibiliComments({ comments, sourceUrl, count }: { comments: BilibiliComment[]; sourceUrl?: string; count?: number }) {
  return (
    <section className="bili-comments">
      <div className="bili-comments__head">
        <h3><CommentRegular aria-hidden /> 评论</h3>
        <span>{comments.length ? `已载入 ${comments.length} 条 · 共 ${formatViews(count ?? comments.length)}` : '暂无评论快照'}</span>
        {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer">打开 B 站评论区 <OpenRegular aria-hidden /></a>}
      </div>
      {comments.length ? (
        <ul className="bili-comments__list">
          {comments.map((comment) => (
            <li key={comment.id}>
              <img src={comment.avatar} alt="" width={28} height={28} loading="lazy" referrerPolicy="no-referrer" />
              <div>
                <div className="bili-comments__meta">
                  <strong>{comment.author}</strong>
                  {comment.date && <span>{formatDate(comment.date)}</span>}
                  {comment.likes > 0 && <span>{formatViews(comment.likes)} 赞</span>}
                  {comment.replyCount ? <span>{comment.replyCount} 条回复</span> : null}
                </div>
                <p>{comment.text}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="bili-comments__empty">该条目暂无本地评论快照，可以前往 B 站查看完整评论区。</p>
      )}
    </section>
  );
}
