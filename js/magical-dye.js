(function () {
    var recipeFiles = [
        "dust_blaze_powder.json",
        "dust_bone_meal.json",
        "dust_glowstone_dust.json",
        "dust_gunpowder.json",
        "dust_redstone.json",
        "dust_sugar.json",
        "mineral_amethyst_block.json",
        "mineral_coal_block.json",
        "mineral_copper_block.json",
        "mineral_diamond_block.json",
        "mineral_emerald_block.json",
        "mineral_gold_block.json",
        "mineral_iron_block.json",
        "mineral_lapis_block.json",
        "mineral_netherite_block.json",
        "mineral_quartz_block.json",
        "mineral_redstone_block.json"
    ];

    var advancementFiles = [
        "magical_dye.json",
        "dust.json",
        "mineral_block.json"
    ];

    var recipeBase = "/resource/minecraft/pack/magical-dye/data/magical_dye/recipe/";
    var advancementBase = "/resource/minecraft/pack/magical-dye/data/magical_dye/advancement/";
    var tagBase = "/resource/minecraft/pack/magical-dye/data/";
    var assetBase = "/resource/minecraft/assests/minecraft";
    var translationUrl = "/resource/minecraft/zh_ch.json";
    var translationFallbackUrl = assetBase + "/lang/en_us.json";
    var slotTexture = assetBase + "/textures/gui/sprites/container/slot.png";

    var tagCache = new Map();

    var state = {
        recipes: [],
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
            if (value.translate) return state.translations[value.translate] || value.translate;
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

    function wikiUrl(id) {
        if (!id) return null;
        var name = getName(id) || (id.split(":")[1] || id);
        return "https://zh.minecraft.wiki/w/" + encodeURIComponent(name);
    }

    function createSlotForId(id) {
        if (window.ItemSlot && typeof window.ItemSlot.createSlot === "function") {
            return ItemSlot.createSlot(id || "minecraft:barrier", {
                translations: state.translations,
                assetBase: assetBase,
                slotTexture: slotTexture
            });
        }

        var slot = document.createElement("div");
        slot.className = "mc-slot";
        slot.style.backgroundImage = "url('" + slotTexture + "')";
        var img = document.createElement("img");
        img.src = assetBase + "/textures/item/barrier.png";
        img.alt = getName(id);
        img.loading = "lazy";
        img.decoding = "async";
        slot.appendChild(img);
        var href = wikiUrl(id);
        var label = getName(id);
        if (href) {
            label = label ? label + "（点击打开 Wiki）" : "点击打开 Wiki";
            slot.classList.add("slot-link");
            slot.setAttribute("role", "link");
            slot.tabIndex = 0;
            var openWiki = function () { window.open(href, "_blank", "noopener"); };
            slot.addEventListener("click", openWiki);
            slot.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openWiki();
                }
            });
        }
        slot.title = label;
        return slot;
    }

    function createGridSlot(options, count, opts) {
        opts = opts || {};
        var hasOptions = Array.isArray(options) && options.length;
        if (!hasOptions) {
            var empty = document.createElement("div");
            empty.className = "mc-slot slot-empty";
            empty.style.backgroundImage = "url('" + slotTexture + "')";
            if (opts.isResult) empty.classList.add("result-slot");
            return empty;
        }

        var id = options[0];
        var slot = null;
        if (window.ItemSlot && typeof window.ItemSlot.createSlot === "function") {
            slot = ItemSlot.createSlot(id || "minecraft:barrier", {
                translations: state.translations,
                assetBase: assetBase,
                slotTexture: slotTexture
            });
        }
        if (!slot) {
            slot = document.createElement("div");
            slot.className = "mc-slot";
            slot.style.backgroundImage = "url('" + slotTexture + "')";
            var img = document.createElement("img");
            img.src = assetBase + "/textures/item/barrier.png";
            img.alt = getName(id);
            img.loading = "lazy";
            img.decoding = "async";
            slot.appendChild(img);
        }
        if (opts.isResult) slot.classList.add("result-slot");

        var showCount = typeof count === "number" && count > 1;
        if (showCount) {
            var badge = document.createElement("span");
            badge.className = "slot-count";
            badge.textContent = count;
            slot.appendChild(badge);
        }
        if (options.length > 1) {
            var alt = document.createElement("span");
            alt.className = "slot-alt";
            alt.textContent = "+" + (options.length - 1);
            slot.appendChild(alt);
        }

        var href = wikiUrl(id);
        var label = getName(id);
        if (href && !slot.classList.contains("slot-link")) {
            slot.classList.add("slot-link");
            slot.setAttribute("role", "link");
            slot.tabIndex = 0;
            slot.title = label ? label + "（点击打开 Wiki）" : "点击打开 Wiki";
            var openWiki = function () { window.open(href, "_blank", "noopener"); };
            slot.addEventListener("click", openWiki);
            slot.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openWiki();
                }
            });
        } else if (label) {
            slot.title = label;
        }
        return slot;
    }

    function setStatus(text) {
        var el = document.getElementById("mdye-status");
        if (el) el.textContent = text;
        var subtitle = document.getElementById("mdye-subtitle");
        if (subtitle) subtitle.textContent = text;
    }

    function setAdvStatus(text) {
        var el = document.getElementById("mdye-adv-status");
        if (el) el.textContent = text;
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
            if (typeof v === "string" && v.charAt(0) === "#") return loadTagItems(v);
            if (typeof v === "string") return Promise.resolve([v]);
            if (v && typeof v === "object") {
                if (v.item) return Promise.resolve([v.item]);
                if (v.tag) return loadTagItems(v.tag);
            }
            return Promise.resolve([]);
        });
        return Promise.all(jobs).then(function (results) {
            var flat = [];
            results.forEach(function (arr) { flat = flat.concat(arr || []); });
            return Array.from(new Set(flat));
        });
    }

    function normalizeIngredient(value) {
        if (!value) return Promise.resolve({ options: [] });
        return resolveItemList(value).then(function (items) {
            return { options: items };
        });
    }

    function parseRecipe(raw, fileName) {
        var resultId = raw && raw.result && raw.result.id ? raw.result.id : null;
        var resultCount = raw && raw.result && raw.result.count ? raw.result.count : 1;
        var ingredients = Array.isArray(raw.ingredients) ? raw.ingredients : [];
        var base = {
            id: "magical_dye:" + fileName.replace(/\.json$/i, ""),
            file: fileName,
            resultId: resultId,
            resultCount: resultCount,
            ingredients: []
        };
        return Promise.all(ingredients.map(normalizeIngredient)).then(function (ings) {
            base.ingredients = ings;
            return base;
        });
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
                return parseRecipe(data, name);
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
            id: "magical_dye:" + id,
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
        var container = document.getElementById("mdye-adv-tree");
        if (!container) return;
        container.innerHTML = "";
        if (!state.advancements.length) {
            var none = document.createElement("p");
            none.className = "recipe-empty";
            none.textContent = "未找到进度数据";
            container.appendChild(none);
            setAdvStatus("未找到进度");
            return;
        }
        var roots = buildAdvTreeData(state.advancements);
        var ul = document.createElement("ul");
        ul.className = "adv-tree";
        roots.forEach(function (r) { ul.appendChild(renderAdvTreeNode(r)); });
        container.appendChild(ul);
        setAdvStatus("已加载 " + state.advancements.length + " 个进度");
        var advTotal = document.getElementById("mdye-adv-total");
        if (advTotal) advTotal.textContent = state.advancements.length;
        tryScrollToHash();
    }

    function updateStats() {
        var total = document.getElementById("mdye-total");
        if (total) total.textContent = state.recipes.length;
        var shapeless = document.getElementById("mdye-shapeless");
        if (shapeless) shapeless.textContent = state.recipes.filter(function (r) { return r.type === "minecraft:crafting_shapeless"; }).length;
        var advTotal = document.getElementById("mdye-adv-total");
        if (advTotal) advTotal.textContent = state.advancements.length;
    }

    function describeRecipeType(type) {
        if (type === "minecraft:crafting_shaped") return "有序合成";
        if (type === "minecraft:crafting_shapeless") return "无序合成";
        if (type === "minecraft:stonecutting") return "切石机";
        if (type === "minecraft:smelting") return "熔炼";
        return type || "配方";
    }

    function workstationChip(type) {
        var meta = {
            label: describeRecipeType(type),
            badge: "配方",
            blockTexture: assetBase + "/textures/block/crafting_table_front.png"
        };
        var chip = document.createElement("div");
        chip.className = "workstation-chip";
        var img = document.createElement("img");
        img.src = meta.blockTexture;
        img.alt = meta.label;
        img.loading = "lazy";
        chip.appendChild(img);
        var texts = document.createElement("div");
        texts.className = "workstation-text";
        var label = document.createElement("strong");
        label.textContent = meta.label;
        texts.appendChild(label);
        var badge = document.createElement("span");
        badge.className = "chip-badge";
        badge.textContent = meta.badge;
        texts.appendChild(badge);
        chip.appendChild(texts);
        return chip;
    }

    function renderMaterialItem(options, count) {
        var li = document.createElement("li");
        li.className = "recipe-materials-item";
        var chips = document.createElement("div");
        chips.className = "ench-item-chips";
        if (typeof count === "number" && count > 1) {
            var cnt = document.createElement("span");
            cnt.className = "material-count";
            cnt.textContent = "数量 × " + count;
            chips.appendChild(cnt);
        }
        options.forEach(function (id, idx) {
            var chip = document.createElement("div");
            chip.className = "ench-item-chip";
            var slot = createSlotForId(id);
            slot.classList.add("ench-item-chip-slot");
            var name = document.createElement("span");
            name.textContent = getName(id);
            chip.appendChild(slot);
            chip.appendChild(name);
            chips.appendChild(chip);
            if (idx !== options.length - 1) {
                var sep = document.createElement("span");
                sep.className = "ench-item-chip-sep";
                sep.textContent = "或";
                chips.appendChild(sep);
            }
        });
        li.appendChild(chips);
        return li;
    }

    function materialsForRecipe(recipe) {
        var map = new Map();
        recipe.ingredients.forEach(function (ing) {
            var opts = ing && ing.options ? ing.options : [];
            var key = opts.slice().sort().join("|");
            var entry = map.get(key);
            if (!entry) {
                entry = { options: opts, count: 0 };
                map.set(key, entry);
            }
            entry.count += 1;
        });
        return Array.from(map.values());
    }

    function renderRecipe(recipe) {
        var card = document.createElement("article");
        card.className = "recipe-card";

        var head = document.createElement("div");
        head.className = "recipe-head";
        var titleWrap = document.createElement("div");
        titleWrap.className = "recipe-title-wrap";
        var title = document.createElement("h3");
        var name = getName(recipe.resultId) || recipe.resultId;
        title.textContent = name + (recipe.resultCount > 1 ? " × " + recipe.resultCount : "");
        titleWrap.appendChild(title);
        var metaLine = document.createElement("p");
        metaLine.className = "recipe-meta";
        metaLine.textContent = describeRecipeType(recipe.type) + " · 配方";
        titleWrap.appendChild(metaLine);
        head.appendChild(titleWrap);
        head.appendChild(workstationChip(recipe.type));
        card.appendChild(head);

        var grid = document.createElement("div");
        grid.className = "recipe-grid-display";
        var inputGrid = document.createElement("div");
        inputGrid.className = "mc-grid";
        var ingredients = recipe.ingredients.slice();
        while (ingredients.length < 9) ingredients.push({ options: [] });
        ingredients.slice(0, 9).forEach(function (ing) {
            var opts = ing && ing.options ? ing.options : [];
            inputGrid.appendChild(createGridSlot(opts));
        });
        grid.appendChild(inputGrid);
        var arrowEl = document.createElement("div");
        arrowEl.className = "mc-arrow";
        arrowEl.textContent = "→";
        grid.appendChild(arrowEl);
        var resultSlot = createGridSlot([recipe.resultId], recipe.resultCount || 1, { isResult: true });
        grid.appendChild(resultSlot);
        card.appendChild(grid);

        var mats = materialsForRecipe(recipe);
        if (mats.length) {
            var matTitle = document.createElement("p");
            matTitle.className = "material-title";
            matTitle.textContent = "需要清单";
            card.appendChild(matTitle);
            var matList = document.createElement("ul");
            matList.className = "recipe-materials";
            mats.forEach(function (ing) {
                var opts = ing && ing.options ? ing.options : [];
                if (!opts.length) return;
                matList.appendChild(renderMaterialItem(opts, ing.count));
            });
            card.appendChild(matList);
        }

        return card;
    }

    function renderRecipes() {
        var container = document.getElementById("mdye-recipe-list");
        if (!container) return;
        container.innerHTML = "";
        if (!state.recipes.length) {
            var none = document.createElement("p");
            none.className = "recipe-empty";
            none.textContent = "未找到配方数据";
            container.appendChild(none);
            setStatus("未找到配方");
            return;
        }
        state.recipes.forEach(function (r) { container.appendChild(renderRecipe(r)); });
        setStatus(state.recipes.length + " 条配方");
        updateStats();
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

    function init() {
        if (state.loaded) {
            renderRecipes();
            renderAdvancements();
            return;
        }
        setStatus("正在读取配方 0% (0/" + recipeFiles.length + ")");
        setAdvStatus("正在读取进度...");
        loadTranslations().then(function () {
            return Promise.all([
                loadRecipes(function (done, total, pct) {
                    setStatus("正在读取配方 " + pct + "% (" + done + "/" + total + ")");
                }),
                loadAdvancements(function (done, total) {
                    setAdvStatus("正在读取进度 " + done + "/" + total);
                })
            ]);
        }).then(function (results) {
            state.recipes = results[0] || [];
            state.advancements = results[1] || [];
            state.loaded = true;
            renderRecipes();
            renderAdvancements();
            setStatus("加载完成");
            updateStats();
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
