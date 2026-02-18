(function () {
    var enchantmentFiles = [
        "protection.json",
        "fire_protection.json",
        "projectile_protection.json",
        "blast_protection.json",
        "unbreaking.json"
    ];

    var advancementFiles = [
        "better-enchantments.json",
        "horse_armor.json",
        "wolf_armor.json"
    ];

    var enchantmentBase = "/resource/minecraft/pack/better-enchantments/data/minecraft/enchantment/";
    var advancementBase = "/resource/minecraft/pack/better-enchantments/data/better-enchantments/advancement/";
    var assetBase = "/resource/minecraft/assests/minecraft";
    var translationUrl = "/resource/minecraft/zh_ch.json";
    var translationFallbackUrl = assetBase + "/lang/en_us.json";
    var slotTexture = assetBase + "/textures/gui/sprites/container/slot.png";
    // Prefer missingno style fallback; barrier is handled via final array element
    var fallbackTexture = assetBase + "/textures/item/missingno.png";
    var tagBase = "/resource/minecraft/pack/better-enchantments/data/";

    var tagCache = new Map();

    var enchantmentIconMap = {
        "protection": "minecraft:enchanted_book",
        "fire_protection": "minecraft:enchanted_book",
        "projectile_protection": "minecraft:enchanted_book",
        "blast_protection": "minecraft:enchanted_book",
        "unbreaking": "minecraft:enchanted_book"
    };

    var customTextureMap = {
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

    var advRelations = {};
    var manualAdvRelations = {
        "better-enchantments:horse_armor": [
            "minecraft:protection",
            "minecraft:fire_protection",
            "minecraft:projectile_protection",
            "minecraft:blast_protection"
        ],
        "better-enchantments:wolf_armor": [
            "minecraft:protection",
            "minecraft:fire_protection",
            "minecraft:projectile_protection",
            "minecraft:blast_protection"
        ]
    };

    var state = {
        enchantments: [],
        advancements: [],
        translations: {},
        loaded: false,
        filter: "all"
    };

    var filtersBound = false;

    function fetchJson(url) {
        return fetch(url).then(function (resp) {
            if (!resp.ok) throw new Error("Failed to load " + url + " (" + resp.status + ")");
            return resp.json();
        });
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

    function getEnchantName(id) {
        if (!id) return "";
        var parts = id.split(":");
        var ns = parts[0] || "minecraft";
        var name = parts[1] || parts[0];
        var keyEnchant = "enchantment." + ns + "." + name;
        if (state.translations[keyEnchant]) return state.translations[keyEnchant];
        return getName(id);
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
        var name = getName(id) || (id.split(":")[1] || id);
        return "https://zh.minecraft.wiki/w/" + encodeURIComponent(name);
    }

    function tagUrlFromId(id) {
        var clean = (id || "").replace(/^#/, "");
        var parts = clean.split(":");
        var ns = parts[0] || "minecraft";
        var path = parts[1] || parts[0];
        return tagBase + ns + "/tags/item/" + path + ".json";
    }

    function loadTagItems(tagId) {
        var clean = (tagId || "").replace(/^#/, "");
        if (tagCache.has(clean)) return tagCache.get(clean);
        var url = tagUrlFromId(tagId);
        var promise = fetchJson(url).then(function (data) {
            var values = data && Array.isArray(data.values) ? data.values : [];
            var items = [];
            var tasks = [];
            values.forEach(function (v) {
                if (typeof v === "string" && v.charAt(0) === "#") {
                    tasks.push(loadTagItems(v).then(function (nested) { items = items.concat(nested); }));
                } else if (typeof v === "string") {
                    items.push(v);
                }
            });
            return Promise.all(tasks).then(function () {
                return Array.from(new Set(items));
            });
        }).catch(function () { return []; });
        tagCache.set(clean, promise);
        return promise;
    }

    function resolveItemList(value) {
        if (!value) return Promise.resolve([]);
        var list = Array.isArray(value) ? value.slice() : [value];
        var jobs = list.map(function (v) {
            if (typeof v === "string" && v.charAt(0) === "#") {
                return loadTagItems(v);
            }
            if (typeof v === "string") return Promise.resolve([v]);
            return Promise.resolve([]);
        });
        return Promise.all(jobs).then(function (results) {
            var flat = [];
            results.forEach(function (arr) { flat = flat.concat(arr || []); });
            return Array.from(new Set(flat));
        });
    }

    function createSlotForId(id) {
        if (!window.ItemSlot || typeof window.ItemSlot.createSlot !== "function") return document.createTextNode("");
        return ItemSlot.createSlot(id, {
            translations: state.translations,
            assetBase: assetBase,
            slotTexture: slotTexture,
            customTextures: customTextureMap
        });
    }

    function normalizeEnchantment(raw, fileName) {
        var id = "minecraft:" + fileName.replace(/\.json$/i, "");
        return {
            id: id,
            name: resolveText(raw.description) || id,
            maxLevel: raw.max_level || 1,
            weight: raw.weight || 0,
            minCost: raw.min_cost || {},
            maxCost: raw.max_cost || {},
            slots: Array.isArray(raw.slots) ? raw.slots : [],
            supported: raw.supported_items,
            primary: raw.primary_items,
            exclusive: raw.exclusive_set || null
        };
    }

    function resolveSupportedLists(list) {
        return Promise.all(list.map(function (e) {
            return Promise.all([
                resolveItemList(e.supported),
                resolveItemList(e.primary)
            ]).then(function (res) {
                e.supportedResolved = res[0];
                e.primaryResolved = res[1];
                return e;
            });
        }));
    }

    function loadEnchantments(onProgress) {
        var total = enchantmentFiles.length;
        var done = 0;
        return Promise.all(enchantmentFiles.map(function (name) {
            return fetchJson(enchantmentBase + name).then(function (data) {
                done += 1;
                if (typeof onProgress === "function") {
                    var pct = Math.floor((done / total) * 100);
                    onProgress(done, total, pct);
                }
                return normalizeEnchantment(data, name);
            }).catch(function () {
                done += 1;
                if (typeof onProgress === "function") {
                    var pct = Math.floor((done / total) * 100);
                    onProgress(done, total, pct);
                }
                return null;
            });
        })).then(function (list) { return list.filter(Boolean); });
    }

    function normalizeAdvancement(raw, fileName) {
        var id = fileName.replace(/\.json$/i, "");
        var display = raw && raw.display ? raw.display : {};
        var iconId = display.icon && display.icon.id ? display.icon.id : null;
        return {
            id: "better-enchantments:" + id,
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
        })).then(function (list) { return list.filter(Boolean); });
    }

    function setStatus(text) {
        var status = document.getElementById("ench-status");
        if (status) status.textContent = text;
        var subtitle = document.getElementById("ench-subtitle");
        if (subtitle) subtitle.textContent = text;
    }

    function setAdvStatus(text) {
        var status = document.getElementById("ench-adv-status");
        if (status) status.textContent = text;
    }

    function updateStats() {
        var totalCount = state.enchantments.length;
        var armorCount = state.enchantments.filter(function (e) { return Array.isArray(e.slots) && e.slots.indexOf("armor") !== -1; }).length;
        var anyCount = state.enchantments.filter(function (e) { return Array.isArray(e.slots) && e.slots.indexOf("any") !== -1; }).length;
        var advCount = state.advancements.length;
        var setText = function (id, value) {
            var el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        setText("ench-total", totalCount);
        setText("ench-armor", armorCount);
        setText("ench-any", anyCount);
        setText("ench-adv-count", advCount);
        var subtitle = document.getElementById("ench-subtitle");
        if (subtitle) subtitle.textContent = "已加载 " + totalCount + " 个附魔";
    }

    function matchesFilter(enchant) {
        if (!enchant) return false;
        if (state.filter === "armor") return Array.isArray(enchant.slots) && enchant.slots.indexOf("armor") !== -1;
        if (state.filter === "any") return Array.isArray(enchant.slots) && enchant.slots.indexOf("any") !== -1;
        return true;
    }

    function applyFilter(filter) {
        var next = (filter === "armor" || filter === "any") ? filter : "all";
        state.filter = next;
        var buttons = document.querySelectorAll('#ench-filter .filter-chip');
        buttons.forEach(function (btn) {
            var mode = btn.getAttribute('data-filter') || 'all';
            if (mode === state.filter) btn.classList.add('active'); else btn.classList.remove('active');
        });
        renderEnchantmentList();
    }

    function bindFilters() {
        if (filtersBound) return;
        filtersBound = true;
        document.querySelectorAll('#ench-filter .filter-chip').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var mode = btn.getAttribute('data-filter') || 'all';
                applyFilter(mode);
            });
        });
    }

    function formatCost(cost) {
        if (!cost || typeof cost !== "object") return "-";
        var base = typeof cost.base === "number" ? cost.base : null;
        var per = typeof cost.per_level_above_first === "number" ? cost.per_level_above_first : null;
        if (base === null && per === null) return "-";
        if (per === null || per === 0) return String(base);
        return base + " + " + per + "×(L-1)";
    }

    function renderItemChips(items, label, iconId) {
        if (!items || !items.length) return null;
        var li = document.createElement("li");
        li.className = "loot-item";
        li.appendChild(createSlotForId(iconId));
        var text = document.createElement("div");
        text.className = "loot-text";
        var title = document.createElement("div");
        title.className = "ench-item-title";
        title.textContent = label;
        text.appendChild(title);
        var chips = document.createElement("div");
        chips.className = "ench-item-chips";
        items.forEach(function (id) {
            var chip = document.createElement("div");
            chip.className = "ench-item-chip";
            var slot = createSlotForId(id);
            slot.classList.add("ench-item-chip-slot");
            var name = document.createElement("span");
            name.textContent = getName(id);
            chip.appendChild(slot);
            chip.appendChild(name);
            chips.appendChild(chip);
        });
        text.appendChild(chips);
        li.appendChild(text);
        return li;
    }

    function renderEnchantment(enchant) {
        var card = document.createElement("div");
        card.className = "loot-card";
        card.id = anchorId("enchant", enchant.id);

        var head = document.createElement("div");
        head.className = "loot-head";
        var row = document.createElement("div");
        row.className = "loot-title-row";
        var iconId = enchantmentIconMap[enchant.id.split(":")[1]] || "minecraft:enchanted_book";
        var slot = createSlotForId(iconId);
        slot.classList.add("loot-egg-slot");
        row.appendChild(slot);
        var title = document.createElement("h3");
        title.textContent = enchant.name;
        row.appendChild(title);
        head.appendChild(row);
        var meta = document.createElement("span");
        meta.className = "loot-meta";
        meta.textContent = "等级上限 " + enchant.maxLevel + " · 权重 " + enchant.weight;
        head.appendChild(meta);
        card.appendChild(head);

        var list = document.createElement("ul");
        list.className = "loot-list";

        var costLi = document.createElement("li");
        costLi.className = "loot-item";
        costLi.appendChild(createSlotForId("minecraft:experience_bottle"));
        var costText = document.createElement("div");
        costText.className = "loot-text";
        costText.textContent = "附魔台等级：" + formatCost(enchant.minCost) + " ~ " + formatCost(enchant.maxCost);
        costLi.appendChild(costText);
        list.appendChild(costLi);

        if (enchant.slots && enchant.slots.length) {
            var slotLi = document.createElement("li");
            slotLi.className = "loot-item";
            slotLi.appendChild(createSlotForId("minecraft:smithing_table"));
            var slotText = document.createElement("div");
            slotText.className = "loot-text";
            slotText.textContent = "适用槽位：" + enchant.slots.join("，");
            slotLi.appendChild(slotText);
            list.appendChild(slotLi);
        }

        if (enchant.supported) {
            var supportedItems = enchant.supportedResolved || [];
            if (supportedItems.length) {
                var supLi = renderItemChips(supportedItems, "可附魔物品", "minecraft:anvil");
                if (supLi) list.appendChild(supLi);
            }
        }

        if (enchant.primary) {
            var primaryItems = enchant.primaryResolved || [];
            if (primaryItems.length) {
                var primLi = renderItemChips(primaryItems, "附魔台主掉落", "minecraft:enchanting_table");
                if (primLi) list.appendChild(primLi);
            }
        }

        if (enchant.exclusive) {
            var exclLi = document.createElement("li");
            exclLi.className = "loot-item";
            exclLi.appendChild(createSlotForId("minecraft:barrier"));
            var exclText = document.createElement("div");
            exclText.className = "loot-text";
            exclText.textContent = "排他组：" + enchant.exclusive;
            exclLi.appendChild(exclText);
            list.appendChild(exclLi);
        }

        card.appendChild(list);
        return card;
    }

    function renderEnchantmentList() {
        var container = document.getElementById("ench-list");
        if (!container) return;
        container.innerHTML = "";
        if (!state.enchantments.length) {
            var none = document.createElement("p");
            none.className = "recipe-empty";
            none.textContent = "未找到附魔数据";
            container.appendChild(none);
            return;
        }
        var filtered = state.enchantments.filter(matchesFilter);
        if (!filtered.length) {
            var empty = document.createElement("p");
            empty.className = "recipe-empty";
            empty.textContent = state.enchantments.length ? "没有匹配的附魔" : "未找到附魔数据";
            container.appendChild(empty);
            setStatus(state.enchantments.length ? "没有匹配的附魔" : "未找到附魔数据");
            return;
        }
        filtered.forEach(function (e) {
            container.appendChild(renderEnchantment(e));
        });
        setStatus(filtered.length + " 个附魔" + (state.filter !== "all" ? " · 已筛选" : ""));
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
            var slot;
            if (rel.type === "enchant") {
                slot = createSlotForId("minecraft:enchanted_book");
                slot.title = getEnchantName(rel.id);
            } else {
                slot = createSlotForId(rel.id);
            }
            slot.classList.add("ench-item-chip-slot");
            chip.appendChild(slot);
            var name = document.createElement("span");
            name.textContent = rel.type === "enchant" ? getEnchantName(rel.id) : getName(rel.id);
            chip.appendChild(name);

            var targetId = null;
            if (rel.type === "enchant") targetId = anchorId("enchant", rel.id);
            if (rel.type === "recipe") targetId = anchorId("recipe", rel.id);
            if (rel.type === "entity") targetId = anchorId("mobcard", rel.id);
            if (rel.type === "dye") targetId = anchorId("dye", rel.id);
            if (targetId) {
                chip.addEventListener("click", function () { scrollHighlight(targetId); });
            }
            chips.appendChild(chip);
        });

        wrap.appendChild(chips);
        return wrap;
    }

    function buildAdvRelations() {
        var map = {};
        var rootId = "better-enchantments:better-enchantments";
        var enchantIds = new Set(state.enchantments.map(function (e) { return e.id; }));

        var ensureNs = function (id) {
            if (!id) return null;
            return id.indexOf(":") === -1 ? "minecraft:" + id : id;
        };

        Object.keys(manualAdvRelations).forEach(function (advId) {
            var list = manualAdvRelations[advId] || [];
            var filtered = list.map(ensureNs).filter(function (id) { return id && enchantIds.has(id); });
            if (filtered.length) {
                map[advId] = filtered.map(function (id) { return { type: "enchant", id: id }; });
            }
        });

        state.advancements.forEach(function (adv) {
            if (!adv || adv.id === rootId) return;
            if (map[adv.id]) return; // respect manual mapping
            var shortId = adv.id.split(":")[1] || adv.id;
            var candidate = ensureNs(shortId);
            if (candidate && enchantIds.has(candidate)) {
                map[adv.id] = [{ type: "enchant", id: candidate }];
            }
        });
        if (!map[rootId] && enchantIds.size) {
            map[rootId] = Array.from(enchantIds).map(function (id) { return { type: "enchant", id: id }; });
        }
        // Fallback: non-root advancements without matches link to the first few enchantments
        var defaults = Array.from(enchantIds).slice(0, 3);
        state.advancements.forEach(function (adv) {
            if (!adv || adv.id === rootId) return;
            if (!map[adv.id] && defaults.length) {
                map[adv.id] = defaults.map(function (id) { return { type: "enchant", id: id }; });
            }
        });
        advRelations = map;
    }

    function createAdvSlot(id, frame) {
        var meta = frameMeta(frame);
        if (window.ItemSlot && typeof window.ItemSlot.createSlot === "function") {
            return ItemSlot.createSlot(id || "minecraft:barrier", {
                translations: state.translations,
                assetBase: assetBase,
                slotTexture: meta.slotTexture
            });
        }
        var slot = document.createElement("div");
        slot.className = "mc-slot";
        slot.style.backgroundImage = "url('" + meta.slotTexture + "')";
        var img = document.createElement("img");
        img.src = assetBase + "/textures/item/barrier.png";
        img.alt = getName(id);
        img.loading = "lazy";
        img.decoding = "async";
        slot.appendChild(img);
        return slot;
    }

    function renderAdvTreeNode(node) {
        var li = document.createElement("li");
        li.className = "adv-tree-node";

        var row = document.createElement("div");
        row.className = "adv-tree-row";
        var iconSlot = createAdvSlot(node.iconId || "minecraft:barrier", node.frame);
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
        var meta = frameMeta(node.frame);
        var frame = document.createElement("span");
        frame.className = meta.cls;
        var icon = document.createElement("span");
        icon.className = "adv-frame-icon fluent-font " + meta.iconClass;
        icon.setAttribute("aria-hidden", "true");
        frame.appendChild(icon);
        frame.appendChild(document.createTextNode(meta.text));
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
        var container = document.getElementById("ench-adv-tree");
        if (!container) return;
        container.innerHTML = "";
        if (!state.advancements.length) {
            var none = document.createElement("p");
            none.className = "recipe-empty";
            none.textContent = "未找到进度数据";
            container.appendChild(none);
            return;
        }
        var roots = buildAdvTreeData(state.advancements);
        var ul = document.createElement("ul");
        ul.className = "adv-tree";
        roots.forEach(function (r) { ul.appendChild(renderAdvTreeNode(r)); });
        container.appendChild(ul);
        setAdvStatus("已加载 " + state.advancements.length + " 个进度");
    }

    function init() {
        bindFilters();
        if (state.loaded) {
            renderEnchantmentList();
            renderAdvancements();
            updateStats();
            return;
        }
        setStatus("正在读取附魔 0% (0/" + enchantmentFiles.length + ")");
        setAdvStatus("正在读取进度...");
        loadTranslations().then(function () {
            return Promise.all([
                loadEnchantments(function (done, total, pct) {
                    setStatus("正在读取附魔 " + pct + "% (" + done + "/" + total + ")");
                }),
                loadAdvancements(function (done, total, pct) {
                    setAdvStatus("正在读取进度 " + done + "/" + total);
                })
            ]);
        }).then(function (results) {
            var enchants = results[0] || [];
            var advancements = results[1] || [];
            return resolveSupportedLists(enchants).then(function (resolved) {
                state.enchantments = resolved;
                state.advancements = advancements;
                buildAdvRelations();
            });
        }).then(function () {
            state.loaded = true;
            renderEnchantmentList();
            renderAdvancements();
            updateStats();
            setStatus("加载完成");
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
        state.filter = "all";
        filtersBound = false;
        init();
    });
})();
