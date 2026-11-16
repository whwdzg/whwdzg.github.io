/**
 * 小工具集合 / Small formatting helpers.
 *
 * 全部为纯函数，便于在 Node 环境里做单元测试。
 */

/** 将 YYYY-MM-DD / ISO 字符串格式化为紧凑日期；缺失时返回中文占位。 */
export function formatDate(value: string | null | undefined, fallback = '日期未记录'): string {
  if (!value) return fallback;
  const date = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : fallback;
}

/** 格式化完整时间（本地时区），用于提交历史、构建信息。 */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '未知';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未知';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/** 以“刚刚 / 3 分钟前 / 2 天前”的形式展示相对时间。 */
export function relativeTime(value: string | number | Date, now: number = Date.now()): string {
  const time = value instanceof Date ? value.getTime() : typeof value === 'number' ? value : new Date(value).getTime();
  if (Number.isNaN(time)) return '未知';
  const diff = Math.max(0, now - time);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < month) return `${Math.floor(diff / day)} 天前`;
  if (diff < year) return `${Math.floor(diff / month)} 个月前`;
  return `${Math.floor(diff / year)} 年前`;
}

/** 秒数 → 0:13 / 21:03 / 01:02:03 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || seconds < 0) return '';
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** 播放量：1234 → 1,234；12345 → 1.2 万 */
export function formatViews(value: number | null | undefined): string {
  if (!value || value < 0) return '';
  if (value >= 100_000_000) return `${trimZero(value / 100_000_000)} 亿`;
  if (value >= 10_000) return `${trimZero(value / 10_000)} 万`;
  return value.toLocaleString('zh-CN');
}

function trimZero(value: number): string {
  const fixed = value >= 10 ? Math.round(value).toString() : value.toFixed(1);
  return fixed.replace(/\.0$/, '');
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || bytes < 0) return '未知';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}

/** 截断长文本，保留首尾（用于 UA 显示）。 */
export function truncateMiddle(value: string, max = 80): string {
  if (value.length <= max) return value;
  const half = Math.floor((max - 1) / 2);
  return `${value.slice(0, half)}…${value.slice(-half)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
