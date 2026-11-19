/** B 站互动数据 / Likes, coins, favorites, shares, comments. */
import { CommentRegular, HeartRegular, OpenRegular } from '@fluentui/react-icons';
import { formatViews } from '../../lib/format';

export interface BilibiliEngagement {
  like: number;
  coin: number;
  favorite: number;
  share: number;
  comment: number;
}

export function BilibiliStats({ stats, sourceUrl }: { stats?: BilibiliEngagement | null; sourceUrl?: string }) {
  if (!stats) return null;
  const items = [
    { key: 'like', label: '赞', value: stats.like, icon: <HeartRegular aria-hidden /> },
    { key: 'coin', label: '币', value: stats.coin },
    { key: 'favorite', label: '藏', value: stats.favorite },
    { key: 'share', label: '享', value: stats.share },
    { key: 'comment', label: '评', value: stats.comment, icon: <CommentRegular aria-hidden /> },
  ];
  return (
    <div className="bili-engagement">
      {items.map((item) => (
        <span key={item.key} className={`bili-engagement__item is-${item.key}`}>
          {item.icon}
          <b>{formatViews(item.value)}</b>
          <small>{item.label}</small>
        </span>
      ))}
      {sourceUrl && (
        <a className="bili-engagement__source" href={sourceUrl} target="_blank" rel="noopener noreferrer">
          在 B 站互动 <OpenRegular aria-hidden />
        </a>
      )}
    </div>
  );
}
