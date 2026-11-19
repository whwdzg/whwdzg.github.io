/** 哔哩哔哩动态 / Bilibili dynamics. */
import { ArrowRightRegular, CommentRegular, OpenRegular } from '@fluentui/react-icons';
import { BILIBILI_DYNAMICS, BILIBILI_PROFILE, BILIBILI_PROFILE_SYNCED_AT } from '../data/bilibili-profile';
import { formatDateTime, formatViews, relativeTime } from '../lib/format';
import { PageIntro } from '../components/layout/PageIntro';
import { BilibiliTabs } from '../components/bilibili/BilibiliTabs';
import { Reveal } from '../components/common/Reveal';
import '../styles/bilibili-profile.css';

export default function BilibiliDynamicsPage() {
  return (
    <div className="page page--bili-dynamics">
      <PageIntro
        eyebrow="BILIBILI · DYNAMICS"
        title="动态"
        lead="沧海水鱼在 B 站发布的近期动态。这里保留原文、点赞数与跳转链接；完整时间线请到 B 站空间查看。"
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
      <div className="container bili-subpage">
        <BilibiliTabs active="dynamics" />
        <div className="bili-dynamic-list">
          {BILIBILI_DYNAMICS.map((dynamic, index) => (
            <Reveal key={dynamic.id} delay={Math.min(index, 6) * 30}>
              <a className="bili-dynamic-card" href={dynamic.url} target="_blank" rel="noopener noreferrer">
                <div className="bili-dynamic-card__head">
                  <span className="badge">动态 #{dynamic.id}</span>
                  <span className="bili-dynamic-card__likes">{formatViews(dynamic.likes)} 赞</span>
                </div>
                <p>{dynamic.text}</p>
                <div className="bili-dynamic-card__foot">
                  <span>{dynamic.cover ? '含图片' : '文字动态'}</span>
                  <span>在 B 站查看 <ArrowRightRegular aria-hidden /></span>
                </div>
              </a>
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
