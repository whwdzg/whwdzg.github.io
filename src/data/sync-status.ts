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
  "updatedAt": "2026-11-24T04:19:14.511Z",
  "sources": {
    "github": {
      "label": "GitHub",
      "at": "2026-11-24T04:18:00.969Z",
      "count": 9,
      "status": "ok",
      "lastAttempt": "2026-11-24T04:18:00.969Z",
      "stale": false,
      "error": ""
    },
    "modrinth": {
      "label": "Modrinth",
      "at": "2026-11-24T04:17:42.235Z",
      "count": 6,
      "status": "ok",
      "lastAttempt": "2026-11-24T04:17:42.235Z",
      "stale": false,
      "error": ""
    },
    "mcmod": {
      "label": "MC百科",
      "at": "2026-11-24T04:17:57.422Z",
      "count": 3,
      "status": "ok",
      "lastAttempt": "2026-11-24T04:17:57.422Z",
      "stale": false,
      "error": ""
    },
    "bilibili": {
      "label": "哔哩哔哩",
      "at": "2026-11-19T08:51:07.510Z",
      "count": 251,
      "status": "error",
      "lastAttempt": "2026-11-24T04:19:14.511Z",
      "stale": true,
      "error": "--fail"
    }
  }
} as const;

export const SYNC_SOURCES = Object.entries(SYNC_STATUS.sources) as Array<
  [keyof typeof SYNC_STATUS.sources, SyncSource]
>;
