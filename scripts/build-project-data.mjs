/**
 * 从本地数据包仓库 + Minecraft 26.3 资源生成项目页数据。
 *
 * 运行前需要本地存在：
 * - D:\Documents\assets                        （Minecraft 26.3 client assets）
 * - D:\Documents\GitHub\better-crafting-recipes
 * - D:\Documents\GitHub\better-enchantments
 * - D:\Documents\GitHub\better-mob-drop
 * - D:\Documents\GitHub\only-survival-mode
 * - D:\Documents\GitHub\glowing-players
 * - D:\Documents\GitHub\*-i18n
 *
 * 生成内容全部提交到仓库，CI 不需要这些本地目录。
 * 运行：node scripts/build-project-data.mjs
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SITE = path.resolve(import.meta.dirname, '..');
const ASSETS = 'D:/Documents/assets/minecraft';
const GH = 'D:/Documents/GitHub';
const OUT_DATA = path.join(SITE, 'src', 'data', 'projects');
const OUT_ITEMS = path.join(SITE, 'public', 'media', 'minecraft', 'items');
const OUT_STATIONS = path.join(SITE, 'public', 'media', 'minecraft', 'stations');
const ZH = readJson(path.join(SITE, 'scripts', 'minecraft-lang-zh_cn.json'));
const EN = readJson(path.join(ASSETS, 'lang', 'en_us.json'));

mkdirSync(OUT_DATA, { recursive: true });
rmSync(OUT_ITEMS, { recursive: true, force: true });
rmSync(OUT_STATIONS, { recursive: true, force: true });
mkdirSync(OUT_ITEMS, { recursive: true });
mkdirSync(OUT_STATIONS, { recursive: true });

function readJson(file) {
  const raw = readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw.replace(/,\s*([}\]])/g, '$1'));
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const warnings = [];

function normalizeId(value) {
  if (typeof value !== 'string') return '';
  let id = value.trim().replace(/^miencraft:/i, 'minecraft:');
  if (!id) return '';
  if (!id.includes(':')) id = `minecraft:${id}`;
  return id;
}

function localPath(id) {
  return normalizeId(id).split(':').slice(1).join(':');
}

function prettify(id) {
  const name = localPath(id).split('/').pop() ?? id;
  return name.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

const NAME_OVERRIDES = {
  'minecraft:iron_chain': ['铁链', 'Iron Chain'],
};

function itemNames(id) {
  const key = localPath(id);
  const names = NAME_OVERRIDES[id] ?? [];
  return {
    zh: names[0] || ZH[`item.minecraft.${key}`] || ZH[`block.minecraft.${key}`] || EN[`item.minecraft.${key}`] || EN[`block.minecraft.${key}`] || prettify(id),
    en: names[1] || EN[`item.minecraft.${key}`] || EN[`block.minecraft.${key}`] || prettify(id),
  };
}

function entityName(id) {
  const key = localPath(id);
  return {
    zh: ZH[`entity.minecraft.${key}`] || EN[`entity.minecraft.${key}`] || prettify(id),
    en: EN[`entity.minecraft.${key}`] || prettify(id),
  };
}

/** 读取所有自定义/覆盖标签，并递归展开。 */
const rawTags = new Map();
function addTagSource(baseDir, namespace) {
  for (const file of walk(baseDir).filter((entry) => entry.endsWith('.json'))) {
    const relative = path.relative(baseDir, file).replace(/\\/g, '/').replace(/\.json$/, '');
    const id = `${namespace}:${relative}`;
    const json = readJson(file);
    rawTags.set(id, json.values ?? json.replace ?? []);
  }
}

addTagSource(path.join(GH, 'better-crafting-recipes/data/better-crafting-recipes/tags/item'), 'better-crafting-recipes');
addTagSource(path.join(GH, 'better-enchantments/data/better-enchantments/tags/item'), 'better-enchantments');
addTagSource(path.join(GH, 'better-enchantments/data/minecraft/tags/item'), 'minecraft');
addTagSource(path.join(SITE, 'scripts/magical-dye-source/data/magical_dye/tags/item'), 'magical_dye');

const BASE_TAGS = {
  'minecraft:planks': [
    'oak_planks', 'spruce_planks', 'birch_planks', 'jungle_planks', 'acacia_planks',
    'dark_oak_planks', 'mangrove_planks', 'cherry_planks', 'bamboo_planks',
    'crimson_planks', 'warped_planks',
  ].map(normalizeId),
  'minecraft:enchantable/armor': [
    'leather_helmet', 'leather_chestplate', 'leather_leggings', 'leather_boots',
    'chainmail_helmet', 'chainmail_chestplate', 'chainmail_leggings', 'chainmail_boots',
    'iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots',
    'golden_helmet', 'golden_chestplate', 'golden_leggings', 'golden_boots',
    'diamond_helmet', 'diamond_chestplate', 'diamond_leggings', 'diamond_boots',
    'netherite_helmet', 'netherite_chestplate', 'netherite_leggings', 'netherite_boots',
    'turtle_helmet', 'wolf_armor',
    'leather_horse_armor', 'copper_horse_armor', 'iron_horse_armor', 'golden_horse_armor', 'diamond_horse_armor',
  ].map(normalizeId),
  'minecraft:enchantable/durability': [
    'leather_helmet', 'leather_chestplate', 'leather_leggings', 'leather_boots',
    'chainmail_helmet', 'chainmail_chestplate', 'chainmail_leggings', 'chainmail_boots',
    'iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots',
    'golden_helmet', 'golden_chestplate', 'golden_leggings', 'golden_boots',
    'diamond_helmet', 'diamond_chestplate', 'diamond_leggings', 'diamond_boots',
    'netherite_helmet', 'netherite_chestplate', 'netherite_leggings', 'netherite_boots',
    'turtle_helmet', 'wolf_armor', 'leather_horse_armor', 'copper_horse_armor',
    'iron_horse_armor', 'golden_horse_armor', 'diamond_horse_armor',
    'elytra', 'shield', 'wooden_sword', 'stone_sword', 'iron_sword', 'golden_sword',
    'diamond_sword', 'netherite_sword', 'bow', 'crossbow', 'trident', 'mace',
    'flint_and_steel', 'shears', 'brush', 'fishing_rod', 'carrot_on_a_stick',
    'warped_fungus_on_a_stick',
  ].map(normalizeId),
  'minecraft:enchantable/head_armor': ['leather_helmet', 'chainmail_helmet', 'iron_helmet', 'golden_helmet', 'diamond_helmet', 'netherite_helmet', 'turtle_helmet'].map(normalizeId),
  'minecraft:enchantable/chest_armor': ['leather_chestplate', 'chainmail_chestplate', 'iron_chestplate', 'golden_chestplate', 'diamond_chestplate', 'netherite_chestplate', 'wolf_armor'].map(normalizeId),
  'minecraft:enchantable/leg_armor': ['leather_leggings', 'chainmail_leggings', 'iron_leggings', 'golden_leggings', 'diamond_leggings', 'netherite_leggings'].map(normalizeId),
  'minecraft:enchantable/foot_armor': ['leather_boots', 'chainmail_boots', 'iron_boots', 'golden_boots', 'diamond_boots', 'netherite_boots'].map(normalizeId),
};
for (const [id, values] of Object.entries(BASE_TAGS)) rawTags.set(id, values);

const TAG_LABELS = {
  'minecraft:planks': '木板（任意）',
  'minecraft:enchantable/armor': '全部护甲（含马铠与狼铠）',
  'minecraft:enchantable/durability': '全部可耐久物品',
  'better-crafting-recipes:stone_resource': '石质方块',
  'better-crafting-recipes:stone_resource_crafting': '可合成石质工具的石材',
  'better-crafting-recipes:skeleton_skull_smelt': '可熔炼为骷髅头的头颅',
  'better-crafting-recipes:sugar_resource_1': '糖源（1 个糖）',
  'better-crafting-recipes:sugar_resource_3': '糖源（3 个糖）',
  'better-enchantments:horse_armor': '马铠',
  'better-enchantments:wolf_armor': '狼铠',
  'magical_dye:dust': '粉末',
  'magical_dye:mineral_block': '矿物块',
  'magical_dye:dye': '染料',
};

function tagLabel(id) {
  return TAG_LABELS[id] ?? `标签 ${id.split(':')[1]?.replace(/_/g, ' ') ?? id}`;
}

const resolvedTags = new Map();
function resolveTag(id, stack = new Set()) {
  if (resolvedTags.has(id)) return resolvedTags.get(id);
  if (stack.has(id)) return [];
  const values = rawTags.get(id) ?? [];
  const items = new Set();
  for (const value of values) {
    if (typeof value === 'string' && value.startsWith('#')) {
      for (const item of resolveTag(normalizeId(value.slice(1)), new Set(stack).add(id))) items.add(item);
    } else if (typeof value === 'string') {
      items.add(normalizeId(value));
    } else if (value && typeof value === 'object' && value.id) {
      if (value.required === false) continue;
      const nested = String(value.id);
      if (nested.startsWith('#')) {
        for (const item of resolveTag(normalizeId(nested.slice(1)), new Set(stack).add(id))) items.add(item);
      } else items.add(normalizeId(nested));
    }
  }
  const result = [...items].filter((item) => item && item !== 'minecraft:air');
  resolvedTags.set(id, result);
  return result;
}

const itemIds = new Set(['minecraft:barrier']);

function resolveIngredient(value, labelHint) {
  const items = new Set();
  const tags = new Set();
  const add = (entry) => {
    if (entry == null) return;
    if (Array.isArray(entry)) {
      entry.forEach(add);
      return;
    }
    if (typeof entry === 'string') {
      const id = normalizeId(entry);
      if (!id) return;
      if (id.startsWith('#')) {
        const tagId = normalizeId(id.slice(1));
        tags.add(tagId);
        for (const item of resolveTag(tagId)) items.add(item);
      } else {
        items.add(id);
      }
      return;
    }
    if (typeof entry === 'object') {
      if (entry.tag) add(`#${entry.tag}`);
      if (entry.item) add(entry.item);
      if (entry.items) add(entry.items);
    }
  };
  add(value);
  for (const item of items) itemIds.add(item);
  for (const tag of tags) for (const item of resolveTag(tag)) itemIds.add(item);
  const tag = tags.size === 1 ? [...tags][0] : undefined;
  const label = labelHint || (tags.size ? [...tags].map(tagLabel).join(' / ') : '');
  return {
    ...(tag ? { tag } : {}),
    items: [...items].filter((item) => item && item !== 'minecraft:air'),
    label,
  };
}

function parseRecipe(file, namespace) {
  const json = readJson(file);
  const type = String(json.type ?? '').replace('minecraft:', '');
  const kind = type === 'crafting_shaped' || type === 'crafting_shapeless' || type === 'stonecutting' || type === 'smelting'
    ? type
    : null;
  if (!kind) return null;
  const resultId = normalizeId(json.result?.id ?? json.result);
  if (!resultId) return null;
  itemIds.add(resultId);
  const result = { item: resultId, count: Number(json.result?.count ?? 1) };
  const base = {
    id: `${namespace}:${path.basename(file, '.json')}`,
    kind,
    result,
  };
  if (kind === 'crafting_shaped') {
    const key = {};
    for (const [char, value] of Object.entries(json.key ?? {})) key[char] = resolveIngredient(value);
    return { ...base, pattern: json.pattern ?? [], key };
  }
  if (kind === 'crafting_shapeless') {
    return { ...base, ingredients: (json.ingredients ?? []).map((entry) => resolveIngredient(entry)) };
  }
  if (kind === 'stonecutting') {
    return { ...base, ingredient: resolveIngredient(json.ingredient) };
  }
  return {
    ...base,
    ingredient: resolveIngredient(json.ingredient),
    experience: json.experience != null ? Number(json.experience) : undefined,
    cookingTime: json.cookingtime != null ? Number(json.cookingtime) : undefined,
  };
}

function parseRecipes(dir, namespace) {
  const recipes = [];
  for (const file of walk(dir).filter((entry) => entry.endsWith('.json')).sort()) {
    const recipe = parseRecipe(file, namespace);
    if (recipe) recipes.push(recipe);
  }
  return recipes;
}

function displayText(value) {
  if (!value) return '';
  const raw = value.translate ?? value.text ?? value.key ?? '';
  return ZH[raw] || raw;
}

function parseAdvancements(dir, namespace) {
  const all = [];
  for (const file of walk(dir).filter((entry) => entry.endsWith('.json'))) {
    const relative = path.relative(dir, file).replace(/\\/g, '/').replace(/\.json$/, '');
    const json = readJson(file);
    const display = json.display ?? {};
    const title = displayText(display.title);
    const description = displayText(display.description);
    const iconRaw = display.icon?.id ?? display.icon?.items ?? display.icon?.item ?? '';
    const icon = iconRaw ? normalizeId(iconRaw) : '';
    if (icon) itemIds.add(icon);
    const hasDisplay = Boolean(title || description || icon || display.frame);
    all.push({
      id: `${namespace}:${relative}`,
      parent: json.parent ? normalizeId(json.parent) : '',
      title,
      description,
      icon,
      frame: display.frame ?? 'unknown',
      hidden: Boolean(display.hidden),
      hasDisplay,
    });
  }

  const visible = all.filter((entry) => entry.hasDisplay && !entry.hidden);
  const nodeMap = new Map(visible.map((entry) => [entry.id, { ...entry, children: [] }]));
  const roots = [];
  for (const node of nodeMap.values()) {
    const parent = node.parent ? nodeMap.get(node.parent) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const sortNodes = (nodes) => {
    nodes.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
    for (const node of nodes) sortNodes(node.children);
  };
  sortNodes(roots);
  return {
    tree: roots,
    total: all.length,
    displayed: visible.length,
  };
}

// ---------------- Crafting ----------------
const craftingDir = path.join(GH, 'better-crafting-recipes/data/better-crafting-recipes');
const craftingRecipes = parseRecipes(path.join(craftingDir, 'recipe'), 'better-crafting-recipes');
const craftingAdvancements = parseAdvancements(path.join(craftingDir, 'advancement'), 'better-crafting-recipes');
const craftingStats = {
  total: craftingRecipes.length,
  shaped: craftingRecipes.filter((recipe) => recipe.kind === 'crafting_shaped').length,
  shapeless: craftingRecipes.filter((recipe) => recipe.kind === 'crafting_shapeless').length,
  stonecutting: craftingRecipes.filter((recipe) => recipe.kind === 'stonecutting').length,
  smelting: craftingRecipes.filter((recipe) => recipe.kind === 'smelting').length,
  advancements: craftingAdvancements.total,
  displayedAdvancements: craftingAdvancements.displayed,
};

// ---------------- Magical Dye ----------------
const magicalDir = path.join(SITE, 'scripts/magical-dye-source/data/magical_dye');
const magicalRecipes = parseRecipes(path.join(magicalDir, 'recipe'), 'magical_dye');
const magicalAdvancements = parseAdvancements(path.join(magicalDir, 'advancement'), 'magical_dye');
const magicalStats = {
  total: magicalRecipes.length,
  shaped: 0,
  shapeless: magicalRecipes.length,
  stonecutting: 0,
  smelting: 0,
  advancements: magicalAdvancements.total,
  displayedAdvancements: magicalAdvancements.displayed,
};

// ---------------- Enchantments ----------------
const enchantDir = path.join(GH, 'better-enchantments/data');
const enchantmentFiles = walk(path.join(enchantDir, 'minecraft/enchantment')).filter((entry) => entry.endsWith('.json'));
const enchantments = enchantmentFiles.map((file) => {
  const json = readJson(file);
  const key = path.basename(file, '.json');
  const names = {
    zh: ZH[`enchantment.minecraft.${key}`] || EN[`enchantment.minecraft.${key}`] || prettify(key),
    en: EN[`enchantment.minecraft.${key}`] || prettify(key),
  };
  const targetTag = String(json.supported_items ?? '');
  const targetItems = targetTag.startsWith('#') ? resolveTag(normalizeId(targetTag.slice(1))) : [];
  for (const item of targetItems) itemIds.add(item);
  return {
    id: `minecraft:${key}`,
    nameZh: names.zh,
    nameEn: names.en,
    maxLevel: Number(json.max_level ?? 1),
    slots: json.slots ?? [],
    supportedItems: targetTag,
    supportedLabel: targetTag.startsWith('#') ? tagLabel(normalizeId(targetTag.slice(1))) : '',
    targetItems,
    exclusiveSet: json.exclusive_set ? String(json.exclusive_set) : '',
    weight: Number(json.weight ?? 0),
    anvilCost: Number(json.anvil_cost ?? 0),
    minCost: json.min_cost ?? null,
    maxCost: json.max_cost ?? null,
    effectTypes: Object.keys(json.effects ?? {}),
  };
});
const enchantAdvancements = parseAdvancements(path.join(enchantDir, 'better-enchantments/advancement'), 'better-enchantments');
const enchantStats = {
  total: enchantments.length,
  armor: enchantments.filter((entry) => entry.supportedItems.includes('armor')).length,
  durability: enchantments.filter((entry) => entry.supportedItems.includes('durability')).length,
  advancements: enchantAdvancements.total,
};

// ---------------- Mob drops ----------------
const mobDir = path.join(GH, 'better-mob-drop/data/better-mob-drop');
const MOB_CATEGORY = {
  allay: 'friendly', axolotl: 'friendly', bat: 'friendly', bee: 'friendly', camel: 'friendly',
  chicken: 'friendly', fox: 'friendly', frog: 'friendly', turtle: 'friendly', villager: 'friendly',
  wandering_trader: 'friendly', armadillo: 'neutral', goat: 'neutral', piglin: 'neutral',
  polar_bear: 'neutral', bogged: 'hostile', ender_dragon: 'hostile', piglin_brute: 'hostile',
};
const MOB_ICON_FALLBACK = {
  ender_dragon: 'minecraft:ender_dragon_spawn_egg',
};
const mobs = walk(path.join(mobDir, 'loot_table/entities'))
  .filter((entry) => entry.endsWith('.json'))
  .sort()
  .map((file) => {
    const mobId = path.basename(file, '.json');
    const json = readJson(file);
    const name = entityName(`minecraft:${mobId}`);
    const drops = [];
    for (const pool of json.pools ?? []) {
      for (const entry of pool.entries ?? []) {
        if (entry.type !== 'minecraft:item' || !entry.name) continue;
        const item = normalizeId(entry.name);
        itemIds.add(item);
        let min = 1;
        let max = 1;
        let looting = false;
        let smelt = false;
        const modifiers = entry.modifier ?? entry.functions ?? [];
        for (const modifier of modifiers) {
          const type = String(modifier.type ?? modifier.function ?? '');
          if (type.includes('set_count')) {
            const count = modifier.count;
            if (typeof count === 'number') min = max = count;
            else if (count && typeof count === 'object') {
              min = Number(count.min ?? 1);
              max = Number(count.max ?? min);
            }
          }
          if (type.includes('enchanted_count_increase') || type.includes('looting')) looting = true;
          if (type.includes('furnace_smelt')) smelt = true;
        }
        drops.push({ item, min, max, looting, smelt });
      }
    }
    const iconItem = normalizeId(MOB_ICON_FALLBACK[mobId] ?? `${mobId}_spawn_egg`);
    itemIds.add(iconItem);
    return {
      id: `minecraft:${mobId}`,
      nameZh: name.zh,
      nameEn: name.en,
      category: MOB_CATEGORY[mobId] ?? 'hostile',
      iconItem,
      drops,
    };
  });
const mobAdvancements = parseAdvancements(path.join(mobDir, 'advancement'), 'better-mob-drop');
const mobStats = {
  total: mobs.length,
  friendly: mobs.filter((mob) => mob.category === 'friendly').length,
  neutral: mobs.filter((mob) => mob.category === 'neutral').length,
  hostile: mobs.filter((mob) => mob.category === 'hostile').length,
  drops: mobs.reduce((sum, mob) => sum + mob.drops.length, 0),
  advancements: mobAdvancements.total,
};

// ---------------- Items / textures ----------------
const HEAD_TEXTURES = {
  'minecraft:skeleton_skull': 'skeleton.png',
  'minecraft:creeper_head': 'creeper.png',
  'minecraft:piglin_head': 'piglin.png',
  'minecraft:zombie_head': 'zombie.png',
  'minecraft:wither_skeleton_skull': 'wither_skeleton.png',
};
const TEXTURE_OVERRIDES = {
  'minecraft:dragon_head': 'block/dragon_egg',
  'minecraft:shield': 'entity/shield/shield_base',
};

function modelTexturePath(modelId, depth = 0) {
  if (!modelId || depth > 6) return '';
  const clean = String(modelId).replace(/^minecraft:/, '');
  const file = path.join(ASSETS, 'models', `${clean}.json`);
  if (!existsSync(file)) return '';
  const model = readJson(file);
  for (const value of Object.values(model.textures ?? {})) {
    if (typeof value !== 'string' || value.startsWith('#')) continue;
    const texture = value.replace(/^minecraft:/, '');
    if (existsSync(path.join(ASSETS, 'textures', `${texture}.png`))) return texture;
  }
  return modelTexturePath(model.parent, depth + 1);
}

function itemModelTexture(name) {
  const itemFile = path.join(ASSETS, 'items', `${name}.json`);
  if (!existsSync(itemFile)) return '';
  const item = readJson(itemFile);
  let model = item.model;
  if (model?.type === 'minecraft:select') model = model.cases?.[0]?.model;
  if (!model || model.type === 'minecraft:special') return '';
  return modelTexturePath(model.model ?? model.base);
}

function findItemTexture(name) {
  if (TEXTURE_OVERRIDES[`minecraft:${name}`]) {
    return TEXTURE_OVERRIDES[`minecraft:${name}`];
  }
  for (const candidate of [
    `item/${name}`,
    `block/${name}`,
    itemModelTexture(name),
  ]) {
    if (candidate && existsSync(path.join(ASSETS, 'textures', `${candidate}.png`))) return candidate;
  }
  return '';
}

for (const item of itemIds) {
  if (!item || item === 'minecraft:air') continue;
  const namespace = item.split(':')[0];
  if (namespace !== 'minecraft') continue;
  const name = localPath(item);
  const head = HEAD_TEXTURES[item];
  const texture = head ? '' : findItemTexture(name);
  const fallback = path.join(ASSETS, 'textures/item/barrier.png');
  const target = path.join(OUT_ITEMS, `${name.replace(/\//g, '_')}.png`);
  if (head) {
    copyFileSync(path.join(SITE, 'scripts/minecraft-heads', head), target);
  } else if (texture) {
    copyFileSync(path.join(ASSETS, 'textures', `${texture}.png`), target);
  } else {
    copyFileSync(fallback, target);
    warnings.push(`texture missing: ${item}`);
  }
}

for (const [source, target] of [
  ['textures/block/crafting_table_front.png', 'crafting_table.png'],
  ['textures/block/stonecutter_top.png', 'stonecutter.png'],
  ['textures/block/furnace_front.png', 'furnace.png'],
]) {
  const src = path.join(ASSETS, source);
  if (existsSync(src)) copyFileSync(src, path.join(OUT_STATIONS, target));
  else warnings.push(`station texture missing: ${source}`);
}

const items = [...itemIds]
  .filter((id) => id && id !== 'minecraft:air')
  .map((id) => {
    const names = itemNames(id);
    return {
      id,
      nameZh: names.zh,
      nameEn: names.en,
      texture: `/media/minecraft/items/${localPath(id).replace(/\//g, '_')}.png`,
    };
  })
  .sort((a, b) => a.nameZh.localeCompare(b.nameZh, 'zh-CN'));

const tags = [...resolvedTags.entries()]
  .map(([id, values]) => ({ id, label: tagLabel(id), items: values }))
  .sort((a, b) => a.id.localeCompare(b.id));

function writeModule(file, content) {
  writeFileSync(path.join(OUT_DATA, file), content, 'utf8');
}

writeModule('minecraft.ts', `/* 由 scripts/build-project-data.mjs 生成，请勿手动编辑。 */
export interface MinecraftItem {
  id: string;
  nameZh: string;
  nameEn: string;
  texture: string;
}

export interface MinecraftTag {
  id: string;
  label: string;
  items: string[];
}

export const MINECRAFT_ITEMS: Record<string, MinecraftItem> = ${JSON.stringify(
  Object.fromEntries(items.map((item) => [item.id, item])),
  null,
  2,
)};

export const MINECRAFT_TAGS: Record<string, MinecraftTag> = ${JSON.stringify(
  Object.fromEntries(tags.map((tag) => [tag.id, tag])),
  null,
  2,
)};

export function minecraftItem(id: string): MinecraftItem {
  return MINECRAFT_ITEMS[id] ?? {
    id,
    nameZh: id.split(':').pop()?.replace(/_/g, ' ') ?? id,
    nameEn: id.split(':').pop()?.replace(/_/g, ' ') ?? id,
    texture: '/media/minecraft/items/barrier.png',
  };
}

export function minecraftTag(id: string): MinecraftTag | null {
  return MINECRAFT_TAGS[id] ?? null;
}
`);

const HEADER = '/* 由 scripts/build-project-data.mjs 生成，请勿手动编辑。 */\n';

writeModule('crafting.ts', `${HEADER}import type { AdvancementNode, Recipe } from './types';

export const CRAFTING_RECIPES: Recipe[] = ${JSON.stringify(craftingRecipes, null, 2)};

export const CRAFTING_ADVANCEMENTS: AdvancementNode[] = ${JSON.stringify(craftingAdvancements.tree, null, 2)};

export const CRAFTING_STATS = ${JSON.stringify(craftingStats, null, 2)} as const;

export const CRAFTING_PACK = {
  id: 'better-crafting-recipes',
  path: '/projects/better-crafting-recipes/',
  title: '更好的合成配方',
  subtitle: 'Better Crafting Recipes',
  version: '1.9.3.6',
  gameVersions: '1.13 – 26.3',
  loader: '数据包 / Fabric / Forge / NeoForge / Quilt',
  language: ['zh_cn', 'en_us'],
} as const;
`);

writeModule('magical-dye.ts', `${HEADER}import type { AdvancementNode, Recipe } from './types';

export const MAGICAL_DYE_RECIPES: Recipe[] = ${JSON.stringify(magicalRecipes, null, 2)};

export const MAGICAL_DYE_ADVANCEMENTS: AdvancementNode[] = ${JSON.stringify(magicalAdvancements.tree, null, 2)};

export const MAGICAL_DYE_STATS = ${JSON.stringify(magicalStats, null, 2)} as const;

export const MAGICAL_DYE_PACK = {
  id: 'magical-dye',
  path: '/projects/magical-dye/',
  title: '魔法染料',
  subtitle: 'Magical Dye',
  version: '1.0.0',
  gameVersions: '1.21.2 – 1.21.4',
  loader: '数据包 / Fabric / Forge / NeoForge / Quilt',
  language: [],
} as const;
`);

writeModule('enchantments.ts', `${HEADER}import type { AdvancementNode } from './types';

export interface EnchantmentInfo {
  id: string;
  nameZh: string;
  nameEn: string;
  maxLevel: number;
  slots: string[];
  supportedItems: string;
  supportedLabel: string;
  targetItems: string[];
  exclusiveSet: string;
  weight: number;
  anvilCost: number;
  minCost: unknown;
  maxCost: unknown;
  effectTypes: string[];
}

export const ENCHANTMENTS: EnchantmentInfo[] = ${JSON.stringify(enchantments, null, 2)};

export const ENCHANTMENT_ADVANCEMENTS: AdvancementNode[] = ${JSON.stringify(enchantAdvancements.tree, null, 2)};

export const ENCHANTMENT_STATS = ${JSON.stringify(enchantStats, null, 2)} as const;

export const ENCHANTMENT_PACK = {
  id: 'better-enchantments',
  path: '/projects/better-enchantments/',
  title: '更好附魔',
  subtitle: 'Better Enchantments',
  version: '1.0.1.3',
  gameVersions: '1.21.5 – 26.3',
  loader: '数据包 / Fabric / Forge / NeoForge / Quilt',
  language: ['zh_cn', 'en_us'],
} as const;
`);

writeModule('mob-drops.ts', `${HEADER}import type { AdvancementNode } from './types';

export type MobCategory = 'friendly' | 'neutral' | 'hostile';

export interface MobDropEntry {
  item: string;
  min: number;
  max: number;
  looting: boolean;
  smelt: boolean;
}

export interface MobInfo {
  id: string;
  nameZh: string;
  nameEn: string;
  category: MobCategory;
  iconItem: string;
  drops: MobDropEntry[];
}

export const MOB_DROPS: MobInfo[] = ${JSON.stringify(mobs, null, 2)};

export const MOB_ADVANCEMENTS: AdvancementNode[] = ${JSON.stringify(mobAdvancements.tree, null, 2)};

export const MOB_STATS = ${JSON.stringify(mobStats, null, 2)} as const;

export const MOB_CATEGORY_LABELS = {
  friendly: '友好生物',
  neutral: '中立生物',
  hostile: '敌对生物',
} as const;

export const MOB_PACK = {
  id: 'better-mob-drop',
  path: '/projects/better-mob-drop/',
  title: '更好的生物掉落',
  subtitle: 'Better Mob Drop',
  version: '1.2.6.4',
  gameVersions: '1.13 – 26.3',
  loader: '数据包 / Fabric / Forge / NeoForge / Quilt',
  language: ['zh_cn', 'en_us'],
} as const;
`);

console.log(`[projects] items=${items.length} tags=${tags.length} recipes=${craftingRecipes.length + magicalRecipes.length} enchantments=${enchantments.length} mobs=${mobs.length}`);
if (warnings.length) {
  console.warn(`[projects] ${warnings.length} warnings`);
  for (const warning of warnings.slice(0, 30)) console.warn(' -', warning);
}

