/** 过期数据提示 / Stale source badge with hover/click explanation. */
import { useState } from 'react';
import { WarningRegular } from '@fluentui/react-icons';
import { SYNC_STATUS } from '../../data/sync-status';
import { formatDateTime } from '../../lib/format';

export type SyncSourceKey = keyof typeof SYNC_STATUS.sources;

export function isSyncSourceStale(source: SyncSourceKey): boolean {
  return Boolean((SYNC_STATUS.sources[source] as { stale?: boolean } | undefined)?.stale);
}

export function StaleBadge({ source, label = '数据已过期' }: { source: SyncSourceKey; label?: string }) {
  const [open, setOpen] = useState(false);
  const data = SYNC_STATUS.sources[source] as { stale?: boolean; at?: string; label: string } | undefined;
  if (!data?.stale) return null;
  return (
    <span className="stale-wrap" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="stale-badge" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <WarningRegular aria-hidden />
        {label}
      </button>
      {open && (
        <span className="stale-popover" role="tooltip">
          <strong>本轮在线数据获取失败</strong>
          <span>正在使用上一次可用数据，最后更新：{data.at ? formatDateTime(data.at) : '未知'}。</span>
          <em>该数据已过期，请以原始站点为准。</em>
        </span>
      )}
    </span>
  );
}
