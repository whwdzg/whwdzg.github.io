(function () {
    var DEFAULT_ASSET_BASE = "/resource/minecraft/assests/minecraft";
    var DEFAULT_SLOT_TEXTURE = DEFAULT_ASSET_BASE + "/textures/gui/sprites/container/slot.png";
    // Inline magenta/black checker used by crafting page as a visible missing texture marker
    var CHECKER_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><rect width='16' height='16' fill='%23000'/><rect x='0' y='0' width='8' height='8' fill='%23ff00ff'/><rect x='8' y='8' width='8' height='8' fill='%23ff00ff'/></svg>";
    var FALLBACKS = function (assetBase) {
        var base = assetBase || DEFAULT_ASSET_BASE;
        return [CHECKER_FALLBACK, base + "/textures/item/missingno.png", base + "/textures/item/barrier.png"];
    };

    var DEFAULT_CUSTOM_TEXTURES = {
        "minecraft:dragon_head": ["https://zh.minecraft.wiki/images/Dragon_Head_JE1_BE1.png"],
        "minecraft:tipped_arrow": ["https://zh.minecraft.wiki/images/Invicon_Arrow_of_Poison.png"],
        "minecraft:dragon_egg": ["https://zh.minecraft.wiki/images/Dragon_Egg_JE3.png"],
        "minecraft:enchanting_table": [
            "https://zh.minecraft.wiki/images/Enchanting_Table.gif"
        ],
        "minecraft:anvil": [
            "https://zh.minecraft.wiki/images/Anvil_JE3_BE3.png"
        ],
        "minecraft:smithing_table": [
            "https://zh.minecraft.wiki/images/Smithing_Table_JE2_BE2.png"
        ],
        "minecraft:shield": [
            "https://zh.minecraft.wiki/images/Shield_JE2_BE1.png"
        ],
        "minecraft:crossbow": [
            "https://zh.minecraft.wiki/images/Crossbow_JE1_BE1.png"
        ],
        "minecraft:leather_horse_armor": [
            "https://zh.minecraft.wiki/images/Invicon_Leather_Horse_Armor.png",
            DEFAULT_ASSET_BASE + "/textures/item/leather_horse_armor.png",
            DEFAULT_ASSET_BASE + "/textures/item/horse_armor_leather.png",
            DEFAULT_ASSET_BASE + "/textures/entity/horse/armor/horse_armor_leather.png",
            DEFAULT_ASSET_BASE + "/textures/gui/sprites/container/slot/horse_armor.png"
        ],
        "minecraft:sculk_sensor": [
            "https://zh.minecraft.wiki/images/Inactive_Sculk_Sensor.gif"
        ],
        "minecraft:sculk": [
            "https://zh.minecraft.wiki/images/Sculk_JE1_BE1.gif"
        ],
        "minecraft:crimson_hyphae": [],
        "minecraft:crimson_stem": [],
        "minecraft:warped_hyphae": [],
        "minecraft:warped_stem": [],
        "minecraft:magma_block": [],
        "minecraft:oak_slab": [
            "https://zh.minecraft.wiki/images/Oak_Slab_JE5_BE2.png"
        ],
        "minecraft:petrified_oak_slab": [
            "https://zh.minecraft.wiki/images/Oak_Slab_JE5_BE2.png"
        ],
        "minecraft:stone_slab": [
            "https://zh.minecraft.wiki/images/Stone_Slab_JE2_BE2.png"
        ],
        "minecraft:enchanted_book": [
            "https://zh.minecraft.wiki/images/Enchanted_Book.gif"
        ],
        "minecraft:experience_bottle": [
            "https://zh.minecraft.wiki/images/Bottle_o%27_Enchanting.gif"
        ],
        "dragon_head": ["https://zh.minecraft.wiki/images/Dragon_Head_JE1_BE1.png"],
        "tipped_arrow": ["https://zh.minecraft.wiki/images/Invicon_Arrow_of_Poison.png"],
        "dragon_egg": ["https://zh.minecraft.wiki/images/Dragon_Egg_JE3.png"],
        "enchanting_table": ["https://zh.minecraft.wiki/images/Enchanting_Table.gif"],
        "anvil": ["https://zh.minecraft.wiki/images/Anvil_JE3_BE3.png"],
        "smithing_table": ["https://zh.minecraft.wiki/images/Smithing_Table_JE2_BE2.png"],
        "shield": ["https://zh.minecraft.wiki/images/Shield_JE2_BE1.png"],
        "crossbow": ["https://zh.minecraft.wiki/images/Crossbow_JE1_BE1.png"],
        "leather_horse_armor": [
            "https://zh.minecraft.wiki/images/Invicon_Leather_Horse_Armor.png",
            DEFAULT_ASSET_BASE + "/textures/item/leather_horse_armor.png",
            DEFAULT_ASSET_BASE + "/textures/item/horse_armor_leather.png",
            DEFAULT_ASSET_BASE + "/textures/entity/horse/armor/horse_armor_leather.png",
            DEFAULT_ASSET_BASE + "/textures/gui/sprites/container/slot/horse_armor.png"
        ],
        "sculk_sensor": ["https://zh.minecraft.wiki/images/Inactive_Sculk_Sensor.gif"],
        "sculk": ["https://zh.minecraft.wiki/images/Sculk_JE1_BE1.gif"],
        "crimson_hyphae": [],
        "crimson_stem": [],
        "warped_hyphae": [],
        "warped_stem": [],
        "magma_block": [],
        "oak_slab": ["https://zh.minecraft.wiki/images/Oak_Slab_JE5_BE2.png"],
        "petrified_oak_slab": ["https://zh.minecraft.wiki/images/Oak_Slab_JE5_BE2.png"],
        "stone_slab": ["https://zh.minecraft.wiki/images/Stone_Slab_JE2_BE2.png"],
        "enchanted_book": ["https://zh.minecraft.wiki/images/Enchanted_Book.gif"],
        "experience_bottle": ["https://zh.minecraft.wiki/images/Bottle_o%27_Enchanting.gif"]
    };

    function titleCase(text) {
        return (text || "").split(/[_\s]+/).filter(Boolean).map(function (part) {
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join(" ");
    }

    function getName(id, translations) {
        if (!id) return "";
        var parts = id.split(":");
        var ns = parts[0] || "minecraft";
        var name = parts[1] || parts[0];
        var dict = translations || {};
        var keyItem = "item." + ns + "." + name;
        var keyBlock = "block." + ns + "." + name;
        var keyEntity = "entity." + ns + "." + name;
        if (dict[keyItem]) return dict[keyItem];
        if (dict[keyBlock]) return dict[keyBlock];
        if (dict[keyEntity]) return dict[keyEntity];
        var manual = {
            "minecraft:white_wool": "白色羊毛",
            "white_wool": "白色羊毛"
        };
        if (manual[id]) return manual[id];
        if (manual[name]) return manual[name];
        return titleCase(name.replace(/_/g, " "));
    }

    function wikiUrl(id, translations) {
        if (!id) return null;
        var name = getName(id, translations) || (id.split(":")[1] || id);
        return "https://zh.minecraft.wiki/w/" + encodeURIComponent(name);
    }

    function textureCandidates(name, assetBase, includeSpawnEgg) {
        var base = assetBase || DEFAULT_ASSET_BASE;
        var list = [];

        var specialBlockVariants = {
            "observer": ["observer_front", "observer_side", "observer_back", "observer_top", "observer_bottom"],
            "piston": ["piston_side", "piston_top", "piston_bottom"],
            "sticky_piston": ["sticky_piston_side", "sticky_piston_top", "piston_bottom"],
            "dispenser": ["dispenser_front", "dispenser_top", "dispenser_bottom", "dispenser_side"],
            "dropper": ["dropper_front", "dropper_top", "dropper_bottom", "dropper_side"],
            "furnace": ["furnace_front", "furnace_top", "furnace_side"],
            "basalt": ["basalt_side", "basalt_top"],
            "polished_basalt": ["polished_basalt_side", "polished_basalt_top"],
            "quartz_block": ["quartz_block_side", "quartz_block_top", "quartz_block_bottom"],
            "reinforced_deepslate": ["reinforced_deepslate_side", "reinforced_deepslate_top", "reinforced_deepslate_bottom"],
            "bone_block": ["bone_block_side", "bone_block_top", "bone_block_bottom"],
            "sculk_catalyst": ["sculk_catalyst_side", "sculk_catalyst_top", "sculk_catalyst_bottom"],
            "sculk_sensor": ["sculk_sensor_side", "sculk_sensor_top", "sculk_sensor_bottom"],
            "sculk_shrieker": ["sculk_shrieker_side", "sculk_shrieker_top", "sculk_shrieker_bottom"]
        };

        var bases = [name];

        // Glass panes: try side/top variants commonly used by MC assets
        if (name.indexOf("pane") !== -1) {
            bases.push(name.replace(/pane$/, "pane_side"));
            bases.push(name.replace(/pane$/, "pane_top"));
            bases.push(name + "_side");
            bases.push(name + "_top");
        }

        // Wood and hyphae: fall back to log/stem textures
        if (name.endsWith("_wood")) {
            bases.push(name.replace(/_wood$/, "_log"));
        }
        if (name.indexOf("stripped_") === 0 && name.endsWith("_wood")) {
            bases.push(name.replace(/_wood$/, "_log"));
        }
        if (name.endsWith("_hyphae")) {
            bases.push(name.replace(/_hyphae$/, "_stem"));
        }
        if (name.indexOf("stripped_") === 0 && name.endsWith("_hyphae")) {
            bases.push(name.replace(/_hyphae$/, "_stem"));
        }

        if (specialBlockVariants[name]) {
            bases = bases.concat(specialBlockVariants[name]);
        }

        bases.forEach(function (n) {
            [
                base + "/textures/item/" + n + ".png",
                base + "/textures/block/" + n + ".png",
                base + "/textures/entity/" + n + ".png"
            ].forEach(function (p) { if (list.indexOf(p) === -1) list.push(p); });
        });

        if (includeSpawnEgg !== false) {
            list.push(base + "/textures/item/" + name + "_spawn_egg.png");
        }
        if (name === "cactus") {
            list.push(base + "/textures/block/cactus_side.png");
            list.push(base + "/textures/block/cactus_top.png");
        }
        return list;
    }

    function pickTextures(id, options) {
        var opts = options || {};
        var assetBase = opts.assetBase || DEFAULT_ASSET_BASE;
        var name = (id || "").split(":")[1] || id || "";
        var customMap = Object.assign({}, DEFAULT_CUSTOM_TEXTURES, opts.customTextures || {});
        var custom = customMap[id] || customMap[name] || [];
        return custom.concat(textureCandidates(name, assetBase, opts.includeSpawnEgg), FALLBACKS(assetBase));
    }

    function createSlot(id, options) {
        var opts = options || {};
        var assetBase = opts.assetBase || DEFAULT_ASSET_BASE;
        var slotTexture = opts.slotTexture || DEFAULT_SLOT_TEXTURE;
        var translations = opts.translations || {};
        var name = getName(id, translations) || id || "";
        var href = opts.disableWiki ? null : wikiUrl(id, translations);
        var title = href ? (name ? name + "（点击打开 Wiki）" : "点击打开 Wiki") : name;

        var slot = document.createElement("div");
        slot.className = opts.className || "mc-slot slot-link";
        slot.style.backgroundImage = "url('" + slotTexture + "')";

        var textures = pickTextures(id, opts);
        var img = document.createElement("img");
        var texIndex = 0;
        img.src = textures[texIndex];
        img.alt = name;
        img.loading = "lazy";
        img.decoding = "async";
        img.onerror = function () {
            texIndex += 1;
            if (texIndex < textures.length) {
                img.src = textures[texIndex];
            } else {
                img.onerror = null;
            }
        };
        slot.title = title;
        slot.appendChild(img);

        if (href) {
            var openWiki = function () { window.open(href, "_blank", "noopener"); };
            slot.addEventListener("click", openWiki);
            slot.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openWiki();
                }
            });
            slot.tabIndex = 0;
            slot.setAttribute("role", "link");
        }
        return slot;
    }

    window.ItemSlot = {
        createSlot: createSlot,
        pickTextures: pickTextures,
        textureCandidates: textureCandidates,
        getName: getName,
        wikiUrl: wikiUrl
    };
})();
