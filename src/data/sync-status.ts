/**
 * 外部数据同步状态 / External sync status.
 * 由 scripts/sync-status.mjs 与每天 GitHub Actions 生成。
 */
export interface SyncSource {
  label: string;
  at: string;
  count: number;
  status: 'ok' | 'error';
}

export const SYNC_STATUS = {
  "updatedAt": "2026-11-19T08:51:07.510Z",
  "sources": {
    "github": {
      "label": "GitHub",
      "at": "2026-11-19T08:50:26.860Z",
      "count": 9,
      "status": "ok"
    },
    "modrinth": {
      "label": "Modrinth",
      "at": "2026-11-19T08:50:17.469Z",
      "count": 6,
      "status": "ok"
    },
    "mcmod": {
      "label": "MC百科",
      "at": "2026-11-19T08:50:21.232Z",
      "count": 3,
      "status": "ok"
    },
    "bilibili": {
      "label": "哔哩哔哩",
      "at": "2026-11-19T08:51:07.510Z",
      "count": 251,
      "status": "ok"
    }
  }
} as const;

export const SYNC_SOURCES = Object.entries(SYNC_STATUS.sources) as Array<
  [keyof typeof SYNC_STATUS.sources, SyncSource]
>;
