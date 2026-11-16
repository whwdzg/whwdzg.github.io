/* 由 scripts/build-project-data.mjs 生成，请勿手动编辑。 */
import type { AdvancementNode } from './types';

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

export const MOB_DROPS: MobInfo[] = [
  {
    "id": "minecraft:allay",
    "nameZh": "悦灵",
    "nameEn": "Allay",
    "category": "friendly",
    "iconItem": "minecraft:allay_spawn_egg",
    "drops": [
      {
        "item": "minecraft:amethyst_shard",
        "min": 1,
        "max": 2,
        "looting": true,
        "smelt": false
      }
    ]
  },
  {
    "id": "minecraft:armadillo",
    "nameZh": "犰狳",
    "nameEn": "Armadillo",
    "category": "neutral",
    "iconItem": "minecraft:armadillo_spawn_egg",
    "drops": [
      {
        "item": "minecraft:armadillo_scute",
        "min": 1,
        "max": 3,
        "looting": true,
        "smelt": false
      }
    ]
  },
  {
    "id": "minecraft:axolotl",
    "nameZh": "美西螈",
    "nameEn": "Axolotl",
    "category": "friendly",
    "iconItem": "minecraft:axolotl_spawn_egg",
    "drops": [
      {
        "item": "minecraft:tropical_fish",
        "min": 1,
        "max": 2,
        "looting": true,
        "smelt": false
      }
    ]
  },
  {
    "id": "minecraft:bat",
    "nameZh": "蝙蝠",
    "nameEn": "Bat",
    "category": "friendly",
    "iconItem": "minecraft:bat_spawn_egg",
    "drops": [
      {
        "item": "minecraft:phantom_membrane",
        "min": 1,
        "max": 1,
        "looting": false,
        "smelt": false
      }
    ]
  },
  {
    "id": "minecraft:bee",
    "nameZh": "蜜蜂",
    "nameEn": "Bee",
    "category": "friendly",
    "iconItem": "minecraft:bee_spawn_egg",
    "drops": [
      {
        "item": "minecraft:honeycomb",
        "min": 1,
        "max": 1,
        "looting": false,
        "smelt": false
      }
    ]
  },
  {
    "id": "minecraft:bogged",
    "nameZh": "沼骸",
    "nameEn": "Bogged",
    "category": "hostile",
    "iconItem": "minecraft:bogged_spawn_egg",
    "drops": [
      {
        "item": "minecraft:arrow",
        "min": 0,
        "max": 2,
        "looting": true,
        "smelt": false
      },
      {
        "item": "minecraft:bone",
        "min": 0,
        "max": 2,
        "looting": true,
        "smelt": false
      },
      {
        "item": "minecraft:tipped_arrow",
        "min": 0,
        "max": 1,
        "looting": true,
        "smelt": false
      },
      {
        "item": "minecraft:brown_mushroom",
        "min": 0,
        "max": 1,
        "looting": true,
        "smelt": false
      },
      {
        "item": "minecraft:red_mushroom",
        "min": 0,
        "max": 1,
        "looting": true,
        "smelt": false
      }
    ]
  },
  {
    "id": "minecraft:camel",
    "nameZh": "骆驼",
    "nameEn": "Camel",
    "category": "friendly",
    "iconItem": "minecraft:camel_spawn_egg",
    "drops": [
      {
        "item": "minecraft:leather",
        "min": 1,
        "max": 2,
        "looting": true,
        "smelt": false
      }
    ]
  },
  {
    "id": "minecraft:chicken",
    "nameZh": "鸡",
    "nameEn": "Chicken",
    "category": "friendly",
    "iconItem": "minecraft:chicken_spawn_egg",
    "drops": [
      {
        "item": "minecraft:feather",
        "min": 0,
        "max": 2,
        "looting": true,
        "smelt": false
      },
      {
        "item": "minecraft:chicken",
        "min": 1,
        "max": 1,
        "looting": true,
        "smelt": true
      },
      {
        "item": "minecraft:egg",
        "min": 1,
        "max": 2,
        "looting": true,
        "smelt": false
      }
    ]
  },
  {
    "id": "minecraft:ender_dragon",
    "nameZh": "末影龙",
    "nameEn": "Ender Dragon",
    "category": "hostile",
    "iconItem": "minecraft:ender_dragon_spawn_egg",
    "drops": [
      {
        "item": "minecraft:elytra",
        "min": 1,
        "max": 1,
        "looting": false,
        "smelt": false
      },
      {
        "item": "minecraft:dragon_head",
        "min": 1,
        "max": 1,
        "looting": false,
        "smelt": false
      },
      {
        "item": "minecraft:dragon_egg",
        "min": 1,
        "max": 1,
        "looting": false,
        "smelt": false
      }
    ]
  },
  {
    "id": "minecraft:fox",
    "nameZh": "狐狸",
    "nameEn": "Fox",
    "category": "friendly",
    "iconItem": "minecraft:fox_spawn_egg",
    "drops": [
      {
        "item": "minecraft:sweet_berries",
        "min": 1,
        "max": 2,
        "looting": true,
        "smelt": false
      }
    ]
  },
  {
    "id": "minecraft:frog",
    "nameZh": "青蛙",
    "nameEn": "Frog",
    "category": "friendly",
    "iconItem": "minecraft:frog_spawn_egg",
    "drops": [
      {
        "item": "minecraft:frogspawn",
        "min": 1,
        "max": 1,
        "looting": false,
        "smelt": false
      }
    ]
  },
  {
    "id": "minecraft:goat",
    "nameZh": "山羊",
    "nameEn": "Goat",
    "category": "neutral",
    "iconItem": "minecraft:goat_spawn_egg",
    "drops": [
      {
        "item": "minecraft:goat_horn",
        "min": 1,
        "max": 2,
        "looting": false,
        "smelt": false
      },
      {
        "item": "minecraft:white_wool",
        "min": 1,
        "max": 2,
        "looting": true,
        "smelt": false
      },
      {
        "item": "minecraft:mutton",
        "min": 1,
        "max": 2,
        "looting": true,
        "smelt": true
      }
    ]
  },
  {
    "id": "minecraft:piglin",
    "nameZh": "猪灵",
    "nameEn": "Piglin",
    "category": "neutral",
    "iconItem": "minecraft:piglin_spawn_egg",
    "drops": [
      {
        "item": "minecraft:gold_ingot",
        "min": 1,
        "max": 3,
        "looting": true,
        "smelt": false
      }
    ]
  },
  {
    "id": "minecraft:piglin_brute",
    "nameZh": "猪灵蛮兵",
    "nameEn": "Piglin Brute",
    "category": "hostile",
    "iconItem": "minecraft:piglin_brute_spawn_egg",
    "drops": [
      {
        "item": "minecraft:netherite_ingot",
        "min": 1,
        "max": 3,
        "looting": true,
        "smelt": false
      }
    ]
  },
  {
    "id": "minecraft:polar_bear",
    "nameZh": "北极熊",
    "nameEn": "Polar Bear",
    "category": "neutral",
    "iconItem": "minecraft:polar_bear_spawn_egg",
    "drops": [
      {
        "item": "minecraft:leather",
        "min": 1,
        "max": 2,
        "looting": true,
        "smelt": false
      },
      {
        "item": "minecraft:cod",
        "min": 0,
        "max": 2,
        "looting": true,
        "smelt": true
      },
      {
        "item": "minecraft:salmon",
        "min": 0,
        "max": 2,
        "looting": true,
        "smelt": true
      }
    ]
  },
  {
    "id": "minecraft:turtle",
    "nameZh": "海龟",
    "nameEn": "Turtle",
    "category": "friendly",
    "iconItem": "minecraft:turtle_spawn_egg",
    "drops": [
      {
        "item": "minecraft:seagrass",
        "min": 0,
        "max": 2,
        "looting": true,
        "smelt": false
      },
      {
        "item": "minecraft:bowl",
        "min": 1,
        "max": 1,
        "looting": false,
        "smelt": false
      },
      {
        "item": "minecraft:turtle_scute",
        "min": 2,
        "max": 4,
        "looting": true,
        "smelt": false
      },
      {
        "item": "minecraft:turtle_egg",
        "min": 1,
        "max": 2,
        "looting": true,
        "smelt": false
      }
    ]
  },
  {
    "id": "minecraft:villager",
    "nameZh": "村民",
    "nameEn": "Villager",
    "category": "friendly",
    "iconItem": "minecraft:villager_spawn_egg",
    "drops": [
      {
        "item": "minecraft:emerald",
        "min": 1,
        "max": 3,
        "looting": true,
        "smelt": false
      }
    ]
  },
  {
    "id": "minecraft:wandering_trader",
    "nameZh": "流浪商人",
    "nameEn": "Wandering Trader",
    "category": "friendly",
    "iconItem": "minecraft:wandering_trader_spawn_egg",
    "drops": [
      {
        "item": "minecraft:emerald",
        "min": 1,
        "max": 3,
        "looting": true,
        "smelt": false
      }
    ]
  }
];

export const MOB_ADVANCEMENTS: AdvancementNode[] = [
  {
    "id": "better-mob-drop:better-mob-drop",
    "parent": "",
    "title": "Better Mob Drop",
    "description": "更好的生物掉落，掉落他们原本应该掉落的东西",
    "icon": "minecraft:iron_sword",
    "frame": "unknown",
    "hidden": false,
    "hasDisplay": true,
    "children": [
      {
        "id": "better-mob-drop:kill_axolotl",
        "parent": "better-mob-drop:better-mob-drop",
        "title": "繁茂洞穴里的住民",
        "description": "螈口夺食",
        "icon": "minecraft:tropical_fish",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": []
      },
      {
        "id": "better-mob-drop:kill_goat",
        "parent": "better-mob-drop:better-mob-drop",
        "title": "高山甄选",
        "description": "山中羊的山珍味道",
        "icon": "minecraft:mutton",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": []
      },
      {
        "id": "better-mob-drop:kill_turtle",
        "parent": "better-mob-drop:better-mob-drop",
        "title": "海龟帽的诞生",
        "description": "杀死一只无助的海龟",
        "icon": "minecraft:turtle_scute",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-mob-drop:kill_armadilo",
            "parent": "better-mob-drop:kill_turtle",
            "title": "狗铠的诞生",
            "description": "杀死一只路过的犰狳",
            "icon": "minecraft:armadillo_scute",
            "frame": "task",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          }
        ]
      },
      {
        "id": "better-mob-drop:kill_vilager",
        "parent": "better-mob-drop:better-mob-drop",
        "title": "奸商处罚",
        "description": "村民之死",
        "icon": "minecraft:emerald",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-mob-drop:kill_wandering_trader",
            "parent": "better-mob-drop:kill_vilager",
            "title": "流浪拴绳",
            "description": "旅途的终点...",
            "icon": "minecraft:lead",
            "frame": "task",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          }
        ]
      },
      {
        "id": "better-mob-drop:kill_allay",
        "parent": "better-mob-drop:better-mob-drop",
        "title": "你个魔鬼！",
        "description": "杀死一只友好的悦灵",
        "icon": "minecraft:amethyst_shard",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": []
      },
      {
        "id": "better-mob-drop:kill_fox",
        "parent": "better-mob-drop:better-mob-drop",
        "title": "破入Windows的Firefox",
        "description": "???",
        "icon": "minecraft:sweet_berries",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": []
      },
      {
        "id": "better-mob-drop:kill_chicken",
        "parent": "better-mob-drop:better-mob-drop",
        "title": "杀鸡取卵",
        "description": "这是否有价值？",
        "icon": "minecraft:egg",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-mob-drop:kill_frog",
            "parent": "better-mob-drop:kill_chicken",
            "title": "我劝你识相",
            "description": "蛙蛙犯了什么错？",
            "icon": "minecraft:frogspawn",
            "frame": "task",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          }
        ]
      },
      {
        "id": "better-mob-drop:kill_camel",
        "parent": "better-mob-drop:better-mob-drop",
        "title": "沙漠中商人的最爱",
        "description": "骆驼皮？！",
        "icon": "minecraft:cactus",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": []
      },
      {
        "id": "better-mob-drop:kill_ender_dragon",
        "parent": "better-mob-drop:better-mob-drop",
        "title": "胜利之首",
        "description": "勇士对恶龙实行的斩首",
        "icon": "minecraft:dragon_head",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": []
      },
      {
        "id": "better-mob-drop:kill_piglin",
        "parent": "better-mob-drop:better-mob-drop",
        "title": "下界奸商",
        "description": "成为摸金校尉",
        "icon": "minecraft:gold_ingot",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-mob-drop:kill_piglin_brute",
            "parent": "better-mob-drop:kill_piglin",
            "title": "决斗游戏",
            "description": "杀死堡垒遗迹中最强劲的斗士",
            "icon": "minecraft:netherite_ingot",
            "frame": "task",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          }
        ]
      },
      {
        "id": "better-mob-drop:kill_bee",
        "parent": "better-mob-drop:better-mob-drop",
        "title": "辛勤小蜜蜂",
        "description": "危险的抢劫",
        "icon": "minecraft:honeycomb",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-mob-drop:kill_bat",
            "parent": "better-mob-drop:kill_bee",
            "title": "我也不想在这里",
            "description": "杀死阴暗无人角落里的蝙蝠",
            "icon": "minecraft:phantom_membrane",
            "frame": "task",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          }
        ]
      },
      {
        "id": "better-mob-drop:kill_polar_bear",
        "parent": "better-mob-drop:better-mob-drop",
        "title": "熊皮大衣",
        "description": "北极的御寒神器",
        "icon": "minecraft:ice",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": []
      },
      {
        "id": "better-mob-drop:kill_bogged",
        "parent": "better-mob-drop:better-mob-drop",
        "title": "沼泽弓手",
        "description": "剧毒法师的死亡",
        "icon": "minecraft:red_mushroom",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": []
      }
    ]
  }
];

export const MOB_STATS = {
  "total": 18,
  "friendly": 11,
  "neutral": 4,
  "hostile": 3,
  "drops": 33,
  "advancements": 19
} as const;

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
