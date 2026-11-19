/** 哔哩哔哩个人主页 / Bilibili profile hub. */
import { ArrowRightRegular, ArrowSyncRegular, CalendarLtrRegular, OpenRegular, PlayRegular } from '@fluentui/react-icons';
import { Link } from '../lib/router';
import { BILIBILI_PROFILE, BILIBILI_PROFILE_SYNCED_AT, BILIBILI_DYNAMICS } from '../data/bilibili-profile';
import { videos } from '../data/videos';
import { formatDateTime, formatViews, relativeTime } from '../lib/format';
import { BilibiliTabs } from '../components/bilibili/BilibiliTabs';
import { Reveal } from '../components/common/Reveal';
import { StaleBadge, isSyncSourceStale } from '../components/common/StaleBadge';
import '../styles/bilibili-profile.css';

export default function BilibiliProfilePage() {
  const stale = isSyncSourceStale('bilibili');
  const profile = BILIBILI_PROFILE;
  const archiveViews = videos.reduce((sum, video) => sum + (video.views ?? 0), 0);
  const stats = [
    { label: '粉丝', value: formatViews(profile.fans), note: 'B 站公开数据' },
    { label: '关注', value: formatViews(profile.following), note: 'B 站公开数据' },
    { label: '获赞', value: formatViews(profile.likes), note: 'B 站公开数据' },
    { label: '视频', value: formatViews(profile.videos), note: 'B 站投稿数' },
    { label: '动态', value: formatViews(profile.opus), note: '已发布动态' },
    { label: '专栏', value: formatViews(profile.articles), note: 'B 站专栏' },
    { label: '归档播放', value: formatViews(archiveViews), note: `${videos.length} 条影像` },
    { label: '等级', value: `Lv.${profile.level}`, note: 'B 站账号' },
  ];
  const recentVideos = videos.slice(0, 4);

  return (
    <div className="page page--bili-profile">
      <div className="container">
        <header className="bili-profile-hero">
          <div className="bili-profile-hero__cover" aria-hidden />
          <div className="bili-profile-hero__body">
            <img className="bili-profile-avatar" src={profile.avatar} alt={`${profile.name}的头像`} width={96} height={96} />
            <div className="bili-profile-identity">
              <p className="eyebrow">BILIBILI · UID {profile.uid}</p>
              <h1>{profile.name}</h1>
              <p className="bili-profile-sign">{profile.sign}</p>
              <div className="bili-profile-badges">
                <span>Lv.{profile.level}</span>
                <span>{formatViews(profile.fans)} 粉丝</span>
                <span>{profile.videos} 个视频</span>
                <span>{profile.opus} 条动态</span>
              </div>
            </div>
            <a className="btn btn--primary btn--md" href="https://space.bilibili.com/588003657" target="_blank" rel="noopener noreferrer">
              打开 B 站主页 <OpenRegular aria-hidden />
            </a>
          </div>
        </header>

        <BilibiliTabs active="profile" />

        <div className="bili-profile-sync">
          <ArrowSyncRegular className="bili-profile-sync__icon" aria-hidden />
          每天同步 · {formatDateTime(BILIBILI_PROFILE_SYNCED_AT)} · {relativeTime(BILIBILI_PROFILE_SYNCED_AT)}
          <StaleBadge source="bilibili" label="B 站数据已过期" />
        </div>

        <Reveal as="section" className={`bili-stat-grid${stale ? ' is-stale' : ''}`} aria-label="个人数据">
          {stats.map((stat) => (
            <div key={stat.label} className="bili-stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.note}</small>
            </div>
          ))}
        </Reveal>

        <div className="bili-profile-layout">
          <div className="bili-profile-main">
            <Reveal as="section" className="article-card bili-announcement">
              <div className="article-card__head">
                <div>
                  <p className="eyebrow">ANNOUNCEMENT</p>
                  <h2>公告</h2>
                </div>
                <span className="badge">个人签名</span>
              </div>
              <p className="bili-announcement__text">{profile.sign}</p>
            </Reveal>

            <Reveal as="section" className="article-card bili-live-card">
              <div className="article-card__head">
                <div>
                  <p className="eyebrow">LIVE ROOM</p>
                  <h2>直播</h2>
                </div>
                <span className={`badge ${profile.live.active ? 'badge--accent' : ''}`}>
                  {profile.live.active ? '直播中' : '当前未开播'}
                </span>
              </div>
              <div className="bili-live">
                {profile.live.cover && <img src={profile.live.cover} alt="" loading="lazy" />}
                <div>
                  <strong>{profile.live.title || '暂无直播标题'}</strong>
                  <p>{profile.live.active ? `正在直播 · ${profile.live.online} 人在线` : '最近直播标题'} · 房间号 {profile.live.roomId}</p>
                </div>
                <a className="btn btn--ghost btn--sm" href={profile.live.url || 'https://live.bilibili.com/23655191'} target="_blank" rel="noopener noreferrer">
                  进入直播间 <OpenRegular aria-hidden />
                </a>
              </div>
            </Reveal>

            <Reveal as="section" className="article-card">
              <div className="article-card__head">
                <div>
                  <p className="eyebrow">RECENT VIDEOS</p>
                  <h2>最近视频</h2>
                </div>
                <Link className="text-link" to="/bilibili/videos/">全部视频 <ArrowRightRegular aria-hidden /></Link>
              </div>
              <div className="bili-recent-videos">
                {recentVideos.map((video) => (
                  <a key={video.id} href={video.url} target="_blank" rel="noopener noreferrer">
                    <img src={video.cover} alt="" loading="lazy" />
                    <span>{video.title}</span>
                  </a>
                ))}
              </div>
            </Reveal>

            <Reveal as="section" className="article-card">
              <div className="article-card__head">
                <div>
                  <p className="eyebrow">RECENT DYNAMICS</p>
                  <h2>最近动态</h2>
                </div>
                <Link className="text-link" to="/bilibili/dynamics/">全部动态 <ArrowRightRegular aria-hidden /></Link>
              </div>
              <div className="bili-recent-dynamics">
                {BILIBILI_DYNAMICS.slice(0, 3).map((dynamic) => (
                  <a key={dynamic.id} href={dynamic.url} target="_blank" rel="noopener noreferrer">
                    <p>{dynamic.text}</p>
                    <small>{dynamic.likes} 赞 <OpenRegular aria-hidden /></small>
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          <aside className="bili-profile-side">
            <div className="bili-side-card">
              <p className="eyebrow">EXPLORE</p>
              <h2>内容分区</h2>
              <Link to="/bilibili/videos/" className="bili-side-link">
                <PlayRegular aria-hidden />
                <span><strong>视频</strong><small>251 条影像归档</small></span>
                <ArrowRightRegular aria-hidden />
              </Link>
              <Link to="/bilibili/dynamics/" className="bili-side-link">
                <CalendarLtrRegular aria-hidden />
                <span><strong>动态</strong><small>{BILIBILI_DYNAMICS.length} 条近期动态</small></span>
                <ArrowRightRegular aria-hidden />
              </Link>
              <Link to="/bilibili/columns/" className="bili-side-link">
                <OpenRegular aria-hidden />
                <span><strong>专栏</strong><small>{profile.articles} 篇 B 站专栏</small></span>
                <ArrowRightRegular aria-hidden />
              </Link>
            </div>
            <p className="bili-profile-note">数据来自 B 站公开接口，由 GitHub Actions 每天自动同步；播放量为站内影像归档合计。</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
