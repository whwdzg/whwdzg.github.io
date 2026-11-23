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
  "updatedAt": "2026-11-23T00:19:53.872Z",
  "sources": {
    "github": {
      "label": "GitHub",
      "at": "2026-11-23T00:18:29.737Z",
      "count": 9,
      "status": "ok",
      "lastAttempt": "2026-11-23T00:18:29.737Z",
      "stale": false,
      "error": ""
    },
    "modrinth": {
      "label": "Modrinth",
      "at": "2026-11-23T00:18:14.068Z",
      "count": 6,
      "status": "ok",
      "lastAttempt": "2026-11-23T00:18:14.068Z",
      "stale": false,
      "error": ""
    },
    "mcmod": {
      "label": "MC百科",
      "at": "2026-11-23T00:18:25.963Z",
      "count": 3,
      "status": "ok",
      "lastAttempt": "2026-11-23T00:18:25.963Z",
      "stale": false,
      "error": ""
    },
    "bilibili": {
      "label": "哔哩哔哩",
      "at": "2026-11-19T08:51:07.510Z",
      "count": 251,
      "status": "error",
      "lastAttempt": "2026-11-23T00:19:53.872Z",
      "stale": true,
      "error": "--fail"
    }
  }
} as const;

export const SYNC_SOURCES = Object.entries(SYNC_STATUS.sources) as Array<
  [keyof typeof SYNC_STATUS.sources, SyncSource]
>;
