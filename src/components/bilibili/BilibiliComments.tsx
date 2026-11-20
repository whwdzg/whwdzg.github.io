/** B 站评论快照 / Snapshot comments with nested replies and emoji. */
import { CommentRegular, OpenRegular } from '@fluentui/react-icons';
import type { BilibiliCommentEmoji, BilibiliCommentImage, BilibiliCommentReply } from '../../data/bilibili-comments';

interface CommentLike {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  replyCount?: number;
  date: string;
  emojis?: BilibiliCommentEmoji[];
  images?: BilibiliCommentImage[];
  replies?: BilibiliCommentReply[];
}
import { formatDate, formatViews } from '../../lib/format';

function RichText({ text, emojis }: { text: string; emojis?: BilibiliCommentEmoji[] }) {
  const map = new Map((emojis ?? []).map((emoji) => [emoji.token, emoji]));
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <p>
      {parts.map((part, index) => {
        const emoji = map.get(part);
        return emoji
          ? <img key={index} className="bili-comment-emoji" src={emoji.url} alt={emoji.token} title={emoji.token} loading="lazy" referrerPolicy="no-referrer" />
          : <span key={index}>{part}</span>;
      })}
    </p>
  );
}

function CommentImages({ images }: { images?: BilibiliCommentImage[] }) {
  if (!images?.length) return null;
  return (
    <div className="bili-comment-images">
      {images.map((image) => (
        <a key={image.url} href={image.url} target="_blank" rel="noopener noreferrer" className={image.animated ? 'is-animated' : ''}>
          <img src={image.url} alt="" loading="lazy" referrerPolicy="no-referrer" data-lightbox="on" />
          {image.animated && <span>GIF</span>}
        </a>
      ))}
    </div>
  );
}

function ReplyItem({ reply }: { reply: BilibiliCommentReply }) {
  return (
    <div className="bili-comment-reply">
      <img src={reply.avatar} alt="" width={22} height={22} loading="lazy" referrerPolicy="no-referrer" />
      <div>
        <div className="bili-comments__meta">
          <strong>{reply.author}</strong>
          {reply.date && <span>{formatDate(reply.date)}</span>}
          {reply.likes > 0 && <span>{formatViews(reply.likes)} 赞</span>}
        </div>
        <RichText text={reply.text} emojis={reply.emojis} />
        <CommentImages images={reply.images} />
      </div>
    </div>
  );
}

export function BilibiliComments({ comments, sourceUrl, count }: { comments: CommentLike[]; sourceUrl?: string; count?: number }) {
  return (
    <section className="bili-comments">
      <div className="bili-comments__head">
        <h3><CommentRegular aria-hidden /> 评论</h3>
        <span>{comments.length ? `已载入 ${comments.length} 条 · 共 ${formatViews(count ?? comments.length)}` : '暂无评论快照'}</span>
        {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer">打开 B 站评论区 <OpenRegular aria-hidden /></a>}
      </div>
      {comments.length ? (
        <ul className="bili-comments__list">
          {comments.map((comment) => {
            const replies = comment.replies ?? [];
            const totalReplies = comment.replyCount ?? replies.length;
            return (
              <li key={comment.id}>
                <img src={comment.avatar} alt="" width={28} height={28} loading="lazy" referrerPolicy="no-referrer" />
                <div>
                  <div className="bili-comments__meta">
                    <strong>{comment.author}</strong>
                    {comment.date && <span>{formatDate(comment.date)}</span>}
                    {comment.likes > 0 && <span>{formatViews(comment.likes)} 赞</span>}
                    {totalReplies > 0 && <span>{totalReplies} 条回复</span>}
                  </div>
                  <RichText text={comment.text} emojis={comment.emojis} />
                  <CommentImages images={comment.images} />
                  {replies.length > 0 && (
                    <details className="bili-comment-replies">
                      <summary>展开楼中楼 · 已载入 {replies.length}/{totalReplies}</summary>
                      <div className="bili-comment-replies__list">
                        {replies.map((reply) => <ReplyItem key={reply.id} reply={reply} />)}
                      </div>
                      {totalReplies > replies.length && sourceUrl && (
                        <a className="bili-comment-replies__more" href={sourceUrl} target="_blank" rel="noopener noreferrer">
                          还有 {totalReplies - replies.length} 条回复，去 B 站查看 <OpenRegular aria-hidden />
                        </a>
                      )}
                    </details>
                  )}
                  {!replies.length && totalReplies > 0 && sourceUrl && (
                    <a className="bili-comment-replies__more" href={sourceUrl} target="_blank" rel="noopener noreferrer">
                      {totalReplies} 条回复，去 B 站查看 <OpenRegular aria-hidden />
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="bili-comments__empty">该条目暂无本地评论快照，可以前往 B 站查看完整评论区。</p>
      )}
    </section>
  );
}
