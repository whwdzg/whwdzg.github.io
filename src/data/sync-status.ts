/**
 * 外部数据同步状态 / External sync status.
 * 由 scripts/sync-status.mjs 与每天 GitHub Actions 生成。
 */
export interface SyncSource {
  label: string;
  at: string;
  count: number;
  status: 'ok' | 'error';
  stale?: boolean;
  lastAttempt?: string;
  error?: string;
}

export const SYNC_STATUS = {
  "updatedAt": "2026-11-21T23:49:20.814Z",
  "sources": {
    "github": {
      "label": "GitHub",
      "at": "2026-11-21T23:48:06.798Z",
      "count": 9,
      "status": "ok",
      "lastAttempt": "2026-11-21T23:48:06.798Z",
      "stale": false,
      "error": ""
    },
    "modrinth": {
      "label": "Modrinth",
      "at": "2026-11-21T23:47:49.139Z",
      "count": 6,
      "status": "ok",
      "lastAttempt": "2026-11-21T23:47:49.139Z",
      "stale": false,
      "error": ""
    },
    "mcmod": {
      "label": "MC百科",
      "at": "2026-11-21T23:48:03.191Z",
      "count": 3,
      "status": "ok",
      "lastAttempt": "2026-11-21T23:48:03.191Z",
      "stale": false,
      "error": ""
    },
    "bilibili": {
      "label": "哔哩哔哩",
      "at": "2026-11-19T08:51:07.510Z",
      "count": 251,
      "status": "error",
      "lastAttempt": "2026-11-21T23:49:20.814Z",
      "stale": true,
      "error": "--fail"
    }
  }
} as const;

export const SYNC_SOURCES = Object.entries(SYNC_STATUS.sources) as Array<
  [keyof typeof SYNC_STATUS.sources, SyncSource]
>;
