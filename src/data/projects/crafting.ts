/* 由 scripts/build-project-data.mjs 生成，请勿手动编辑。 */
import type { AdvancementNode, Recipe } from './types';

export const CRAFTING_RECIPES: Recipe[] = [
  {
    "id": "better-crafting-recipes:amethyst_shard",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:amethyst_shard",
      "count": 4
    },
    "ingredients": [
      {
        "items": [
          "minecraft:amethyst_block"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:black_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:black_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:black_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:blue_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:blue_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:blue_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:bone",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:bone",
      "count": 8
    },
    "ingredients": [
      {
        "items": [
          "minecraft:skeleton_skull"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:brewing_stand",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:brewing_stand",
      "count": 1
    },
    "pattern": [
      " X ",
      "###"
    ],
    "key": {
      "#": {
        "tag": "better-crafting-recipes:stone_resource_crafting",
        "items": [
          "minecraft:cobblestone",
          "minecraft:cobbled_deepslate",
          "minecraft:diorite",
          "minecraft:andesite",
          "minecraft:granite",
          "minecraft:calcite",
          "minecraft:tuff",
          "minecraft:basalt",
          "minecraft:blackstone",
          "minecraft:netherrack",
          "minecraft:end_stone"
        ],
        "label": "可合成石质工具的石材"
      },
      "X": {
        "items": [
          "minecraft:blaze_rod"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:brick",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:brick",
      "count": 4
    },
    "ingredient": {
      "items": [
        "minecraft:bricks"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:brown_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:brown_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:brown_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:budding_amethyst",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:budding_amethyst",
      "count": 1
    },
    "pattern": [
      " # ",
      "#X#",
      " # "
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:amethyst_shard"
        ],
        "label": ""
      },
      "X": {
        "items": [
          "minecraft:amethyst_block"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:chainmail_boots",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:chainmail_boots",
      "count": 1
    },
    "pattern": [
      "# #",
      "# #"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:iron_chain"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:chainmail_chestplate",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:chainmail_chestplate",
      "count": 1
    },
    "pattern": [
      "# #",
      "###",
      "###"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:iron_chain"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:chainmail_helmet",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:chainmail_helmet",
      "count": 1
    },
    "pattern": [
      "###",
      "# #"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:iron_chain"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:chainmail_leggings",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:chainmail_leggings",
      "count": 1
    },
    "pattern": [
      "###",
      "# #",
      "# #"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:iron_chain"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:clay",
    "kind": "smelting",
    "result": {
      "item": "minecraft:clay",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:mud"
      ],
      "label": ""
    },
    "experience": 1,
    "cookingTime": 100
  },
  {
    "id": "better-crafting-recipes:clay_ball",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:clay_ball",
      "count": 4
    },
    "ingredients": [
      {
        "items": [
          "minecraft:clay"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:coal_block",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:coal_block",
      "count": 1
    },
    "ingredients": [
      {
        "items": [
          "minecraft:charcoal"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:charcoal"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:charcoal"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:charcoal"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:charcoal"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:charcoal"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:charcoal"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:charcoal"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:charcoal"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:cobbled_deepslate",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:cobbled_deepslate",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:deepslate"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:cobblestone",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:cobblestone",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:stone"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:cobweb",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:cobweb",
      "count": 1
    },
    "ingredients": [
      {
        "items": [
          "minecraft:slime_ball"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:string"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:copper_ingot",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:copper_ingot",
      "count": 9
    },
    "ingredients": [
      {
        "items": [
          "minecraft:copper_block",
          "minecraft:exposed_copper",
          "minecraft:weathered_copper",
          "minecraft:oxidized_copper",
          "minecraft:cut_copper",
          "minecraft:exposed_cut_copper",
          "minecraft:weathered_cut_copper",
          "minecraft:oxidized_cut_copper",
          "minecraft:chiseled_copper",
          "minecraft:exposed_chiseled_copper",
          "minecraft:weathered_chiseled_copper",
          "minecraft:oxidized_chiseled_copper"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:creeper_head",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:creeper_head",
      "count": 1
    },
    "pattern": [
      "###",
      "#&#",
      "###"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:gunpowder"
        ],
        "label": ""
      },
      "&": {
        "items": [
          "minecraft:skeleton_skull"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:cyan_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:cyan_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:cyan_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:diamond_horse_armor",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:diamond_horse_armor",
      "count": 1
    },
    "pattern": [
      "  #",
      "#X#",
      "###"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:diamond"
        ],
        "label": ""
      },
      "X": {
        "items": [
          "minecraft:leather_horse_armor"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:dirt",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:dirt",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:coarse_dirt"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:dispenser",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:dispenser",
      "count": 1
    },
    "pattern": [
      "###",
      "#&#",
      "#X#"
    ],
    "key": {
      "#": {
        "tag": "better-crafting-recipes:stone_resource_crafting",
        "items": [
          "minecraft:cobblestone",
          "minecraft:cobbled_deepslate",
          "minecraft:diorite",
          "minecraft:andesite",
          "minecraft:granite",
          "minecraft:calcite",
          "minecraft:tuff",
          "minecraft:basalt",
          "minecraft:blackstone",
          "minecraft:netherrack",
          "minecraft:end_stone"
        ],
        "label": "可合成石质工具的石材"
      },
      "X": {
        "items": [
          "minecraft:redstone"
        ],
        "label": ""
      },
      "&": {
        "items": [
          "minecraft:bow"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:dropper",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:dropper",
      "count": 1
    },
    "pattern": [
      "###",
      "# #",
      "#X#"
    ],
    "key": {
      "#": {
        "tag": "better-crafting-recipes:stone_resource_crafting",
        "items": [
          "minecraft:cobblestone",
          "minecraft:cobbled_deepslate",
          "minecraft:diorite",
          "minecraft:andesite",
          "minecraft:granite",
          "minecraft:calcite",
          "minecraft:tuff",
          "minecraft:basalt",
          "minecraft:blackstone",
          "minecraft:netherrack",
          "minecraft:end_stone"
        ],
        "label": "可合成石质工具的石材"
      },
      "X": {
        "items": [
          "minecraft:redstone"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:echo_shard",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:echo_shard",
      "count": 4
    },
    "ingredients": [
      {
        "items": [
          "minecraft:sculk"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:enchanted_golden_apple",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:enchanted_golden_apple",
      "count": 1
    },
    "pattern": [
      "###",
      "#X#",
      "###"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:gold_block"
        ],
        "label": ""
      },
      "X": {
        "items": [
          "minecraft:apple"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:experience_bottle",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:experience_bottle",
      "count": 16
    },
    "pattern": [
      " # ",
      "#X#",
      " # "
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:lapis_lazuli"
        ],
        "label": ""
      },
      "X": {
        "items": [
          "minecraft:glass_bottle"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:flint",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:flint",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:gravel"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:furnace",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:furnace",
      "count": 1
    },
    "pattern": [
      "###",
      "# #",
      "###"
    ],
    "key": {
      "#": {
        "tag": "better-crafting-recipes:stone_resource_crafting",
        "items": [
          "minecraft:cobblestone",
          "minecraft:cobbled_deepslate",
          "minecraft:diorite",
          "minecraft:andesite",
          "minecraft:granite",
          "minecraft:calcite",
          "minecraft:tuff",
          "minecraft:basalt",
          "minecraft:blackstone",
          "minecraft:netherrack",
          "minecraft:end_stone"
        ],
        "label": "可合成石质工具的石材"
      }
    }
  },
  {
    "id": "better-crafting-recipes:glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:glowstone_dust",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:glowstone_dust",
      "count": 4
    },
    "ingredients": [
      {
        "items": [
          "minecraft:glowstone"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:golden_horse_armor",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:golden_horse_armor",
      "count": 1
    },
    "pattern": [
      "  #",
      "#X#",
      "###"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:gold_ingot"
        ],
        "label": ""
      },
      "X": {
        "items": [
          "minecraft:leather_horse_armor"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:gravel",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:gravel",
      "count": 1
    },
    "ingredient": {
      "tag": "better-crafting-recipes:stone_resource",
      "items": [
        "minecraft:stone",
        "minecraft:cobblestone",
        "minecraft:deepslate",
        "minecraft:cobbled_deepslate",
        "minecraft:diorite",
        "minecraft:andesite",
        "minecraft:granite",
        "minecraft:calcite",
        "minecraft:tuff",
        "minecraft:basalt",
        "minecraft:blackstone",
        "minecraft:netherrack",
        "minecraft:end_stone"
      ],
      "label": "石质方块"
    }
  },
  {
    "id": "better-crafting-recipes:gray_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:gray_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:gray_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:green_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:green_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:green_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:gunpowder",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:gunpowder",
      "count": 4
    },
    "ingredients": [
      {
        "items": [
          "minecraft:gravel"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:flint"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:coal"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:sugar"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:gunpowder2",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:gunpowder",
      "count": 4
    },
    "ingredients": [
      {
        "items": [
          "minecraft:gravel"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:flint"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:charcoal"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:sugar"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:heart_of_the_sea",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:heart_of_the_sea",
      "count": 1
    },
    "pattern": [
      "*#*",
      "#X#",
      "*#*"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:prismarine_crystals"
        ],
        "label": ""
      },
      "*": {
        "items": [
          "minecraft:prismarine_shard"
        ],
        "label": ""
      },
      "X": {
        "items": [
          "minecraft:diamond"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:iron_horse_armor",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:iron_horse_armor",
      "count": 1
    },
    "pattern": [
      "  #",
      "#X#",
      "###"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:iron_ingot"
        ],
        "label": ""
      },
      "X": {
        "items": [
          "minecraft:leather_horse_armor"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:lava_bucket",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:lava_bucket",
      "count": 1
    },
    "ingredients": [
      {
        "items": [
          "minecraft:bucket"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:magma_block"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:leather",
    "kind": "smelting",
    "result": {
      "item": "minecraft:leather",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:rotten_flesh"
      ],
      "label": ""
    },
    "experience": 1,
    "cookingTime": 100
  },
  {
    "id": "better-crafting-recipes:light",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:light",
      "count": 1
    },
    "pattern": [
      " # ",
      "#X#",
      " # "
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:glowstone_dust"
        ],
        "label": ""
      },
      "X": {
        "items": [
          "minecraft:glass"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:light_blue_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:light_blue_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:light_blue_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:light_gray_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:light_gray_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:light_gray_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:lime_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:lime_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:lime_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:magenta_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:magenta_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:magenta_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:magma_cream",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:magma_cream",
      "count": 4
    },
    "ingredients": [
      {
        "items": [
          "minecraft:magma_block"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:mud",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:mud",
      "count": 8
    },
    "ingredients": [
      {
        "items": [
          "minecraft:dirt"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:dirt"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:dirt"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:dirt"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:dirt"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:dirt"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:dirt"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:dirt"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:water_bucket"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:nether_brick",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:nether_brick",
      "count": 4
    },
    "ingredient": {
      "items": [
        "minecraft:nether_bricks"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:nether_wart",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:nether_wart",
      "count": 9
    },
    "ingredients": [
      {
        "items": [
          "minecraft:nether_wart_block"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:observer",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:observer",
      "count": 1
    },
    "pattern": [
      "###",
      "XX&",
      "###"
    ],
    "key": {
      "#": {
        "tag": "better-crafting-recipes:stone_resource_crafting",
        "items": [
          "minecraft:cobblestone",
          "minecraft:cobbled_deepslate",
          "minecraft:diorite",
          "minecraft:andesite",
          "minecraft:granite",
          "minecraft:calcite",
          "minecraft:tuff",
          "minecraft:basalt",
          "minecraft:blackstone",
          "minecraft:netherrack",
          "minecraft:end_stone"
        ],
        "label": "可合成石质工具的石材"
      },
      "X": {
        "items": [
          "minecraft:redstone"
        ],
        "label": ""
      },
      "&": {
        "items": [
          "minecraft:quartz"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:orange_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:orange_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:orange_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:petrified_oak_slab",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:petrified_oak_slab",
      "count": 2
    },
    "ingredients": [
      {
        "items": [
          "minecraft:oak_slab"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:stone_slab"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:piglin_head",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:piglin_head",
      "count": 1
    },
    "pattern": [
      "###",
      "#&#",
      "###"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:porkchop"
        ],
        "label": ""
      },
      "&": {
        "items": [
          "minecraft:skeleton_skull"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:pink_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:pink_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:pink_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:piston",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:piston",
      "count": 1
    },
    "pattern": [
      "&&&",
      "#*#",
      "#X#"
    ],
    "key": {
      "#": {
        "tag": "better-crafting-recipes:stone_resource_crafting",
        "items": [
          "minecraft:cobblestone",
          "minecraft:cobbled_deepslate",
          "minecraft:diorite",
          "minecraft:andesite",
          "minecraft:granite",
          "minecraft:calcite",
          "minecraft:tuff",
          "minecraft:basalt",
          "minecraft:blackstone",
          "minecraft:netherrack",
          "minecraft:end_stone"
        ],
        "label": "可合成石质工具的石材"
      },
      "X": {
        "items": [
          "minecraft:redstone"
        ],
        "label": ""
      },
      "&": {
        "tag": "minecraft:planks",
        "items": [
          "minecraft:oak_planks",
          "minecraft:spruce_planks",
          "minecraft:birch_planks",
          "minecraft:jungle_planks",
          "minecraft:acacia_planks",
          "minecraft:dark_oak_planks",
          "minecraft:mangrove_planks",
          "minecraft:cherry_planks",
          "minecraft:bamboo_planks",
          "minecraft:crimson_planks",
          "minecraft:warped_planks"
        ],
        "label": "木板（任意）"
      },
      "*": {
        "items": [
          "minecraft:iron_ingot"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:pointed_dripstone",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:pointed_dripstone",
      "count": 4
    },
    "ingredients": [
      {
        "items": [
          "minecraft:dripstone_block"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:powder_snow_bucket",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:powder_snow_bucket",
      "count": 1
    },
    "ingredients": [
      {
        "items": [
          "minecraft:snow_block"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:bucket"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:purple_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:purple_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:purple_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:quartz",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:quartz",
      "count": 4
    },
    "ingredients": [
      {
        "items": [
          "minecraft:quartz_block"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:rabbit_hide",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:rabbit_hide",
      "count": 4
    },
    "ingredients": [
      {
        "items": [
          "minecraft:leather"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:red_sand",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:red_sand",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:gravel"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:red_sand2",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:red_sand",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:terracotta"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:red_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:red_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:red_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:reinforced_deepslate",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:reinforced_deepslate",
      "count": 1
    },
    "pattern": [
      "#X#"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:bone"
        ],
        "label": ""
      },
      "X": {
        "items": [
          "minecraft:deepslate"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:sand",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:sand",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:gravel"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:sculk",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:sculk",
      "count": 1
    },
    "pattern": [
      "##",
      "##"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:echo_shard"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:sculk_catalyst",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:sculk_catalyst",
      "count": 2
    },
    "pattern": [
      "#",
      "X"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:sculk"
        ],
        "label": ""
      },
      "X": {
        "items": [
          "minecraft:bone_block"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:sculk_sensor",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:sculk_sensor",
      "count": 2
    },
    "pattern": [
      "##",
      "XX"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:echo_shard"
        ],
        "label": ""
      },
      "X": {
        "items": [
          "minecraft:sculk"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:sculk_shrieker",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:sculk_shrieker",
      "count": 2
    },
    "pattern": [
      "##",
      "XX"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:bone"
        ],
        "label": ""
      },
      "X": {
        "items": [
          "minecraft:sculk"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:sculk_vein",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:sculk_vein",
      "count": 3
    },
    "pattern": [
      "##"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:sculk"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:skeleton_skull",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:skeleton_skull",
      "count": 1
    },
    "pattern": [
      "###",
      "# #",
      "###"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:bone"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:skeleton_skull_smelt",
    "kind": "smelting",
    "result": {
      "item": "minecraft:skeleton_skull",
      "count": 1
    },
    "ingredient": {
      "tag": "better-crafting-recipes:skeleton_skull_smelt",
      "items": [
        "minecraft:zombie_head",
        "minecraft:wither_skeleton_skull",
        "minecraft:piglin_head"
      ],
      "label": "可熔炼为骷髅头的头颅"
    },
    "experience": 50,
    "cookingTime": 100
  },
  {
    "id": "better-crafting-recipes:stone_axe",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:stone_axe",
      "count": 1
    },
    "pattern": [
      "##",
      "#X",
      " X"
    ],
    "key": {
      "#": {
        "tag": "better-crafting-recipes:stone_resource_crafting",
        "items": [
          "minecraft:cobblestone",
          "minecraft:cobbled_deepslate",
          "minecraft:diorite",
          "minecraft:andesite",
          "minecraft:granite",
          "minecraft:calcite",
          "minecraft:tuff",
          "minecraft:basalt",
          "minecraft:blackstone",
          "minecraft:netherrack",
          "minecraft:end_stone"
        ],
        "label": "可合成石质工具的石材"
      },
      "X": {
        "items": [
          "minecraft:stick"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:stone_hoe",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:stone_hoe",
      "count": 1
    },
    "pattern": [
      "##",
      " X",
      " X"
    ],
    "key": {
      "#": {
        "tag": "better-crafting-recipes:stone_resource_crafting",
        "items": [
          "minecraft:cobblestone",
          "minecraft:cobbled_deepslate",
          "minecraft:diorite",
          "minecraft:andesite",
          "minecraft:granite",
          "minecraft:calcite",
          "minecraft:tuff",
          "minecraft:basalt",
          "minecraft:blackstone",
          "minecraft:netherrack",
          "minecraft:end_stone"
        ],
        "label": "可合成石质工具的石材"
      },
      "X": {
        "items": [
          "minecraft:stick"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:stone_pickaxe",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:stone_pickaxe",
      "count": 1
    },
    "pattern": [
      "###",
      " X ",
      " X "
    ],
    "key": {
      "#": {
        "tag": "better-crafting-recipes:stone_resource_crafting",
        "items": [
          "minecraft:cobblestone",
          "minecraft:cobbled_deepslate",
          "minecraft:diorite",
          "minecraft:andesite",
          "minecraft:granite",
          "minecraft:calcite",
          "minecraft:tuff",
          "minecraft:basalt",
          "minecraft:blackstone",
          "minecraft:netherrack",
          "minecraft:end_stone"
        ],
        "label": "可合成石质工具的石材"
      },
      "X": {
        "items": [
          "minecraft:stick"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:stone_shovel",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:stone_shovel",
      "count": 1
    },
    "pattern": [
      "#",
      "X",
      "X"
    ],
    "key": {
      "#": {
        "tag": "better-crafting-recipes:stone_resource_crafting",
        "items": [
          "minecraft:cobblestone",
          "minecraft:cobbled_deepslate",
          "minecraft:diorite",
          "minecraft:andesite",
          "minecraft:granite",
          "minecraft:calcite",
          "minecraft:tuff",
          "minecraft:basalt",
          "minecraft:blackstone",
          "minecraft:netherrack",
          "minecraft:end_stone"
        ],
        "label": "可合成石质工具的石材"
      },
      "X": {
        "items": [
          "minecraft:stick"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:stone_spear",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:stone_spear",
      "count": 1
    },
    "pattern": [
      "  #",
      " X ",
      "X  "
    ],
    "key": {
      "#": {
        "tag": "better-crafting-recipes:stone_resource_crafting",
        "items": [
          "minecraft:cobblestone",
          "minecraft:cobbled_deepslate",
          "minecraft:diorite",
          "minecraft:andesite",
          "minecraft:granite",
          "minecraft:calcite",
          "minecraft:tuff",
          "minecraft:basalt",
          "minecraft:blackstone",
          "minecraft:netherrack",
          "minecraft:end_stone"
        ],
        "label": "可合成石质工具的石材"
      },
      "X": {
        "items": [
          "minecraft:stick"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:stone_sword",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:stone_sword",
      "count": 1
    },
    "pattern": [
      "#",
      "#",
      "X"
    ],
    "key": {
      "#": {
        "tag": "better-crafting-recipes:stone_resource_crafting",
        "items": [
          "minecraft:cobblestone",
          "minecraft:cobbled_deepslate",
          "minecraft:diorite",
          "minecraft:andesite",
          "minecraft:granite",
          "minecraft:calcite",
          "minecraft:tuff",
          "minecraft:basalt",
          "minecraft:blackstone",
          "minecraft:netherrack",
          "minecraft:end_stone"
        ],
        "label": "可合成石质工具的石材"
      },
      "X": {
        "items": [
          "minecraft:stick"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:string",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:string",
      "count": 4
    },
    "ingredients": [
      {
        "items": [
          "minecraft:white_wool"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:stripped_acacia_log",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_acacia_log",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:acacia_log"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_acacia_wood",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_acacia_wood",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:acacia_wood"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_bamboo_block",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_bamboo_block",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:bamboo_block"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_birch_log",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_birch_log",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:birch_log"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_birch_wood",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_birch_wood",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:birch_wood"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_cherry_log",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_cherry_log",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:cherry_log"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_cherry_wood",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_cherry_wood",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:cherry_wood"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_crimson_hyphae",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_crimson_hyphae",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:crimson_hyphae"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_crimson_stem",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_crimson_stem",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:crimson_stem"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_dark_oak_log",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_dark_oak_log",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:dark_oak_log"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_dark_oak_wood",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_dark_oak_wood",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:dark_oak_wood"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_jungle_log",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_jungle_log",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:jungle_log"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_jungle_wood",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_jungle_wood",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:jungle_wood"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_mangrove_log",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_mangrove_log",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:mangrove_log"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_mangrove_wood",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_mangrove_wood",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:mangrove_wood"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_oak_log",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_oak_log",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:oak_log"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_oak_wood",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_oak_wood",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:oak_wood"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_spruce_log",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_spruce_log",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:spruce_log"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_spruce_wood",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_spruce_wood",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:spruce_wood"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_warped_hyphae",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_warped_hyphae",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:warped_hyphae"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:stripped_warped_stem",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:stripped_warped_stem",
      "count": 1
    },
    "ingredient": {
      "items": [
        "minecraft:warped_stem"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:sugar_1",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:sugar",
      "count": 1
    },
    "ingredients": [
      {
        "tag": "better-crafting-recipes:sugar_resource_1",
        "items": [
          "minecraft:apple",
          "minecraft:melon_slice",
          "minecraft:sweet_berries",
          "minecraft:glow_berries",
          "minecraft:beetroot_soup",
          "minecraft:sugar_cane"
        ],
        "label": "糖源（1 个糖）"
      }
    ]
  },
  {
    "id": "better-crafting-recipes:sugar_3",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:sugar",
      "count": 3
    },
    "ingredients": [
      {
        "tag": "better-crafting-recipes:sugar_resource_3",
        "items": [
          "minecraft:honey_bottle",
          "minecraft:cake",
          "minecraft:pumpkin_pie"
        ],
        "label": "糖源（3 个糖）"
      }
    ]
  },
  {
    "id": "better-crafting-recipes:totem_of_undying",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:totem_of_undying",
      "count": 1
    },
    "pattern": [
      "* *",
      "#X#",
      " * "
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:experience_bottle"
        ],
        "label": ""
      },
      "*": {
        "items": [
          "minecraft:gold_ingot"
        ],
        "label": ""
      },
      "X": {
        "items": [
          "minecraft:enchanted_golden_apple"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:trident",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:trident",
      "count": 1
    },
    "pattern": [
      "* *",
      "*X*",
      " * "
    ],
    "key": {
      "*": {
        "items": [
          "minecraft:diamond"
        ],
        "label": ""
      },
      "X": {
        "items": [
          "minecraft:heart_of_the_sea"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:water_bucket",
    "kind": "crafting_shapeless",
    "result": {
      "item": "minecraft:water_bucket",
      "count": 1
    },
    "ingredients": [
      {
        "items": [
          "minecraft:ice"
        ],
        "label": ""
      },
      {
        "items": [
          "minecraft:bucket"
        ],
        "label": ""
      }
    ]
  },
  {
    "id": "better-crafting-recipes:white_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:white_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:white_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:wither_skeleton_skull",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:wither_skeleton_skull",
      "count": 1
    },
    "pattern": [
      "###",
      "#&#",
      "###"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:coal"
        ],
        "label": ""
      },
      "&": {
        "items": [
          "minecraft:skeleton_skull"
        ],
        "label": ""
      }
    }
  },
  {
    "id": "better-crafting-recipes:yellow_stained_glass_pane",
    "kind": "stonecutting",
    "result": {
      "item": "minecraft:yellow_stained_glass_pane",
      "count": 3
    },
    "ingredient": {
      "items": [
        "minecraft:yellow_stained_glass"
      ],
      "label": ""
    }
  },
  {
    "id": "better-crafting-recipes:zombie_head",
    "kind": "crafting_shaped",
    "result": {
      "item": "minecraft:zombie_head",
      "count": 1
    },
    "pattern": [
      "###",
      "#&#",
      "###"
    ],
    "key": {
      "#": {
        "items": [
          "minecraft:rotten_flesh"
        ],
        "label": ""
      },
      "&": {
        "items": [
          "minecraft:skeleton_skull"
        ],
        "label": ""
      }
    }
  }
];

export const CRAFTING_ADVANCEMENTS: AdvancementNode[] = [
  {
    "id": "better-crafting-recipes:better-crafting-recipes",
    "parent": "",
    "title": "更好的合成配方",
    "description": "Minecraft补充！完全！探索更合理的配方吧！",
    "icon": "minecraft:bundle",
    "frame": "task",
    "hidden": false,
    "hasDisplay": true,
    "children": [
      {
        "id": "better-crafting-recipes:reuse",
        "parent": "better-crafting-recipes:better-crafting-recipes",
        "title": "废物利用",
        "description": "腐肉烧皮革，懂？",
        "icon": "minecraft:leather",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-crafting-recipes:leather_job",
            "parent": "better-crafting-recipes:reuse",
            "title": "皮革工艺",
            "description": "兔子皮制作皮革，皮革制作兔子皮...",
            "icon": "minecraft:rabbit_hide",
            "frame": "task",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          }
        ]
      },
      {
        "id": "better-crafting-recipes:light",
        "parent": "better-crafting-recipes:better-crafting-recipes",
        "title": "光芒四射",
        "description": "啊，我的眼睛！",
        "icon": "minecraft:light",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": []
      },
      {
        "id": "better-crafting-recipes:mutisugar",
        "parent": "better-crafting-recipes:better-crafting-recipes",
        "title": "果糖提取",
        "description": "果糖也是糖！还有那么多别的甜食，都是糖！",
        "icon": "minecraft:sugar",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-crafting-recipes:gunpowder",
            "parent": "better-crafting-recipes:mutisugar",
            "title": "火药制作",
            "description": "糖是易燃的，你知道嘛？",
            "icon": "minecraft:gunpowder",
            "frame": "task",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          }
        ]
      },
      {
        "id": "better-crafting-recipes:mud",
        "parent": "better-crafting-recipes:better-crafting-recipes",
        "title": "和泥巴",
        "description": "水多了，加点土；土多了，加点水",
        "icon": "minecraft:mud",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-crafting-recipes:clay",
            "parent": "better-crafting-recipes:mud",
            "title": "水的蒸发",
            "description": "水多了，蒸发点",
            "icon": "minecraft:clay",
            "frame": "task",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          }
        ]
      },
      {
        "id": "better-crafting-recipes:bucket_block",
        "parent": "better-crafting-recipes:better-crafting-recipes",
        "title": "块用桶装",
        "description": "把冰、岩浆块、雪塞到桶里",
        "icon": "minecraft:water_bucket",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": []
      },
      {
        "id": "better-crafting-recipes:strip_the_woods",
        "parent": "better-crafting-recipes:better-crafting-recipes",
        "title": "快速去皮",
        "description": "使用切石机快速去皮木材，或者应该叫切木机？",
        "icon": "minecraft:stripped_oak_wood",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-crafting-recipes:grine_to_gravel",
            "parent": "better-crafting-recipes:strip_the_woods",
            "title": "研磨成砾",
            "description": "使用切石机将石头研磨成沙砾，废石的最好去处",
            "icon": "minecraft:gravel",
            "frame": "task",
            "hidden": false,
            "hasDisplay": true,
            "children": [
              {
                "id": "better-crafting-recipes:cut_to_glasspane",
                "parent": "better-crafting-recipes:grine_to_gravel",
                "title": "玻璃切片",
                "description": "使用切石机将玻璃加工为玻璃板",
                "icon": "minecraft:glass_pane",
                "frame": "task",
                "hidden": false,
                "hasDisplay": true,
                "children": []
              },
              {
                "id": "better-crafting-recipes:grine_to_flint",
                "parent": "better-crafting-recipes:grine_to_gravel",
                "title": "机床切石",
                "description": "使用切石机从沙砾中筛出燧石，这是切石机干的活？",
                "icon": "minecraft:flint",
                "frame": "task",
                "hidden": false,
                "hasDisplay": true,
                "children": []
              },
              {
                "id": "better-crafting-recipes:cut_to_cobblestone",
                "parent": "better-crafting-recipes:grine_to_gravel",
                "title": "加工圆石",
                "description": "使用切石机将石头快速加工为圆石",
                "icon": "minecraft:cobblestone",
                "frame": "task",
                "hidden": false,
                "hasDisplay": true,
                "children": []
              },
              {
                "id": "better-crafting-recipes:grine_to_dirt",
                "parent": "better-crafting-recipes:grine_to_gravel",
                "title": "搅拌均匀",
                "description": "使用切石机将砂土均匀打散为泥土",
                "icon": "minecraft:dirt",
                "frame": "task",
                "hidden": false,
                "hasDisplay": true,
                "children": []
              },
              {
                "id": "better-crafting-recipes:grine_to_sand",
                "parent": "better-crafting-recipes:grine_to_gravel",
                "title": "精挑细筛",
                "description": "使用切石机从筛出沙子，全能切石机无疑了",
                "icon": "minecraft:sand",
                "frame": "task",
                "hidden": false,
                "hasDisplay": true,
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "better-crafting-recipes:stonemade_tools",
        "parent": "better-crafting-recipes:better-crafting-recipes",
        "title": "石质工具扩展",
        "description": "用各类石头制成工具，从此废石不再是废石。",
        "icon": "minecraft:stone_pickaxe",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-crafting-recipes:stonemade_blocks",
            "parent": "better-crafting-recipes:stonemade_tools",
            "title": "石质工作方块扩展",
            "description": "用各类石头制成工作方块。",
            "icon": "minecraft:furnace",
            "frame": "task",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          }
        ]
      },
      {
        "id": "better-crafting-recipes:skeleton_skull",
        "parent": "better-crafting-recipes:better-crafting-recipes",
        "title": "头颅骨",
        "description": "这是谁的颅骨？",
        "icon": "minecraft:skeleton_skull",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-crafting-recipes:wither_key",
            "parent": "better-crafting-recipes:skeleton_skull",
            "title": "恶魔钥匙",
            "description": "当潘多拉的魔盒可以被大规模制造时，世界会怎么样？",
            "icon": "minecraft:wither_skeleton_skull",
            "frame": "goal",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          },
          {
            "id": "better-crafting-recipes:head_head",
            "parent": "better-crafting-recipes:skeleton_skull",
            "title": "头头是道",
            "description": "首级仙人，就得有首级",
            "icon": "minecraft:creeper_head",
            "frame": "goal",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          }
        ]
      },
      {
        "id": "better-crafting-recipes:coal_block",
        "parent": "better-crafting-recipes:better-crafting-recipes",
        "title": "压缩能源",
        "description": "木炭集合体",
        "icon": "minecraft:coal_block",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": []
      },
      {
        "id": "better-crafting-recipes:string",
        "parent": "better-crafting-recipes:better-crafting-recipes",
        "title": "羊毛制线",
        "description": "羊毛本来就是纺织的材料，不是吗",
        "icon": "minecraft:string",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-crafting-recipes:cobweb",
            "parent": "better-crafting-recipes:string",
            "title": "黏线织网",
            "description": "网线具有黏性，使人难以逃脱",
            "icon": "minecraft:cobweb",
            "frame": "task",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          }
        ]
      },
      {
        "id": "better-crafting-recipes:make_chainmail_armor",
        "parent": "better-crafting-recipes:better-crafting-recipes",
        "title": "隐藏护甲",
        "description": "寻找未知护甲的秘密，并解锁隐藏的力量。",
        "icon": "minecraft:chainmail_chestplate",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-crafting-recipes:heart_of_the_sea",
            "parent": "better-crafting-recipes:make_chainmail_armor",
            "title": "海洋之力",
            "description": "统领海洋的力量",
            "icon": "minecraft:heart_of_the_sea",
            "frame": "goal",
            "hidden": false,
            "hasDisplay": true,
            "children": [
              {
                "id": "better-crafting-recipes:trident",
                "parent": "better-crafting-recipes:heart_of_the_sea",
                "title": "海王武器",
                "description": "海王的力量，未尝不可人造",
                "icon": "minecraft:trident",
                "frame": "challenge",
                "hidden": false,
                "hasDisplay": true,
                "children": []
              }
            ]
          },
          {
            "id": "better-crafting-recipes:make_horse_armor",
            "parent": "better-crafting-recipes:make_chainmail_armor",
            "title": "骑士护甲",
            "description": "锻造更好的马铠，然后准备为你的宝马装备它。",
            "icon": "minecraft:diamond_horse_armor",
            "frame": "task",
            "hidden": false,
            "hasDisplay": true,
            "children": [
              {
                "id": "better-crafting-recipes:make_saddle",
                "parent": "better-crafting-recipes:make_horse_armor",
                "title": "坐骑之始",
                "description": "准备好你的鞍，踏上世界征途",
                "icon": "minecraft:saddle",
                "frame": "task",
                "hidden": false,
                "hasDisplay": true,
                "children": []
              }
            ]
          },
          {
            "id": "better-crafting-recipes:enchanted_golden_apple",
            "parent": "better-crafting-recipes:make_chainmail_armor",
            "title": "至尊食物",
            "description": "老玩家会回忆的东西",
            "icon": "minecraft:enchanted_golden_apple",
            "frame": "challenge",
            "hidden": false,
            "hasDisplay": true,
            "children": [
              {
                "id": "better-crafting-recipes:experience_bottle",
                "parent": "better-crafting-recipes:enchanted_golden_apple",
                "title": "附魔力量",
                "description": "经验回收者",
                "icon": "minecraft:experience_bottle",
                "frame": "challenge",
                "hidden": false,
                "hasDisplay": true,
                "children": [
                  {
                    "id": "better-crafting-recipes:totem_of_undying",
                    "parent": "better-crafting-recipes:experience_bottle",
                    "title": "不死力量",
                    "description": "人造魔法",
                    "icon": "minecraft:totem_of_undying",
                    "frame": "challenge",
                    "hidden": false,
                    "hasDisplay": true,
                    "children": []
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "better-crafting-recipes:echo_shard",
        "parent": "better-crafting-recipes:better-crafting-recipes",
        "title": "幽匿碎片",
        "description": "通过幽匿块与回声碎片的分解，探寻洞穴深处的神秘",
        "icon": "minecraft:echo_shard",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-crafting-recipes:reinforced_deepslate",
            "parent": "better-crafting-recipes:echo_shard",
            "title": "坚固强化",
            "description": "用亡灵的骨头强化深板岩",
            "icon": "minecraft:reinforced_deepslate",
            "frame": "task",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          },
          {
            "id": "better-crafting-recipes:sculk_expand",
            "parent": "better-crafting-recipes:echo_shard",
            "title": "幽匿衍生",
            "description": "合成各类幽匿方块，就能掌握那种神秘力量？",
            "icon": "minecraft:sculk_catalyst",
            "frame": "challenge",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          }
        ]
      },
      {
        "id": "better-crafting-recipes:petrified_oak",
        "parent": "better-crafting-recipes:better-crafting-recipes",
        "title": "远古遗物",
        "description": "化石级遗物，石台阶和木台阶的结合体",
        "icon": "minecraft:petrified_oak_slab",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": []
      },
      {
        "id": "better-crafting-recipes:it_should_have_be",
        "parent": "better-crafting-recipes:better-crafting-recipes",
        "title": "早该如此",
        "description": "分解原本不可分解的方块，然后开始质问Mojang",
        "icon": "minecraft:amethyst_block",
        "frame": "task",
        "hidden": false,
        "hasDisplay": true,
        "children": [
          {
            "id": "better-crafting-recipes:break_it_down",
            "parent": "better-crafting-recipes:it_should_have_be",
            "title": "打破砖墙",
            "description": "拆东墙，补西墙",
            "icon": "minecraft:brick",
            "frame": "task",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          },
          {
            "id": "better-crafting-recipes:grow_amethyst",
            "parent": "better-crafting-recipes:it_should_have_be",
            "title": "生长吧！紫水晶!",
            "description": "制作紫水晶母岩，开始你的紫水晶农场",
            "icon": "minecraft:budding_amethyst",
            "frame": "goal",
            "hidden": false,
            "hasDisplay": true,
            "children": []
          }
        ]
      }
    ]
  }
];

export const CRAFTING_STATS = {
  "total": 111,
  "shaped": 37,
  "shapeless": 23,
  "stonecutting": 48,
  "smelting": 3,
  "advancements": 150,
  "displayedAdvancements": 39
} as const;

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
