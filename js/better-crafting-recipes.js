(function () {
    var recipeFiles = [
        "amethyst_shard.json",
        "black_stained_glass_pane.json",
        "blue_stained_glass_pane.json",
        "bone.json",
        "brewing_stand.json",
        "brick.json",
        "brown_stained_glass_pane.json",
        "budding_amethyst.json",
        "chainmail_boots.json",
        "chainmail_chestplate.json",
        "chainmail_helmet.json",
        "chainmail_leggings.json",
        "clay.json",
        "clay_ball.json",
        "coal_block.json",
        "cobbled_deepslate.json",
        "cobblestone.json",
        "cobweb.json",
        "creeper_head.json",
        "cyan_stained_glass_pane.json",
        "diamond_horse_armor.json",
        "dirt.json",
        "dispenser.json",
        "dropper.json",
        "echo_shard.json",
        "enchanted_golden_apple.json",
        "experience_bottle.json",
        "flint.json",
        "furnace.json",
        "glass_pane.json",
        "glowstone_dust.json",
        "golden_horse_armor.json",
        "gravel.json",
        "gray_stained_glass_pane.json",
        "green_stained_glass_pane.json",
        "gunpowder.json",
        "gunpowder2.json",
        "heart_of_the_sea.json",
        "iron_horse_armor.json",
        "lava_bucket.json",
        "leather.json",
        "light.json",
        "light_blue_stained_glass_pane.json",
        "light_gray_stained_glass_pane.json",
        "lime_stained_glass_pane.json",
        "magenta_stained_glass_pane.json",
        "magma_cream.json",
        "mud.json",
        "nether_brick.json",
        "nether_wart.json",
        "observer.json",
        "orange_stained_glass_pane.json",
        "petrified_oak_slab.json",
        "piglin_head.json",
        "pink_stained_glass_pane.json",
        "piston.json",
        "pointed_dripstone.json",
        "powder_snow_bucket.json",
        "purple_stained_glass_pane.json",
        "quartz.json",
        "rabbit_hide.json",
        "red_sand.json",
        "red_sand2.json",
        "red_stained_glass_pane.json",
        "reinforced_deepslate.json",
        "saddle.json",
        "sand.json",
        "sculk.json",
        "sculk_catalyst.json",
        "sculk_sensor.json",
        "sculk_shrieker.json",
        "sculk_vein.json",
        "skeleton_skull.json",
        "skeleton_skull_smelt.json",
        "stone_axe.json",
        "stone_hoe.json",
        "stone_pickaxe.json",
        "stone_shovel.json",
        "stone_sword.json",
        "string.json",
        "stripped_acacia_log.json",
        "stripped_acacia_wood.json",
        "stripped_bamboo_block.json",
        "stripped_birch_log.json",
        "stripped_birch_wood.json",
        "stripped_cherry_log.json",
        "stripped_cherry_wood.json",
        "stripped_crimson_hyphae.json",
        "stripped_crimson_stem.json",
        "stripped_dark_oak_log.json",
        "stripped_dark_oak_wood.json",
        "stripped_jungle_log.json",
        "stripped_jungle_wood.json",
        "stripped_mangrove_log.json",
        "stripped_mangrove_wood.json",
        "stripped_oak_log.json",
        "stripped_oak_wood.json",
        "stripped_spruce_log.json",
        "stripped_spruce_wood.json",
        "stripped_warped_hyphae.json",
        "stripped_warped_stem.json",
        "sugar_1.json",
        "sugar_3.json",
        "totem_of_undying.json",
        "trident.json",
        "water_bucket.json",
        "white_stained_glass_pane.json",
        "wither_skeleton_skull.json",
        "yellow_stained_glass_pane.json",
        "zombie_head.json"
    ];

    var advancementFiles = [
        "better-crafting-recipes.json",
        "break_it_down.json",
        "bucket_block.json",
        "clay.json",
        "coal_block.json",
        "cobweb.json",
        "cut_to_cobblestone.json",
        "cut_to_glasspane.json",
        "echo_shard.json",
        "enchanted_golden_apple.json",
        "experience_bottle.json",
        "grine_to_dirt.json",
        "grine_to_flint.json",
        "grine_to_gravel.json",
        "grine_to_sand.json",
        "grow_amethyst.json",
        "gunpowder.json",
        "head_head.json",
        "heart_of_the_sea.json",
        "it_should_have_be.json",
        "leather_job.json",
        "light.json",
        "make_chainmail_armor.json",
        "make_horse_armor.json",
        "make_saddle.json",
        "mud.json",
        "mutisugar.json",
        "petrified_oak.json",
        "recyle_skull.json",
        "reinforced_deepslate.json",
        "reuse.json",
        "sculk_expand.json",
        "skeleton_skull.json",
        "stonemade_blocks.json",
        "stonemade_tools.json",
        "string.json",
        "strip_the_woods.json",
        "totem_of_undying.json",
        "trident.json",
        "wither_key.json"
    ];

    var recipeBase = "/resource/minecraft/pack/better-crafting-recipes/data/better-crafting-recipes/recipe/";
    var advancementBase = "/resource/minecraft/pack/better-crafting-recipes/data/better-crafting-recipes/advancement/";
    var packBase = "/resource/minecraft/pack";
    var assetBase = "/resource/minecraft/assests/minecraft";
    var translationUrl = "/resource/minecraft/zh_ch.json";
    var translationFallbackUrl = assetBase + "/lang/en_us.json";
    var slotTexture = assetBase + "/textures/gui/sprites/container/slot.png";

    var stationMeta = {
        "minecraft:crafting_shaped": {
            label: "工作台",
            badge: "有序合成",
            blockTexture: assetBase + "/textures/block/crafting_table_front.png"
        },
        "minecraft:crafting_shapeless": {
            label: "工作台",
            badge: "无序合成",
            blockTexture: assetBase + "/textures/block/crafting_table_front.png"
        },
        "minecraft:stonecutting": {
            label: "切石机",
            badge: "单素材",
            blockTexture: assetBase + "/textures/block/stonecutter_top.png"
        },
        "minecraft:smelting": {
            label: "熔炉",
            badge: "熔炼",
            blockTexture: assetBase + "/textures/block/furnace_front.png"
        }
    };

    var state = {
        recipes: [],
        translations: {},
        tags: {},
        advancements: [],
        filter: "all",
        hashPending: true
    };
    var hasInitialized = false;
    var filtersBound = false;

    function fetchJson(url) {
        return fetch(url).then(function (resp) {
            if (!resp.ok) throw new Error("Failed to load " + url + " (" + resp.status + ")");
            return resp.json();
        });
    }

    function setStatus(text) {
        var status = document.getElementById("recipe-status");
        if (status) status.textContent = text;
    }

    function setRecipeProgress(text) {
        setStatus(text);
        var subtitle = document.getElementById("recipe-subtitle");
        if (subtitle) subtitle.textContent = text;
    }

    function loadTranslations() {
        return fetchJson(translationUrl).then(function (data) {
            state.translations = data || {};
            return state.translations;
        }).catch(function () {
            return fetchJson(translationFallbackUrl).then(function (data) {
                state.translations = data || {};
                return state.translations;
            }).catch(function () {
                state.translations = {};
                return state.translations;
            });
        });
    }

    function extractOption(value) {
        if (Array.isArray(value)) {
            return value.reduce(function (acc, cur) { return acc.concat(extractOption(cur)); }, []);
        }
        if (typeof value === "string") {
            var isTag = value.charAt(0) === "#";
            return [{ id: isTag ? value.slice(1) : value, isTag: isTag, raw: value }];
        }
        if (value && typeof value === "object" && value.item) {
            return [{ id: value.item, isTag: false, raw: value.item }];
        }
        return [];
    }

    function normalizeRequirement(value) {
        return { options: extractOption(value) };
    }

    function normalizeRecipe(raw, fileName) {
        var resultId = raw.result && raw.result.id ? raw.result.id : raw.result;
        if (typeof resultId === "string" && resultId.indexOf(":") === -1) {
            resultId = "minecraft:" + resultId;
        }

        var recipe = {
            file: fileName,
            type: raw.type,
            resultId: resultId,
            resultCount: raw.result && raw.result.count ? raw.result.count : 1,
            pattern: Array.isArray(raw.pattern) ? raw.pattern : [],
            key: {},
            shapeless: Array.isArray(raw.ingredients) ? raw.ingredients.map(normalizeRequirement) : [],
            single: raw.ingredient !== undefined ? normalizeRequirement(raw.ingredient) : null,
            experience: raw.experience,
            cookingtime: raw.cookingtime,
            category: raw.category
        };
        if (raw.key && typeof raw.key === "object") {
            Object.keys(raw.key).forEach(function (k) {
                recipe.key[k] = normalizeRequirement(raw.key[k]);
            });
        }
        return recipe;
    }

    function buildAdvRelations() {
        var map = {};
        var rootId = "better-crafting-recipes:better-crafting-recipes";
        var byResult = new Map();
        state.recipes.forEach(function (r) {
            if (!r || !r.resultId) return;
            if (!byResult.has(r.resultId)) byResult.set(r.resultId, []);
            byResult.get(r.resultId).push(r);
        });

        var ensureNs = function (id) {
            if (!id) return null;
            return id.indexOf(":") === -1 ? "minecraft:" + id : id;
        };

        // Manual mappings take precedence when matching recipes exist
        Object.keys(manualAdvRelations).forEach(function (advId) {
            var targets = manualAdvRelations[advId] || [];
            var seen = new Set();
            var rels = [];
            targets.forEach(function (tid) {
                var cid = ensureNs(tid);
                if (!cid || seen.has(cid)) return;
                if (byResult.has(cid)) {
                    seen.add(cid);
                    rels.push({ type: "recipe", id: cid });
                }
            });
            if (rels.length) map[advId] = rels;
        });

        state.advancements.forEach(function (adv) {
            if (!adv || adv.id === rootId) return;
            if (map[adv.id]) return; // keep manual mapping
            var candidates = [];
            var shortId = adv.id.split(":")[1] || adv.id;
            candidates.push(ensureNs(shortId));
            if (adv.iconId) candidates.push(ensureNs(adv.iconId));
            candidates = candidates.filter(Boolean);
            var matches = [];
            var seen = new Set();
            candidates.forEach(function (cid) {
                (byResult.get(cid) || []).forEach(function (r) {
                    if (!r || !r.resultId || seen.has(r.resultId)) return;
                    seen.add(r.resultId);
                    matches.push(r);
                });
            });
            if (matches.length) {
                map[adv.id] = matches.map(function (r) { return { type: "recipe", id: r.resultId }; });
            }
        });
        var defaultRecipes = state.recipes.slice(0, 3); // allow multiple fallbacks if available
        state.advancements.forEach(function (adv) {
            if (!adv || adv.id === rootId) return;
            if (!map[adv.id] && defaultRecipes.length) {
                map[adv.id] = defaultRecipes.map(function (r) { return { type: "recipe", id: r.resultId }; });
            }
        });
        advRelations = map;
    }

    function loadRecipes(onProgress) {
        var total = recipeFiles.length;
        var done = 0;
        return Promise.all(recipeFiles.map(function (name) {
            return fetchJson(recipeBase + name).then(function (data) {
                done += 1;
                if (typeof onProgress === "function") {
                    var pct = Math.floor((done / total) * 100);
                    onProgress(done, total, pct);
                }
                return normalizeRecipe(data, name);
            });
        }));
    }

    function normalizeAdvancement(raw, fileName) {
        var id = fileName.replace(/\.json$/i, "");
        var display = raw && raw.display ? raw.display : {};
        var iconId = display.icon && display.icon.id ? display.icon.id : null;
        return {
            id: "better-crafting-recipes:" + id,
            file: fileName,
            title: resolveText(display.title) || id,
            description: resolveText(display.description),
            iconId: iconId,
            frame: display.frame || "task",
            parent: raw && raw.parent ? raw.parent : null,
            background: display.background || null
        };
    }

    function loadAdvancements(onProgress) {
        var total = advancementFiles.length;
        var done = 0;
        return Promise.all(advancementFiles.map(function (name) {
            return fetchJson(advancementBase + name).then(function (data) {
                done += 1;
                if (typeof onProgress === "function") {
                    var pct = Math.floor((done / total) * 100);
                    onProgress(done, total, pct);
                }
                return normalizeAdvancement(data, name);
            }).catch(function () {
                done += 1;
                if (typeof onProgress === "function") {
                    var pct = Math.floor((done / total) * 100);
                    onProgress(done, total, pct);
                }
                return null;
            });
        })).then(function (list) {
            return list.filter(Boolean);
        });
    }

    function collectTags(recipes) {
        var tags = new Set();
        recipes.forEach(function (r) {
            Object.keys(r.key || {}).forEach(function (k) {
                (r.key[k].options || []).forEach(function (opt) {
                    if (opt.isTag) tags.add(opt.id);
                });
            });
            (r.shapeless || []).forEach(function (req) {
                (req.options || []).forEach(function (opt) { if (opt.isTag) tags.add(opt.id); });
            });
            if (r.single) {
                (r.single.options || []).forEach(function (opt) { if (opt.isTag) tags.add(opt.id); });
            }
        });
        return tags;
    }

    function tagUrl(tagId) {
        var ns = tagId.split(":")[0];
        var path = tagId.split(":")[1];
        return packBase + "/" + ns + "/data/" + ns + "/tags/item/" + path + ".json";
    }

    var tagFallbacks = {
        "minecraft:planks": [
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
        ]
    };

    function loadTag(tagId) {
        if (state.tags[tagId]) return Promise.resolve(state.tags[tagId]);
        return fetchJson(tagUrl(tagId)).then(function (data) {
            var values = data && Array.isArray(data.values) ? data.values : [];
            state.tags[tagId] = values;
            return values;
        }).catch(function () {
            if (tagFallbacks[tagId]) {
                state.tags[tagId] = tagFallbacks[tagId];
                return state.tags[tagId];
            }
            state.tags[tagId] = [];
            return [];
        });
    }

    function preloadTags(tagSet) {
        return Promise.all(Array.from(tagSet).map(loadTag));
    }

    function titleCase(text) {
        return text.split(/[_\s]+/).filter(Boolean).map(function (part) {
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join(" ");
    }

    var manualNames = {
        "minecraft:white_wool": "白色羊毛",
        "white_wool": "白色羊毛"
    };

    // Advancement → related targets (entity/recipe/enchant/dye)
    var advRelations = {};
    var manualAdvRelations = {
        "better-crafting-recipes:bucket_block": [
            "minecraft:water_bucket",
            "minecraft:powder_snow_bucket",
            "minecraft:lava_bucket"
        ],
        "better-crafting-recipes:break_it_down": [
            "minecraft:brick",
            "minecraft:nether_brick"
        ],
        "better-crafting-recipes:sculk_expand": [
            "minecraft:sculk_sensor",
            "minecraft:sculk_catalyst",
            "minecraft:sculk_shrieker",
            "minecraft:sculk_vein"
        ],
        "better-crafting-recipes:sculk": [
            "minecraft:sculk",
            "minecraft:echo_shard"
        ],
        "better-crafting-recipes:it_should_have_be": [
            "minecraft:amethyst_shard",
            "minecraft:quartz",
            "minecraft:nether_wart",
            "minecraft:magma_cream",
            "minecraft:pointed_dripstone"
        ],
        "better-crafting-recipes:make_chainmail_armor": [
            "minecraft:chainmail_helmet",
            "minecraft:chainmail_chestplate",
            "minecraft:chainmail_leggings",
            "minecraft:chainmail_boots"
        ],
        "better-crafting-recipes:make_horse_armor": [
            "minecraft:diamond_horse_armor",
            "minecraft:golden_horse_armor",
            "minecraft:iron_horse_armor"
        ],
        "better-crafting-recipes:mutisugar": [
            "minecraft:sugar"
        ],
        "better-crafting-recipes:gunpowder": [
            "minecraft:gunpowder"
        ],
        "better-crafting-recipes:head_head": [
            "minecraft:creeper_head",
            "minecraft:zombie_head",
            "minecraft:wither_skeleton_skull",
            "minecraft:piglin_head"
        ],
        "better-crafting-recipes:stonemade_tools": [
            "minecraft:stone_pickaxe",
            "minecraft:stone_shovel",
            "minecraft:stone_axe",
            "minecraft:stone_sword",
            "minecraft:stone_hoe"
        ],
        "better-crafting-recipes:stonemade_blocks": [
            "minecraft:furnace",
            "minecraft:brewing_stand",
            "minecraft:dispenser",
            "minecraft:dropper",
            "minecraft:observer",
            "minecraft:piston"
        ],
        "better-crafting-recipes:cut_to_cobblestone": [
            "minecraft:cobblestone",
            "minecraft:cobbled_deepslate"
        ],
        "better-crafting-recipes:strip_the_woods": [
            "minecraft:stripped_acacia_log",
            "minecraft:stripped_acacia_wood",
            "minecraft:stripped_bamboo_block",
            "minecraft:stripped_birch_log",
            "minecraft:stripped_birch_wood",
            "minecraft:stripped_cherry_log",
            "minecraft:stripped_cherry_wood",
            "minecraft:stripped_crimson_hyphae",
            "minecraft:stripped_crimson_stem",
            "minecraft:stripped_dark_oak_log",
            "minecraft:stripped_dark_oak_wood",
            "minecraft:stripped_jungle_log",
            "minecraft:stripped_jungle_wood",
            "minecraft:stripped_mangrove_log",
            "minecraft:stripped_mangrove_wood",
            "minecraft:stripped_oak_log",
            "minecraft:stripped_oak_wood",
            "minecraft:stripped_spruce_log",
            "minecraft:stripped_spruce_wood",
            "minecraft:stripped_warped_hyphae",
            "minecraft:stripped_warped_stem"
        ],
        "better-crafting-recipes:cut_to_glasspane": [
            "minecraft:glass_pane",
            "minecraft:black_stained_glass_pane",
            "minecraft:blue_stained_glass_pane",
            "minecraft:brown_stained_glass_pane",
            "minecraft:cyan_stained_glass_pane",
            "minecraft:gray_stained_glass_pane",
            "minecraft:green_stained_glass_pane",
            "minecraft:light_blue_stained_glass_pane",
            "minecraft:light_gray_stained_glass_pane",
            "minecraft:lime_stained_glass_pane",
            "minecraft:magenta_stained_glass_pane",
            "minecraft:orange_stained_glass_pane",
            "minecraft:pink_stained_glass_pane",
            "minecraft:purple_stained_glass_pane",
            "minecraft:red_stained_glass_pane",
            "minecraft:white_stained_glass_pane",
            "minecraft:yellow_stained_glass_pane"
        ],
        "better-crafting-recipes:grine_to_sand": [
            "minecraft:sand",
            "minecraft:red_sand"
        ]
    };

    function getName(id) {
        if (!id) return "";
        var parts = id.split(":");
        var ns = parts[0] || "minecraft";
        var name = parts[1] || parts[0];
        var keyItem = "item." + ns + "." + name;
        var keyBlock = "block." + ns + "." + name;
        if (manualNames[id]) return manualNames[id];
        if (manualNames[name]) return manualNames[name];
        if (state.translations[keyItem]) return state.translations[keyItem];
        if (state.translations[keyBlock]) return state.translations[keyBlock];
        return titleCase(name.replace(/_/g, " "));
    }

    function anchorId(prefix, id) {
        return prefix + "-" + (id || "").replace(/[^a-zA-Z0-9_-]/g, "-");
    }

    function scrollHighlight(targetId) {
        if (!targetId) return;
        var attempts = 0;
        var tryFind = function () {
            var target = document.getElementById(targetId);
            if (target) {
                target.classList.add("search-highlight");
                target.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
                setTimeout(function () { target.classList.remove("search-highlight"); }, 3600);
                return;
            }
            attempts += 1;
            if (attempts < 5) {
                setTimeout(tryFind, 120);
            } else {
                location.hash = "#" + targetId;
            }
        };
        tryFind();
    }

    function wikiUrl(id) {
        if (!id) return null;
        var name = getName(id) || id.split(":")[1] || id;
        return "https://zh.minecraft.wiki/w/" + encodeURIComponent(name);
    }

    function resolveText(value) {
        if (!value) return "";
        if (typeof value === "string") {
            return state.translations[value] || value;
        }
        if (typeof value === "object") {
            if (value.translate) {
                return state.translations[value.translate] || value.translate;
            }
            if (value.text) return value.text;
        }
        return "";
    }

    function buildAdvTreeData(advancements) {
        var map = new Map();
        advancements.forEach(function (adv) {
            map.set(adv.id, Object.assign({ children: [] }, adv));
        });
        map.forEach(function (adv) {
            if (adv.parent && map.has(adv.parent)) {
                map.get(adv.parent).children.push(adv);
            }
        });
        var roots = [];
        map.forEach(function (adv) {
            var isRoot = !adv.parent || !map.has(adv.parent);
            if (isRoot) roots.push(adv);
        });
        return roots;
    }

    var specialTextures = {
        "enchanted_golden_apple": [
            "https://zh.minecraft.wiki/images/Enchanted_Golden_Apple_JE2_BE2.gif",
            assetBase + "/textures/item/golden_apple.png",
            assetBase + "/textures/item/enchanted_golden_apple.png"
        ],
        "enchanting_table": [
            "https://zh.minecraft.wiki/images/Enchanting_Table.gif",
            assetBase + "/textures/block/enchanting_table_top.png",
            assetBase + "/textures/block/enchanting_table_side.png"
        ],
        "anvil": [
            "https://zh.minecraft.wiki/images/Anvil_JE3_BE3.png",
            assetBase + "/textures/block/anvil_top.png",
            assetBase + "/textures/block/anvil.png"
        ],
        "smithing_table": [
            "https://zh.minecraft.wiki/images/Smithing_Table_JE2_BE2.png",
            assetBase + "/textures/block/smithing_table_front.png",
            assetBase + "/textures/block/smithing_table_top.png",
            assetBase + "/textures/block/smithing_table_side.png"
        ],
        "shield": [
            "https://zh.minecraft.wiki/images/Shield_JE2_BE1.png",
            assetBase + "/textures/entity/shield_base.png",
            assetBase + "/textures/entity/shield.png",
            assetBase + "/textures/item/shield.png"
        ],
        "crossbow": [
            "https://zh.minecraft.wiki/images/Crossbow_JE1_BE1.png",
            assetBase + "/textures/item/crossbow.png"
        ],
        "magma_block": [
            assetBase + "/textures/block/magma.png"
        ],
        "stone_slab": [
            assetBase + "/textures/block/stone.png",
            assetBase + "/textures/block/stone_slab_side.png"
        ],
        "petrified_oak_slab": [
            assetBase + "/textures/block/oak_planks.png"
        ],
        "crimson_hyphae": [
            assetBase + "/textures/block/crimson_stem.png",
            assetBase + "/textures/block/crimson_stem_top.png"
        ],
        "warped_hyphae": [
            assetBase + "/textures/block/warped_stem.png",
            assetBase + "/textures/block/warped_stem_top.png"
        ],
        "stripped_crimson_hyphae": [
            assetBase + "/textures/block/stripped_crimson_stem.png",
            assetBase + "/textures/block/stripped_crimson_stem_top.png"
        ],
        "stripped_warped_hyphae": [
            assetBase + "/textures/block/stripped_warped_stem.png",
            assetBase + "/textures/block/stripped_warped_stem_top.png"
        ],
        "leather_horse_armor": [
            "https://zh.minecraft.wiki/images/Invicon_Leather_Horse_Armor.png",
            assetBase + "/textures/item/leather_horse_armor.png",
            assetBase + "/textures/item/horse_armor_leather.png",
            assetBase + "/textures/entity/horse/armor/horse_armor_leather.png",
            assetBase + "/textures/gui/sprites/container/slot/horse_armor.png",
            assetBase + "/textures/item/saddle.png"
        ],
        "oak_slab": [
            assetBase + "/textures/item/oak_slab.png",
            assetBase + "/textures/block/oak_planks.png",
            assetBase + "/textures/block/oak_slab_top.png",
            assetBase + "/textures/block/oak_slab_side.png"
        ],
        "snow_block": [
            assetBase + "/textures/block/snow.png",
            assetBase + "/textures/item/snowball.png"
        ],
        "piglin_head": [
            assetBase + "/textures/item/piglin_head.png"
        ],
        "skeleton_skull": [
            assetBase + "/textures/item/skeleton_skull.png"
        ],
        "wither_skeleton_skull": [
            "https://zh.minecraft.wiki/images/Wither_Skeleton_Skull_JE2_BE2.png",
            assetBase + "/textures/item/wither_skeleton_skull.png"
        ],
        "zombie_head": [
            "https://zh.minecraft.wiki/images/Zombie_Head_JE2_BE2.png",
            assetBase + "/textures/item/zombie_head.png"
        ],
        "creeper_head": [
            "https://zh.minecraft.wiki/images/Creeper_Head_JE1_BE1.png",
            assetBase + "/textures/item/creeper_head.png"
        ],
        "player_head": [
            assetBase + "/textures/item/player_head.png"
        ],
        "dragon_head": [
            assetBase + "/textures/item/dragon_head.png"
        ],
        "skeleton_skull": [
            "https://zh.minecraft.wiki/images/Skeleton_Skull_JE2_BE2.png",
            assetBase + "/textures/item/skeleton_skull.png"
        ],
        "piglin_head": [
            "https://zh.minecraft.wiki/images/Piglin_Head_JE1_BE1.png",
            assetBase + "/textures/item/piglin_head.png"
        ]
    };

    var customTextureMap = {};
    Object.keys(specialTextures).forEach(function (key) {
        customTextureMap[key] = specialTextures[key];
        customTextureMap["minecraft:" + key] = specialTextures[key];
    });

    function textureCandidates(name) {
        // Exact overrides for tricky assets
        if (specialTextures[name]) {
            return specialTextures[name].slice();
        }

        var bases = [name];
        // For panes, also try suffixes commonly used by MC assets
        if (name.indexOf("pane") !== -1) {
            bases.push(name.replace(/pane$/, "pane_side"));
            bases.push(name.replace(/pane$/, "pane_top"));
            bases.push(name + "_side");
            bases.push(name + "_top");
        }

        // Wood variants: try mapping *_wood -> *_log for textures
        if (name.endsWith("_wood")) {
            bases.push(name.replace(/_wood$/, "_log"));
        }
        if (name.indexOf("stripped_") === 0 && name.endsWith("_wood")) {
            bases.push(name.replace(/_wood$/, "_log"));
        }

        // Snow block alias
        if (name === "snow_block") {
            bases.push("snow");
        }

        var list = [];
        bases.forEach(function (n) {
            [
                assetBase + "/textures/item/" + n + ".png",
                assetBase + "/textures/block/" + n + ".png",
                assetBase + "/textures/block/" + n + "_front.png",
                assetBase + "/textures/block/" + n + "_side.png",
                assetBase + "/textures/block/" + n + "_top.png",
                assetBase + "/textures/block/" + n + "_bottom.png",
                assetBase + "/textures/block/" + n + "_end.png"
            ].forEach(function (p) { if (list.indexOf(p) === -1) list.push(p); });
        });
        return list;
    }

    function optionLabel(option) {
        if (option.isTag) {
            var values = state.tags[option.id] || [];
            if (values.length) {
                var full = values.map(getName).join(" · ");
                return "标签 " + option.id + " (" + full + ")";
            }
            return "标签 " + option.id;
        }
        return getName(option.id);
    }

    function optionIds(option) {
        if (!option) return [];
        if (option.isTag) {
            var values = state.tags[option.id] || [];
            return values.length ? values.slice() : [option.id];
        }
        return [option.id];
    }

    function requirementKey(req) {
        return (req.options || []).map(function (opt) { return opt.raw; }).sort().join("|");
    }

    function materialsForRecipe(recipe) {
        if (recipe.type === "minecraft:crafting_shaped") {
            var counts = {};
            recipe.pattern.forEach(function (row) {
                for (var i = 0; i < row.length; i++) {
                    var ch = row[i];
                    if (!ch || ch === " ") continue;
                    counts[ch] = (counts[ch] || 0) + 1;
                }
            });
            return Object.keys(counts).map(function (ch) {
                return { count: counts[ch], requirement: recipe.key[ch] || { options: [] } };
            });
        }
        if (recipe.type === "minecraft:crafting_shapeless") {
            var map = new Map();
            recipe.shapeless.forEach(function (req) {
                var key = requirementKey(req);
                var entry = map.get(key);
                if (!entry) {
                    entry = { count: 0, requirement: req };
                    map.set(key, entry);
                }
                entry.count += 1;
            });
            return Array.from(map.values());
        }
        if (recipe.type === "minecraft:stonecutting" || recipe.type === "minecraft:smelting") {
            return recipe.single ? [{ count: 1, requirement: recipe.single }] : [];
        }
        return [];
    }

    function primaryOption(req) {
        var options = req && req.options ? req.options : [];
        if (!options.length) return null;
        var nonTag = options.find(function (o) { return !o.isTag; });
        if (nonTag) return nonTag;
        var tagOpt = options.find(function (o) { return o.isTag; });
        if (tagOpt) {
            var values = state.tags[tagOpt.id] || [];
            if (values.length) {
                return { id: values[0], isTag: false, raw: values[0] };
            }
            return tagOpt;
        }
        return options[0];
    }

    function altCount(req) {
        var options = req && req.options ? req.options : [];
        var count = 0;
        options.forEach(function (opt) {
            if (opt.isTag) {
                var values = state.tags[opt.id] || [];
                count += values.length ? values.length : 1;
            } else {
                count += 1;
            }
        });
        return Math.max(count, options.length);
    }

    function createSlot(req, count, opts) {
        opts = opts || {};
        var bgTexture = opts.slotTexture || slotTexture;
        var hasOptions = req && Array.isArray(req.options) && req.options.length;
        if (!hasOptions) {
            var empty = document.createElement("div");
            empty.className = "mc-slot slot-empty";
            empty.style.backgroundImage = "url('" + bgTexture + "')";
            if (opts.isResult) empty.classList.add("result-slot");
            return empty;
        }

        var primary = primaryOption(req);
        var primaryId = primary ? primary.id : null;
        var slot = null;
        if (window.ItemSlot && typeof window.ItemSlot.createSlot === "function") {
            slot = ItemSlot.createSlot(primaryId || "minecraft:barrier", {
                translations: state.translations,
                assetBase: assetBase,
                slotTexture: bgTexture,
                customTextures: customTextureMap
            });
        }
        if (!slot) {
            slot = document.createElement("div");
            slot.className = "mc-slot";
            slot.style.backgroundImage = "url('" + bgTexture + "')";
            var img = document.createElement("img");
            img.src = assetBase + "/textures/item/barrier.png";
            img.alt = primaryId || "";
            img.loading = "lazy";
            img.decoding = "async";
            slot.appendChild(img);
        }
        if (opts.isResult) slot.classList.add("result-slot");

        var names = (req.options || []).map(optionLabel).join(" / ");
        var wikiHref = window.ItemSlot && typeof ItemSlot.wikiUrl === "function" ? ItemSlot.wikiUrl(primaryId, state.translations) : wikiUrl(primaryId);
        if (names) {
            var imgEl = slot.querySelector("img");
            if (imgEl) imgEl.alt = names;
            slot.title = wikiHref ? names + "（点击打开 Wiki）" : names;
        }
        var showCount = typeof count === "number" && count > 1;
        if (showCount) {
            var badge = document.createElement("span");
            badge.className = "slot-count";
            badge.textContent = count;
            slot.appendChild(badge);
        }
        var alts = altCount(req);
        if (alts > 1) {
            var altBadge = document.createElement("span");
            altBadge.className = "slot-alt";
            altBadge.textContent = "+" + (alts - 1);
            slot.appendChild(altBadge);
        }
        if (wikiHref && slot && !slot.classList.contains("slot-link")) {
            slot.classList.add("slot-link");
            slot.setAttribute("role", "link");
            slot.tabIndex = 0;
            slot.dataset.wikiHref = wikiHref;
            var openWiki = function () {
                var href = slot.dataset.wikiHref || wikiHref;
                if (href) window.open(href, "_blank", "noopener");
            };
            slot.addEventListener("click", openWiki);
            slot.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openWiki();
                }
            });
        }

        // If the requirement is a tag or has multiple options, rotate displayed item every 2s
        var variantIds = [];
        var hasTagOption = false;
        (req.options || []).forEach(function (opt) {
            if (opt.isTag) {
                hasTagOption = true;
                var values = state.tags[opt.id] || [];
                variantIds = variantIds.concat(values);
            } else if (opt.id) {
                variantIds.push(opt.id);
            }
        });
        variantIds = variantIds.filter(Boolean);

        var rotationStarted = false;
        function startRotation(ids) {
            if (!ids || ids.length < 2 || rotationStarted) return;
            rotationStarted = true;
            var imgEl = slot.querySelector("img");
            var idx = 0;
            setInterval(function () {
                idx = (idx + 1) % ids.length;
                var nextId = ids[idx];
                var textures = (window.ItemSlot && typeof ItemSlot.pickTextures === "function")
                    ? ItemSlot.pickTextures(nextId, { assetBase: assetBase, customTextures: customTextureMap })
                    : [assetBase + "/textures/item/barrier.png"];
                var texIdx = 0;
                if (imgEl && textures.length) {
                    imgEl.onerror = function () {
                        texIdx += 1;
                        if (texIdx < textures.length) {
                            imgEl.src = textures[texIdx];
                        } else {
                            imgEl.onerror = null;
                        }
                    };
                    imgEl.src = textures[0];
                }
                var nextName = getName(nextId);
                if (imgEl) imgEl.alt = nextName;
                var nextHref = (window.ItemSlot && typeof ItemSlot.wikiUrl === "function") ? ItemSlot.wikiUrl(nextId, state.translations) : wikiUrl(nextId);
                if (slot) {
                    slot.title = nextHref ? nextName + "（点击打开 Wiki）" : nextName;
                    slot.dataset.wikiHref = nextHref || "";
                }
            }, 5000);
        }

        if (variantIds.length > 1) {
            startRotation(variantIds);
        } else if (!rotationStarted && hasTagOption) {
            // If tag values were not ready yet, load and then rotate once available
            (req.options || []).forEach(function (opt) {
                if (!opt.isTag) return;
                loadTag(opt.id).then(function (vals) {
                    if (vals && vals.length > 1) {
                        startRotation(vals.filter(Boolean));
                    }
                });
            });
        }
        return slot;
    }

    function arrow(label) {
        var el = document.createElement("div");
        el.className = "mc-arrow";
        el.setAttribute("aria-hidden", "true");
        el.textContent = label || "→";
        return el;
    }

    function renderShaped(recipe) {
        var wrap = document.createElement("div");
        wrap.className = "recipe-grid-display shaped";
        var grid = document.createElement("div");
        grid.className = "mc-grid";
        for (var i = 0; i < 9; i++) {
            var y = Math.floor(i / 3);
            var x = i % 3;
            var row = recipe.pattern[y] || "";
            var ch = row[x] || " ";
            var req = ch && ch !== " " ? recipe.key[ch] : null;
            grid.appendChild(createSlot(req, 1));
        }
        wrap.appendChild(grid);
        wrap.appendChild(arrow());
        wrap.appendChild(createSlot({ options: [{ id: recipe.resultId, isTag: false, raw: recipe.resultId }] }, recipe.resultCount, { isResult: true }));
        return wrap;
    }

    function renderShapeless(recipe) {
        var wrap = document.createElement("div");
        wrap.className = "recipe-grid-display shapeless";
        var grid = document.createElement("div");
        grid.className = "mc-grid shapeless-grid";
        for (var i = 0; i < 9; i++) {
            var req = recipe.shapeless[i] || null;
            grid.appendChild(createSlot(req, 1));
        }
        wrap.appendChild(grid);
        wrap.appendChild(arrow());
        wrap.appendChild(createSlot({ options: [{ id: recipe.resultId, isTag: false, raw: recipe.resultId }] }, recipe.resultCount, { isResult: true }));
        return wrap;
    }

    function renderStonecutting(recipe) {
        var wrap = document.createElement("div");
        wrap.className = "recipe-grid-display stonecutting";
        wrap.appendChild(createSlot(recipe.single, 1));
        wrap.appendChild(arrow());
        wrap.appendChild(createSlot({ options: [{ id: recipe.resultId, isTag: false, raw: recipe.resultId }] }, recipe.resultCount, { isResult: true }));
        return wrap;
    }

    function renderSmelting(recipe) {
        var wrap = document.createElement("div");
        wrap.className = "recipe-grid-display smelting";
        wrap.appendChild(createSlot(recipe.single, 1));
        var arr = arrow("→");
        arr.classList.add("smelting-arrow");
        wrap.appendChild(arr);
        wrap.appendChild(createSlot({ options: [{ id: recipe.resultId, isTag: false, raw: recipe.resultId }] }, recipe.resultCount, { isResult: true }));
        return wrap;
    }

    function renderMaterials(materials) {
        var list = document.createElement("ul");
        list.className = "recipe-materials";
        materials.forEach(function (entry) {
            var li = document.createElement("li");
            var chips = document.createElement("div");
            chips.className = "ench-item-chips";
            if (entry.count > 1) {
                var cnt = document.createElement("span");
                cnt.className = "material-count";
                cnt.textContent = "数量 × " + entry.count;
                chips.appendChild(cnt);
            }
            var opts = (entry.requirement && entry.requirement.options) ? entry.requirement.options : [];
            var ids = [];
            opts.forEach(function (opt) { ids = ids.concat(optionIds(opt)); });
            ids = Array.from(new Set(ids));
            ids.forEach(function (id, idx) {
                var chip = document.createElement("div");
                chip.className = "ench-item-chip";
                var slot = createSlot({ options: [{ id: id, isTag: false, raw: id }] }, 1);
                slot.classList.add("ench-item-chip-slot");
                var name = document.createElement("span");
                name.textContent = getName(id);
                chip.appendChild(slot);
                chip.appendChild(name);
                chips.appendChild(chip);
                if (idx !== ids.length - 1) {
                    var sep = document.createElement("span");
                    sep.className = "ench-item-chip-sep";
                    sep.textContent = "或";
                    chips.appendChild(sep);
                }
            });
            li.appendChild(chips);
            list.appendChild(li);
        });
        return list;
    }

    function frameMeta(frame) {
        var f = frame || "task";
        if (f === "challenge") return {
            cls: "adv-frame adv-frame-challenge",
            iconClass: "icon-ic_fluent_trophy_20_regular",
            text: "挑战",
            slotTexture: assetBase + "/textures/gui/sprites/advancements/challenge_frame_unobtained.png"
        };
        if (f === "goal") return {
            cls: "adv-frame adv-frame-goal",
            iconClass: "icon-ic_fluent_target_20_regular",
            text: "目标",
            slotTexture: assetBase + "/textures/gui/sprites/advancements/goal_frame_unobtained.png"
        };
        return {
            cls: "adv-frame adv-frame-task",
            iconClass: "icon-ic_fluent_task_list_add_20_regular",
            text: "进度",
            slotTexture: assetBase + "/textures/gui/sprites/advancements/task_frame_unobtained.png"
        };
    }

    function renderRelations(advId) {
        var rels = advRelations[advId] || [];
        if (!rels.length) return null;

        var wrap = document.createElement("div");
        wrap.className = "adv-relations";
        var label = document.createElement("span");
        label.className = "adv-rel-label";
        label.textContent = "相关内容";
        wrap.appendChild(label);

        var chips = document.createElement("div");
        chips.className = "ench-item-chips adv-rel-chips";

        rels.forEach(function (rel) {
            var chip = document.createElement("div");
            chip.className = "ench-item-chip adv-rel-chip";
            var slot = createSlot({ options: [{ id: rel.id, isTag: false, raw: rel.id }] }, 1);
            slot.classList.add("ench-item-chip-slot");
            chip.appendChild(slot);
            var name = document.createElement("span");
            name.textContent = getName(rel.id);
            chip.appendChild(name);

            var targetId = null;
            if (rel.type === "recipe") targetId = anchorId("recipe", rel.id);
            if (rel.type === "entity") targetId = anchorId("mobcard", rel.id);
            if (rel.type === "enchant") targetId = anchorId("enchant", rel.id);
            if (rel.type === "dye") targetId = anchorId("dye", rel.id);
            if (targetId) {
                chip.addEventListener("click", function () { scrollHighlight(targetId); });
            }
            chips.appendChild(chip);
        });

        wrap.appendChild(chips);
        return wrap;
    }

    function renderAdvancementCard(adv) {
        var card = document.createElement("article");
        card.className = "adv-card";
        var frameInfo = frameMeta(adv.frame);
        var iconSlot = createSlot({ options: [{ id: adv.iconId || "minecraft:barrier", isTag: false, raw: adv.iconId || "minecraft:barrier" }] }, 1, { slotTexture: frameInfo.slotTexture });
        iconSlot.classList.add("adv-icon-slot");
        card.appendChild(iconSlot);

        var body = document.createElement("div");
        body.className = "adv-body";
        var title = document.createElement("h3");
        title.className = "adv-title";
        title.textContent = adv.title || adv.id;
        body.appendChild(title);
        if (adv.description) {
            var desc = document.createElement("p");
            desc.className = "adv-desc";
            desc.textContent = adv.description;
            body.appendChild(desc);
        }
        var meta = document.createElement("div");
        meta.className = "adv-meta";
        var frameInfo = frameMeta(adv.frame);
        var frame = document.createElement("span");
        frame.className = frameInfo.cls;
        var icon = document.createElement("span");
        icon.className = "adv-frame-icon fluent-font " + frameInfo.iconClass;
        icon.setAttribute("aria-hidden", "true");
        frame.appendChild(icon);
        frame.appendChild(document.createTextNode(frameInfo.text));
        meta.appendChild(frame);
        if (adv.parent) {
            var parent = document.createElement("span");
            parent.className = "adv-parent";
            parent.textContent = "父进度: " + adv.parent;
            meta.appendChild(parent);
        }
        body.appendChild(meta);

        var advRelationsNode = renderRelations(adv.id);
        if (advRelationsNode) body.appendChild(advRelationsNode);

        card.appendChild(body);
        return card;
    }

    function renderAdvTreeNode(node) {
        var li = document.createElement("li");
        li.className = "adv-tree-node";

        var row = document.createElement("div");
        row.className = "adv-tree-row";
        var frameInfo = frameMeta(node.frame);
        var iconSlot = createSlot({ options: [{ id: node.iconId || "minecraft:barrier", isTag: false, raw: node.iconId || "minecraft:barrier" }] }, 1, { slotTexture: frameInfo.slotTexture });
        iconSlot.classList.add("adv-icon-slot");
        row.appendChild(iconSlot);

        var info = document.createElement("div");
        info.className = "adv-tree-info";
        var title = document.createElement("span");
        title.className = "adv-tree-title";
        title.textContent = node.title || node.id;
        info.appendChild(title);
        if (node.description) {
            var desc = document.createElement("span");
            desc.className = "adv-tree-desc";
            desc.textContent = node.description;
            info.appendChild(desc);
        }
        var frameInfo = frameMeta(node.frame);
        var frame = document.createElement("span");
        frame.className = frameInfo.cls;
        var icon = document.createElement("span");
        icon.className = "adv-frame-icon fluent-font " + frameInfo.iconClass;
        icon.setAttribute("aria-hidden", "true");
        frame.appendChild(icon);
        frame.appendChild(document.createTextNode(frameInfo.text));
        info.appendChild(frame);
        var relations = renderRelations(node.id);
        if (relations) info.appendChild(relations);
        row.appendChild(info);
        li.appendChild(row);

        if (node.children && node.children.length) {
            var ul = document.createElement("ul");
            ul.className = "adv-tree-children";
            node.children.forEach(function (child) {
                ul.appendChild(renderAdvTreeNode(child));
            });
            li.appendChild(ul);
        }
        return li;
    }

    function renderAdvancements() {
        var status = document.getElementById("advancement-status");
        var treeHost = document.getElementById("advancement-tree");
        if (treeHost) {
            treeHost.innerHTML = "";
            if (!state.advancements.length) {
                var t = document.createElement("p");
                t.className = "recipe-empty";
                t.textContent = "没有可显示的进度";
                treeHost.appendChild(t);
            } else {
                var roots = buildAdvTreeData(state.advancements);
                var tree = document.createElement("ul");
                tree.className = "adv-tree";
                roots.forEach(function (root) {
                    tree.appendChild(renderAdvTreeNode(root));
                });
                treeHost.appendChild(tree);
            }
        }
        if (status) status.textContent = state.advancements.length ? ("共 " + state.advancements.length + " 个进度") : "未找到进度";
        tryScrollToHash();
    }

    function tryScrollToHash() {
        if (!state.hashPending) return;
        if (!location.hash) { state.hashPending = false; return; }
        var target = document.getElementById(location.hash.replace(/^#/, ""));
        if (target) {
            state.hashPending = false;
            setTimeout(function () {
                target.scrollIntoView({ behavior: "auto", block: "start", inline: "nearest" });
            }, 0);
        }
    }

    function workstationChip(recipe) {
        var meta = stationMeta[recipe.type] || {};
        var chip = document.createElement("div");
        chip.className = "workstation-chip";
        if (meta.blockTexture) {
            var img = document.createElement("img");
            img.src = meta.blockTexture;
            img.alt = meta.label || "工作方块";
            img.loading = "lazy";
            chip.appendChild(img);
        }
        var texts = document.createElement("div");
        texts.className = "workstation-text";
        var label = document.createElement("strong");
        label.textContent = meta.label || "工作方块";
        texts.appendChild(label);
        var badge = document.createElement("span");
        badge.className = "chip-badge";
        badge.textContent = meta.badge || "配方";
        texts.appendChild(badge);
        chip.appendChild(texts);
        return chip;
    }

    function describeRecipeType(type) {
        if (type === "minecraft:crafting_shaped") return "有序合成";
        if (type === "minecraft:crafting_shapeless") return "无序合成";
        if (type === "minecraft:stonecutting") return "切石机";
        if (type === "minecraft:smelting") return "熔炼";
        return type;
    }

    function recipeTitle(recipe) {
        return getName(recipe.resultId || "") + " × " + recipe.resultCount;
    }

    function renderRecipe(recipe) {
        var card = document.createElement("article");
        card.className = "recipe-card";
        card.id = anchorId("recipe", recipe.resultId || "recipe");

        var head = document.createElement("div");
        head.className = "recipe-head";

        var titleWrap = document.createElement("div");
        titleWrap.className = "recipe-title-wrap";
        var title = document.createElement("h3");
        title.textContent = recipeTitle(recipe);
        titleWrap.appendChild(title);
        var metaLine = document.createElement("p");
        metaLine.className = "recipe-meta";
        metaLine.textContent = describeRecipeType(recipe.type) + " · " + (recipe.category ? recipe.category : "配方") + (recipe.cookingtime ? " · 耗时 " + recipe.cookingtime + "t" : "") + (recipe.experience ? " · 经验 " + recipe.experience : "");
        titleWrap.appendChild(metaLine);

        head.appendChild(titleWrap);
        head.appendChild(workstationChip(recipe));
        card.appendChild(head);

        var grid;
        if (recipe.type === "minecraft:crafting_shaped") grid = renderShaped(recipe);
        else if (recipe.type === "minecraft:crafting_shapeless") grid = renderShapeless(recipe);
        else if (recipe.type === "minecraft:stonecutting") grid = renderStonecutting(recipe);
        else if (recipe.type === "minecraft:smelting") grid = renderSmelting(recipe);
        if (grid) card.appendChild(grid);

        var materials = materialsForRecipe(recipe);
        if (materials.length) {
            var matTitle = document.createElement("p");
            matTitle.className = "material-title";
            matTitle.textContent = "需要材料";
            card.appendChild(matTitle);
            card.appendChild(renderMaterials(materials));
        }

        return card;
    }

    function applyFilter(filter) {
        state.filter = filter;
        var buttons = document.querySelectorAll('.filter-chip');
        buttons.forEach(function (btn) {
            if (btn.getAttribute('data-filter') === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        renderList();
    }

    function matchesFilter(recipe) {
        if (state.filter === "all") return true;
        if (state.filter === "crafting") return recipe.type === "minecraft:crafting_shaped";
        if (state.filter === "shapeless") return recipe.type === "minecraft:crafting_shapeless";
        if (state.filter === "stonecutting") return recipe.type === "minecraft:stonecutting";
        if (state.filter === "smelting") return recipe.type === "minecraft:smelting";
        return true;
    }

    function renderList() {
        var container = document.getElementById("recipe-list");
        if (!container) return;
        container.innerHTML = "";
        var filtered = state.recipes.filter(matchesFilter);
        if (!filtered.length) {
            var empty = document.createElement("p");
            empty.className = "recipe-empty";
            empty.textContent = "没有匹配的配方";
            container.appendChild(empty);
        }
        filtered.forEach(function (recipe) {
            container.appendChild(renderRecipe(recipe));
        });
        var status = document.getElementById("recipe-status");
        if (status) status.textContent = filtered.length + " 条配方" + (state.filter !== "all" ? " · 已筛选" : "");
        tryScrollToHash();
    }

    function updateStats(recipes) {
        var counts = {
            total: recipes.length,
            crafting: recipes.filter(function (r) { return r.type === "minecraft:crafting_shaped"; }).length,
            shapeless: recipes.filter(function (r) { return r.type === "minecraft:crafting_shapeless"; }).length,
            stonecutting: recipes.filter(function (r) { return r.type === "minecraft:stonecutting"; }).length,
            smelting: recipes.filter(function (r) { return r.type === "minecraft:smelting"; }).length,
            adv: state.advancements.length
        };
        var setText = function (id, value) {
            var el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        setText("stat-total", counts.total);
        setText("stat-crafting", counts.crafting);
        setText("stat-shapeless", counts.shapeless);
        setText("stat-stonecutting", counts.stonecutting);
        setText("stat-smelting", counts.smelting);
        setText("stat-adv", counts.adv);
        var subtitle = document.getElementById("recipe-subtitle");
        if (subtitle) subtitle.textContent = "已加载 " + counts.total + " 条配方";
    }

    function bindFilters() {
        if (filtersBound) return;
        filtersBound = true;
        document.querySelectorAll('.filter-chip').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var mode = btn.getAttribute('data-filter') || 'all';
                applyFilter(mode);
            });
        });
    }

    function init() {
        if (hasInitialized) {
            updateStats(state.recipes);
            applyFilter(state.filter || "all");
            setStatus("加载完成");
            return;
        }
        hasInitialized = true;
        setRecipeProgress("正在读取数据包 0% (0/" + recipeFiles.length + ")");
        var advStatusEl = document.getElementById("advancement-status");
        if (advStatusEl) advStatusEl.textContent = "正在读取进度...";
        bindFilters();
        loadTranslations().then(function () {
            return Promise.all([
                loadRecipes(function (done, total, pct) {
                    setRecipeProgress("正在读取数据包 " + pct + "% (" + done + "/" + total + ")");
                }),
                loadAdvancements(function (done, total) {
                    if (advStatusEl) advStatusEl.textContent = "正在读取进度 " + done + "/" + total;
                })
            ]);
        }).then(function (results) {
            var recipes = results[0];
            var advancements = results[1];
            var tags = collectTags(recipes);
            return preloadTags(tags).then(function () { return { recipes: recipes, advancements: advancements }; });
        }).then(function (payload) {
            state.recipes = payload.recipes;
            state.advancements = payload.advancements;
            buildAdvRelations();
            updateStats(state.recipes);
            applyFilter(state.filter || "all");
            setStatus("加载完成");
            renderAdvancements();
            if (advStatusEl) advStatusEl.textContent = "已加载 " + state.advancements.length + " 个进度";
        }).catch(function (err) {
            setStatus("加载失败");
            if (advStatusEl) advStatusEl.textContent = "加载进度失败";
            var container = document.getElementById("recipe-list");
            if (container) {
                var p = document.createElement("p");
                p.textContent = "加载配方失败: " + err.message;
                container.appendChild(p);
            }
        });
    }

    var wallpaperUrl = "/resource/img/shell/bg/bg.jpg";
    var wallpaperPromise = null;
    function waitForWallpaper() {
        if (wallpaperPromise) return wallpaperPromise;
        wallpaperPromise = new Promise(function (resolve) {
            var resolved = false;
            var finish = function () { if (resolved) return; resolved = true; resolve(); };
            var img = new Image();
            img.onload = finish;
            img.onerror = finish;
            img.src = wallpaperUrl + (wallpaperUrl.indexOf('?') === -1 ? '?preload=1' : '&preload=1');
            if (img.complete) finish();
            setTimeout(finish, 3000);
        });
        return wallpaperPromise;
    }

    var initScheduled = false;
    function scheduleInit() {
        if (initScheduled) return;
        initScheduled = true;
        waitForWallpaper().then(function () {
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    init();
                });
            });
        });
    }

    if (document.readyState === "complete") {
        scheduleInit();
    } else {
        window.addEventListener("load", scheduleInit, { once: true });
    }

    window.addEventListener("spa:page:loaded", function () {
        initScheduled = false;
        state.hashPending = true;
        scheduleInit();
    });
})();
