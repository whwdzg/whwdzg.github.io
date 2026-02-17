(function () {
    var lootFiles = [
        "allay.json",
        "armadillo.json",
        "axolotl.json",
        "bat.json",
        "bee.json",
        "bogged.json",
        "camel.json",
        "chicken.json",
        "ender_dragon.json",
        "fox.json",
        "frog.json",
        "goat.json",
        "piglin.json",
        "piglin_brute.json",
        "polar_bear.json",
        "turtle.json",
        "villager.json",
        "wandering_trader.json"
    ];

    var advancementFiles = [
        "better-mob-drop.json",
        "kill_allay.json",
        "kill_armadilo.json",
        "kill_axolotl.json",
        "kill_bat.json",
        "kill_bee.json",
        "kill_bogged.json",
        "kill_camel.json",
        "kill_chicken.json",
        "kill_ender_dragon.json",
        "kill_fox.json",
        "kill_frog.json",
        "kill_goat.json",
        "kill_piglin.json",
        "kill_piglin_brute.json",
        "kill_polar_bear.json",
        "kill_turtle.json",
        "kill_vilager.json",
        "kill_wandering_trader.json"
    ];

    var lootBase = "/resource/minecraft/pack/better-mob-drop/data/better-mob-drop/loot_table/entities/";
    var advancementBase = "/resource/minecraft/pack/better-mob-drop/data/better-mob-drop/advancement/";
    var assetBase = "/resource/minecraft/assests/minecraft";
    var translationUrl = "/resource/minecraft/zh_ch.json";
    var translationFallbackUrl = assetBase + "/lang/en_us.json";
    var slotTexture = assetBase + "/textures/gui/sprites/container/slot.png";
    var fallbackTexture = assetBase + "/textures/item/barrier.png";

    var state = {
        loot: [],
        advancements: [],
        translations: {},
        loaded: false,
        hashPending: true
    };

    function fetchJson(url) {
        return fetch(url).then(function (resp) {
            if (!resp.ok) throw new Error("Failed to load " + url + " (" + resp.status + ")");
            return resp.json();
        });
    }

    function setStatus(text) {
        var status = document.getElementById("mobdrop-status");
        if (status) status.textContent = text;
        var subtitle = document.getElementById("mobdrop-subtitle");
        if (subtitle) subtitle.textContent = text;
    }

    function setAdvStatus(text) {
        var status = document.getElementById("mobdrop-adv-status");
        if (status) status.textContent = text;
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

    function titleCase(text) {
        return text.split(/[_\s]+/).filter(Boolean).map(function (part) {
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join(" ");
    }

    function getName(id) {
        if (!id) return "";
        var parts = id.split(":");
        var ns = parts[0] || "minecraft";
        var name = parts[1] || parts[0];
        var keyItem = "item." + ns + "." + name;
        var keyBlock = "block." + ns + "." + name;
        var keyEntity = "entity." + ns + "." + name;
        if (state.translations[keyItem]) return state.translations[keyItem];
        if (state.translations[keyBlock]) return state.translations[keyBlock];
        if (state.translations[keyEntity]) return state.translations[keyEntity];
        return titleCase(name.replace(/_/g, " "));
    }

    function wikiUrl(id) {
        if (!id) return null;
        var name = getName(id) || (id.split(":")[1] || id);
        return "https://zh.minecraft.wiki/w/" + encodeURIComponent(name);
    }

    var spawnEggMap = {
        "minecraft:allay": "minecraft:allay_spawn_egg",
        "minecraft:armadillo": "minecraft:armadillo_spawn_egg",
        "minecraft:axolotl": "minecraft:axolotl_spawn_egg",
        "minecraft:bat": "minecraft:bat_spawn_egg",
        "minecraft:bee": "minecraft:bee_spawn_egg",
        "minecraft:bogged": "minecraft:bogged_spawn_egg",
        "minecraft:camel": "minecraft:camel_spawn_egg",
        "minecraft:chicken": "minecraft:chicken_spawn_egg",
        "minecraft:ender_dragon": "minecraft:ender_dragon_spawn_egg",
        "minecraft:fox": "minecraft:fox_spawn_egg",
        "minecraft:frog": "minecraft:frog_spawn_egg",
        "minecraft:goat": "minecraft:goat_spawn_egg",
        "minecraft:piglin": "minecraft:piglin_spawn_egg",
        "minecraft:piglin_brute": "minecraft:piglin_brute_spawn_egg",
        "minecraft:polar_bear": "minecraft:polar_bear_spawn_egg",
        "minecraft:turtle": "minecraft:turtle_spawn_egg",
        "minecraft:villager": "minecraft:villager_spawn_egg",
        "minecraft:wandering_trader": "minecraft:wandering_trader_spawn_egg"
    };

    // Custom texture fallbacks for entities/items missing bundled sprites
    var customTextureMap = {
        "minecraft:dragon_head": ["https://zh.minecraft.wiki/images/Dragon_Head_JE1_BE1.png"],
        "minecraft:tipped_arrow": ["https://zh.minecraft.wiki/images/Invicon_Arrow_of_Poison.png"],
        "minecraft:dragon_egg": ["https://zh.minecraft.wiki/images/Dragon_Egg_JE3.png"],
        "minecraft:enchanting_table": [
            "https://zh.minecraft.wiki/images/Enchanting_Table.gif",
            assetBase + "/textures/block/enchanting_table_top.png",
            assetBase + "/textures/block/enchanting_table_side.png"
        ],
        "minecraft:anvil": [
            "https://zh.minecraft.wiki/images/Anvil_JE3_BE3.png",
            assetBase + "/textures/block/anvil_top.png",
            assetBase + "/textures/block/anvil.png"
        ],
        "minecraft:smithing_table": [
            "https://zh.minecraft.wiki/images/Smithing_Table_JE2_BE2.png",
            assetBase + "/textures/block/smithing_table_front.png",
            assetBase + "/textures/block/smithing_table_top.png",
            assetBase + "/textures/block/smithing_table_side.png"
        ],
        "minecraft:shield": [
            "https://zh.minecraft.wiki/images/Shield_JE2_BE1.png",
            assetBase + "/textures/entity/shield_base.png",
            assetBase + "/textures/entity/shield.png",
            assetBase + "/textures/item/shield.png"
        ],
        "minecraft:crossbow": [
            "https://zh.minecraft.wiki/images/Crossbow_JE1_BE1.png",
            assetBase + "/textures/item/crossbow.png"
        ]
    };

    function textureCandidates(name) {
        var bases = [name];
        var list = [];
        bases.forEach(function (n) {
            [
                assetBase + "/textures/item/" + n + ".png",
                assetBase + "/textures/block/" + n + ".png",
                assetBase + "/textures/entity/" + n + ".png",
                assetBase + "/textures/item/" + n + "_spawn_egg.png"
            ].forEach(function (p) { if (list.indexOf(p) === -1) list.push(p); });
        });
        // Handle blocks like cactus that don't have a single root-named texture file
        if (name === "cactus") {
            list.push(assetBase + "/textures/block/cactus_side.png");
            list.push(assetBase + "/textures/block/cactus_top.png");
        }
        return list;
    }

    function pickTexture(id) {
        if (!id) return [fallbackTexture];
        var name = id.split(":")[1] || id;
        var custom = customTextureMap[id] || customTextureMap[name] || [];
        return custom.concat(textureCandidates(name), [fallbackTexture]);
    }

    function spawnEggId(entityId) {
        return spawnEggMap[entityId] || null;
    }

    function createSlotForId(id) {
        var slot = document.createElement("div");
        slot.className = "mc-slot slot-link";
        slot.style.backgroundImage = "url('" + slotTexture + "')";
        var textures = pickTexture(id);
        var img = document.createElement("img");
        var texIndex = 0;
        img.src = textures[texIndex] || fallbackTexture;
        img.alt = getName(id);
        img.loading = "lazy";
        img.decoding = "async";
        img.onerror = function () {
            texIndex += 1;
            if (texIndex < textures.length) {
                img.src = textures[texIndex];
            } else {
                img.onerror = null;
                img.src = fallbackTexture;
            }
        };
        slot.title = getName(id) + "（点击打开 Wiki）";
        slot.appendChild(img);
        var href = wikiUrl(id);
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

    function normalizeRange(count) {
        if (!count) return { min: 1, max: 1 };
        if (typeof count === "number") return { min: count, max: count };
        if (count.type === "minecraft:uniform" && typeof count.min === "number" && typeof count.max === "number") {
            return { min: count.min, max: count.max };
        }
        if (typeof count.min === "number" && typeof count.max === "number") {
            return { min: count.min, max: count.max };
        }
        return { min: 1, max: 1 };
    }

    function parseEntry(entry, poolRolls) {
        var rolls = typeof poolRolls === "number" ? poolRolls : 1;
        var info = {
            id: entry.name,
            min: 1,
            max: 1,
            looting: null,
            smelt: false
        };
        if (Array.isArray(entry.functions)) {
            entry.functions.forEach(function (fn) {
                if (fn.function === "minecraft:set_count") {
                    var r = normalizeRange(fn.count);
                    info.min = r.min;
                    info.max = r.max;
                }
                if (fn.function === "minecraft:enchanted_count_increase") {
                    var lr = normalizeRange(fn.count);
                    info.looting = lr;
                }
                if (fn.function === "minecraft:furnace_smelt") {
                    info.smelt = true;
                }
            });
        }
        info.min = Math.max(0, info.min * rolls);
        info.max = Math.max(info.min, info.max * rolls);
        return info;
    }

    function parseLootTable(raw, fileName) {
        var entityId = "minecraft:" + fileName.replace(/\.json$/i, "");
        var drops = [];
        (raw.pools || []).forEach(function (pool) {
            var rolls = pool && pool.rolls;
            (pool.entries || []).forEach(function (e) {
                if (e.type === "minecraft:item" && e.name) {
                    drops.push(parseEntry(e, rolls));
                }
            });
        });
        return { entityId: entityId, drops: drops, file: fileName };
    }

    function loadLootTables(onProgress) {
        var total = lootFiles.length;
        var done = 0;
        return Promise.all(lootFiles.map(function (name) {
            return fetchJson(lootBase + name).then(function (data) {
                done += 1;
                if (typeof onProgress === "function") {
                    var pct = Math.floor((done / total) * 100);
                    onProgress(done, total, pct);
                }
                return parseLootTable(data, name);
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

    function normalizeAdvancement(raw, fileName) {
        var id = fileName.replace(/\.json$/i, "");
        var display = raw && raw.display ? raw.display : {};
        var iconId = display.icon && display.icon.id ? display.icon.id : null;
        return {
            id: "better-mob-drop:" + id,
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

    function renderAdvTreeNode(node) {
        var li = document.createElement("li");
        li.className = "adv-tree-node";

        var row = document.createElement("div");
        row.className = "adv-tree-row";
        var iconSlot = createSlotForId(node.iconId || "minecraft:barrier");
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
        var frame = document.createElement("span");
        frame.className = "adv-frame adv-frame-" + (node.frame || "task");
        frame.textContent = node.frame === "challenge" ? "挑战" : node.frame === "goal" ? "目标" : "进度";
        info.appendChild(frame);
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
        var treeHost = document.getElementById("mobdrop-adv-tree");
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
        setAdvStatus(state.advancements.length ? "共 " + state.advancements.length + " 个进度" : "未找到进度");
        tryScrollToHash();
    }

    function renderLoot() {
        var list = document.getElementById("mobdrop-list");
        if (!list) return;
        list.innerHTML = "";
        if (!state.loot.length) {
            var empty = document.createElement("p");
            empty.className = "recipe-empty";
            empty.textContent = "没有可显示的掉落";
            list.appendChild(empty);
            return;
        }
        state.loot.forEach(function (mob) {
            var card = document.createElement("article");
            card.className = "loot-card";

            var head = document.createElement("div");
            head.className = "loot-head";
            var title = document.createElement("div");
            title.className = "loot-title-row";
            var nameEl = document.createElement("h3");
            nameEl.textContent = getName(mob.entityId) || mob.entityId;
            title.appendChild(nameEl);
            var egg = spawnEggId(mob.entityId);
            if (egg) {
                var eggSlot = createSlotForId(egg);
                eggSlot.classList.add("loot-egg-slot");
                title.appendChild(eggSlot);
            }
            head.appendChild(title);
            var meta = document.createElement("span");
            meta.className = "loot-meta";
            meta.textContent = mob.drops.length + " 种掉落";
            head.appendChild(meta);
            card.appendChild(head);

            var ul = document.createElement("ul");
            ul.className = "loot-list";
            if (!mob.drops.length) {
                var none = document.createElement("li");
                none.textContent = "无掉落";
                ul.appendChild(none);
            }
            mob.drops.forEach(function (drop) {
                var li = document.createElement("li");
                li.className = "loot-item";
                li.appendChild(createSlotForId(drop.id));
                var text = document.createElement("div");
                text.className = "loot-text";
                var range = drop.min === drop.max ? String(drop.min) : (drop.min + " – " + drop.max);
                var line = getName(drop.id) + " · 掉落 " + range;
                if (drop.looting) {
                    var lr = drop.looting;
                    var lrange = lr.min === lr.max ? ("+" + lr.min) : ("+" + lr.min + " – +" + lr.max);
                    line += " · 掠夺额外 " + lrange;
                }
                if (drop.smelt) {
                    line += " · 可被熔炼掉落";
                }
                text.textContent = line;
                li.appendChild(text);
                ul.appendChild(li);
            });
            card.appendChild(ul);
            list.appendChild(card);
        });
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

    function updateStats() {
        var total = document.getElementById("mobdrop-total");
        if (total) total.textContent = state.loot.length;
    }

    function init() {
        if (state.loaded) {
            renderLoot();
            renderAdvancements();
            updateStats();
            return;
        }
        setStatus("正在读取掉落 0% (0/" + lootFiles.length + ")");
        setAdvStatus("正在读取进度...");
        loadTranslations().then(function () {
            return Promise.all([
                loadLootTables(function (done, total, pct) {
                    setStatus("正在读取掉落 " + pct + "% (" + done + "/" + total + ")");
                }),
                loadAdvancements(function (done, total) {
                    setAdvStatus("正在读取进度 " + done + "/" + total);
                })
            ]);
        }).then(function (results) {
            state.loot = results[0];
            state.advancements = results[1];
            state.loaded = true;
            renderLoot();
            renderAdvancements();
            updateStats();
            setStatus("加载完成");
            setAdvStatus("已加载 " + state.advancements.length + " 个进度");
        }).catch(function (err) {
            setStatus("加载失败: " + err.message);
            setAdvStatus("加载进度失败");
        });
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
        init();
    } else {
        window.addEventListener("DOMContentLoaded", init, { once: true });
    }

    window.addEventListener("spa:page:loaded", function () {
        state.loaded = false;
        state.hashPending = true;
        init();
    });
})();
