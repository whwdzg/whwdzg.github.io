/** MC百科短评 / MCMOD comments snapshot. */
import { useState } from 'react';
import { CommentRegular, OpenRegular } from '@fluentui/react-icons';
import { MCMOD_COMMENTS_SYNCED_AT, mcmodComments } from '../../data/projects/mcmod-comments';
import { mcmodProject } from '../../data/projects/mcmod';
import { formatDateTime, relativeTime } from '../../lib/format';
import { Reveal } from '../common/Reveal';
import { StaleBadge, isSyncSourceStale } from '../common/StaleBadge';
import '../../styles/mcmod-comments.css';

interface McmodCommentsProps {
  slug: string;
}

const CHANNELS: Record<number, string> = {
  1: '喷泉广场',
  2: '冒险者公会',
};

export function McmodComments({ slug }: McmodCommentsProps) {
  const entry = mcmodProject(slug);
  const stale = isSyncSourceStale('mcmod');
  const comments = mcmodComments(slug);
  const replyTotal = comments.reduce((sum, comment) => sum + comment.replies.length, 0);
  const [openReplies, setOpenReplies] = useState<Set<string>>(() => new Set());
  const toggleReplies = (id: string) => {
    setOpenReplies((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  return (
    <Reveal as="section" className={`article-card${stale ? ' is-stale' : ''}`} id="mcmod-comments">
      <div className="article-card__head">
        <div>
          <p className="eyebrow">MCMOD · COMMENTS</p>
          <h2>MC百科评论</h2>
        </div>
        <span className="badge badge--muted">{comments.length} 条短评{replyTotal ? ` · ${replyTotal} 条楼中楼` : ''}</span>
        <StaleBadge source="mcmod" label="MC百科数据已过期" />
      </div>
      <p className="project-section-lead">
        来自 MC百科条目下的公开短评，保留原话与楼层；有回复的评论可以展开楼中楼。评论只在构建期同步，不在浏览器里请求 MC百科。
      </p>
      {comments.length ? (
        <div className="mcmod-comment-list">
          {comments.map((comment) => (
            <article className="mcmod-comment" key={comment.id}>
              <img
                className="mcmod-comment__avatar"
                src={comment.avatar}
                alt={`${comment.author} 的头像`}
                width={34}
                height={34}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <div className="mcmod-comment__body">
                <div className="mcmod-comment__meta">
                  <strong>{comment.author}</strong>
                  <span className="mcmod-comment__floor">{comment.floor}</span>
                  <span>{comment.relative || comment.date}</span>
                  <span className="mcmod-comment__channel">{CHANNELS[comment.channel] ?? '短评'}</span>
                  {comment.replyCount > 0 && <span>{comment.replyCount} 条回复</span>}
                </div>
                <p>{comment.text}</p>
                {comment.likes > 0 && <small>{comment.likes} 人觉得有用</small>}
                {comment.replies.length > 0 && (
                  <div className="mcmod-replies">
                    <button
                      type="button"
                      className="mcmod-replies__toggle"
                      aria-expanded={openReplies.has(comment.id)}
                      onClick={() => toggleReplies(comment.id)}
                    >
                      <CommentRegular aria-hidden />
                      {openReplies.has(comment.id) ? '收起楼中楼' : `查看 ${comment.replies.length} 条楼中楼`}
                    </button>
                    {openReplies.has(comment.id) && (
                      <div className="mcmod-reply-list">
                        {comment.replies.map((reply) => (
                          <div className="mcmod-reply" key={reply.id}>
                            <img src={reply.avatar} alt="" width={26} height={26} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                            <div>
                              <div className="mcmod-reply__meta">
                                <strong>{reply.author}</strong>
                                {reply.replyTo && <span>回复 @{reply.replyTo}</span>}
                                <span>{reply.relative || reply.date}</span>
                              </div>
                              <p>{reply.text}</p>
                              {reply.likes > 0 && <small>{reply.likes} 人觉得有用</small>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mcmod-comments-empty">
          <CommentRegular aria-hidden /> MC百科条目下暂时没有可显示的短评。
        </p>
      )}
      <div className="mcmod-comments-foot">
        <span>同步于 {formatDateTime(MCMOD_COMMENTS_SYNCED_AT)} · {relativeTime(MCMOD_COMMENTS_SYNCED_AT)}</span>
        {entry && (
          <a href={entry.url} target="_blank" rel="noopener noreferrer">
            在 MC百科查看 <OpenRegular aria-hidden />
          </a>
        )}
      </div>
    </Reveal>
  );
}
