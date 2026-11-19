/** 哔哩哔哩动态 / Bilibili dynamics. */
import { useState } from 'react';
import { CommentRegular, OpenRegular } from '@fluentui/react-icons';
import { BILIBILI_DYNAMICS, BILIBILI_PROFILE, BILIBILI_PROFILE_SYNCED_AT } from '../data/bilibili-profile';
import { formatDate, formatDateTime, formatViews, relativeTime } from '../lib/format';
import { PageIntro } from '../components/layout/PageIntro';
import { BilibiliTabs } from '../components/bilibili/BilibiliTabs';
import { Reveal } from '../components/common/Reveal';
import { BilibiliStats } from '../components/bilibili/BilibiliStats';
import { BilibiliComments } from '../components/bilibili/BilibiliComments';
import { BilibiliDynamicText } from '../components/bilibili/BilibiliDynamicText';
import { StaleBadge, isSyncSourceStale } from '../components/common/StaleBadge';
import '../styles/bilibili-profile.css';

export default function BilibiliDynamicsPage() {
  const stale = isSyncSourceStale('bilibili');
  const [openComments, setOpenComments] = useState<Set<string>>(() => new Set());
  const toggleComments = (id: string) => {
    setOpenComments((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  return (
    <div className="page page--bili-dynamics">
      <PageIntro
        eyebrow="BILIBILI · DYNAMICS"
        title="动态"
        lead="沧海水鱼在 B 站发布的近期动态。这里保留原文、三连 / 分享数据与评论快照；完整时间线请到 B 站空间查看。"
        meta={[
          { icon: 'comment', label: `${BILIBILI_DYNAMICS.length} 条近期动态` },
          { icon: 'person', label: BILIBILI_PROFILE.name },
          { icon: 'refresh', label: `同步于 ${relativeTime(BILIBILI_PROFILE_SYNCED_AT)}` },
        ]}
        actions={
          <a className="btn btn--primary btn--md" href="https://space.bilibili.com/588003657/dynamic" target="_blank" rel="noopener noreferrer">
            打开 B 站动态 <OpenRegular aria-hidden />
          </a>
        }
      />
      <div className={`container bili-subpage${stale ? ' is-stale' : ''}`}>
        <BilibiliTabs active="dynamics" />
        <div className="bili-stale-row"><StaleBadge source="bilibili" label="动态数据已过期" /></div>
        <div className="bili-dynamic-list">
          {BILIBILI_DYNAMICS.map((dynamic, index) => (
            <Reveal key={dynamic.id} delay={Math.min(index, 6) * 30}>
              <article className="bili-dynamic-card">
                <div className="bili-dynamic-card__head">
                  <a className="badge" href={dynamic.url} target="_blank" rel="noopener noreferrer">动态 #{dynamic.id}</a>
                  <span className="bili-dynamic-card__likes">{formatViews(dynamic.stats.like)} 赞</span>
                </div>
                <BilibiliDynamicText dynamic={dynamic} className="bili-dynamic-card__text" />
                {dynamic.images.length > 0 && (
                  <div className="bili-dynamic-images">
                    {dynamic.images.map((image, imageIndex) => (
                      <a key={image.url} href={dynamic.url} target="_blank" rel="noopener noreferrer" aria-label={`查看动态图片 ${imageIndex + 1}`}>
                        <img src={image.url} alt="" width={image.width || 480} height={image.height || 480} loading="lazy" data-lightbox="on" referrerPolicy="no-referrer" />
                      </a>
                    ))}
                  </div>
                )}
                <BilibiliStats stats={dynamic.stats} sourceUrl={dynamic.url} />
                <div className="bili-dynamic-card__foot">
                  <span>{dynamic.date ? `发布于 ${formatDate(dynamic.date)}` : '发布日期未记录'}</span>
                  <button type="button" className="bili-dynamic-card__toggle" aria-expanded={openComments.has(dynamic.id)} onClick={() => toggleComments(dynamic.id)}>
                    <CommentRegular aria-hidden />
                    {openComments.has(dynamic.id) ? '收起评论' : `查看评论 (${dynamic.stats.comment})`}
                  </button>
                </div>
                {openComments.has(dynamic.id) && (
                  <BilibiliComments comments={dynamic.comments} sourceUrl={dynamic.url} count={dynamic.stats.comment} />
                )}
              </article>
            </Reveal>
          ))}
        </div>
        <p className="bili-subpage-note">
          <CommentRegular aria-hidden /> 动态来自 B 站公开接口快照，最近同步 {formatDateTime(BILIBILI_PROFILE_SYNCED_AT)}。共 {BILIBILI_PROFILE.opus} 条动态。
        </p>
      </div>
    </div>
  );
}
