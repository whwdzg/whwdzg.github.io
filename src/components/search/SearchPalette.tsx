/**
 * 命令面板式搜索 / Command palette.
 *
 * 替代 2.0 的“抓取整页 HTML 再匹配”方案：
 * - 页面、章节、外链、留言是静态索引；
 * - 视频数据在首次打开搜索时才动态 import，不进入首屏 bundle；
 * - 支持 ↑ / ↓ / Enter / Esc 与 Ctrl+K。
 */
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SearchRegular, DismissRegular, OpenRegular, ArrowRightRegular, ClockRegular } from '@fluentui/react-icons';
import { useUi } from '../../hooks/useUi';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { useRouter } from '../../lib/router';
import { ROUTES } from '../../lib/routes';
import { searchItems, type SearchableItem } from '../../lib/search';
import { COMMENTS } from '../../data/comments';
import { LINKS, PROJECTS, SUBSITES } from '../../data/site';
import { TOOLS } from '../../data/tools';
import { FluentIcon } from '../common/FluentIcon';

const ROUTE_ICONS: Record<string, string> = {
  '/': 'home',
  '/bilibili/': 'tv',
  '/bilibili/videos/': 'play',
  '/bilibili/dynamics/': 'comment',
  '/bilibili/columns/': 'document',
  '/comments/': 'comment',
  '/comments/github/': 'github',
  '/projects/modrinth/': 'rocket',
  '/projects/better-crafting-recipes/': 'rocket',
  '/projects/better-enchantments/': 'rocket',
  '/projects/better-mob-drop/': 'rocket',
  '/projects/magical-dye/': 'rocket',
  '/projects/only-survival-mode/': 'rocket',
  '/projects/glowing-players/': 'rocket',
  '/projects/asteria-player/': 'play',
  '/projects/paligraph-canvas/': 'document',
  '/projects/life-simulation-wiki/': 'document',
  '/projects/github/': 'github',
  '/projects/occultation/': 'sparkle',
  '/tools/': 'code',
  '/tools/base64/': 'code',
  '/tools/basex/': 'code',
  '/tools/base-convert/': 'code',
  '/tools/unicode/': 'document',
  '/tools/calculator/': 'sparkle',
  '/tools/mc-projection/': 'cube',
  '/about/': 'info',
};

const ROUTE_KEYWORDS: Record<string, string> = {
  '/': 'home index 首页 主页 站点',
  '/bilibili/': 'bilibili b站 个人主页 粉丝 关注 获赞 直播 profile fans',
  '/bilibili/videos/': 'bilibili b站 视频 影像 归档 video archive',
  '/bilibili/dynamics/': 'bilibili b站 动态 opus 动态列表',
  '/bilibili/columns/': 'bilibili b站 专栏 文章 article read cv',
  '/comments/': 'guestbook comment 留言 评论 message 私信',
  '/comments/github/': 'github issue 评论 留言 comment 头像 回复 reply 讨论 discussion',
  '/projects/modrinth/': 'projects modrinth 项目 数据包 datapack 模组 下载',
  '/about/': 'about version commit 版本 提交 关于 构建',
};

const STATIC_ITEMS: SearchableItem[] = [
  ...ROUTES.filter((route) => route.searchable !== false && ((!route.path.startsWith('/projects/') && !route.path.startsWith('/tools/')) || route.path === '/projects/modrinth/' || route.path === '/tools/')).map((route) => ({
    id: `page:${route.path}`,
    title: route.shortTitle,
    subtitle: route.description,
    keywords: ROUTE_KEYWORDS[route.path] ?? '',
    group: '页面',
    href: route.path,
    icon: ROUTE_ICONS[route.path] ?? 'info',
  })),
  { id: 'section:home-now', title: '现在 / 站点状态', subtitle: '当前在做什么、3.2 重构进度', group: '章节', href: '/#now', icon: 'sparkle' },
  { id: 'section:home-projects', title: '精选项目', subtitle: 'Modrinth 数据包与模组', group: '章节', href: '/#projects', icon: 'rocket' },
  { id: 'section:home-extras', title: '子站与工具', subtitle: 'Asteria Player、Wiki 镜像与站内工具', group: '章节', href: '/#extras', icon: 'rocket' },
  { id: 'section:home-videos', title: '最近影像', subtitle: '最新哔哩哔哩投稿', group: '章节', href: '/#latest-videos', icon: 'play' },
  { id: 'section:home-timeline', title: '更新轨迹', subtitle: '2022 → 2026 的版本时间线', group: '章节', href: '/#timeline', icon: 'history' },
  { id: 'section:bili-search', title: '影像搜索与筛选', subtitle: '按标题、年份、状态筛选影像归档', group: '章节', href: '/bilibili/videos/#archive-toolbar', icon: 'filter' },
  { id: 'section:comments-write', title: '写一条留言', subtitle: '复制草稿并前往 B 站私信', group: '章节', href: '/comments/#write', icon: 'mail' },
  { id: 'section:comments-list', title: '留言摘录', subtitle: '人工整理的留言与回复', group: '章节', href: '/comments/#entries', icon: 'comment' },
  { id: 'section:comments-github', title: 'GitHub 评论区', subtitle: '由公开 Issue 驱动的讨论与回复', group: '章节', href: '/comments/github/#gh-thread', icon: 'github' },
  { id: 'section:about-version', title: '版本与提交', subtitle: '版本号、构建时间与最近提交', group: '章节', href: '/about/#version', icon: 'commit' },
  { id: 'section:about-tech', title: '技术栈', subtitle: 'React、Vite、TypeScript、PWA', group: '章节', href: '/about/#tech', icon: 'code' },
  { id: 'section:about-performance', title: '性能策略', subtitle: '代码分割、WebP、懒加载与缓存', group: '章节', href: '/about/#performance', icon: 'rocket' },
  { id: 'column:index', title: '专栏', subtitle: '长文与记录', keywords: '专栏 columns 文章 长文', group: '专栏', href: '/columns/', icon: 'document', meta: '专栏' },
  { id: 'column:update-2026-11', title: '关于更新&直播', subtitle: 'B 站动态 · 2026-11-08', keywords: '更新 直播 沧海水鱼 2026', group: '专栏', href: '/columns/update-2026-11/', icon: 'document', meta: '001' },
  { id: 'user:hxhej', title: 'hxhej', subtitle: '用户页 · 留言板参与者', keywords: 'hxhej 用户 留言板', group: '用户', href: '/user/hxhej/', icon: 'person', meta: 'UID 2' },
  { id: 'user:canghaishuiyu', title: '沧海水鱼', subtitle: '用户页 · 站点作者', keywords: '沧海水鱼 用户 作者 数据包', group: '用户', href: '/user/canghaishuiyu/', icon: 'person', meta: 'UID 1' },
  {
    id: 'project:occultation',
    title: '掩星',
    subtitle: '掩星 · 一个仍在设计中的世界观',
    keywords: '掩星 occultation 世界观 终端 密钥',
    group: '项目',
    href: '/projects/occultation/',
    icon: 'sparkle',
    meta: '世界观',
  },
  ...SUBSITES.map((site) => ({
    id: `subsite:${site.id}`,
    title: site.title,
    subtitle: site.subtitle,
    keywords: site.description,
    group: '子站',
    href: site.path,
    icon: 'globe',
    meta: '子站',
  })),
  ...TOOLS.map((tool) => ({
    id: `tool:${tool.id}`,
    title: tool.title,
    subtitle: tool.description,
    keywords: `${tool.tag} ${tool.subtitle}`,
    group: '工具',
    href: tool.path,
    icon: tool.icon,
    meta: tool.tag,
  })),
  ...PROJECTS.map((project) => ({
    id: `project:${project.id}`,
    title: project.title,
    subtitle: project.subtitle,
    keywords: project.description,
    group: '项目',
    href: project.path,
    icon: 'rocket',
    meta: '项目详情',
  })),
  ...COMMENTS.map((comment) => ({
    id: `comment:${comment.id}`,
    title: `${comment.author} 的留言`,
    subtitle: comment.text,
    group: '留言',
    href: `/comments/#comment-${comment.id}`,
    icon: 'comment',
    meta: comment.date,
  })),
  { id: 'external:bilibili', title: '哔哩哔哩空间', subtitle: '@沧海水鱼 的 B 站主页', group: '外链', href: LINKS.bilibili, external: true, icon: 'tv' },
  { id: 'external:github', title: 'GitHub', subtitle: '@whwdzg 的开源仓库', group: '外链', href: LINKS.github, external: true, icon: 'github' },
  { id: 'external:modrinth', title: 'Modrinth 主页', subtitle: '数据包与模组下载', group: '外链', href: LINKS.modrinth, external: true, icon: 'globe' },
  { id: 'external:mcmod', title: 'MCMOD 主页', subtitle: '中文 Minecraft 模组资料', group: '外链', href: LINKS.mcmod, external: true, icon: 'shield' },
  { id: 'external:repo', title: '本站源码', subtitle: 'whwdzg.github.io 的 3.3 源码', group: '外链', href: LINKS.repo, external: true, icon: 'code' },
];

const GROUP_ORDER = ['页面', '章节', '视频', '项目', '留言', '外链'];

export function SearchPalette() {
  const { searchOpen, closeSearch } = useUi();
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [videoItems, setVideoItems] = useState<SearchableItem[] | null>(null);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useFocusTrap(ref, searchOpen, closeSearch);
  useLockBodyScroll(searchOpen);

  useEffect(() => {
    if (!searchOpen) {
      setQuery('');
      setActive(0);
      return;
    }
    setQuery('');
    setActive(0);
    const focus = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(focus);
  }, [searchOpen]);

  // 首次打开时才加载视频索引，首屏不承担 43 条数据的解析成本。
  useEffect(() => {
    if (!searchOpen || videoItems) return;
    let cancelled = false;
    void import('../../data/videos').then((module) => {
      if (cancelled) return;
      setVideoItems(
        module.videos.map((video) => ({
          id: `video:${video.id}`,
          title: video.title,
          subtitle: video.description || (video.date ? `${video.date} · 哔哩哔哩` : '哔哩哔哩'),
          keywords: `${video.bvid} ${video.status} ${video.date ?? ''}`,
          group: '视频',
          href: `/bilibili/videos/?video=${video.id}`,
          icon: 'play',
          meta: video.date ?? '日期未记录',
        })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [searchOpen, videoItems]);

  const allItems = useMemo(() => [...STATIC_ITEMS, ...(videoItems ?? [])], [videoItems]);

  const results = useMemo(() => {
    const found = searchItems(deferredQuery, allItems, 18);
    if (!deferredQuery.trim()) {
      return found.filter((item) => item.group === '页面' || item.group === '项目').slice(0, 8);
    }
    return found;
  }, [deferredQuery, allItems]);

  const grouped = useMemo(() => {
    const map = new Map<string, SearchableItem[]>();
    for (const item of results) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return [...map.entries()].sort((a, b) => GROUP_ORDER.indexOf(a[0]) - GROUP_ORDER.indexOf(b[0]));
  }, [results]);

  const flat = useMemo(() => grouped.flatMap(([, items]) => items), [grouped]);

  useEffect(() => {
    setActive(0);
  }, [deferredQuery]);

  useEffect(() => {
    if (active >= flat.length) setActive(Math.max(0, flat.length - 1));
  }, [active, flat.length]);

  const choose = (item: SearchableItem) => {
    closeSearch();
    if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(item.href);
  };

  if (!searchOpen) return null;

  let index = 0;

  return createPortal(
    <div className="search-layer" role="presentation">
      <div className="search-scrim" onClick={closeSearch} aria-hidden />
      <div
        ref={ref}
        className="search-panel"
        role="dialog"
        aria-modal="true"
        aria-label="站内搜索"
        tabIndex={-1}
      >
        <div className="search-input-row">
          <SearchRegular className="search-input-row__icon" aria-hidden />
          <input
            ref={inputRef}
            className="search-input"
            type="search"
            placeholder="搜索页面、视频、留言或链接…"
            aria-label="搜索站点"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActive((value) => (flat.length ? (value + 1) % flat.length : 0));
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActive((value) => (flat.length ? (value - 1 + flat.length) % flat.length : 0));
              } else if (event.key === 'Enter') {
                event.preventDefault();
                const item = flat[active];
                if (item) choose(item);
              }
            }}
          />
          <button className="icon-btn icon-btn--sm" type="button" aria-label="关闭搜索" onClick={closeSearch}>
            <DismissRegular aria-hidden />
          </button>
        </div>

        <div className="search-results" role="listbox" aria-label="搜索结果">
          {!flat.length && (
            <div className="search-empty">
              <SearchRegular aria-hidden />
              <p>{!videoItems && query ? '正在索引影像归档…' : '没有找到匹配内容'}</p>
              <span>试试“3.0”“Minecraft”“留言”或“版本”。</span>
            </div>
          )}

          {grouped.map(([group, items]) => (
            <section className="search-group" key={group} aria-label={group}>
              <p className="search-group__title">{group}</p>
              {items.map((item) => {
                const itemIndex = index;
                index += 1;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={active === itemIndex}
                    className={`search-result ${active === itemIndex ? 'is-active' : ''}`}
                    onMouseEnter={() => setActive(itemIndex)}
                    onClick={() => choose(item)}
                  >
                    <span className="search-result__icon">
                      {item.icon ? <FluentIcon name={item.icon} size={18} aria-hidden /> : <SearchRegular aria-hidden />}
                    </span>
                    <span className="search-result__text">
                      <span className="search-result__title">{item.title}</span>
                      {item.subtitle && <span className="search-result__subtitle">{item.subtitle}</span>}
                    </span>
                    {item.meta && <span className="search-result__meta">{item.meta}</span>}
                    {item.external ? (
                      <OpenRegular className="search-result__go" aria-hidden />
                    ) : (
                      <ArrowRightRegular className="search-result__go" aria-hidden />
                    )}
                  </button>
                );
              })}
            </section>
          ))}
        </div>

        <div className="search-foot">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> 选择 <kbd>Enter</kbd> 打开 <kbd>Esc</kbd> 关闭
          </span>
          <span className="search-foot__count">
            <ClockRegular aria-hidden /> {results.length} 条结果
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
