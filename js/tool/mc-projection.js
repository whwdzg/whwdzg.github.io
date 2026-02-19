(() => {
    window.mcprojBooted = true;
           console.info('[mcproj] script loaded v20260219-23');
    let THREE = null;
    let PointerLockControls = null;
    let BufferCtor = null;
    let pakoLib = null;
    let nbtParse = null;
    let nbtSimplify = null;
    let depsLoaded = false;

    const MAX_BLOCKS = 200000; // soft limit to prevent lockups
    let canvas = null;
    let canvasWrap = null;
    let drop = null;
    let fileInput = null;
    let fileMeta = null;
    let statusPill = null;
    let totalEl = null;
    let sizeEl = null;
    let uniqueEl = null;
    let tableBody = null;
    let fullscreenBtn = null;
    let progressWrap = null;
    let progressBar = null;
    let hud = null;
    let hudFps = null;
    let hudPos = null;
    let hudBlocks = null;
    let speedInput = null;
    let focusEl = null;
    // legacy placeholder to avoid ReferenceError if old cached code paths call it
    const speedSlider = null;

    const toast = window.globalCopyToast || { show () {} };

    let renderer = null;
    let scene = null;
    let camera = null;
    let controls = null;
    let instancedMeshes = [];
    let animationId = null;
    let clock = null;
    let initialized = false;
    let pendingFile = null;
    let hideProgressTimer = null;
    let velocity = null;
    let direction = null;
    const moveState = { forward: false, back: false, left: false, right: false, up: false, down: false };
    let boundDropNode = null;
    let langMap = null;
    let targetCenter = null;
    let fpsAccum = 0;
    let fpsFrames = 0;
    let lastRenderCounts = { parsed: 0, rendered: 0, types: 0 };
    let textureLoader = null;
    let moveSpeed = 50;
    const textureCache = new Map();
    let raycaster = null;
    const focusOrigin = { v: null };
    const focusDir = { v: null };
    let focusCooldown = 0;
    let outlineMesh = null;

    async function loadDeps() {
        if (depsLoaded) return;

        const tryImport = async (label, candidates) => {
            let lastErr = null;
            for (const url of candidates) {
                try {
                    console.info('[mcproj] import', label, url);
                    return await import(url);
                } catch (err) {
                    lastErr = err;
                }
            }
            throw new Error(label + ' 加载失败: ' + (lastErr ? lastErr.message : '未知错误'));
        };

        setStatus('加载依赖中...', 'info');
        try {
            const threeMod = await tryImport('three', [
                'https://unpkg.com/three@0.159.0/build/three.module.js',
                'https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.module.js',
                'https://esm.sh/three@0.159.0'
            ]);
            const plcMod = await tryImport('PointerLockControls', [
                'https://unpkg.com/three@0.159.0/examples/jsm/controls/PointerLockControls.js',
                'https://cdn.jsdelivr.net/npm/three@0.159.0/examples/jsm/controls/PointerLockControls.js',
                'https://esm.sh/three@0.159.0/examples/jsm/controls/PointerLockControls?deps=three@0.159.0'
            ]);
            const bufferMod = await tryImport('buffer', [
                'https://cdn.jsdelivr.net/npm/buffer@6.0.3/+esm',
                'https://unpkg.com/buffer@6.0.3/index-esm.js',
                'https://esm.sh/buffer@6.0.3'
            ]);
            const pakoMod = await tryImport('pako', [
                'https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm',
                'https://unpkg.com/pako@2.1.0/dist/pako.esm.mjs',
                'https://esm.sh/pako@2.1.0'
            ]);
            const nbtMod = await tryImport('prismarine-nbt', [
                'https://cdn.jsdelivr.net/npm/prismarine-nbt@2.2.1/+esm',
                'https://esm.sh/prismarine-nbt@2.2.1'
            ]);

            THREE = threeMod;
            PointerLockControls = plcMod.PointerLockControls;
            BufferCtor = bufferMod.Buffer || bufferMod.default?.Buffer;
            pakoLib = pakoMod.default || pakoMod;
            nbtParse = nbtMod.parse;
            nbtSimplify = nbtMod.simplify;
            if (!THREE || !PointerLockControls || !BufferCtor || !pakoLib || !nbtParse || !nbtSimplify) {
                throw new Error('依赖导出缺失');
            }
            clock = new THREE.Clock();
            velocity = new THREE.Vector3();
            direction = new THREE.Vector3();
            textureLoader = new THREE.TextureLoader();
            depsLoaded = true;
            setStatus('依赖加载完成，选择文件开始', 'success');
        } catch (err) {
            console.error('依赖加载失败', err);
            setStatus('依赖加载失败，请检查网络/CDN', 'error');
            fileMeta.textContent = '初始化失败：' + err.message;
            throw err;
        }
    }

    function refreshElements() {
        canvas = document.getElementById('mcproj-canvas');
        canvasWrap = document.getElementById('mcproj-canvas-wrap');
        drop = document.getElementById('mcproj-drop');
        fileInput = document.getElementById('mcproj-file');
        fileMeta = document.getElementById('mcproj-file-meta');
        statusPill = document.getElementById('mcproj-status');
        totalEl = document.getElementById('mcproj-total');
        sizeEl = document.getElementById('mcproj-size');
        uniqueEl = document.getElementById('mcproj-unique');
        tableBody = document.getElementById('mcproj-table-body');
        fullscreenBtn = document.getElementById('mcproj-fullscreen');
        progressWrap = document.getElementById('mcproj-progress');
        progressBar = document.getElementById('mcproj-progress-bar');
        hud = document.getElementById('mcproj-hud');
        hudFps = document.getElementById('mcproj-hud-fps');
        hudPos = document.getElementById('mcproj-hud-pos');
        hudBlocks = document.getElementById('mcproj-hud-blocks');
        speedInput = document.getElementById('mcproj-speed-input');
        focusEl = document.getElementById('mcproj-focus');
        return !!(canvas && canvasWrap && drop && fileInput && fileMeta && statusPill && totalEl && sizeEl && uniqueEl && tableBody && fullscreenBtn);
    }

    async function ensureReady() {
        if (!depsLoaded) {
            await loadDeps();
        }
        if (!initialized) {
            if (!refreshElements()) {
                console.warn('[mcproj] elements missing during ensureReady');
                return;
            }
            resetScene();
            bindKeys();
            bindFullscreen();
            animate();
            initialized = true;
            console.info('[mcproj] init completed');
        }
    }

    function setStatus(text, tone) {
        if (!statusPill) return;
        statusPill.textContent = text;
        statusPill.dataset.state = tone || 'info';
    }

    function setProgress(pct) {
        if (!progressWrap || !progressBar) return;
        progressWrap.hidden = false;
        const clamped = Math.max(0, Math.min(100, pct));
        progressBar.style.width = clamped + '%';
        progressWrap.setAttribute('aria-valuenow', String(Math.round(clamped)));
        if (hideProgressTimer) {
            clearTimeout(hideProgressTimer);
            hideProgressTimer = null;
        }
    }

    function hideProgress(delay) {
        if (!progressWrap) return;
        const d = delay || 400;
        hideProgressTimer = setTimeout(() => {
            progressWrap.hidden = true;
            progressBar.style.width = '0%';
        }, d);
    }

    function resetScene() {
        if (animationId) cancelAnimationFrame(animationId);
        animationId = null;
        disposeMeshes();
        if (renderer) renderer.dispose();
        const { w, h } = getWrapSize();
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(w, h, false);

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a);

        camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 20000);
        camera.position.set(10, 10, 10);

        controls = new PointerLockControls(camera, canvasWrap);
        controls.addEventListener('lock', () => setStatus('已锁定鼠标 (Esc 可退出)', 'success'));
        controls.addEventListener('unlock', () => setStatus('鼠标未锁定，点击画面开始', 'info'));
        canvasWrap.addEventListener('click', () => controls.lock());

        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        const dir = new THREE.DirectionalLight(0xffffff, 0.6);
        dir.position.set(5, 10, 7);
        scene.add(ambient, dir);

        if (!raycaster) raycaster = new THREE.Raycaster();
        if (!focusOrigin.v) focusOrigin.v = new THREE.Vector3();
        if (!focusDir.v) focusDir.v = new THREE.Vector3();
        setupOutlineHelper();

        window.addEventListener('resize', handleResize);
        bindSpeedControl();
        // restart loop after rebuild
        animate();
    }

    function getWrapSize() {
        const w = canvasWrap ? canvasWrap.clientWidth : 0;
        const h = canvasWrap ? canvasWrap.clientHeight : 0;
        const safeW = w > 0 ? w : 960;
        const safeH = h > 0 ? h : 540;
        return { w: safeW, h: safeH };
    }

    function handleResize() {
        if (!renderer || !camera) return;
        const { w, h } = getWrapSize();
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
    }

    function animate() {
        if (!clock) {
            animationId = requestAnimationFrame(animate);
            return;
        }
        const delta = clock.getDelta();
        if (controls && controls.isLocked) {
            const speed = moveSpeed;
            velocity.x -= velocity.x * 8.0 * delta;
            velocity.z -= velocity.z * 8.0 * delta;
            velocity.y -= velocity.y * 8.0 * delta;

            direction.z = Number(moveState.forward) - Number(moveState.back);
            direction.x = Number(moveState.right) - Number(moveState.left);
            direction.y = Number(moveState.up) - Number(moveState.down);
            direction.normalize();

            if (moveState.forward || moveState.back) velocity.z -= direction.z * speed * delta;
            if (moveState.left || moveState.right) velocity.x -= direction.x * speed * delta;
            if (moveState.up || moveState.down) velocity.y += direction.y * speed * delta;

            controls.moveRight(-velocity.x * delta);
            controls.moveForward(-velocity.z * delta);
            controls.getObject().position.y += velocity.y * delta;
        }
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
        updateHud(delta);
        updateFocus(delta);
        animationId = requestAnimationFrame(animate);
    }

    function bindKeys() {
        const onKey = (e, down) => {
            switch (e.code) {
                case 'KeyW': moveState.forward = down; break;
                case 'KeyS': moveState.back = down; break;
                case 'KeyA': moveState.left = down; break;
                case 'KeyD': moveState.right = down; break;
                case 'Space': moveState.up = down; break;
                case 'ShiftLeft':
                case 'ShiftRight': moveState.down = down; break;
                default: return;
            }
            e.preventDefault();
        };
        window.addEventListener('keydown', (e) => onKey(e, true));
        window.addEventListener('keyup', (e) => onKey(e, false));
    }

    function updateHud(delta) {
        if (!hud) return;
        fpsAccum += delta;
        fpsFrames += 1;
        if (hudFps && fpsAccum >= 0.25) {
            const fps = fpsFrames / fpsAccum;
            hudFps.textContent = fps.toFixed(1);
            fpsAccum = 0;
            fpsFrames = 0;
        }
        const obj = controls ? controls.getObject() : camera;
        if (hudPos && obj && obj.position) {
            const p = obj.position;
            hudPos.textContent = `${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`;
        }
        if (hudBlocks) {
            const { parsed, rendered, types } = lastRenderCounts;
            hudBlocks.textContent = parsed ? `${rendered}/${parsed} · 种类 ${types}` : '-';
        }
    }

    function updateFocus(delta) {
        if (!focusEl || !raycaster || !camera || !instancedMeshes.length) return;
        focusCooldown += delta;
        if (focusCooldown < 0.1) return; // throttle to ~10 fps
        focusCooldown = 0;
        const origin = focusOrigin.v || (focusOrigin.v = new THREE.Vector3());
        const dir = focusDir.v || (focusDir.v = new THREE.Vector3());
        camera.getWorldPosition(origin);
        camera.getWorldDirection(dir);
        raycaster.set(origin, dir);
        raycaster.far = 400;
        const hits = raycaster.intersectObjects(instancedMeshes, false);
        if (hits && hits.length) {
            const hit = hits[0];
            const meta = hit.object && hit.object.userData ? hit.object.userData.mcprojMeta : null;
            const label = meta && (meta.label || meta.name || meta.itemId);
            focusEl.textContent = label || '-';
            updateOutline(hit);
        } else {
            focusEl.textContent = '-';
            hideOutline();
        }
    }

    function setupOutlineHelper() {
        if (!THREE || !scene) return;
        if (outlineMesh && scene.children.includes(outlineMesh)) {
            outlineMesh.visible = false;
            return;
        }
        const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.002, 1.002, 1.002));
        const mat = new THREE.LineBasicMaterial({ color: 0x111111, linewidth: 2 });
        outlineMesh = new THREE.LineSegments(geo, mat);
        outlineMesh.visible = false;
        outlineMesh.renderOrder = 999;
        scene.add(outlineMesh);
    }

    function updateOutline(hit) {
        if (!outlineMesh || !hit || hit.instanceId === undefined || hit.instanceId === null) return;
        const mesh = hit.object;
        if (!mesh || typeof mesh.getMatrixAt !== 'function') return;
        const mat = new THREE.Matrix4();
        mesh.getMatrixAt(hit.instanceId, mat);
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        mat.decompose(pos, quat, scale);
        outlineMesh.position.copy(pos);
        outlineMesh.quaternion.copy(quat);
        outlineMesh.scale.copy(scale);
        outlineMesh.visible = true;
    }

    function hideOutline() {
        if (outlineMesh) outlineMesh.visible = false;
    }

    function readFile(file, onProgress) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.onprogress = (evt) => {
                if (evt.lengthComputable && onProgress) {
                    const pct = (evt.loaded / evt.total) * 100;
                    onProgress(pct);
                }
            };
            reader.onloadstart = () => {
                if (onProgress) onProgress(0);
            };
            reader.onloadend = () => {
                if (onProgress) onProgress(100);
            };
            reader.onload = () => resolve(reader.result);
            reader.readAsArrayBuffer(file);
        });
    }

    function maybeDecompress(uint8) {
        if (uint8.length >= 2 && uint8[0] === 0x1f && uint8[1] === 0x8b) {
            return pakoLib.ungzip(uint8);
        }
        return uint8;
    }

    function parseNbt(uint8) {
        return new Promise((resolve, reject) => {
            try {
                const buf = BufferCtor.from(uint8);
                nbtParse(buf, (err, data) => {
                    if (err) return reject(err);
                    resolve(nbtSimplify(data));
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    function colorFromName(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i += 1) {
            hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        const h = (hash % 360 + 360) % 360;
        const s = 60;
        const l = 55;
        const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l / 100 - c / 2;
        let r = 0, g = 0, b = 0;
        if (h < 60) { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        return new THREE.Color(r + m, g + m, b + m);
    }

    function unpackPalette(states, bits, total) {
        const mask = (1n << BigInt(bits)) - 1n;
        const out = new Uint32Array(total);
        let acc = 0n;
        let accBits = 0;
        let idx = 0;
        const asUint = (v) => BigInt.asUintN(64, BigInt(v));
        for (let i = 0; i < states.length; i += 1) {
            acc |= asUint(states[i]) << BigInt(accBits);
            accBits += 64;
            while (accBits >= bits && idx < total) {
                out[idx] = Number(acc & mask);
                acc >>= BigInt(bits);
                accBits -= bits;
                idx += 1;
            }
        }
        return out;
    }

    function toVec3(v) {
        if (Array.isArray(v) && v.length >= 3) return [Number(v[0]) || 0, Number(v[1]) || 0, Number(v[2]) || 0];
        if (v && typeof v === 'object') {
            const x = Number(v.x ?? v.X ?? v[0]) || 0;
            const y = Number(v.y ?? v.Y ?? v[1]) || 0;
            const z = Number(v.z ?? v.Z ?? v[2]) || 0;
            return [x, y, z];
        }
        return [0, 0, 0];
    }

    function normalizePalette(raw) {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'object') {
            const entries = Object.entries(raw).sort((a, b) => Number(a[0]) - Number(b[0]));
            return entries.map(([, v]) => v);
        }
        return [];
    }

    function localizeBlockId(nameKey) {
        if (!nameKey) return '';
        const colon = nameKey.indexOf(':');
        const ns = colon !== -1 ? nameKey.slice(0, colon) : 'minecraft';
        const id = colon !== -1 ? nameKey.slice(colon + 1) : nameKey;
        const key = `block.${ns}.${id}`;
        if (langMap && langMap[key]) return langMap[key];
        return nameKey;
    }

    function paletteName(entry) {
        if (typeof entry === 'string') return localizeBlockId(entry);
        if (entry && typeof entry === 'object') {
            if (entry.Name) {
                const props = entry.Properties || entry.properties;
                const base = localizeBlockId(entry.Name);
                if (props && typeof props === 'object' && Object.keys(props).length) {
                    const kv = Object.keys(props).sort().map((k) => `${k}=${props[k]}`);
                    return `${base}[${kv.join(',')}]`;
                }
                return base;
            }
            return JSON.stringify(entry);
        }
        return String(entry);
    }

    function blockInfo(entry) {
        const label = paletteName(entry);
        if (entry && typeof entry === 'object') {
            const id = entry.Name || entry.name || label;
            return { id, label };
        }
        if (typeof entry === 'string') {
            return { id: entry, label };
        }
        return { id: label, label };
    }

    function isAir(rawName) {
        if (!rawName) return true;
        const s = String(rawName).toLowerCase();
        return s === 'air' || s === 'minecraft:air' || s.endsWith(':air') || s.includes('void_air') || s.includes('cave_air') || s === 'id:0:0';
    }

    function normalizeStates(raw) {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        if (ArrayBuffer.isView(raw)) return Array.from(raw);
        if (raw.data) return normalizeStates(raw.data);
        if (raw.value) return normalizeStates(raw.value);
        return [];
    }

    function decodeStates(states, bits, total) {
        const isByteLike = states.length > 0 && states.every((v) => typeof v === 'number' && v >= 0 && v < 256);
        if (isByteLike) {
            return unpackBitArray(states, bits, total);
        }
        return unpackPalette(states, bits, total);
    }

    async function loadLang() {
        if (langMap) return langMap;
        const tryFetch = async (url) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))));
        const merge = (a, b) => ({ ...(a || {}), ...(b || {}) });
        try {
            const [zh, en] = await Promise.allSettled([
                tryFetch('/resource/minecraft/zh_ch.json'),
                tryFetch('/resource/minecraft/en_us.json')
            ]);
            const zhObj = zh.status === 'fulfilled' ? zh.value : {};
            const enObj = en.status === 'fulfilled' ? en.value : {};
            langMap = merge(enObj, zhObj); // zh 覆盖英文
        } catch (e) {
            langMap = {};
        }
        return langMap;
    }

    function unpackBitArray(bytes, bits, total) {
        const mask = (1n << BigInt(bits)) - 1n;
        const out = new Uint32Array(total);
        let acc = 0n;
        let accBits = 0;
        let idx = 0;
        for (let i = 0; i < bytes.length; i += 1) {
            acc |= BigInt(bytes[i]) << BigInt(accBits);
            accBits += 8;
            while (accBits >= bits && idx < total) {
                out[idx] = Number(acc & mask);
                acc >>= BigInt(bits);
                accBits -= bits;
                idx += 1;
            }
        }
        return out;
    }

    function buildFromLitematic(root) {
        const regions = root.Regions || root.regions;
        if (!regions) throw new Error('未找到 Regions');
        const blocks = [];
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        Object.keys(regions).forEach((key) => {
            const reg = regions[key];
            const [sxRaw, syRaw, szRaw] = toVec3(reg.Size || reg.size || reg.regionSize || [0, 0, 0]);
            const sx = Math.abs(sxRaw);
            const sy = Math.abs(syRaw);
            const sz = Math.abs(szRaw);
            const origin = toVec3(reg.Position || reg.position || reg.origin || [0, 0, 0]);
            const palette = normalizePalette(reg.BlockStatePalette || reg.palette);
            const states = normalizeStates(reg.BlockStates || reg.block_states);
            if (!palette || !states) throw new Error('Region palette 或 BlockStates 缺失');
            if (!palette.length) throw new Error('Region palette 为空');
            const bits = Math.max(1, Math.ceil(Math.log2(palette.length)));
            const total = sx * sy * sz;
            if (!total) throw new Error('Region 尺寸为 0');
            const indices = decodeStates(states, bits, total);
            if (!indices.length) throw new Error('Region BlockStates 为空');
            if (indices.length < total) {
                console.warn('[mcproj] region states decoded less than expected', indices.length, 'vs', total);
            }
            console.info('[mcproj] region', key, 'size', [sx, sy, sz], 'palette', palette.length, 'states', states.length, 'bits', bits, 'decoder', (states.length && typeof states[0] === 'bigint') ? 'long' : 'bytes');
            for (let y = 0; y < sy; y += 1) {
                for (let z = 0; z < sz; z += 1) {
                    for (let x = 0; x < sx; x += 1) {
                        const idx = (y * sz + z) * sx + x;
                        const pid = indices[idx];
                        if (pid >= palette.length) continue;
                        const info = blockInfo(palette[pid]);
                        const rawName = info.id || (typeof palette[pid] === 'object' ? palette[pid].Name : palette[pid]);
                        if (isAir(rawName)) continue;
                        const wx = origin[0] + x;
                        const wy = origin[1] + y;
                        const wz = origin[2] + z;
                        blocks.push({ x: wx, y: wy, z: wz, name: info.label, itemId: info.id });
                        if (wx < minX) minX = wx;
                        if (wy < minY) minY = wy;
                        if (wz < minZ) minZ = wz;
                        if (wx > maxX) maxX = wx;
                        if (wy > maxY) maxY = wy;
                        if (wz > maxZ) maxZ = wz;
                    }
                }
            }
        });
        if (!blocks.length) return { blocks, size: [0, 0, 0], bounds: null };
        return {
            blocks,
            size: [maxX - minX + 1, maxY - minY + 1, maxZ - minZ + 1],
            bounds: { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] }
        };
    }

    function buildFromSchematic(root) {
        const width = root.Width || root.width;
        const height = root.Height || root.height;
        const length = root.Length || root.length;
        const blocksTag = root.Blocks || root.blocks;
        const dataTag = root.Data || root.data || [];
        if (!width || !height || !length || !blocksTag) throw new Error('无效的 schematic');
        const blocks = [];
        const total = width * height * length;
        if (!blocksTag.length) throw new Error('schematic Blocks 为空');
        const palette = {};
        for (let i = 0; i < total; i += 1) {
            const id = blocksTag[i];
            const data = dataTag[i] || 0;
            const key = `id:${id}:${data}`;
            palette[key] = true;
        }
        for (let y = 0; y < height; y += 1) {
            for (let z = 0; z < length; z += 1) {
                for (let x = 0; x < width; x += 1) {
                    const idx = (y * length + z) * width + x;
                    const id = blocksTag[idx];
                    const data = dataTag[idx] || 0;
                    if (id === 0) continue; // treat id 0 as air
                    const name = `id:${id}:${data}`;
                    blocks.push({ x, y, z, name, itemId: name });
                }
            }
        }
        return { blocks, size: [width, height, length], bounds: { min: [0, 0, 0], max: [width - 1, height - 1, length - 1] } };
    }

    function buildFromSpongeSchem(root) {
        const width = root.Width || root.width;
        const height = root.Height || root.height;
        const length = root.Length || root.length;
        const palette = root.Palette || root.palette;
        const data = root.BlockData || root.blockdata || root.blockData;
        if (!width || !height || !length || !palette || !data) {
            throw new Error('无效的 schem (缺少尺寸或 Palette/BlockData)');
        }
        const paletteEntries = Object.entries(palette);
        if (!paletteEntries.length) throw new Error('schem Palette 为空');
        const invPalette = new Map();
        paletteEntries.forEach(([name, id]) => {
            invPalette.set(Number(id), name);
        });
        const total = width * height * length;
        const bits = Math.max(1, Math.ceil(Math.log2(paletteEntries.length)));
        const indices = unpackBitArray(data, bits, total);
        const blocks = [];
        for (let y = 0; y < height; y += 1) {
            for (let z = 0; z < length; z += 1) {
                for (let x = 0; x < width; x += 1) {
                    const idx = (y * length + z) * width + x;
                    const pid = indices[idx];
                    const rawName = invPalette.get(pid) || `id:${pid}`;
                    const info = blockInfo(rawName);
                    if (isAir(info.id || rawName)) continue;
                    blocks.push({ x, y, z, name: info.label, itemId: info.id });
                }
            }
        }
        return { blocks, size: [width, height, length], bounds: { min: [0, 0, 0], max: [width - 1, height - 1, length - 1] } };
    }

    function chooseParser(nbt) {
        const errors = [];
        const tryBuild = (label, builder) => {
            try {
                const parsed = builder(nbt);
                console.info('[mcproj] parsed as', label, 'blocks', parsed.blocks.length);
                return parsed;
            } catch (e) {
                errors.push(label + ': ' + e.message);
                return null;
            }
        };

        const hasRegions = !!(nbt && (nbt.Regions || nbt.regions));
        const hasClassic = !!(nbt && (nbt.Blocks || nbt.blocks) && (nbt.Width || nbt.width));
        const hasSponge = !!(nbt && (nbt.Palette || nbt.palette) && (nbt.BlockData || nbt.blockdata || nbt.blockData));

        let parsed = null;
        if (hasRegions) parsed = tryBuild('litematic', buildFromLitematic);
        if (!parsed && hasSponge) parsed = tryBuild('sponge-schem', buildFromSpongeSchem);
        if (!parsed && hasClassic) parsed = tryBuild('schematic', buildFromSchematic);

        if (!parsed && hasSponge) parsed = tryBuild('sponge-schem', buildFromSpongeSchem);
        if (!parsed) parsed = tryBuild('litematic', buildFromLitematic);
        if (!parsed) parsed = tryBuild('schematic', buildFromSchematic);

            if (!parsed) {
                throw new Error('未识别的 NBT 格式：' + errors.join('; '));
            }
        if (!parsed.blocks || !parsed.blocks.length) {
                throw new Error('未找到方块数据，文件可能为空或格式不兼容');
        }
        return parsed;
    }

    function disposeMeshes() {
        if (!instancedMeshes || !instancedMeshes.length) return;
        instancedMeshes.forEach((m) => {
            if (m.geometry) m.geometry.dispose();
            if (m.material) {
                if (Array.isArray(m.material)) {
                    m.material.forEach((mat) => mat && mat.dispose());
                } else {
                    m.material.dispose();
                }
            }
            scene.remove(m);
        });
        instancedMeshes = [];
    }

    async function loadTextureFor(id) {
        if (!textureLoader || !window.ItemSlot || !id) return null;
        if (textureCache.has(id)) return textureCache.get(id);
        const translations = langMap || {};
        const candidates = window.ItemSlot.pickTextures(id, { translations, includeSpawnEgg: false });
        const promise = (async () => {
            for (const url of candidates) {
                try {
                    const tex = await textureLoader.loadAsync(url);
                    tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
                    tex.magFilter = THREE.NearestFilter;
                    tex.minFilter = THREE.NearestFilter;
                    tex.generateMipmaps = false;
                    tex.needsUpdate = true;
                    return tex;
                } catch (e) {
                    // try next
                }
            }
            return null;
        })();
        textureCache.set(id, promise);
        return promise;
    }

    async function buildGeometry(parsed) {
        if (!scene) return;
        disposeMeshes();
        const blocks = parsed.blocks;
        const total = blocks.length;
        if (!total) throw new Error('未找到方块数据');
        if (total > MAX_BLOCKS) {
            throw new Error('方块数量超过限制，请使用更小的模型');
        }

        const paletteMap = new Map();
        blocks.forEach((b) => {
            const key = b.name;
            if (!paletteMap.has(key)) {
                const colorKey = b.itemId || b.name;
                paletteMap.set(key, { positions: [], colorKey, itemId: b.itemId || null, label: b.name });
            }
            paletteMap.get(key).positions.push([b.x, b.y, b.z]);
        });

        const geom = new THREE.BoxGeometry(1, 1, 1);
        const paletteArray = Array.from(paletteMap.entries());
        let renderedCount = 0;
        for (const [name, meta] of paletteArray) {
            const tex = await loadTextureFor(meta.itemId || name);
            const mat = tex ? new THREE.MeshStandardMaterial({ map: tex }) : new THREE.MeshStandardMaterial({ color: colorFromName(meta.colorKey) });
            const mesh = new THREE.InstancedMesh(geom, mat, meta.positions.length);
            mesh.frustumCulled = false;
            mesh.userData.mcprojMeta = { name, label: meta.label || name, itemId: meta.itemId || null, positions: meta.positions };
            const dummy = new THREE.Object3D();
            meta.positions.forEach((pos, idx) => {
                dummy.position.set(pos[0], pos[1], pos[2]);
                dummy.updateMatrix();
                mesh.setMatrixAt(idx, dummy.matrix);
            });
            mesh.instanceMatrix.needsUpdate = true;
            instancedMeshes.push(mesh);
            scene.add(mesh);
            renderedCount += meta.positions.length;
        }
        lastRenderCounts = { parsed: total, rendered: renderedCount, types: paletteArray.length };

        // center camera
        const [sx, sy, sz] = parsed.size;
        const bounds = parsed.bounds;
        if (bounds) console.info('[mcproj] bounds', bounds);
        const cx = bounds ? (bounds.min[0] + bounds.max[0]) / 2 : sx / 2;
        const cy = bounds ? (bounds.min[1] + bounds.max[1]) / 2 : sy / 2;
        const cz = bounds ? (bounds.min[2] + bounds.max[2]) / 2 : sz / 2;
        const center = new THREE.Vector3(cx, cy, cz);
        targetCenter = center.clone();
        controls.getObject().position.copy(center.clone().add(new THREE.Vector3(0, Math.max(6, sy * 0.6), Math.max(6, sz * 0.8))));
        camera.lookAt(center);

        const statsPalette = paletteArray.map(([n, meta]) => [n, { count: meta.positions.length, color: colorFromName(meta.colorKey), itemId: meta.itemId }]);
        updateStats(blocks, statsPalette, parsed.size);
        setStatus('渲染完成，点击画面获取鼠标锁定', 'success');
    }

    function updateStats(blocks, paletteArray, size) {
        totalEl.textContent = blocks.length.toLocaleString('zh-CN');
        sizeEl.textContent = size ? `${size[0]} x ${size[1]} x ${size[2]}` : '-';
        uniqueEl.textContent = paletteArray.length;
        tableBody.innerHTML = '';
        if (!paletteArray.length) {
            tableBody.innerHTML = '<tr><td colspan="2">无数据</td></tr>';
            return;
        }
        const translations = langMap || {};
        paletteArray.sort((a, b) => b[1].count - a[1].count).forEach(([name, meta]) => {
            const tr = document.createElement('tr');
            const nameTd = document.createElement('td');
            const cell = document.createElement('div');
            cell.className = 'mcproj-block-cell';

            if (window.ItemSlot) {
                try {
                    const slot = window.ItemSlot.createSlot(meta.itemId || name, { translations });
                    slot.classList.add('mcproj-block-slot');
                    cell.appendChild(slot);
                } catch (e) {
                    console.warn('[mcproj] createSlot failed', e);
                }
            }

            const label = document.createElement('span');
            label.className = 'mcproj-block-label';
            label.textContent = name;
            cell.appendChild(label);

            nameTd.appendChild(cell);
            const countTd = document.createElement('td');
            countTd.textContent = meta.count.toLocaleString('zh-CN');
            tr.appendChild(nameTd);
            tr.appendChild(countTd);
            tableBody.appendChild(tr);
        });
    }

    async function handleFile(file) {
        setStatus('读取中...', 'info');
        fileMeta.textContent = `${file.name} · ${(file.size / 1024).toFixed(1)} KB`;
        try {
            await ensureReady();
            await loadLang();
            console.info('[mcproj] start parse', file.name, 'size', file.size);
            const buf = await readFile(file, (pct) => setProgress(pct));
            const uint8 = new Uint8Array(buf);
            const inflated = maybeDecompress(uint8);
            const nbt = await parseNbt(inflated);
            console.info('[mcproj] nbt keys', Object.keys(nbt || {}));
            const parsed = chooseParser(nbt);
            console.info('[mcproj] parsed size', parsed.size, 'blocks', parsed.blocks.length);
            resetScene();
            await buildGeometry(parsed);
            handleResize();
            pendingFile = null;
            setProgress(100);
            hideProgress(500);
            console.info('[mcproj] parse success');
        } catch (err) {
            console.error(err);
            setStatus('解析失败：' + (err && err.message ? err.message : '未知错误'), 'error');
            toast.show('解析失败', 'error', 'icon-ic_fluent_error_circle_24_regular');
            hideProgress(800);
            if (fileMeta) fileMeta.textContent = '解析失败：' + (err && err.message ? err.message : '未知错误');
        }
    }

    function bindDrop() {
        if (!drop || !fileInput) return;
        if (boundDropNode === drop) return; // already bound for current DOM node
        boundDropNode = drop;

        console.info('[mcproj] bindDrop on node', boundDropNode.id || boundDropNode.className);

        const onDrop = async (ev) => {
            ev.preventDefault();
            drop.classList.remove('dragover');
            const file = ev.dataTransfer.files && ev.dataTransfer.files[0];
            if (file) {
                console.info('[mcproj] drop file', file.name);
                pendingFile = file;
                fileMeta.textContent = `${pendingFile.name} · ${(pendingFile.size / 1024).toFixed(1)} KB`;
                setStatus('读取中...', 'info');
                setProgress(0);
                await handleFile(pendingFile);
            }
        };
        ['dragover', 'dragenter'].forEach((evt) => {
            drop.addEventListener(evt, (e) => { e.preventDefault(); drop.classList.add('dragover'); });
        });
        ['dragleave', 'drop'].forEach((evt) => {
            drop.addEventListener(evt, () => drop.classList.remove('dragover'));
        });
        drop.addEventListener('drop', onDrop);
        const resetPicker = () => { fileInput.value = ''; fileInput.value = null; };
        drop.addEventListener('click', () => { resetPicker(); fileInput.click(); });
        drop.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); resetPicker(); fileInput.click(); } });
        fileInput.addEventListener('mousedown', resetPicker);
        fileInput.addEventListener('click', resetPicker);
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            pendingFile = file;
            console.info('[mcproj] choose file', pendingFile.name);
            fileMeta.textContent = `${pendingFile.name} · ${(pendingFile.size / 1024).toFixed(1)} KB`;
            setStatus('读取中...', 'info');
            setProgress(0);
            resetPicker();
            await handleFile(pendingFile);
        });
    }

    function bindSpeedControl() {
        if (!speedInput) return;
        const MIN_SPEED = 2;
        const MAX_SPEED = 100;
        const clamp = (val) => {
            const n = Number(val);
            if (!Number.isFinite(n)) return moveSpeed;
            return Math.min(Math.max(n, MIN_SPEED), MAX_SPEED);
        };
        const commit = (raw) => {
            const next = clamp(raw);
            moveSpeed = next;
            speedInput.value = String(Math.round(next * 100) / 100);
        };
        commit(speedInput.value || moveSpeed);
        speedInput.addEventListener('input', (e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) {
                moveSpeed = clamp(n);
            }
        });
        ['change', 'blur'].forEach((evt) => {
            speedInput.addEventListener(evt, (e) => commit(e.target.value));
        });
        speedInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                commit(e.target.value);
                e.target.blur();
            }
        });
    }

    function bindFullscreen() {
        if (!fullscreenBtn) return;
        fullscreenBtn.addEventListener('click', () => {
            const wrap = canvasWrap;
            if (!wrap) return;
            if (!document.fullscreenElement) {
                wrap.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        });
        document.addEventListener('fullscreenchange', handleResize);
    }

    async function init() {
        refreshElements();
        if (!canvas || !drop || !fileInput) {
            console.warn('[mcproj] elements not found during init');
            return;
        }
        bindDrop();
        if (statusPill) setStatus('未载入，选择或拖放文件', 'info');
        if (fileMeta) fileMeta.textContent = '等待选择文件';
        console.info('[mcproj] init: bound listeners');
        // 后台加载依赖，完成后确保场景就绪
        loadDeps()
            .then(() => ensureReady())
            .catch(() => {});
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', () => { init(); }, { once: true });
    } else {
        init();
    }
    window.addEventListener('spa:page:loaded', () => { init(); });
})();
