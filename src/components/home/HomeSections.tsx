/**
 * 首页内容区 / Home content sections.
 *
 * 这些区块都位于首屏之下，使用 `content-visibility: auto` + IntersectionObserver
 * 延迟渲染动画；不引入轮播库、图表库或动画库。
 */
import {
  ArrowRightRegular,
  CheckmarkCircleRegular,
  ClockRegular,
  EyeRegular,
  OpenRegular,
  PlayRegular,
  SparkleRegular,
} from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { FluentIcon } from '../common/FluentIcon';
import { useCountUp } from '../../hooks/useCountUp';
import { Reveal } from '../common/Reveal';
import { SectionHeading } from '../common/SectionHeading';
import { SpotlightCard } from '../common/SpotlightCard';
import { FEATURED_VIDEOS, HIGHLIGHTS, PROJECTS, QUICK_LINKS, TIMELINE, LINKS, SITE } from '../../data/site';
import { siteMeta } from '../../lib/meta';

/** 数字统计卡 */
function Stat({ value, suffix, label, note }: { value: number; suffix?: string; label: string; note?: string }) {
  const { value: animated, ref } = useCountUp<HTMLDivElement>(value);
  return (
    <div className="stat-card" ref={ref}>
      <p className="stat-card__value">
        {Math.round(animated)}
        {suffix && <span>{suffix}</span>}
      </p>
      <p className="stat-card__label">{label}</p>
      {note && <p className="stat-card__note">{note}</p>}
    </div>
  );
}

export function NowSection() {
  return (
    <section id="now" className="section now" aria-labelledby="now-title">
      <div className="container">
        <Reveal className="now__intro">
          <div className="now__headline">
            <p className="eyebrow">
              <SparkleRegular aria-hidden /> NOW · 2026
            </p>
            <h2 id="now-title" className="display-title">
              一个由 <em>Minecraft</em>、代码与影像构成的
              <span className="display-title__accent">个人角落。</span>
            </h2>
          </div>
          <div className="now__copy">
            <p>
              我是滄海水魚，网上通常叫 whwdzg。做 Minecraft 数据包，搬运并翻译喜欢的影像，
              也花很多时间把个人网站重写一遍又一遍。
            </p>
            <p>
              3.x 从 3.0 开始重写：不照搬旧页面，而是用新的设计语言重新实现相同的功能。
              目标很朴素——更好看，也要更快、更轻。
            </p>
            <ul className="now__status" aria-label="3.x 完成状态">
              <li>
                <CheckmarkCircleRegular aria-hidden /> Fluent 设计系统与液态玻璃
              </li>
              <li>
                <CheckmarkCircleRegular aria-hidden /> 矩形悬浮侧栏与全屏自动收起页眉
              </li>
              <li>
                <CheckmarkCircleRegular aria-hidden /> 43 条影像归档与本地 WebP 封面
              </li>
              <li>
                <CheckmarkCircleRegular aria-hidden /> 版本 / 提交历史页与 GitHub Pages 部署
              </li>
            </ul>
          </div>
        </Reveal>

        <div className="now__stats">
          <Reveal delay={0}>
            <Stat value={43} label="影像归档" note="2021 → 2025" />
          </Reveal>
          <Reveal delay={70}>
            <Stat value={6} label="Modrinth 项目" note="数据包 / 模组" />
          </Reveal>
          <Reveal delay={140}>
            <div className="stat-card">
              <p className="stat-card__value">
                20<span>22</span>
              </p>
              <p className="stat-card__label">开始记录</p>
              <p className="stat-card__note">Legacy 1.0</p>
            </div>
          </Reveal>
          <Reveal delay={210}>
            <div className="stat-card">
              <p className="stat-card__value stat-card__value--small">
                v<span>{siteMeta.version}</span>
              </p>
              <p className="stat-card__label">当前版本</p>
              <p className="stat-card__note">{siteMeta.commitShort || 'dev'} · {siteMeta.branch}</p>
            </div>
          </Reveal>
        </div>

        <Reveal className="now__highlights" delay={80}>
          <SectionHeading
            eyebrow="DESIGN NOTES"
            title="这次，先把体验做好"
            description="每个视觉决定都对应一个性能取舍。玻璃可以关，粒子可以停，动画可以减。"
          />
          <div className="highlight-grid">
            {HIGHLIGHTS.map((item) => (
              <SpotlightCard className="highlight-card" key={item.title}>
                <span className="highlight-card__icon">
                  <FluentIconForHighlight name={item.icon} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </SpotlightCard>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** 避免在数据文件里放 React 组件，用一层小映射把字符串转成图标。 */
function FluentIconForHighlight({ name }: { name: string }) {
  return <FluentIcon name={name} size={22} aria-hidden />;
}

export function ProjectGrid() {
  return (
    <section id="projects" className="section projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading
          eyebrow="PROJECTS"
          title="精选项目"
          description="给 Minecraft 原版补一点顺手的东西。六个项目全部开源，站内可以查看完整配方、附魔与掉落表。"
          actions={
            <Link className="text-link" to="/projects/modrinth/">
              全部项目 <ArrowRightRegular aria-hidden />
            </Link>
          }
        />
        <div className="project-grid">
          {PROJECTS.map((project, index) => (
            <Reveal key={project.id} delay={index * 70}>
              <SpotlightCard className="project-card" accent={project.accent}>
                <div className="project-card__top">
                  <img className="project-card__icon" src={project.icon} alt="" width={48} height={48} loading="lazy" />
                  <div className="project-card__tags">
                    {project.tags.map((tag) => (
                      <span className="badge" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="project-card__body">
                  <p className="project-card__subtitle">{project.subtitle}</p>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
                <div className="project-card__links">
                  <Link to={project.path}>
                    项目详情 <ArrowRightRegular aria-hidden />
                  </Link>
                  <a href={project.modrinth} target="_blank" rel="noopener noreferrer">
                    Modrinth <OpenRegular aria-hidden />
                  </a>
                  <a href={project.github} target="_blank" rel="noopener noreferrer">
                    GitHub <OpenRegular aria-hidden />
                  </a>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LatestVideos() {
  return (
    <section id="latest-videos" className="section latest" aria-labelledby="latest-title">
      <div className="container">
        <SectionHeading
          eyebrow="LATEST"
          title="最近影像"
          description="从哔哩哔哩归档里挑出的 6 条。点击卡片可以直接打开归档详情。"
          actions={
            <Link className="text-link" to="/bilibili/">
              全部 43 条 <ArrowRightRegular aria-hidden />
            </Link>
          }
        />
        <div className="video-rail" role="list">
          {FEATURED_VIDEOS.map((video, index) => (
            <Reveal key={video.id} delay={index * 50} className="video-rail__item">
              <Link
                to={`/bilibili/?video=${video.id}`}
                className="video-mini"
                aria-label={`${video.title}，${video.date}`}
              >
                <div className="video-mini__cover">
                  <img src={video.cover} alt="" width={320} height={180} loading="lazy" decoding="async" />
                  <span className="video-mini__play">
                    <PlayRegular aria-hidden />
                  </span>
                  <span className="video-mini__duration">{video.duration}</span>
                </div>
                <div className="video-mini__body">
                  <p className="video-mini__date">
                    <ClockRegular aria-hidden /> {video.date}
                  </p>
                  <h3>{video.title}</h3>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="latest__foot">
          <p>
            <EyeRegular aria-hidden /> 封面与时长来自 B 站公开接口，已统一转存为本地 WebP。
          </p>
          <Link className="btn btn--ghost btn--sm" to="/bilibili/">
            进入影像归档 <ArrowRightRegular aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function TimelineSection() {
  return (
    <section id="timeline" className="section timeline" aria-labelledby="timeline-title">
      <div className="container">
        <SectionHeading
          eyebrow="CHANGELOG"
          title="更新轨迹"
          description="从传统静态页面到 3.0 重构。完整版本号与提交时间在关于页。"
        />
        <ol className="timeline__list">
          {TIMELINE.map((entry, index) => (
            <Reveal as="li" key={entry.year} className={`timeline__item timeline__item--${entry.tone}`} delay={index * 80}>
              <div className="timeline__year">
                <span>{entry.year}</span>
                <small>{entry.label}</small>
              </div>
              <div className="timeline__card">
                <span className="timeline__dot" aria-hidden />
                <h3>{entry.title}</h3>
                <p>{entry.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
        <div className="timeline__foot">
          <Link className="text-link" to="/about/#commits">
            查看最近提交时间 <ArrowRightRegular aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeCTA() {
  return (
    <section className="section home-cta" aria-labelledby="cta-title">
      <div className="container">
        <Reveal className="home-cta__panel">
          <div className="home-cta__glow" aria-hidden />
          <img className="home-cta__avatar" src={SITE.avatar} alt={SITE.avatarAlt} width={72} height={72} loading="lazy" />
          <p className="eyebrow">SAY HELLO</p>
          <h2 id="cta-title" className="display-title">
            想聊点什么？
            <span className="display-title__accent">留言、私信，或者只是逛逛。</span>
          </h2>
          <p className="home-cta__lead">
            静态站不直接写评论，但留言板保留了完整的入口。也可以从下面这些地方找到我。
          </p>
          <div className="home-cta__actions">
            <Link className="btn btn--primary btn--lg" to="/comments/">
              去留言板 <ArrowRightRegular aria-hidden />
            </Link>
            <Link className="btn btn--ghost btn--lg" to="/comments/github/">
              <FluentIcon name="github" size={18} aria-hidden />
              GitHub 评论
            </Link>
            <a className="btn btn--ghost btn--lg" href={LINKS.bilibiliMessage} target="_blank" rel="noopener noreferrer">
              B 站私信 <OpenRegular aria-hidden />
            </a>
            <Link className="btn btn--ghost btn--lg" to="/about/">
              关于本站 <ArrowRightRegular aria-hidden />
            </Link>
          </div>
          <ul className="home-cta__links">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label} <OpenRegular aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

