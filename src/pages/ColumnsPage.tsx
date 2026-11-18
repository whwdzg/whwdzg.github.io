/** 专栏索引 / Columns index. */
import { useMemo } from 'react';
import { ArrowRightRegular, BookRegular, CalendarLtrRegular, ClockRegular } from '@fluentui/react-icons';
import { Link } from '../lib/router';
import { COLUMNS } from '../data/columns';
import { PageIntro } from '../components/layout/PageIntro';
import { Reveal } from '../components/common/Reveal';
import { formatDate } from '../lib/format';
import '../styles/columns.css';

export default function ColumnsPage() {
  const columns = useMemo(() => COLUMNS, []);
  return (
    <div className="page page--columns">
      <PageIntro
        eyebrow="COLUMNS · NOTES"
        title="专栏"
        lead="比影像慢一点的文字。这里放长一点的记录、说明与还没有写完的想法。"
        meta={[
          { icon: 'document', label: `${columns.length} 篇专栏` },
          { icon: 'person', label: '沧海水鱼' },
          { icon: 'calendar', label: '持续更新' },
        ]}
        actions={
          <Link className="btn btn--primary btn--md" to="/">
            回到主页 <ArrowRightRegular aria-hidden />
          </Link>
        }
      />
      <div className="container columns-page">
        <div className="column-grid">
          {columns.map((column, index) => (
            <Reveal key={column.slug} delay={index * 60}>
              <Link className="column-card" to={`/columns/${column.slug}/`}>
                <div className="column-card__number">{column.number}</div>
                <div className="column-card__body">
                  <p className="eyebrow">{column.subtitle}</p>
                  <h2>{column.title}</h2>
                  <p className="column-card__excerpt">{column.excerpt}</p>
                  <div className="column-card__meta">
                    <span><CalendarLtrRegular aria-hidden /> {formatDate(column.date)}</span>
                    <span><ClockRegular aria-hidden /> {column.readTime}</span>
                    <span className="column-card__more">阅读 <ArrowRightRegular aria-hidden /></span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="column-note">
          <BookRegular aria-hidden />
          <p>专栏为静态页面；内容会随版本更新整理。B 站原动态、视频与项目页仍保留在各自入口。</p>
        </div>
      </div>
    </div>
  );
}
