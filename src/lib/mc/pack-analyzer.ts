/** MC 数据包 / 资源包 ZIP 解析。 */
import JSZip from 'jszip';
import {
  formatRangeFromMeta,
  metaDescription,
  supportedVersions,
  type PackKind,
  type SupportedVersions,
} from './pack-formats';

export interface PackCategory {
  id: string;
  label: string;
  files: string[];
}

export interface PackAnalysis {
  kind: PackKind;
  actualKind: PackKind | 'mixed' | 'unknown';
  fileName: string;
  size: number;
  meta: Record<string, any>;
  metaText: string;
  description: string;
  supported: SupportedVersions;
  formatLabel: string;
  namespaces: string[];
  categories: PackCategory[];
  rootFiles: string[];
  files: number;
  icon: Blob | null;
  warning: string;
}

const DATA_LABELS: Record<string, string> = {
  advancement: '进度',
  advancements: '进度',
  recipe: '配方',
  recipes: '配方',
  loot_table: '战利品表',
  loot_tables: '战利品表',
  function: '函数',
  functions: '函数',
  tags: '标签',
  predicate: '谓词',
  predicates: '谓词',
  item_modifier: '物品修饰器',
  item_modifiers: '物品修饰器',
  structure: '结构',
  structures: '结构',
  worldgen: '世界生成',
  dimension: '维度',
  dimension_type: '维度类型',
  damage_type: '伤害类型',
  enchantment: '附魔',
  enchantments: '附魔',
  painting_variant: '画变体',
  jukebox_song: '唱片',
  trim_pattern: '盔甲纹饰',
  trim_material: '纹饰材料',
};

const RESOURCE_LABELS: Record<string, string> = {
  textures: '纹理',
  models: '模型',
  blockstates: '方块状态',
  lang: '语言',
  sounds: '声音',
  font: '字体',
  shaders: '着色器',
  particles: '粒子',
  atlases: '图集',
  post_effect: '后处理',
  equipment: '装备',
  items: '物品定义',
  font_providers: '字体提供器',
  overlays: '覆盖层',
};

function stripPrefix(name: string, prefix: string): string {
  return prefix && name.startsWith(prefix) ? name.slice(prefix.length) : name;
}

function labelFor(kind: PackKind, category: string): string {
  const table = kind === 'data' ? DATA_LABELS : RESOURCE_LABELS;
  return table[category] ?? table[category.replace(/s$/, '')] ?? category;
}

export async function analyzePack(file: File, requestedKind: PackKind): Promise<PackAnalysis> {
  if (file.size > 100 * 1024 * 1024) throw new Error('文件超过 100MB，浏览器解析可能耗尽内存');
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    throw new Error('无法读取 ZIP，请确认文件没有损坏或加密');
  }

  const paths = Object.values(zip.files)
    .filter((entry) => !entry.dir)
    .map((entry) => entry.name.replace(/\\/g, '/'));
  if (!paths.length) throw new Error('ZIP 是空的');

  // 兼容把整个数据包放在一层文件夹里的 ZIP。
  const metaCandidates = paths.filter((path) => /(^|\/)pack\.mcmeta$/.test(path));
  if (!metaCandidates.length) throw new Error('没有找到 pack.mcmeta，不是有效的 Minecraft 整合包');
  const metaPath = metaCandidates.sort((a, b) => a.length - b.length)[0];
  const prefix = metaPath.slice(0, metaPath.length - 'pack.mcmeta'.length);
  const relativePaths = paths.map((path) => stripPrefix(path, prefix));

  const metaFile = zip.file(metaPath);
  if (!metaFile) throw new Error('无法读取 pack.mcmeta');
  const rawMetaText = await metaFile.async('string');
  const metaText = rawMetaText.replace(/^\uFEFF/, '').trim();
  let meta: Record<string, any>;
  try {
    meta = JSON.parse(metaText);
  } catch {
    throw new Error('pack.mcmeta 不是合法 JSON');
  }

  const hasData = relativePaths.some((path) => path.startsWith('data/'));
  const hasAssets = relativePaths.some((path) => path.startsWith('assets/'));
  const actualKind: PackAnalysis['actualKind'] = hasData && hasAssets ? 'mixed' : hasData ? 'data' : hasAssets ? 'resource' : 'unknown';
  const warning =
    actualKind === 'mixed'
      ? '这个 ZIP 同时包含 data/ 与 assets/，可能是同时提供数据包和资源包的整合包。'
      : actualKind !== 'unknown' && actualKind !== requestedKind
        ? `当前页面解析的是${requestedKind === 'data' ? '数据包' : '资源包'}，但 ZIP 更像${actualKind === 'data' ? '数据包' : '资源包'}；下面仍会展示实际内容。`
        : '';

  const ranges = formatRangeFromMeta(meta);
  const supported = supportedVersions(requestedKind, meta);
  const formatLabel = ranges
    ? ranges.min.label === ranges.max.label
      ? ranges.min.label
      : `${ranges.min.label} – ${ranges.max.label}`
    : '未声明';

  const namespaces = new Set<string>();
  const categories = new Map<string, string[]>();
  const rootFiles: string[] = [];

  for (const path of relativePaths) {
    const match = path.match(/^(data|assets)\/([^/]+)\/([^/]+)\/(.+)$/);
    if (match) {
      namespaces.add(match[2]);
      const id = match[3];
      const list = categories.get(id) ?? [];
      list.push(path);
      categories.set(id, list);
    } else if (!path.startsWith('data/') && !path.startsWith('assets/')) {
      rootFiles.push(path);
    }
  }

  const categoryList = [...categories.entries()]
    .map(([id, files]) => ({
      id,
      label: labelFor(requestedKind, id),
      files: files.sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => b.files.length - a.files.length || a.id.localeCompare(b.id));

  const iconFile = zip.file(`${prefix}pack.png`);
  const iconBlob = iconFile ? await iconFile.async('blob') : null;
  const icon = iconBlob && iconBlob.size > 0 ? iconBlob : null;

  return {
    kind: requestedKind,
    actualKind,
    fileName: file.name,
    size: file.size,
    meta,
    metaText,
    description: metaDescription(meta.pack?.description) || '未填写描述',
    supported,
    formatLabel,
    namespaces: [...namespaces].sort(),
    categories: categoryList,
    rootFiles: rootFiles.filter((path) => path !== 'pack.mcmeta').sort(),
    files: relativePaths.length,
    icon,
    warning,
  };
}
