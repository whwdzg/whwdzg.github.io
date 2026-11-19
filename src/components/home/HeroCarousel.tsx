/**
 * 首页主视觉轮播 / Home hero carousel.
 *
 * 视觉：大字号标题 + 全幅壁纸 + 深色渐变遮罩 + 悬浮信息卡。
 * 性能：
 * - 只渲染当前与下一张图片，避免一次解码 4 张壁纸；
 * - 自动播放会在悬停、聚焦、页面隐藏、减少动画时暂停；
 * - 滚动视差只改变一个 CSS 变量，且用 rAF 合并。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRightRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  OpenRegular,
  PauseRegular,
  PlayRegular,
  SparkleRegular,
} from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { useSettings } from '../../hooks/useSettings';
import { FluentIcon } from '../common/FluentIcon';

interface SlideAction {
  label: string;
  to: string;
  external?: boolean;
  primary?: boolean;
}

interface Slide {
  id: string;
  kicker: string;
  title: string;
  accent: string;
  lead: string;
  light: string;
  dark: string;
  meta: string[];
  actions: SlideAction[];
}

const SLIDES: Slide[] = [
  {
    id: 'rebuild',
    kicker: '3.10.0 · FLUENT REBUILD',
    title: '重新开始，',
    accent: '以更轻盈的方式。',
    lead: 'Fluent Design Sun Valley 的秩序感，加一点液态玻璃的悬浮感。没有框架堆叠，只有更快的加载、更少的资源与更清楚的导航。',
    light: '/media/hero/light-4.webp',
    dark: '/media/hero/dark-1.webp',
    meta: ['2026 · 3.10.0', 'React + Vite', 'GPL-3.0'],
    actions: [
      { label: '了解 3.10.0', to: '/about/', primary: true },
      { label: '查看更新轨迹', to: '/#timeline' },
    ],
  },
  {
    id: 'archive',
    kicker: 'ARCHIVE · BILIBILI',
    title: '251 段影像，',
    accent: '一次完整归档。',
    lead: '从 2021 年的第一条 Minecraft 视频，到官方短视频、合集与直播回放。封面全部本地 WebP 化，支持搜索、年份筛选与网格 / 列表视图。',
    light: '/media/hero/light-1.webp',
    dark: '/media/hero/dark-2.webp',
    meta: ['251 条记录', '3 条直播回放', '本地 WebP'],
    actions: [
      { label: '浏览影像归档', to: '/bilibili/videos/', primary: true },
      { label: '前往 B 站', to: 'https://space.bilibili.com/588003657', external: true },
    ],
  },
  {
    id: 'projects',
    kicker: 'PROJECTS · MINECRAFT',
    title: '让原版，',
    accent: '多一点可能。',
    lead: '更好的合成配方、更好附魔、更好的生物掉落，以及一个很认真的愚人节数据包。都可以在 Modrinth 与 GitHub 找到。',
    light: '/media/hero/light-5.webp',
    dark: '/media/hero/dark-1.webp',
    meta: ['6 个 Modrinth 项目', '1.13+', '数据包 / 模组'],
    actions: [
      { label: '查看精选项目', to: '/#projects', primary: true },
      { label: 'Modrinth 主页', to: 'https://modrinth.com/user/whwdzg', external: true },
    ],
  },
  {
    id: 'subsites',
    kicker: 'SUB-SITES · TOOLS',
    title: '播放器与 Wiki，',
    accent: '也放进站点。',
    lead: 'Asteria Player 负责本地音视频播放；来福 Simulation Wiki 已扩展到 451 个页面、195 个媒体文件。编码、计算器、投影工具与掩星世界观也都在这里。',
    light: '/media/hero/light-3.webp',
    dark: '/media/hero/dark-2.webp',
    meta: ['2 个子站', '8 个工具', '451 页 Wiki'],
    actions: [
      { label: '浏览子站', to: '/projects/asteria-player/', primary: true },
      { label: '打开工具', to: '/tools/' },
    ],
  },
  {
    id: 'guestbook',
    kicker: 'GUESTBOOK · COMMENTS',
    title: '留下一点，',
    accent: '你来过的痕迹。',
    lead: '静态站没有服务端，但留言从未消失。这里保留人工整理的留言摘录，也提供一个更顺手的写作入口：写好、复制、去 B 站私信。',
    light: '/media/hero/light-3.webp',
    dark: '/media/hero/dark-2.webp',
    meta: ['2024 开启', '人工整理', 'B 站私信'],
    actions: [
      { label: '打开留言板', to: '/comments/', primary: true },
      { label: 'B 站私信', to: 'https://message.bilibili.com/#/whisper/mid588003657', external: true },
    ],
  },
];

export function HeroCarousel() {
  const { settings, resolvedTheme } = useSettings();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pageHidden, setPageHidden] = useState(() => document.hidden);
  const [remaining, setRemaining] = useState(7);
  const sectionRef = useRef<HTMLElement>(null);
  const reduced =
    settings.motion === 'reduced' ||
    (settings.motion === 'system' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const next = (active + 1) % SLIDES.length;
  const autoPlaying = !paused && !hovered && !reduced && !pageHidden;

  const go = useCallback((index: number) => {
    setActive(((index % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  // 自动播放倒计时提示
  useEffect(() => {
    setRemaining(7);
    if (!autoPlaying) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => (value <= 1 ? 7 : value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active, autoPlaying]);

  // 自动播放
  useEffect(() => {
    if (paused || hovered || reduced || pageHidden) return;
    const timer = window.setTimeout(() => go(active + 1), 6500);
    return () => window.clearTimeout(timer);
  }, [active, paused, hovered, reduced, pageHidden, go]);

  // 页面隐藏时暂停，回到页面后继续（不改变用户手动暂停的状态）。
  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // 预解码下一张，切换时不会闪白
  useEffect(() => {
    const source = resolvedTheme === 'dark' ? SLIDES[next].dark : SLIDES[next].light;
    const image = new Image();
    image.decoding = 'async';
    image.src = source;
  }, [next, resolvedTheme]);

  // 轻微视差：只写 CSS 变量，不触发 React 重渲染
  useEffect(() => {
    if (reduced) return;
    const node = sectionRef.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const offset = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height)));
      node.style.setProperty('--hero-scroll', `${(offset * 46).toFixed(1)}px`);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reduced]);

  const facts = useMemo(
    () => [
      { value: '251', label: '影像归档' },
      { value: '06', label: 'Modrinth 项目' },
      { value: '03', label: '直播回放' },
      { value: '3.10.0', label: '当前版本' },
    ],
    [],
  );

  return (
    <section
      ref={sectionRef}
      className="hero"
      aria-roledescription="carousel"
      aria-label="站点亮点"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHovered(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          go(active - 1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          go(active + 1);
        }
      }}
    >
      <div className="hero__slides">
        {SLIDES.map((item, index) => {
          const image = resolvedTheme === 'dark' ? item.dark : item.light;
          const isActive = index === active;
          const renderImage = isActive || index === next;
          return (
            <article
              key={item.id}
              className={`hero__slide ${isActive ? 'is-active' : ''}`}
              aria-hidden={!isActive}
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${SLIDES.length}`}
              inert={!isActive}
            >
              {renderImage && (
                <div className="hero__media">
                  <img
                    src={image}
                    alt=""
                    width={1440}
                    height={810}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    decoding={index === 0 ? 'sync' : 'async'}
                  />
                </div>
              )}
              <div className="hero__shade" aria-hidden />
              <div className="hero__grid">
                <div className="hero__content">
                  <p className="hero__kicker">
                    <SparkleRegular aria-hidden />
                    {item.kicker}
                  </p>
                  <h2 className="hero__title">
                    <span>{item.title}</span>
                    <span className="hero__title-accent">{item.accent}</span>
                  </h2>
                  <p className="hero__lead">{item.lead}</p>
                  <div className="hero__actions">
                    {item.actions.map((action) => (
                      <Link
                        key={action.to}
                        to={action.to}
                        external={action.external}
                        className={`btn ${action.primary ? 'btn--primary' : 'btn--ghost'} btn--lg`}
                      >
                        <span className="btn__label">{action.label}</span>
                        {action.external ? <OpenRegular aria-hidden /> : <ArrowRightRegular aria-hidden />}
                      </Link>
                    ))}
                  </div>
                  <ul className="hero__meta" aria-label="亮点信息">
                    {item.meta.map((meta) => (
                      <li key={meta}>{meta}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="hero__facts" aria-label="站点数据">
        {facts.map((fact) => (
          <div className="hero__fact" key={fact.label}>
            <strong>{fact.value}</strong>
            <span>{fact.label}</span>
          </div>
        ))}
      </aside>

      <div className="hero__controls">
        <div className="hero__dots" role="tablist" aria-label="切换亮点">
          {SLIDES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`第 ${index + 1} 张：${item.kicker}`}
              className={`hero__dot ${index === active ? 'is-active' : ''}`}
              onClick={() => go(index)}
            >
              <span />
            </button>
          ))}
        </div>
        <div className="hero__nav">
          <span className="hero__timer" aria-live="off">
            {autoPlaying ? `${remaining}s 后切换` : '已暂停'}
          </span>
          <span className="hero__counter">
            <strong>{String(active + 1).padStart(2, '0')}</strong>
            <span aria-hidden>/</span>
            {String(SLIDES.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            className="icon-btn icon-btn--sm"
            aria-label={paused ? '继续自动播放' : '暂停自动播放'}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <PlayRegular aria-hidden /> : <PauseRegular aria-hidden />}
          </button>
          <button type="button" className="icon-btn icon-btn--sm" aria-label="上一张" onClick={() => go(active - 1)}>
            <ChevronLeftRegular aria-hidden />
          </button>
          <button type="button" className="icon-btn icon-btn--sm" aria-label="下一张" onClick={() => go(active + 1)}>
            <ChevronRightRegular aria-hidden />
          </button>
        </div>
      </div>

      <a className="hero__scroll" href="#now" aria-label="向下滚动到站点介绍">
        <span className="hero__mouse" aria-hidden />
        <span>向下滚动</span>
      </a>

      <div className="hero__status" aria-hidden>
        <span>v{__APP_VERSION__}</span>
        <FluentIcon name="sparkle" size={14} />
      </div>
    </section>
  );
}


