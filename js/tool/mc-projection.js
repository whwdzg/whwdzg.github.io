import * as THREE from 'https://unpkg.com/three@0.159.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.159.0/examples/jsm/controls/PointerLockControls.js';

(() => {
    const MAX_BLOCKS = 200000; // soft limit to prevent lockups
    const canvas = document.getElementById('mcproj-canvas');
    const canvasWrap = document.getElementById('mcproj-canvas-wrap');
    const drop = document.getElementById('mcproj-drop');
    const fileInput = document.getElementById('mcproj-file');
    const fileMeta = document.getElementById('mcproj-file-meta');
    const statusPill = document.getElementById('mcproj-status');
    const totalEl = document.getElementById('mcproj-total');
    const sizeEl = document.getElementById('mcproj-size');
    const uniqueEl = document.getElementById('mcproj-unique');
    const tableBody = document.getElementById('mcproj-table-body');
    const fullscreenBtn = document.getElementById('mcproj-fullscreen');
    const parseBtn = document.getElementById('mcproj-parse');

    const toast = window.globalCopyToast || { show () {} };
    const Buffer = () => window.Buffer || (window.buffer && window.buffer.Buffer) || null;
    const nbtLib = () => window.prismarineNbt || null;
    const pako = () => window.pako || null;

    if (!canvas || !drop || !fileInput) {
        console.warn('MC projection init skipped: missing elements');
        return;
    }

    let renderer = null;
    let scene = null;
    let camera = null;
    let controls = null;
    let instancedMesh = null;
    let animationId = null;
    let clock = new THREE.Clock();
    let initialized = false;
    let pendingFile = null;
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const moveState = { forward: false, back: false, left: false, right: false, up: false, down: false };

    function setStatus(text, tone) {
        statusPill.textContent = text;
        statusPill.dataset.state = tone || 'info';
    }

    function resetScene() {
        if (animationId) cancelAnimationFrame(animationId);
        if (renderer) renderer.dispose();
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(canvasWrap.clientWidth, canvasWrap.clientHeight, false);

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a);

        camera = new THREE.PerspectiveCamera(60, canvasWrap.clientWidth / canvasWrap.clientHeight, 0.1, 2000);
        camera.position.set(10, 10, 10);

        controls = new PointerLockControls(camera, canvasWrap);
        controls.addEventListener('lock', () => setStatus('已锁定鼠标 (Esc 可退出)', 'success'));
        controls.addEventListener('unlock', () => setStatus('鼠标未锁定，点击画面开始', 'info'));
        canvasWrap.addEventListener('click', () => controls.lock());

        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        const dir = new THREE.DirectionalLight(0xffffff, 0.6);
        dir.position.set(5, 10, 7);
        scene.add(ambient, dir);

        window.addEventListener('resize', handleResize);
    }

    function handleResize() {
        if (!renderer || !camera) return;
        const w = canvasWrap.clientWidth;
        const h = canvasWrap.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
    }

    function animate() {
        const delta = clock.getDelta();
        if (controls && controls.isLocked) {
            const speed = 18;
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

    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.onload = () => resolve(reader.result);
            reader.readAsArrayBuffer(file);
        });
    }

    function maybeDecompress(uint8) {
        const p = pako();
        if (uint8.length >= 2 && uint8[0] === 0x1f && uint8[1] === 0x8b && p) {
            return p.ungzip(uint8);
        }
        return uint8;
    }

    function parseNbt(uint8) {
        return new Promise((resolve, reject) => {
            try {
                const buf = Buffer().from(uint8);
                const nbt = nbtLib();
                nbt.parse(buf, (err, data) => {
                    if (err) return reject(err);
                    resolve(nbt.simplify(data));
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
        for (let i = 0; i < states.length; i += 1) {
            acc |= BigInt(states[i]) << BigInt(accBits);
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

    function buildFromLitematic(root) {
        const regions = root.Regions || root.regions;
        if (!regions) throw new Error('未找到 Regions');
        const blocks = [];
        let sizeX = 0, sizeY = 0, sizeZ = 0;
        Object.keys(regions).forEach((key) => {
            const reg = regions[key];
            const sx = reg.Size[0];
            const sy = reg.Size[1];
            const sz = reg.Size[2];
            const origin = reg.Position || reg.position || [0, 0, 0];
            const palette = reg.BlockStatePalette || reg.palette;
            const states = reg.BlockStates || reg.block_states;
            if (!palette || !states) return;
            const bits = Math.max(1, Math.ceil(Math.log2(palette.length)));
            const total = sx * sy * sz;
            const indices = unpackPalette(states, bits, total);
            for (let y = 0; y < sy; y += 1) {
                for (let z = 0; z < sz; z += 1) {
                    for (let x = 0; x < sx; x += 1) {
                        const idx = (y * sz + z) * sx + x;
                        const pid = indices[idx];
                        if (pid >= palette.length) continue;
                        blocks.push({ x: origin[0] + x, y: origin[1] + y, z: origin[2] + z, name: palette[pid] });
                    }
                }
            }
            sizeX = Math.max(sizeX, origin[0] + sx);
            sizeY = Math.max(sizeY, origin[1] + sy);
            sizeZ = Math.max(sizeZ, origin[2] + sz);
        });
        return { blocks, size: [sizeX, sizeY, sizeZ] };
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
                    const name = `id:${id}:${data}`;
                    blocks.push({ x, y, z, name });
                }
            }
        }
        return { blocks, size: [width, height, length] };
    }

    function detectType(name) {
        const lower = name.toLowerCase();
        if (lower.endsWith('.litematic') || lower.endsWith('.litematica') || lower.endsWith('.litamatica')) return 'litematic';
        if (lower.endsWith('.schematic')) return 'schematic';
        return 'nbt';
    }

    function buildGeometry(parsed) {
        if (!scene) return;
        if (instancedMesh) {
            instancedMesh.geometry.dispose();
            instancedMesh.material.dispose();
            scene.remove(instancedMesh);
            instancedMesh = null;
        }
        const blocks = parsed.blocks;
        const total = blocks.length;
        if (!total) throw new Error('未找到方块数据');
        if (total > MAX_BLOCKS) {
            throw new Error('方块数量超过限制，请使用更小的模型');
        }
        const paletteMap = new Map();
        blocks.forEach((b) => {
            if (!paletteMap.has(b.name)) {
                paletteMap.set(b.name, { count: 0, color: colorFromName(b.name) });
            }
            paletteMap.get(b.name).count += 1;
        });

        const paletteArray = Array.from(paletteMap.entries());
        const geom = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshStandardMaterial({ vertexColors: true });
        instancedMesh = new THREE.InstancedMesh(geom, mat, total);
        const dummy = new THREE.Object3D();
        const color = new THREE.Color();

        let i = 0;
        blocks.forEach((b) => {
            dummy.position.set(b.x, b.y, b.z);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, dummy.matrix);
            const paletteItem = paletteMap.get(b.name);
            color.copy(paletteItem.color);
            instancedMesh.setColorAt(i, color);
            i += 1;
        });
        instancedMesh.instanceColor.needsUpdate = true;
        scene.add(instancedMesh);

        // center camera
        const [sx, sy, sz] = parsed.size;
        const center = new THREE.Vector3(sx / 2, sy / 2, sz / 2);
        controls.getObject().position.copy(center.clone().add(new THREE.Vector3(0, Math.max(6, sy * 0.6), Math.max(6, sz * 0.8))));
        camera.lookAt(center);

        updateStats(blocks, paletteArray, parsed.size);
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
        paletteArray.sort((a, b) => b[1].count - a[1].count).forEach(([name, meta]) => {
            const tr = document.createElement('tr');
            const nameTd = document.createElement('td');
            nameTd.textContent = name;
            const countTd = document.createElement('td');
            countTd.textContent = meta.count.toLocaleString('zh-CN');
            tr.appendChild(nameTd);
            tr.appendChild(countTd);
            tableBody.appendChild(tr);
        });
    }

    async function handleFile(file) {
        setStatus('读取中...', 'info');
        if (parseBtn) parseBtn.disabled = true;
        fileMeta.textContent = `${file.name} · ${(file.size / 1024).toFixed(1)} KB`;
        try {
            const buf = await readFile(file);
            const uint8 = new Uint8Array(buf);
            const inflated = maybeDecompress(uint8);
            const nbt = await parseNbt(inflated);
            const type = detectType(file.name);
            let parsed;
            if (type === 'litematic') {
                parsed = buildFromLitematic(nbt);
            } else if (type === 'schematic') {
                parsed = buildFromSchematic(nbt);
            } else {
                // try litematic first, fallback to schematic
                try {
                    parsed = buildFromLitematic(nbt);
                } catch (e) {
                    parsed = buildFromSchematic(nbt);
                }
            }
            resetScene();
            buildGeometry(parsed);
            handleResize();
            pendingFile = null;
            if (parseBtn) parseBtn.disabled = true;
        } catch (err) {
            console.error(err);
            setStatus('解析失败：' + (err && err.message ? err.message : '未知错误'), 'error');
            toast.show('解析失败', 'error', 'icon-ic_fluent_error_circle_24_regular');
            if (parseBtn) parseBtn.disabled = false;
        }
    }

    function bindDrop() {
        const onDrop = (ev) => {
            ev.preventDefault();
            drop.classList.remove('dragover');
            const file = ev.dataTransfer.files && ev.dataTransfer.files[0];
            if (file) handleFile(file);
        };
        ['dragover', 'dragenter'].forEach((evt) => {
            drop.addEventListener(evt, (e) => { e.preventDefault(); drop.classList.add('dragover'); });
        });
        ['dragleave', 'drop'].forEach((evt) => {
            drop.addEventListener(evt, () => drop.classList.remove('dragover'));
        });
        drop.addEventListener('drop', onDrop);
        drop.addEventListener('click', () => fileInput.click());
        drop.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                pendingFile = e.target.files[0];
                fileMeta.textContent = `${pendingFile.name} · ${(pendingFile.size / 1024).toFixed(1)} KB`;
                setStatus('已选择，点击“开始解析”', 'info');
                if (parseBtn) parseBtn.disabled = false;
                fileInput.value = '';
            }
        });

        if (parseBtn) {
            parseBtn.addEventListener('click', () => {
                if (!pendingFile) {
                    setStatus('请先选择文件', 'error');
                    return;
                }
                handleFile(pendingFile);
            });
        }
    }

    function bindFullscreen() {
        fullscreenBtn.addEventListener('click', () => {
            const wrap = canvasWrap;
            if (!document.fullscreenElement) {
                wrap.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        });
        document.addEventListener('fullscreenchange', handleResize);
    }

    async function waitDeps() {
        const start = performance.now();
        while (performance.now() - start < 8000) {
            if (Buffer() && nbtLib()) return true;
            await new Promise((r) => setTimeout(r, 120));
        }
        return false;
    }

    async function init() {
        setStatus('加载依赖...', 'info');
        const ok = await waitDeps();
        if (!ok) {
            setStatus('依赖未加载，请检查网络后刷新', 'error');
            console.warn('MC projection deps unavailable after wait');
            return;
        }
        if (!initialized) {
            resetScene();
            bindKeys();
            bindDrop();
            bindFullscreen();
            animate();
            initialized = true;
        }
        setStatus('未载入，选择或拖放文件', 'info');
    }

    window.addEventListener('load', init);
    window.addEventListener('spa:page:loaded', init);
})();
