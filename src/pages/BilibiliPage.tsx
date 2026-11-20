/**
 * 哔哩哔哩影像归档 / Bilibili archive.
 *
 * 数据来自 src/data/videos.ts（构建期生成，包含 251 条记录与本地 WebP 封面）。
 * 页面提供：
 * - 标题 / 简介 / BV 号搜索（useDeferredValue 防抖）
 * - 状态筛选、年份筛选、排序
 * - 网格 / 列表视图（记忆到 localStorage）
 * - 详情弹窗、上一条 / 下一条、随机一条
 * - 分批渲染（首屏 12 条），避免一次插入 251 张卡片
 */
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  SearchRegular,
  DismissRegular,
  GridRegular,
  ListRegular,
  OpenRegular,
  ArrowShuffleRegular,
  ArrowClockwiseRegular,
} from '@fluentui/react-icons';
import { PageIntro } from '../components/layout/PageIntro';
import { FluentIcon } from '../components/common/FluentIcon';
import { VideoCard } from '../components/bilibili/VideoCard';
import { VideoDetail } from '../components/bilibili/VideoDetail';
import { CollectionDetail } from '../components/bilibili/CollectionDetail';
import { Button, IconButton } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { BilibiliTabs } from '../components/bilibili/BilibiliTabs';
import { BILIBILI_COMMENT_PROGRESS } from '../data/bilibili-comments';
import { StaleBadge } from '../components/common/StaleBadge';
import { useRouter } from '../lib/router';
import { readStorage, writeStorage } from '../lib/storage';
import { videos, videosById, videoStats, type Video } from '../data/videos';
import { LINKS } from '../data/site';

type StatusFilter = 'all' | 'playable' | 'collection' | 'live' | 'private' | 'offline';
type SortMode = 'newest' | 'oldest' | 'title' | 'views';
type ViewMode = 'grid' | 'list';

const PAGE_SIZE = 12;
const VIEW_KEY = 'whwdzg-bilibili-view';
const COLLAPSE_KEY = 'whwdzg-bilibili-collapse-collections';

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string; count: number }> = [
  { value: 'all', label: '全部', count: videoStats.total },
  { value: 'playable', label: '可观看', count: videoStats.playable },
  { value: 'collection', label: '合集', count: videoStats.collection },
  { value: 'live', label: '直播回放', count: videoStats.live },
  { value: 'private', label: '已私密', count: videoStats.private },
  { value: 'offline', label: '已失效', count: videoStats.offline },
];

function matchesStatus(video: Video, status: StatusFilter): boolean {
  if (status === 'all') return true;
  if (status === 'playable') return !video.disabled;
  return video.status === status;
}

export default function BilibiliPage() {
  const { search, navigate } = useRouter();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [year, setYear] = useState('all');
  const [sort, setSort] = useState<SortMode>('newest');
  const [view, setView] = useState<ViewMode>(() => (readStorage(VIEW_KEY) === 'list' ? 'list' : 'grid'));
  const [collapseCollections, setCollapseCollections] = useState(() => readStorage(COLLAPSE_KEY) === 'true');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [collectionVideo, setCollectionVideo] = useState<Video | null>(null);
  const [detailId, setDetailId] = useState<number | null>(() => {
    const value = Number(new URLSearchParams(search).get('video'));
    return Number.isFinite(value) && videosById.has(value) ? value : null;
  });

  // 查询参数 → 详情弹窗。搜索面板通过 /bilibili/?video=12 直接打开详情。
  useEffect(() => {
    const raw = new URLSearchParams(search).get('video');
    if (!raw) {
      setDetailId(null);
      return;
    }
    const value = Number(raw);
    if (Number.isFinite(value) && videosById.has(value)) setDetailId(value);
  }, [search]);

  useEffect(() => {
    writeStorage(VIEW_KEY, view);
  }, [view]);

  useEffect(() => {
    writeStorage(COLLAPSE_KEY, String(collapseCollections));
  }, [collapseCollections]);

  // 筛选条件变化时回到第一批
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [deferredQuery, status, year, sort, collapseCollections]);

  const yearCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const video of videos) {
      const key = video.date?.slice(0, 4) ?? 'unknown';
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, []);

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    const result = videos.filter((video) => {
      if (collapseCollections && status !== 'collection' && video.status === 'collection') return false;
      if (!matchesStatus(video, status)) return false;
      if (year === 'unknown' && video.date) return false;
      if (year !== 'all' && year !== 'unknown' && video.date?.slice(0, 4) !== year) return false;
      if (!needle) return true;
      const haystack = `${video.title} ${video.description} ${video.bvid} ${video.date ?? ''} ${video.status}`.toLowerCase();
      return haystack.includes(needle);
    });

    result.sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title, 'zh-CN');
      if (sort === 'views') return (b.views ?? -1) - (a.views ?? -1);
      if (sort === 'oldest') {
        if (a.date && b.date) return a.date.localeCompare(b.date);
        if (a.date) return -1;
        if (b.date) return 1;
        return a.id - b.id;
      }
      if (a.date && b.date) return b.date.localeCompare(a.date);
      if (a.date) return -1;
      if (b.date) return 1;
      return a.id - b.id;
    });
    return result;
  }, [deferredQuery, status, year, sort, collapseCollections]);

  const visible = filtered.slice(0, limit);
  const canLoadMore = limit < filtered.length && detailId == null && collectionVideo == null;

  // 滚动到“加载更多”按钮下方一段距离后自动加载下一批。
  useEffect(() => {
    const node = loadMoreRef.current;
    if (!canLoadMore || !node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setLimit((current) => Math.min(filtered.length, current + PAGE_SIZE));
      },
      { rootMargin: '0px 0px 80px 0px', threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [canLoadMore, filtered.length, limit]);
  const yearOptions = useMemo(() => [
    { value: 'all', label: '全部年份' },
    ...videoStats.years.map((item) => ({ value: item, label: item, count: yearCounts.get(item) })),
    ...(yearCounts.has('unknown') ? [{ value: 'unknown', label: '日期未记录', count: yearCounts.get('unknown') }] : []),
  ], [yearCounts]);
  const maxYear = Math.max(1, ...yearCounts.values());
  const hasFilters = Boolean(query) || status !== 'all' || year !== 'all' || sort !== 'newest';

  const openDetail = (video: Video) => {
    if (video.status === 'collection') {
      setDetailId(null);
      setCollectionVideo(video);
      navigate('/bilibili/videos/', { replace: true, scroll: false });
      return;
    }
    setCollectionVideo(null);
    setDetailId(video.id);
    navigate(`/bilibili/videos/?video=${video.id}`, { replace: true, scroll: false });
  };

  const closeDetail = () => {
    setDetailId(null);
    setCollectionVideo(null);
    navigate('/bilibili/videos/', { replace: true, scroll: false });
  };

  const detailList = filtered.length ? filtered : videos;
  const detailIndex = detailId == null ? -1 : detailList.findIndex((video) => video.id === detailId);
  const detail = detailId == null ? null : videosById.get(detailId) ?? null;
  const prev = detailIndex > 0 ? detailList[detailIndex - 1] : null;
  const next = detailIndex >= 0 && detailIndex < detailList.length - 1 ? detailList[detailIndex + 1] : null;

  const resetFilters = () => {
    setQuery('');
    setStatus('all');
    setYear('all');
    setSort('newest');
  };

  const randomVideo = () => {
    const pool = videos.filter((video) => !video.disabled && !(collapseCollections && video.status === 'collection'));
    if (!pool.length) return;
    openDetail(pool[Math.floor(Math.random() * pool.length)]);
  };

  return (
    <div className="page page--bilibili">
      <PageIntro
        eyebrow="ARCHIVE · BILIBILI"
        title="影像存档"
        lead="沧海水鱼在哔哩哔哩发布的作品归档。早期部分视频已失效或私密，仅保留记录；合集可在站内展开查看 B 站全部成员视频的封面、标题与时间；直播回放已单独标记并可按状态筛选。"
        meta={[
          { icon: 'tv', label: '沧海水鱼' },
          { icon: 'calendar', label: '起始 2021-06-29' },
          { icon: 'refresh', label: '同步 2026-11-17' },
          { icon: 'image', label: '本地 WebP 封面' },
        ]}
        actions={
          <>
            <a className="btn btn--primary btn--md" href={LINKS.bilibili} target="_blank" rel="noopener noreferrer">
              <FluentIcon name="tv" size={18} aria-hidden />
              前往哔哩哔哩空间
              <OpenRegular aria-hidden />
            </a>
            <Button variant="secondary" icon={<ArrowShuffleRegular aria-hidden />} onClick={randomVideo}>
              随机看一条
            </Button>
            <a className="btn btn--ghost btn--md" href={LINKS.repo2} target="_blank" rel="noopener noreferrer">
              2.0 归档
              <OpenRegular aria-hidden />
            </a>
          </>
        }
        aside={
          <div className="archive-summary">
            <div className="archive-summary__head">
              <span>ARCHIVE SUMMARY</span>
              <span className="status-dot" aria-hidden />
            </div>
            <div className="archive-summary__stats">
              <div>
                <strong>{videoStats.total}</strong>
                <span>条记录</span>
              </div>
              <div>
                <strong>{videoStats.playable}</strong>
                <span>可观看</span>
              </div>
              <div>
                <strong>{videoStats.collection}</strong>
                <span>合集</span>
              </div>
              <div>
                <strong>{videoStats.live}</strong>
                <span>直播回放</span>
              </div>
              <div>
                <strong>{videoStats.offline}</strong>
                <span>已失效</span>
              </div>
            </div>
            <div className="archive-summary__years" aria-label="按年份统计">
              {[...yearCounts.entries()]
                .filter(([key]) => key !== 'unknown')
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([key, count]) => (
                  <div className="year-bar" key={key}>
                    <span className="year-bar__label">{key}</span>
                    <span className="year-bar__track">
                      <span className="year-bar__fill" style={{ width: `${(count / maxYear) * 100}%` }} />
                    </span>
                    <span className="year-bar__count">{count}</span>
                  </div>
                ))}
            </div>
            <p className="archive-summary__note">
              {videoStats.private} 条已私密 · 封面仅在在线视频时抓取
            </p>
            <p className="archive-summary__note">
              评论抓取 {BILIBILI_COMMENT_PROGRESS.covered}/{BILIBILI_COMMENT_PROGRESS.total} · 第 {BILIBILI_COMMENT_PROGRESS.cycle} 轮
            </p>
          </div>
        }
      />

      <div className="container"><BilibiliTabs active="videos" /><div className="bili-stale-row"><StaleBadge source="bilibili" label="影像数据已过期" /></div></div>

      <section className="section archive" aria-labelledby="archive-title">
        <div className="container">
          <div className="archive-toolbar" id="archive-toolbar">
            <div className="archive-search">
              <SearchRegular aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索标题、简介、BV 号…"
                aria-label="搜索影像归档"
              />
              {query && (
                <button type="button" className="archive-search__clear" aria-label="清空搜索" onClick={() => setQuery('')}>
                  <DismissRegular aria-hidden />
                </button>
              )}
            </div>

            <div className="archive-status" role="group" aria-label="状态筛选">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`chip ${status === option.value ? 'is-active' : ''}`}
                  aria-pressed={status === option.value}
                  onClick={() => setStatus(option.value)}
                >
                  {option.label}
                  <span>{option.count}</span>
                </button>
              ))}
            </div>

            <div className="archive-controls">
              <div className="select-field">
                <span>年份</span>
                <Select value={year} options={yearOptions} onChange={setYear} ariaLabel="按年份筛选" />
              </div>

              <div className="select-field">
                <span>排序</span>
                <Select
                  value={sort}
                  options={[
                    { value: 'newest', label: '最新优先' },
                    { value: 'oldest', label: '最早优先' },
                    { value: 'title', label: '按标题' },
                    { value: 'views', label: '按播放量' },
                  ]}
                  onChange={(value) => setSort(value as SortMode)}
                  ariaLabel="排序方式"
                />
              </div>

              <label className="archive-collapse">
                <input
                  type="checkbox"
                  checked={collapseCollections}
                  onChange={(event) => setCollapseCollections(event.target.checked)}
                />
                <span>折叠合集</span>
              </label>

              <div className="view-toggle" role="group" aria-label="视图切换">
                <IconButton label="网格视图" size="sm" active={view === 'grid'} onClick={() => setView('grid')}>
                  <GridRegular aria-hidden />
                </IconButton>
                <IconButton label="列表视图" size="sm" active={view === 'list'} onClick={() => setView('list')}>
                  <ListRegular aria-hidden />
                </IconButton>
              </div>
            </div>
          </div>

          <div className="archive-result-bar">
            <p aria-live="polite">
              显示 <strong>{visible.length}</strong> / {filtered.length} 条
              {hasFilters && <span className="archive-result-bar__filtered">（已筛选）</span>}
              {collapseCollections && <span className="archive-result-bar__filtered"> · 合集已折叠</span>}
            </p>
            {hasFilters && (
              <button type="button" className="text-btn" onClick={resetFilters}>
                <ArrowClockwiseRegular aria-hidden />
                重置筛选
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <div className="archive-empty">
              <SearchRegular aria-hidden />
              <h3>没有匹配的影像</h3>
              <p>试试更短的关键词，或清除年份 / 状态筛选。</p>
              <Button variant="primary" onClick={resetFilters}>
                重置筛选
              </Button>
            </div>
          ) : (
            <div className={`archive-grid archive-grid--${view}`} id="archive-list">
              {visible.map((video) => (
                <VideoCard key={video.id} video={video} view={view} onOpen={openDetail} />
              ))}
            </div>
          )}

          {limit < filtered.length && (
            <div className="archive-more">
              <Button variant="secondary" size="lg" onClick={() => setLimit((value) => value + PAGE_SIZE)}>
                加载更多（剩余 {filtered.length - limit} 条）
              </Button>
              <p>继续下滑会自动加载下一批 · 首屏只渲染 12 条。</p>
              <div className="archive-more__sentinel" ref={loadMoreRef} aria-hidden />
            </div>
          )}

          {filtered.length > 0 && limit >= filtered.length && (
            <p className="archive-end">已经到底了 · 共 {filtered.length} 条</p>
          )}
        </div>
      </section>

      <VideoDetail
        video={detail}
        onClose={closeDetail}
        onPrev={prev ? () => openDetail(prev) : undefined}
        onNext={next ? () => openDetail(next) : undefined}
        onOpenCollection={detail?.status === 'collection' ? () => { setDetailId(null); setCollectionVideo(detail); } : undefined}
        hasPrev={Boolean(prev)}
        hasNext={Boolean(next)}
      />
      <CollectionDetail video={collectionVideo} onClose={() => setCollectionVideo(null)} />
    </div>
  );
}
