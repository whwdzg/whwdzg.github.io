/** 视频卡片 / Video card for grid and list views. */
import { CalendarLtrRegular, ClockRegular, EyeRegular, OpenRegular, PlayRegular, NumberSymbolRegular } from '@fluentui/react-icons';
import type { Video } from '../../data/videos';
import { formatDate, formatDuration, formatViews } from '../../lib/format';

export const STATUS_LABELS: Record<Video['status'], string> = {
  public: '视频',
  collection: '合集',
  private: '已私密',
  offline: '已失效',
};

interface VideoCardProps {
  video: Video;
  view: 'grid' | 'list';
  onOpen: (video: Video) => void;
}

export function VideoCard({ video, view, onOpen }: VideoCardProps) {
  const duration = formatDuration(video.durationSeconds);
  const date = formatDate(video.date);
  const views = formatViews(video.views);
  return (
    <article className={`video-card video-card--${view} ${video.disabled ? 'is-disabled' : ''}`}>
      <button
        type="button"
        className="video-card__cover"
        onClick={() => onOpen(video)}
        aria-label={video.status === 'collection' ? `查看合集：${video.title}` : `查看详情：${video.title}`}
      >
        <img
          src={video.cover}
          alt={video.coverAlt}
          width={640}
          height={360}
          loading="lazy"
          decoding="async"
        />
        <span className={`video-badge video-badge--${video.status}`}>{STATUS_LABELS[video.status]}</span>
        {duration && <span className="video-card__duration">{duration}</span>}
        <span className="video-card__play" aria-hidden>
          <PlayRegular />
        </span>
      </button>

      <div className="video-card__body">
        <div className="video-card__meta">
          <span>
            <CalendarLtrRegular aria-hidden /> {date}
          </span>
          {video.count != null && (
            <span>
              <NumberSymbolRegular aria-hidden /> {video.count}
            </span>
          )}
          {duration && (
            <span>
              <ClockRegular aria-hidden /> {duration}
            </span>
          )}
          {views && (
            <span>
              <EyeRegular aria-hidden /> {views}
            </span>
          )}
        </div>
        <h3 className="video-card__title">{video.title}</h3>
        {video.description && <p className="video-card__desc">{video.description}</p>}
        <div className="video-card__actions">
          <button type="button" className="video-card__detail" onClick={() => onOpen(video)}>
            {video.status === 'collection' ? `查看合集 ${video.count ?? ''} 条` : '查看详情'}
          </button>
          {video.url ? (
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className={video.disabled ? 'is-stale' : ''}
              aria-disabled={video.disabled || undefined}
              onClick={(event) => {
                if (video.disabled) event.preventDefault();
              }}
            >
              {video.disabled ? '链接已失效' : '在 B 站观看'}
              {!video.disabled && <OpenRegular aria-hidden />}
            </a>
          ) : (
            <span className="is-stale">链接已丢失</span>
          )}
        </div>
      </div>
    </article>
  );
}
