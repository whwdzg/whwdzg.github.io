/** 视频详情弹窗 / Video detail modal with prev/next and copy. */
import { useEffect } from 'react';
import {
  CalendarLtrRegular,
  ClockRegular,
  CopyRegular,
  EyeRegular,
  OpenRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
} from '@fluentui/react-icons';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../../hooks/useToast';
import { copyText } from '../../lib/clipboard';
import { formatDate, formatDuration, formatViews } from '../../lib/format';
import type { Video } from '../../data/videos';
import { STATUS_LABELS } from './VideoCard';
import { BilibiliStats } from './BilibiliStats';
import { BilibiliComments } from './BilibiliComments';
import { BILIBILI_VIDEO_COMMENTS } from '../../data/bilibili-comments';

interface VideoDetailProps {
  video: Video | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onOpenCollection?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function VideoDetail({ video, onClose, onPrev, onNext, onOpenCollection, hasPrev, hasNext }: VideoDetailProps) {
  const { toast } = useToast();
  const duration = formatDuration(video?.durationSeconds);
  const comments = video ? BILIBILI_VIDEO_COMMENTS[String(video.id)] ?? [] : [];

  useEffect(() => {
    if (!video) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && hasPrev) onPrev?.();
      if (event.key === 'ArrowRight' && hasNext) onNext?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [video, hasPrev, hasNext, onPrev, onNext]);

  return (
    <Modal
      open={Boolean(video)}
      onClose={onClose}
      title={video?.title ?? '视频详情'}
      size="xl"
      bare
      className="video-detail-modal"
    >
      {video && (
        <div className="video-detail">
          <div className="video-detail__cover">
            <img src={video.cover} alt={video.coverAlt} width={1280} height={720} data-lightbox="on" />
            <span className={`video-badge video-badge--${video.status}`}>{STATUS_LABELS[video.status]}</span>
            {duration && <span className="video-detail__duration">{duration}</span>}
          </div>

          <div className="video-detail__body">
            <div className="video-detail__head">
              <div>
                <p className="eyebrow">BILIBILI ARCHIVE · #{String(video.id).padStart(2, '0')}</p>
                <h2>{video.title}</h2>
              </div>
            </div>

            <ul className="video-detail__meta">
              <li>
                <CalendarLtrRegular aria-hidden /> {formatDate(video.date)}
                {video.endDate && <span> → {video.endDate}</span>}
              </li>
              {video.count != null && <li>合集 · {video.count} 条</li>}
              {duration && (
                <li>
                  <ClockRegular aria-hidden /> {duration}
                </li>
              )}
              {video.views != null && (
                <li>
                  <EyeRegular aria-hidden /> {formatViews(video.views)} 播放
                </li>
              )}
              {video.bvid && <li className="video-detail__bvid">{video.bvid}</li>}
            </ul>

            {video.stats && <BilibiliStats stats={{ like: video.stats.like, coin: video.stats.coin, favorite: video.stats.favorite, share: video.stats.share, comment: video.stats.reply }} sourceUrl={video.url} />}

            {video.description && <p className="video-detail__desc">{video.description}</p>}
            {video.note && <p className="video-detail__note">{video.note}</p>}

            <div className="video-detail__actions">
              {video.url ? (
                <a
                  className={`btn btn--primary btn--md ${video.disabled ? 'is-disabled' : ''}`}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={video.disabled || undefined}
                  onClick={(event) => {
                    if (video.disabled) event.preventDefault();
                  }}
                >
                  {video.disabled ? '链接已失效' : '在哔哩哔哩观看'}
                  {!video.disabled && <OpenRegular aria-hidden />}
                </a>
              ) : (
                <Button variant="secondary" disabled>
                  链接已丢失
                </Button>
              )}
              <Button
                variant="secondary"
                icon={<CopyRegular aria-hidden />}
                onClick={async () => {
                  const ok = await copyText(video.title);
                  toast(ok ? '标题已复制' : '复制失败', ok ? 'success' : 'error');
                }}
              >
                复制标题
              </Button>
              {video.status === 'collection' && onOpenCollection && (
                <Button
                  variant="secondary"
                  icon={<OpenRegular aria-hidden />}
                  onClick={onOpenCollection}
                >
                  查看合集全部 {video.count ?? ''} 条
                </Button>
              )}
              {video.bvid && (
                <Button
                  variant="ghost"
                  icon={<CopyRegular aria-hidden />}
                  onClick={async () => {
                    const ok = await copyText(video.bvid);
                    toast(ok ? 'BV 号已复制' : '复制失败', ok ? 'success' : 'error');
                  }}
                >
                  {video.bvid}
                </Button>
              )}
            </div>

            <BilibiliComments comments={comments} sourceUrl={video.url} count={video.stats?.reply} />

            <div className="video-detail__nav">
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronLeftRegular aria-hidden />}
                onClick={onPrev}
                disabled={!hasPrev}
              >
                上一条
              </Button>
              <span>
                {hasPrev || hasNext ? '使用 ← → 也可以在条目间切换' : '这是唯一的条目'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                iconRight={<ChevronRightRegular aria-hidden />}
                onClick={onNext}
                disabled={!hasNext}
              >
                下一条
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
