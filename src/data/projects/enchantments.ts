/* 由 scripts/build-project-data.mjs 生成，请勿手动编辑。 */
import type { AdvancementNode } from './types';

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

export const ENCHANTMENTS: EnchantmentInfo[] = [
  {
    "id": "minecraft:blast_protection",
    "nameZh": "爆炸保护",
    "nameEn": "Blast Protection",
    "maxLevel": 4,
    "slots": [
      "any"
    ],
    "supportedItems": "#minecraft:enchantable/armor",
    "supportedLabel": "全部护甲（含马铠与狼铠）",
    "targetItems": [
      "minecraft:leather_helmet",
      "minecraft:leather_chestplate",
      "minecraft:leather_leggings",
      "minecraft:leather_boots",
      "minecraft:chainmail_helmet",
      "minecraft:chainmail_chestplate",
      "minecraft:chainmail_leggings",
      "minecraft:chainmail_boots",
      "minecraft:iron_helmet",
      "minecraft:iron_chestplate",
      "minecraft:iron_leggings",
      "minecraft:iron_boots",
      "minecraft:golden_helmet",
      "minecraft:golden_chestplate",
      "minecraft:golden_leggings",
      "minecraft:golden_boots",
      "minecraft:diamond_helmet",
      "minecraft:diamond_chestplate",
      "minecraft:diamond_leggings",
      "minecraft:diamond_boots",
      "minecraft:netherite_helmet",
      "minecraft:netherite_chestplate",
      "minecraft:netherite_leggings",
      "minecraft:netherite_boots",
      "minecraft:turtle_helmet",
      "minecraft:wolf_armor",
      "minecraft:leather_horse_armor",
      "minecraft:copper_horse_armor",
      "minecraft:iron_horse_armor",
      "minecraft:golden_horse_armor",
      "minecraft:diamond_horse_armor"
    ],
    "exclusiveSet": "#minecraft:exclusive_set/armor",
    "weight": 2,
    "anvilCost": 4,
    "minCost": {
      "base": 5,
      "per_level_above_first": 8
    },
    "maxCost": {
      "base": 13,
      "per_level_above_first": 8
    },
    "effectTypes": [
      "minecraft:attributes",
      "minecraft:damage_protection"
    ]
  },
  {
    "id": "minecraft:fire_protection",
    "nameZh": "火焰保护",
    "nameEn": "Fire Protection",
    "maxLevel": 4,
    "slots": [
      "any"
    ],
    "supportedItems": "#minecraft:enchantable/armor",
    "supportedLabel": "全部护甲（含马铠与狼铠）",
    "targetItems": [
      "minecraft:leather_helmet",
      "minecraft:leather_chestplate",
      "minecraft:leather_leggings",
      "minecraft:leather_boots",
      "minecraft:chainmail_helmet",
      "minecraft:chainmail_chestplate",
      "minecraft:chainmail_leggings",
      "minecraft:chainmail_boots",
      "minecraft:iron_helmet",
      "minecraft:iron_chestplate",
      "minecraft:iron_leggings",
      "minecraft:iron_boots",
      "minecraft:golden_helmet",
      "minecraft:golden_chestplate",
      "minecraft:golden_leggings",
      "minecraft:golden_boots",
      "minecraft:diamond_helmet",
      "minecraft:diamond_chestplate",
      "minecraft:diamond_leggings",
      "minecraft:diamond_boots",
      "minecraft:netherite_helmet",
      "minecraft:netherite_chestplate",
      "minecraft:netherite_leggings",
      "minecraft:netherite_boots",
      "minecraft:turtle_helmet",
      "minecraft:wolf_armor",
      "minecraft:leather_horse_armor",
      "minecraft:copper_horse_armor",
      "minecraft:iron_horse_armor",
      "minecraft:golden_horse_armor",
      "minecraft:diamond_horse_armor"
    ],
    "exclusiveSet": "#minecraft:exclusive_set/armor",
    "weight": 5,
    "anvilCost": 2,
    "minCost": {
      "base": 10,
      "per_level_above_first": 8
    },
    "maxCost": {
      "base": 18,
      "per_level_above_first": 8
    },
    "effectTypes": [
      "minecraft:attributes",
      "minecraft:damage_protection"
    ]
  },
  {
    "id": "minecraft:projectile_protection",
    "nameZh": "弹射物保护",
    "nameEn": "Projectile Protection",
    "maxLevel": 4,
    "slots": [
      "any"
    ],
    "supportedItems": "#minecraft:enchantable/armor",
    "supportedLabel": "全部护甲（含马铠与狼铠）",
    "targetItems": [
      "minecraft:leather_helmet",
      "minecraft:leather_chestplate",
      "minecraft:leather_leggings",
      "minecraft:leather_boots",
      "minecraft:chainmail_helmet",
      "minecraft:chainmail_chestplate",
      "minecraft:chainmail_leggings",
      "minecraft:chainmail_boots",
      "minecraft:iron_helmet",
      "minecraft:iron_chestplate",
      "minecraft:iron_leggings",
      "minecraft:iron_boots",
      "minecraft:golden_helmet",
      "minecraft:golden_chestplate",
      "minecraft:golden_leggings",
      "minecraft:golden_boots",
      "minecraft:diamond_helmet",
      "minecraft:diamond_chestplate",
      "minecraft:diamond_leggings",
      "minecraft:diamond_boots",
      "minecraft:netherite_helmet",
      "minecraft:netherite_chestplate",
      "minecraft:netherite_leggings",
      "minecraft:netherite_boots",
      "minecraft:turtle_helmet",
      "minecraft:wolf_armor",
      "minecraft:leather_horse_armor",
      "minecraft:copper_horse_armor",
      "minecraft:iron_horse_armor",
      "minecraft:golden_horse_armor",
      "minecraft:diamond_horse_armor"
    ],
    "exclusiveSet": "#minecraft:exclusive_set/armor",
    "weight": 5,
    "anvilCost": 2,
    "minCost": {
      "base": 3,
      "per_level_above_first": 6
    },
    "maxCost": {
      "base": 9,
      "per_level_above_first": 6
    },
    "effectTypes": [
      "minecraft:damage_protection"
    ]
  },
  {
    "id": "minecraft:protection",
    "nameZh": "保护",
    "nameEn": "Protection",
    "maxLevel": 4,
    "slots": [
      "any"
    ],
    "supportedItems": "#minecraft:enchantable/armor",
    "supportedLabel": "全部护甲（含马铠与狼铠）",
    "targetItems": [
      "minecraft:leather_helmet",
      "minecraft:leather_chestplate",
      "minecraft:leather_leggings",
      "minecraft:leather_boots",
      "minecraft:chainmail_helmet",
      "minecraft:chainmail_chestplate",
      "minecraft:chainmail_leggings",
      "minecraft:chainmail_boots",
      "minecraft:iron_helmet",
      "minecraft:iron_chestplate",
      "minecraft:iron_leggings",
      "minecraft:iron_boots",
      "minecraft:golden_helmet",
      "minecraft:golden_chestplate",
      "minecraft:golden_leggings",
      "minecraft:golden_boots",
      "minecraft:diamond_helmet",
      "minecraft:diamond_chestplate",
      "minecraft:diamond_leggings",
      "minecraft:diamond_boots",
      "minecraft:netherite_helmet",
      "minecraft:netherite_chestplate",
      "minecraft:netherite_leggings",
      "minecraft:netherite_boots",
      "minecraft:turtle_helmet",
      "minecraft:wolf_armor",
      "minecraft:leather_horse_armor",
      "minecraft:copper_horse_armor",
      "minecraft:iron_horse_armor",
      "minecraft:golden_horse_armor",
      "minecraft:diamond_horse_armor"
    ],
    "exclusiveSet": "#minecraft:exclusive_set/armor",
    "weight": 10,
    "anvilCost": 1,
    "minCost": {
      "base": 1,
      "per_level_above_first": 11
    },
    "maxCost": {
      "base": 12,
      "per_level_above_first": 11
    },
    "effectTypes": [
      "minecraft:damage_protection"
    ]
  },
  {
    "id": "minecraft:unbreaking",
    "nameZh": "耐久",
    "nameEn": "Unbreaking",
    "maxLevel": 3,
    "slots": [
      "any"
    ],
    "supportedItems": "#minecraft:enchantable/durability",
    "supportedLabel": "全部可耐久物品",
    "targetItems": [
      "minecraft:leather_helmet",
      "minecraft:leather_chestplate",
      "minecraft:leather_leggings",
      "minecraft:leather_boots",
      "minecraft:chainmail_helmet",
      "minecraft:chainmail_chestplate",
      "minecraft:chainmail_leggings",
      "minecraft:chainmail_boots",
      "minecraft:iron_helmet",
      "minecraft:iron_chestplate",
      "minecraft:iron_leggings",
      "minecraft:iron_boots",
      "minecraft:golden_helmet",
      "minecraft:golden_chestplate",
      "minecraft:golden_leggings",
      "minecraft:golden_boots",
      "minecraft:diamond_helmet",
      "minecraft:diamond_chestplate",
      "minecraft:diamond_leggings",
      "minecraft:diamond_boots",
      "minecraft:netherite_helmet",
      "minecraft:netherite_chestplate",
      "minecraft:netherite_leggings",
      "minecraft:netherite_boots",
      "minecraft:turtle_helmet",
      "minecraft:wolf_armor",
      "minecraft:leather_horse_armor",
      "minecraft:copper_horse_armor",
      "minecraft:iron_horse_armor",
      "minecraft:golden_horse_armor",
      "minecraft:diamond_horse_armor",
      "minecraft:elytra",
      "minecraft:shield",
      "minecraft:wooden_sword",
      "minecraft:stone_sword",
      "minecraft:iron_sword",
      "minecraft:golden_sword",
      "minecraft:diamond_sword",
      "minecraft:netherite_sword",
      "minecraft:bow",
      "minecraft:crossbow",
      "minecraft:trident",
      "minecraft:mace",
      "minecraft:flint_and_steel",
      "minecraft:shears",
      "minecraft:brush",
      "minecraft:fishing_rod",
      "minecraft:carrot_on_a_stick",
      "minecraft:warped_fungus_on_a_stick"
    ],
    "exclusiveSet": "",
    "weight": 5,
    "anvilCost": 2,
    "minCost": {
      "base": 5,
      "per_level_above_first": 8
    },
    "maxCost": {
      "base": 55,
      "per_level_above_first": 8
    },
    "effectTypes": [
      "minecraft:item_damage"
    ]
  }
];

export const ENCHANTMENT_ADVANCEMENTS: AdvancementNode[] = [
  {
    "id": "better-enchantments:better-enchantments",
    "parent": "",
    "title": "更好附魔",
    "description": "附魔扩展！适用更多装备！提供更多效果！",
    "icon": "minecraft:enchanted_book",
    "frame": "task",
    "hidden": false,
    "hasDisplay": true,
    "children": [
      {
        "id": "better-enchantments:horse_armor",
        "parent": "better-enchantments:better-enchantments",
        "title": "附魔马铠",
        "description": "保护？耐久？在铁砧中为一件马铠附魔。",
        "icon": "minecraft:diamond_horse_armor",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-enchantments:wolf_armor",
            "parent": "better-enchantments:horse_armor",
            "title": "附魔狼铠",
            "description": "加强版汪汪队出动！",
            "icon": "minecraft:wolf_armor",
            "frame": "task",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          }
        ]
      }
    ]
  }
];

export const ENCHANTMENT_STATS = {
  "total": 5,
  "armor": 4,
  "durability": 1,
  "advancements": 3
} as const;

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
