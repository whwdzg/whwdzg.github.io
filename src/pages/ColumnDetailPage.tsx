/** 专栏详情 / Column article. */
import { ArrowLeftRegular, ArrowRightRegular, BookRegular, OpenRegular } from '@fluentui/react-icons';
import { Link, useRouter } from '../lib/router';
import { columnBySlug } from '../data/columns';
import { PageIntro } from '../components/layout/PageIntro';
import { Reveal } from '../components/common/Reveal';
import { formatDate } from '../lib/format';
import '../styles/columns.css';

export default function ColumnDetailPage() {
  const { path } = useRouter();
  const slug = path.split('/').filter(Boolean).pop() ?? '';
  const column = columnBySlug(slug);
  if (!column) return null;

  return (
    <div className="page page--column">
      <PageIntro
        eyebrow={`COLUMN · ${column.number}`}
        title={column.title}
        lead={column.subtitle}
        meta={[
          { icon: 'person', label: '沧海水鱼' },
          { icon: 'calendar', label: formatDate(column.date) },
          { icon: 'clock', label: column.readTime },
        ]}
        actions={
          <>
            <Link className="btn btn--ghost btn--md" to="/columns/">
              <ArrowLeftRegular aria-hidden /> 全部专栏
            </Link>
            <a className="btn btn--secondary btn--md" href={column.source} target="_blank" rel="noopener noreferrer">
              B 站原动态 <OpenRegular aria-hidden />
            </a>
          </>
        }
      />
      <div className="container column-detail-layout">
        <Reveal as="article" className="article-card column-article">
          <div className="column-article__meta">
            <span>{column.number}</span>
            <span>{column.subtitle}</span>
          </div>
          <blockquote className="column-quote">{column.quote}</blockquote>
          {column.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="column-source">
            <BookRegular aria-hidden />
            <div>
              <strong>原文</strong>
              <a href={column.source} target="_blank" rel="noopener noreferrer">{column.sourceLabel} <OpenRegular aria-hidden /></a>
            </div>
          </div>
        </Reveal>
        <aside className="column-side">
          <div className="column-side-card">
            <p className="eyebrow">COLUMN INFO</p>
            <dl>
              <div><dt>作者</dt><dd>沧海水鱼</dd></div>
              <div><dt>发布</dt><dd>{formatDate(column.date)}</dd></div>
              <div><dt>阅读</dt><dd>{column.readTime}</dd></div>
              <div><dt>来源</dt><dd>B 站置顶动态</dd></div>
            </dl>
            <Link className="text-link" to="/columns/">全部专栏 <ArrowRightRegular aria-hidden /></Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
