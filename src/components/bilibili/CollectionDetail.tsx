/** 合集全部内容 / All episodes of a Bilibili UGC season. */
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowSortRegular,
  CalendarLtrRegular,
  EyeRegular,
  OpenRegular,
  PlayRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { Modal } from '../common/Modal';
import type { Video } from '../../data/videos';
import type {
  BilibiliCollection,
  BilibiliCollectionEpisode,
} from '../../data/bilibili-collections';
import { formatDate, formatDuration, formatViews } from '../../lib/format';
import '../../styles/pages.css';

type SortMode = 'newest' | 'oldest' | 'title';

let collectionModule: Promise<typeof import('../../data/bilibili-collections')> | null = null;
function loadCollections() {
  collectionModule ??= import('../../data/bilibili-collections');
  return collectionModule;
}

interface CollectionDetailProps {
  video: Video | null;
  onClose: () => void;
}

function EpisodeCard({ episode }: { episode: BilibiliCollectionEpisode }) {
  return (
    <a
      className="collection-episode"
      href={episode.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${episode.title} · ${formatDate(episode.date)}`}
    >
      <span className="collection-episode__cover">
        {episode.cover ? (
          <img src={episode.cover} alt={episode.coverAlt} width={640} height={360} loading="lazy" decoding="async" />
        ) : (
          <span className="collection-episode__placeholder"><PlayRegular aria-hidden /></span>
        )}
        {episode.durationSeconds != null && (
          <span className="collection-episode__duration">{formatDuration(episode.durationSeconds)}</span>
        )}
        <span className="collection-episode__play" aria-hidden><PlayRegular /></span>
      </span>
      <strong>{episode.title}</strong>
      <span className="collection-episode__meta">
        <span><CalendarLtrRegular aria-hidden /> {formatDate(episode.date)}</span>
        {episode.views != null && <span><EyeRegular aria-hidden /> {formatViews(episode.views)}</span>}
      </span>
    </a>
  );
}

export function CollectionDetail({ video, onClose }: CollectionDetailProps) {
  const [collection, setCollection] = useState<BilibiliCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');

  useEffect(() => {
    if (!video || video.status !== 'collection') {
      setCollection(null);
      return;
    }
    let alive = true;
    setLoading(true);
    setError('');
    setQuery('');
    setCollection(null);
    loadCollections()
      .then((module) => {
        if (!alive) return;
        const found = module.collectionForBvid(video.bvid);
        if (found) setCollection(found);
        else setError('没有找到这个合集的在线快照');
      })
      .catch(() => {
        if (alive) setError('合集数据加载失败，请稍后重试');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [video]);

  const sections = useMemo(() => {
    if (!collection) return [];
    const needle = query.trim().toLowerCase();
    return collection.sections
      .map((section) => {
        const episodes = section.episodes
          .filter((episode) => {
            if (!needle) return true;
            return `${episode.title} ${episode.bvid} ${episode.section}`.toLowerCase().includes(needle);
          })
          .sort((a, b) => {
            if (sort === 'title') return a.title.localeCompare(b.title, 'zh-CN');
            const left = a.date ?? '';
            const right = b.date ?? '';
            return sort === 'oldest' ? left.localeCompare(right) : right.localeCompare(left);
          });
        return { ...section, episodes };
      })
      .filter((section) => section.episodes.length > 0);
  }, [collection, query, sort]);

  const visibleCount = sections.reduce((total, section) => total + section.episodes.length, 0);

  return (
    <Modal
      open={Boolean(video)}
      onClose={onClose}
      title={video ? `合集 · ${video.title.replace(/^合集 \| /, '')}` : '合集'}
      size="xl"
      bare
      className="collection-modal"
    >
      <div className="collection-detail">
        <div className="collection-detail__head">
          {collection?.cover ? (
            <img className="collection-detail__cover" src={collection.cover} alt={collection.coverAlt} width={240} height={135} loading="lazy" />
          ) : (
            <span className="collection-detail__cover collection-detail__cover--empty"><PlayRegular aria-hidden /></span>
          )}
          <div className="collection-detail__intro">
            <p className="eyebrow">BILIBILI COLLECTION · UGC SEASON</p>
            <h2>{collection?.title ?? video?.title.replace(/^合集 \| /, '') ?? '合集'}</h2>
            <p className="collection-detail__desc">{collection?.description || video?.description}</p>
            <div className="collection-detail__meta">
              <span>{collection?.count ?? video?.count ?? '—'} 条内容</span>
              <span>{collection?.sections.length ?? '—'} 个分区</span>
              {collection?.fetchedAt && (
                <span title={collection.fetchedAt}>在线 API 快照 · {new Date(collection.fetchedAt).toLocaleDateString('zh-CN')}</span>
              )}
            </div>
          </div>
          <div className="collection-detail__actions">
            {video?.url && (
              <a className="btn btn--primary btn--md" href={video.url} target="_blank" rel="noopener noreferrer">
                在 B 站打开合集 <OpenRegular aria-hidden />
              </a>
            )}
          </div>
        </div>

        <div className="collection-toolbar">
          <label className="collection-search">
            <SearchRegular aria-hidden />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索合集内视频、BV 号或分区…" />
          </label>
          <label className="collection-sort">
            <ArrowSortRegular aria-hidden />
            <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
              <option value="newest">最新优先</option>
              <option value="oldest">最早优先</option>
              <option value="title">按标题</option>
            </select>
          </label>
          <span className="collection-count">{visibleCount} / {collection?.count ?? 0} 条</span>
        </div>

        {loading && (
          <div className="collection-loading">
            <span className="skeleton-line" />
            <span className="skeleton-line" />
            <span className="skeleton-line" />
          </div>
        )}
        {error && <p className="collection-error">{error}</p>}

        {!loading && !error && collection && sections.length === 0 && (
          <p className="collection-empty">没有匹配的视频。</p>
        )}

        {!loading && !error && sections.map((section) => (
          <section className="collection-section" key={section.title}>
            <div className="collection-section__head">
              <h3>{section.title}</h3>
              <span>{section.episodes.length} 条</span>
            </div>
            <div className="collection-grid">
              {section.episodes.map((episode) => <EpisodeCard key={episode.bvid} episode={episode} />)}
            </div>
          </section>
        ))}

        {!loading && !error && collection && (
          <p className="collection-detail__foot">
            封面、标题、发布日期与时长来自 B 站公开 view 接口；播放量等数字为快照值。
          </p>
        )}
      </div>
    </Modal>
  );
}
