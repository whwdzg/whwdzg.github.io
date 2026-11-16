/**
 * 留言板 / Guestbook.
 *
 * 静态站没有写入接口，因此把“留言”拆成三个可完成的步骤：
 * 1. 在本地写草稿（自动保存到 localStorage）
 * 2. 复制格式化文本
 * 3. 打开 B 站私信，粘贴发送
 *
 * 留言摘录仍然是人工整理，保留原话与回复关系。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CopyRegular,
  OpenRegular,
  PinRegular,
  LinkRegular,
  CheckmarkCircleRegular,
  DismissRegular,
  SendRegular,
  MailRegular,
  ArrowRightRegular,
  CalendarLtrRegular,
  ClockRegular,
} from '@fluentui/react-icons';
import { PageIntro } from '../components/layout/PageIntro';
import { TableOfContents } from '../components/common/TableOfContents';
import { Button } from '../components/common/Button';
import { useActiveSection } from '../hooks/useActiveSection';
import { useToast } from '../hooks/useToast';
import { copyText } from '../lib/clipboard';
import { readJson, writeJson } from '../lib/storage';
import { formatDate, formatDateTime } from '../lib/format';
import { COMMENTS, GUESTBOOK_META } from '../data/comments';
import { LINKS } from '../data/site';

const DRAFT_KEY = 'whwdzg-guestbook-draft-v1';
const MAX_LENGTH = 500;

interface Draft {
  name: string;
  message: string;
  updatedAt: string;
}

const EMPTY_DRAFT: Draft = { name: '', message: '', updatedAt: '' };

const TOC_ITEMS = [
  { id: 'guide', label: '留言方式' },
  { id: 'write', label: '写一条留言' },
  { id: 'entries', label: '留言摘录' },
  { id: 'jump', label: '目录与跳转' },
];

export default function CommentsPage() {
  const { toast } = useToast();
  const [draft, setDraft] = useState<Draft>(() => ({ ...EMPTY_DRAFT, ...readJson<Partial<Draft>>(DRAFT_KEY, {}) }));
  const [savedAt, setSavedAt] = useState<string>(() => readJson<Partial<Draft>>(DRAFT_KEY, {}).updatedAt ?? '');
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const hydrated = useRef(false);
  const skipAutosave = useRef(false);
  const active = useActiveSection(useMemo(() => TOC_ITEMS.map((item) => item.id), []));

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    if (skipAutosave.current) {
      skipAutosave.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      const updatedAt = new Date().toISOString();
      const next = { ...draft, updatedAt };
      writeJson(DRAFT_KEY, next);
      setSavedAt(updatedAt);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draft]);

  const formatted = useMemo(() => {
    const name = draft.name.trim() || '匿名访客';
    const message = draft.message.trim();
    return `来自 whwdzg.github.io 留言板\n昵称：${name}\n留言：${message}`;
  }, [draft]);

  const copyDraft = async () => {
    if (!draft.message.trim()) {
      setError('先写点什么再复制吧。');
      return;
    }
    setError('');
    const ok = await copyText(formatted);
    toast(ok ? '留言已复制，去 B 站私信粘贴发送吧' : '复制失败，请手动选择文本', ok ? 'success' : 'error');
  };

  const copyAndOpen = () => {
    if (!draft.message.trim()) {
      setError('先写点什么再发送吧。');
      return;
    }
    setError('');
    void copyDraft();
    window.open(LINKS.bilibiliMessage, '_blank', 'noopener,noreferrer');
  };

  const clearDraft = () => {
    skipAutosave.current = true;
    setDraft({ ...EMPTY_DRAFT });
    setError('');
    setPreview(false);
    writeJson(DRAFT_KEY, { ...EMPTY_DRAFT });
    setSavedAt('');
    toast('草稿已清空', 'info');
  };

  const copyComment = async (text: string) => {
    const ok = await copyText(text);
    toast(ok ? '留言已复制' : '复制失败', ok ? 'success' : 'error');
  };

  const copyCommentLink = async (id: number) => {
    const url = `${window.location.origin}/comments/#comment-${id}`;
    const ok = await copyText(url);
    toast(ok ? '留言链接已复制' : '复制失败', ok ? 'success' : 'error');
  };

  return (
    <div className="page page--comments">
      <PageIntro
        eyebrow="GUESTBOOK · COMMENTS"
        title="留言板"
        lead="静态站的“留言板”：想说的、想吐槽的，都可以在这里留下。这里保存人工整理的摘录，也提供一个更顺手的写作入口。"
        meta={[
          { icon: 'person', label: '滄海水魚' },
          { icon: 'calendar', label: `始于 ${formatDate(GUESTBOOK_META.startedAt)}` },
          { icon: 'clock', label: `更新 ${formatDate(GUESTBOOK_META.updatedAt)}` },
          { icon: 'comment', label: `${COMMENTS.length} 条摘录` },
        ]}
        actions={
          <>
            <a className="btn btn--primary btn--md" href={LINKS.bilibiliMessage} target="_blank" rel="noopener noreferrer">
              <MailRegular aria-hidden />
              通过 B 站私信留言
              <OpenRegular aria-hidden />
            </a>
            <a className="btn btn--secondary btn--md" href={GUESTBOOK_META.nextArticle.href} target="_blank" rel="noopener noreferrer">
              下一篇：海绵宝宝 add-on
              <OpenRegular aria-hidden />
            </a>
          </>
        }
        aside={
          <div className="guestbook-aside">
            <div className="guestbook-aside__card">
              <img src="/media/avatars/shuiyu.webp" alt="滄海水魚" width={56} height={56} />
              <div>
                <p>留言会人工整理</p>
                <span>通过 B 站私信发送，作者择期更新到本站。</span>
              </div>
            </div>
            <ul className="guestbook-aside__steps">
              <li>
                <strong>01</strong> 写下想说的话
              </li>
              <li>
                <strong>02</strong> 复制格式化文本
              </li>
              <li>
                <strong>03</strong> 在 B 站私信粘贴
              </li>
            </ul>
          </div>
        }
      />

      <div className="container comments-layout">
        <div className="comments-main">
          <section className="article-card" id="guide" aria-labelledby="guide-title">
            <p className="eyebrow">HOW IT WORKS</p>
            <h2 id="guide-title">留言方式</h2>
            <p>
              静态网站无法直接写入评论，所以这里不假装有一个数据库。你可以先在本页写好草稿，
              复制后通过 bilibili 私信发给我；我会择期把留言整理到下面的摘录里。
            </p>
            <div className="steps-grid">
              <div className="step-card">
                <span className="step-card__index">01</span>
                <h3>在本地写</h3>
                <p>草稿只保存在你的浏览器，不会上传到任何服务器。</p>
              </div>
              <div className="step-card">
                <span className="step-card__index">02</span>
                <h3>复制文本</h3>
                <p>自动带上昵称与留言，格式整齐，直接粘贴即可。</p>
              </div>
              <div className="step-card">
                <span className="step-card__index">03</span>
                <h3>B 站私信</h3>
                <p>点击按钮打开私信页，发送后等待人工整理。</p>
              </div>
            </div>
          </section>

          <section className="article-card composer-card" id="write" aria-labelledby="write-title">
            <div className="composer-card__head">
              <div>
                <p className="eyebrow">WRITE</p>
                <h2 id="write-title">写一条留言</h2>
              </div>
              <span className="composer-card__save" aria-live="polite">
                <CheckmarkCircleRegular aria-hidden />
                {savedAt ? `草稿已保存 ${formatDateTime(savedAt)}` : '草稿自动保存在本地'}
              </span>
            </div>

            <div className="composer-grid">
              <div className="composer-form">
                <label className="field">
                  <span className="field__label">昵称（可选）</span>
                  <input
                    type="text"
                    value={draft.name}
                    maxLength={32}
                    placeholder="匿名访客"
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  />
                </label>

                <label className="field">
                  <span className="field__label">留言</span>
                  <textarea
                    value={draft.message}
                    maxLength={MAX_LENGTH}
                    rows={6}
                    placeholder="想说的、想吐槽的，都可以。"
                    onChange={(event) => {
                      setDraft((current) => ({ ...current, message: event.target.value }));
                      if (error) setError('');
                    }}
                    aria-describedby="composer-count"
                    aria-invalid={Boolean(error)}
                  />
                </label>

                <div className="composer-meta">
                  <span id="composer-count" className={draft.message.length >= MAX_LENGTH ? 'is-limit' : ''}>
                    {draft.message.length} / {MAX_LENGTH}
                  </span>
                  {error && <span className="composer-error">{error}</span>}
                </div>

                <div className="composer-actions">
                  <Button variant="primary" icon={<SendRegular aria-hidden />} onClick={copyAndOpen}>
                    复制并前往 B 站私信
                  </Button>
                  <Button variant="secondary" icon={<CopyRegular aria-hidden />} onClick={copyDraft}>
                    仅复制留言
                  </Button>
                  <Button variant="ghost" icon={<DismissRegular aria-hidden />} onClick={clearDraft}>
                    清空
                  </Button>
                  <Button variant="subtle" onClick={() => setPreview((value) => !value)} aria-pressed={preview}>
                    {preview ? '收起预览' : '预览'}
                  </Button>
                </div>
              </div>

              {preview && (
                <div className="composer-preview" aria-label="留言预览">
                  <p className="eyebrow">PREVIEW</p>
                  <article className="comment-card comment-card--preview">
                    <img src="/media/avatars/shuiyu.webp" alt="" width={40} height={40} />
                    <div className="comment-card__body">
                      <div className="comment-card__meta">
                        <strong>{draft.name.trim() || '匿名访客'}</strong>
                        <span>{formatDate(new Date().toISOString())}</span>
                      </div>
                      <p className="comment-card__text">{draft.message.trim() || '留言预览会显示在这里。'}</p>
                    </div>
                  </article>
                  <pre className="composer-preview__raw">{formatted}</pre>
                </div>
              )}
            </div>
          </section>

          <section className="article-card" id="entries" aria-labelledby="entries-title">
            <div className="article-card__head">
              <div>
                <p className="eyebrow">EXCERPTS</p>
                <h2 id="entries-title">留言摘录</h2>
              </div>
              <span className="badge badge--muted">{COMMENTS.length} 条 · 人工整理</span>
            </div>
            <p>以下为人工汇总的片段，原话保留。头像与昵称对应 B 站 / 站点身份。</p>

            <div className="comment-list">
              {COMMENTS.map((comment) => (
                <article className="comment-card" id={`comment-${comment.id}`} key={comment.id}>
                  <img className="comment-card__avatar" src={comment.avatar} alt={`${comment.author} 的头像`} width={40} height={40} loading="lazy" />
                  <div className="comment-card__body">
                    <div className="comment-card__meta">
                      <strong>{comment.author}</strong>
                      <span>{formatDate(comment.date)}</span>
                      {comment.pinned && (
                        <span className="badge badge--accent">
                          <PinRegular aria-hidden /> 置顶
                        </span>
                      )}
                    </div>
                    <p className="comment-card__text">{comment.text}</p>
                    <div className="comment-card__actions">
                      <button type="button" onClick={() => copyComment(comment.text)}>
                        <CopyRegular aria-hidden /> 复制
                      </button>
                      <button type="button" onClick={() => copyCommentLink(comment.id)}>
                        <LinkRegular aria-hidden /> 链接
                      </button>
                    </div>

                    {comment.reply && (
                      <div className="comment-reply">
                        <img src={comment.reply.avatar} alt="" width={32} height={32} loading="lazy" />
                        <div>
                          <div className="comment-card__meta">
                            <strong>{comment.reply.author}</strong>
                            <span>{formatDate(comment.reply.date)}</span>
                            <span className="badge badge--muted">回复</span>
                          </div>
                          <p className="comment-card__text">{comment.reply.text}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="article-card" id="jump" aria-labelledby="jump-title">
            <p className="eyebrow">NEXT</p>
            <h2 id="jump-title">目录与跳转</h2>
            <p>沿着归档继续逛，或者直接去留言。</p>
            <div className="jump-grid">
              <a className="jump-card" href={GUESTBOOK_META.nextArticle.href} target="_blank" rel="noopener noreferrer">
                <span>
                  <CalendarLtrRegular aria-hidden /> 下一篇
                </span>
                <strong>海绵宝宝 add-on</strong>
                <OpenRegular aria-hidden />
              </a>
              <a className="jump-card" href={LINKS.bilibili} target="_blank" rel="noopener noreferrer">
                <span>
                  <ClockRegular aria-hidden /> 影像归档
                </span>
                <strong>哔哩哔哩空间</strong>
                <OpenRegular aria-hidden />
              </a>
              <a className="jump-card" href={LINKS.github} target="_blank" rel="noopener noreferrer">
                <span>
                  <ArrowRightRegular aria-hidden /> 源码
                </span>
                <strong>GitHub 仓库</strong>
                <OpenRegular aria-hidden />
              </a>
            </div>
          </section>
        </div>

        <TableOfContents items={TOC_ITEMS} active={active} />
      </div>
    </div>
  );
}
