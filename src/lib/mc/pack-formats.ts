/** Minecraft 数据包 / 资源包版本映射与 pack.mcmeta 解析。 */

export type PackKind = 'data' | 'resource';

export interface PackFormatEntry {
  format: string;
  versions: string;
}

/** 数据包格式（pack_format / min_format / max_format）。 */
export const DATA_PACK_FORMATS: PackFormatEntry[] = [
  { format: '121.0', versions: '26.3' },
  { format: '107.1', versions: '26.2' },
  { format: '101.1', versions: '26.1 – 26.1.2' },
  { format: '94.1', versions: '1.21.11' },
  { format: '88.0', versions: '1.21.9 – 1.21.10' },
  { format: '81', versions: '1.21.7 – 1.21.8' },
  { format: '80', versions: '1.21.6' },
  { format: '71', versions: '1.21.5' },
  { format: '61', versions: '1.21.4' },
  { format: '57', versions: '1.21.2 – 1.21.3' },
  { format: '48', versions: '1.21 – 1.21.1' },
  { format: '41', versions: '1.20.5 – 1.20.6' },
  { format: '26', versions: '1.20.3 – 1.20.4' },
  { format: '18', versions: '1.20.2' },
  { format: '15', versions: '1.20 – 1.20.1' },
  { format: '12', versions: '1.19.4' },
  { format: '10', versions: '1.19 – 1.19.3' },
  { format: '9', versions: '1.18.2' },
  { format: '8', versions: '1.18 – 1.18.1' },
  { format: '7', versions: '1.17 – 1.17.1' },
  { format: '6', versions: '1.16.2 – 1.16.5' },
  { format: '5', versions: '1.15 – 1.16.1' },
  { format: '4', versions: '1.13 – 1.14.4' },
];

/** 资源包格式。 */
export const RESOURCE_PACK_FORMATS: PackFormatEntry[] = [
  { format: '97.1', versions: '26.3' },
  { format: '88.0', versions: '26.2' },
  { format: '84.0', versions: '26.1 – 26.1.2' },
  { format: '75.0', versions: '1.21.11' },
  { format: '69.0', versions: '1.21.9 – 1.21.10' },
  { format: '64', versions: '1.21.7 – 1.21.8' },
  { format: '63', versions: '1.21.6' },
  { format: '55', versions: '1.21.5' },
  { format: '46', versions: '1.21.4' },
  { format: '42', versions: '1.21.2 – 1.21.3' },
  { format: '34', versions: '1.21 – 1.21.1' },
  { format: '32', versions: '1.20.5 – 1.20.6' },
  { format: '22', versions: '1.20.3 – 1.20.4' },
  { format: '18', versions: '1.20.2' },
  { format: '15', versions: '1.20 – 1.20.1' },
  { format: '13', versions: '1.19.4' },
  { format: '12', versions: '1.19.3' },
  { format: '9', versions: '1.19 – 1.19.2' },
  { format: '8', versions: '1.18 – 1.18.2' },
  { format: '7', versions: '1.17 – 1.17.1' },
  { format: '6', versions: '1.16.2 – 1.16.5' },
  { format: '5', versions: '1.15 – 1.16.1' },
  { format: '4', versions: '1.13 – 1.14.4' },
];

export interface ParsedFormat {
  major: number;
  minor: number;
  label: string;
}

export function parseFormat(value: unknown): ParsedFormat | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { major: value, minor: 0, label: String(value) };
  }
  if (Array.isArray(value) && value.length >= 1 && typeof value[0] === 'number') {
    const major = value[0];
    const minor = typeof value[1] === 'number' ? value[1] : 0;
    return { major, minor, label: `${major}.${minor}` };
  }
  if (typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value)) {
    const [major, minor = '0'] = value.split('.');
    return { major: Number(major), minor: Number(minor), label: `${major}.${minor}` };
  }
  return null;
}

function compareFormats(a: ParsedFormat, b: ParsedFormat): number {
  return a.major === b.major ? a.minor - b.minor : a.major - b.major;
}

export interface FormatRange {
  min: ParsedFormat;
  max: ParsedFormat;
  source: string;
}

/** 解析 pack.mcmeta 中旧版 / 新版格式声明。 */
export function formatRangeFromMeta(meta: Record<string, any>): FormatRange | null {
  const pack = meta.pack ?? {};
  if (pack.supported_formats !== undefined) {
    const supported = pack.supported_formats;
    if (Array.isArray(supported) && supported.length === 2 && supported.every((item) => typeof item === 'number')) {
      const min = parseFormat(supported[0]);
      const max = parseFormat(supported[1]);
      if (min && max) return { min, max, source: 'supported_formats' };
    }
    if (Array.isArray(supported) && supported.every((item) => Array.isArray(item))) {
      const parsed = supported.map(parseFormat).filter((item): item is ParsedFormat => Boolean(item));
      if (parsed.length) return { min: parsed[0], max: parsed[parsed.length - 1], source: 'supported_formats' };
    }
    const direct = parseFormat(supported);
    if (direct) return { min: direct, max: direct, source: 'supported_formats' };
  }
  if (pack.min_format !== undefined || pack.max_format !== undefined) {
    const min = parseFormat(pack.min_format) ?? parseFormat(pack.max_format);
    const max = parseFormat(pack.max_format) ?? min;
    if (min && max) return { min, max, source: 'min_format / max_format' };
  }
  if (pack.pack_format !== undefined) {
    const direct = parseFormat(pack.pack_format);
    if (direct) return { min: direct, max: direct, source: 'pack_format' };
  }
  return null;
}

export interface SupportedVersions {
  labels: string[];
  formats: string[];
  range: FormatRange | null;
  note: string;
}

/** 将格式范围映射到站点使用的 Minecraft 版本表。 */
export function supportedVersions(kind: PackKind, meta: Record<string, any>): SupportedVersions {
  const table = kind === 'data' ? DATA_PACK_FORMATS : RESOURCE_PACK_FORMATS;
  const range = formatRangeFromMeta(meta);
  if (!range) {
    return { labels: [], formats: [], range: null, note: 'pack.mcmeta 没有声明可识别的 pack_format。' };
  }
  const matches = table.filter((entry) => {
    const format = parseFormat(entry.format);
    return Boolean(format && compareFormats(format, range.min) >= 0 && compareFormats(format, range.max) <= 0);
  });
  const exact = table.find((entry) => entry.format === range.min.label || entry.format === range.max.label);
  if (!matches.length && exact) matches.push(exact);
  const labels = [...new Set(matches.map((entry) => entry.versions))];
  const formats = [...new Set(matches.map((entry) => entry.format))];
  return {
    labels,
    formats,
    range,
    note: labels.length
      ? `按 ${kind === 'data' ? '数据包' : '资源包'}格式表匹配。`
      : `格式 ${range.min.label}${range.max.label !== range.min.label ? ` – ${range.max.label}` : ''} 暂未收录到版本表。`,
  };
}

export function metaDescription(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(metaDescription).join('');
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.text === 'string') return record.text;
    if (typeof record.translate === 'string') return record.translate;
    if (record.with) return `${record.translate ?? ''} ${metaDescription(record.with)}`.trim();
    if (record.extra) return metaDescription(record.extra);
  }
  return '';
}
