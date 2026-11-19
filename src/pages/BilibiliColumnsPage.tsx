/** 哔哩哔哩专栏 / Bilibili articles. */
import { ArrowRightRegular, DocumentRegular, OpenRegular } from '@fluentui/react-icons';
import { BILIBILI_ARTICLES, BILIBILI_PROFILE_SYNCED_AT } from '../data/bilibili-profile';
import { formatDate, formatDateTime, formatViews, relativeTime } from '../lib/format';
import { PageIntro } from '../components/layout/PageIntro';
import { BilibiliTabs } from '../components/bilibili/BilibiliTabs';
import { Reveal } from '../components/common/Reveal';
import { StaleBadge, isSyncSourceStale } from '../components/common/StaleBadge';
import '../styles/bilibili-profile.css';

export default function BilibiliColumnsPage() {
  const stale = isSyncSourceStale('bilibili');
  return (
    <div className="page page--bili-columns">
      <PageIntro
        eyebrow="BILIBILI · ARTICLES"
        title="专栏"
        lead="B 站专栏文章。这里展示标题、摘要、发布时间与阅读 / 点赞数据，阅读全文请前往 B 站。"
        meta={[
          { icon: 'document', label: `${BILIBILI_ARTICLES.length} 篇专栏` },
          { icon: 'person', label: '沧海水鱼' },
          { icon: 'refresh', label: `同步于 ${relativeTime(BILIBILI_PROFILE_SYNCED_AT)}` },
        ]}
        actions={
          <a className="btn btn--primary btn--md" href="https://space.bilibili.com/588003657/article" target="_blank" rel="noopener noreferrer">
            打开 B 站专栏 <OpenRegular aria-hidden />
          </a>
        }
      />
      <div className={`container bili-subpage${stale ? ' is-stale' : ''}`}>
        <BilibiliTabs active="columns" />
        <div className="bili-stale-row"><StaleBadge source="bilibili" label="专栏数据已过期" /></div>
        <div className="bili-article-list">
          {BILIBILI_ARTICLES.map((article, index) => (
            <Reveal key={article.id} delay={index * 60}>
              <a className="bili-article-card" href={article.url} target="_blank" rel="noopener noreferrer">
                <div className="bili-article-card__visual">
                  {article.cover ? <img src={article.cover} alt="" loading="lazy" /> : <DocumentRegular aria-hidden />}
                </div>
                <div className="bili-article-card__body">
                  <p className="eyebrow">{article.date ? formatDate(article.date) : 'B 站专栏'}</p>
                  <h2>{article.title}</h2>
                  <p>{article.summary}</p>
                  <div>
                    <span>{formatViews(article.views)} 阅读</span>
                    <span>{formatViews(article.likes)} 赞</span>
                    <span>{article.words} 字</span>
                    <strong>阅读全文 <ArrowRightRegular aria-hidden /></strong>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
        <p className="bili-subpage-note"><DocumentRegular aria-hidden /> 专栏数据同步于 {formatDateTime(BILIBILI_PROFILE_SYNCED_AT)}。</p>
      </div>
    </div>
  );
}
