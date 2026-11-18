/** 用户页 / Public user profile. */
import { useMemo } from 'react';
import { CalendarLtrRegular, CommentRegular, OpenRegular, PersonRegular } from '@fluentui/react-icons';
import { Link } from '../lib/router';
import { useRouter } from '../lib/router';
import { COMMENTS } from '../data/comments';
import { USERS, userBySlug } from '../data/users';
import { TableOfContents } from '../components/common/TableOfContents';
import { useActiveSection } from '../hooks/useActiveSection';
import { formatDate } from '../lib/format';
import '../styles/user.css';

const TOC = [
  { id: 'intro', label: '简述' },
  { id: 'guestbook', label: '留言板' },
  { id: 'links', label: '链接' },
];

export default function UserPage() {
  const { path } = useRouter();
  const slug = path.includes('hxhej') ? 'hxhej' : 'canghaishuiyu';
  const user = userBySlug(slug) ?? USERS.canghaishuiyu;
  const active = useActiveSection(useMemo(() => TOC.map((item) => item.id), []));
  const related = COMMENTS.filter((comment) => comment.userSlug === slug || comment.reply?.userSlug === slug);

  return (
    <div className="page page--user" style={{ '--user-accent': user.accent } as React.CSSProperties}>
      <div className="container user-page">
        <header className="user-hero">
          <div className="user-hero__banner" aria-hidden />
          <div className="user-hero__body">
            <img className="user-avatar" src={user.avatar} alt={`${user.name} 的头像`} width={96} height={96} />
            <div className="user-identity">
              <p className="eyebrow">USER PROFILE · UID {user.uid}</p>
              <h1>{user.name}</h1>
              {user.legacyName && <p className="user-legacy">旧版名称：{user.legacyName}</p>}
              <p className="user-tagline">{user.tagline}</p>
              <div className="user-meta">
                <span><PersonRegular aria-hidden /> UID {user.uid}</span>
                <span><CalendarLtrRegular aria-hidden /> 入站 {formatDate(user.joined)}</span>
                <span>更新 {formatDate(user.updated)}</span>
              </div>
              <div className="user-actions">
                <a className="btn btn--primary btn--sm" href={user.bilibili} target="_blank" rel="noopener noreferrer">
                  哔哩哔哩 <OpenRegular aria-hidden />
                </a>
                {user.github && (
                  <a className="btn btn--ghost btn--sm" href={user.github} target="_blank" rel="noopener noreferrer">
                    GitHub <OpenRegular aria-hidden />
                  </a>
                )}
                <Link className="btn btn--ghost btn--sm" to="/comments/">
                  <CommentRegular aria-hidden /> 留言板
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="user-layout">
          <div className="user-main">
            <section className="article-card" id="intro">
              <p className="eyebrow">ABOUT</p>
              <h2>简述</h2>
              <p className="user-summary">{user.summary}</p>
              <div className="user-stat-grid">
                {user.stats.map((stat) => (
                  <div key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
              <p className="user-note">{user.note}</p>
            </section>

            <section className="article-card" id="guestbook">
              <div className="article-card__head">
                <div>
                  <p className="eyebrow">GUESTBOOK</p>
                  <h2>留言板</h2>
                </div>
                <span className="badge">{related.length} 条相关摘录</span>
              </div>
              {related.length ? (
                <div className="user-comment-list">
                  {related.map((comment) => (
                    <article key={comment.id} className="user-comment">
                      <div className="user-comment__head">
                        <strong>{comment.author}</strong>
                        <span>{formatDate(comment.date)}</span>
                      </div>
                      <p>{comment.text}</p>
                      {comment.reply && (
                        <div className="user-comment__reply">
                          <strong>{comment.reply.author}</strong>
                          <p>{comment.reply.text}</p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p>还没有留下公开留言。</p>
              )}
              <Link className="text-link" to="/comments/">
                打开留言板 <OpenRegular aria-hidden />
              </Link>
            </section>

            <section className="article-card" id="links">
              <p className="eyebrow">LINKS</p>
              <h2>站外与站内</h2>
              <div className="user-link-grid">
                <a href={user.bilibili} target="_blank" rel="noopener noreferrer">
                  <span>哔哩哔哩</span>
                  <strong>space.bilibili.com/{user.bilibili.split('/').pop()}</strong>
                </a>
                {user.github ? (
                  <a href={user.github} target="_blank" rel="noopener noreferrer">
                    <span>GitHub</span>
                    <strong>github.com/whwdzg</strong>
                  </a>
                ) : null}
                <Link to="/projects/modrinth/">
                  <span>站内项目</span>
                  <strong>Modrinth 项目索引</strong>
                </Link>
              </div>
            </section>
          </div>

          <aside className="user-side">
            <TableOfContents items={TOC} active={active} title="用户目录" />
          </aside>
        </div>
      </div>
    </div>
  );
}
