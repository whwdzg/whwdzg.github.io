/**
 * 更新外部数据同步状态 / Mark a data source as freshly synced.
 *
 * 用法：node scripts/sync-status.mjs <source> [count]
 * source: modrinth | mcmod | bilibili | github
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT = path.join(ROOT, 'src/data/sync-status.ts');
const LABELS = {
  modrinth: 'Modrinth',
  mcmod: 'MC百科',
  bilibili: '哔哩哔哩',
  github: 'GitHub',
};

function load() {
  if (!existsSync(OUTPUT)) return { updatedAt: '', sources: {} };
  const text = readFileSync(OUTPUT, 'utf8');
  const match = text.match(/SYNC_STATUS[^=]*=\s*(\{[\s\S]*\});?/);
  if (!match) return { updatedAt: '', sources: {} };
  try {
    return JSON.parse(match[1]);
  } catch {
    return { updatedAt: '', sources: {} };
  }
}

const source = process.argv[2];
const count = Number(process.argv[3]) || 0;
const failed = process.argv.includes('--fail');
const error = process.argv[4] || '';
const status = load();
if (!source || !(source in LABELS)) {
  console.error(`usage: node scripts/sync-status.mjs <${Object.keys(LABELS).join('|')}> [count]`);
  process.exit(1);
}
const at = new Date().toISOString();
status.updatedAt = at;
const previous = status.sources?.[source] ?? {};
status.sources = {
  ...status.sources,
  [source]: failed
    ? { ...previous, label: LABELS[source], lastAttempt: at, stale: true, status: 'error', error }
    : { ...previous, label: LABELS[source], at, lastAttempt: at, count, status: 'ok', stale: false, error: '' },
};
const output = `/**
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

export const SYNC_STATUS = ${JSON.stringify(status, null, 2)} as const;

export const SYNC_SOURCES = Object.entries(SYNC_STATUS.sources) as Array<
  [keyof typeof SYNC_STATUS.sources, SyncSource]
>;
`;
writeFileSync(OUTPUT, output);
console.log(`[sync] ${source} @ ${at} · ${count}`);
