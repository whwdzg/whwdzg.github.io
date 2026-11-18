/** MC 投影查看器 / Minecraft litematic & schematic viewer. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowClockwiseRegular,
  ArrowDownRegular,
  ArrowLeftRegular,
  ArrowRightRegular,
  ArrowUpRegular,
  DismissRegular,
  FullScreenMaximizeRegular,
  OpenRegular,
} from '@fluentui/react-icons';
import { ToolShell } from '../../components/tools/ToolShell';
import { blockModel } from '../../lib/mc/models';
import { blockStateKey, parseProjectionFile, type BlockState, type Projection } from '../../lib/mc/nbt';
import '../../styles/tools.css';

const TOC = [
  { id: 'viewer', label: '查看器' },
  { id: 'controls', label: '操作' },
  { id: 'format', label: '文件格式' },
];

interface ViewerStats {
  total: number;
  size: string;
  unique: number;
  legend: Array<{ id: string; count: number }>;
}

function colorFor(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) hash = (hash * 31 + id.charCodeAt(index)) | 0;
  return Math.abs(hash) % 0xffffff || 0x7f8fa6;
}

export default function ProjectionPage() {
  const [status, setStatus] = useState('等待文件');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<ViewerStats | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const targetRef = useRef<any>(null);
  const sphereRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 40 });
  const textureCache = useRef(new Map<string, any>());
  const materialCache = useRef(new Map<string, any>());
  const boxGeometry = useRef<any>(null);
  const animationRef = useRef<number>(0);
  const pointerRef = useRef<{ x: number; y: number; button: number } | null>(null);
  const touchRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<number | null>(null);
  const toc = useMemo(() => TOC, []);

  const updateCamera = useCallback(() => {
    const camera = cameraRef.current;
    const target = targetRef.current;
    if (!camera || !target) return;
    const { theta, phi, radius } = sphereRef.current;
    camera.position.set(
      target.x + radius * Math.sin(phi) * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.cos(theta),
    );
    camera.lookAt(target);
  }, []);

  const initThree = useCallback(async () => {
    if (threeRef.current || !mountRef.current) return;
    const THREE = await import('three');
    threeRef.current = THREE;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0d12);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.replaceChildren(renderer.domElement);
    const ambient = new THREE.AmbientLight(0xffffff, 1.7);
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(30, 60, 20);
    scene.add(ambient, sun);
    const grid = new THREE.GridHelper(60, 60, 0x31445e, 0x1b2736);
    grid.position.y = -0.01;
    scene.add(grid);
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    targetRef.current = new THREE.Vector3(0, 0, 0);
    boxGeometry.current = new THREE.BoxGeometry(1, 1, 1);
    const resize = () => {
      const node = mountRef.current;
      if (!node || !rendererRef.current) return;
      const width = node.clientWidth;
      const height = node.clientHeight;
      rendererRef.current.setSize(width, height, false);
      cameraRef.current.aspect = width / Math.max(1, height);
      cameraRef.current.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mountRef.current);
    updateCamera();
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      rendererRef.current?.render(sceneRef.current, cameraRef.current);
    };
    animate();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationRef.current);
      renderer.dispose();
    };
  }, [updateCamera]);

  useEffect(() => {
    void initThree();
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [initThree]);

  const textureMaterial = useCallback(async (path: string | null, id: string) => {
    const THREE = threeRef.current;
    if (!THREE) return null;
    const key = path ?? `color:${id}`;
    const cached = materialCache.current.get(key);
    if (cached) return cached;

    // 缓存 Promise，避免 8 个 worker 同时请求同一张贴图/材质。
    const promise = (async () => {
      if (!path) return new THREE.MeshLambertMaterial({ color: colorFor(id) });
      let texturePromise = textureCache.current.get(path);
      if (!texturePromise) {
        texturePromise = new THREE.TextureLoader().loadAsync(path).catch(() => null);
        textureCache.current.set(path, texturePromise);
      }
      const texture = await texturePromise;
      if (texture) {
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestMipmapNearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
      }
      return new THREE.MeshLambertMaterial({
        map: texture ?? null,
        color: texture ? 0xffffff : colorFor(id),
        transparent: false,
        alphaTest: 0.15,
        side: THREE.DoubleSide,
      });
    })();
    materialCache.current.set(key, promise);
    return promise;
  }, []);

  const buildInstancedState = useCallback(async (THREE: any, block: BlockState, count: number) => {
    const parts = await blockModel(block);
    const meshes: any[] = [];
    const addInstances = (material: any, local: any) => {
      const mesh = new THREE.InstancedMesh(boxGeometry.current, material, count);
      const world = new THREE.Matrix4();
      for (let index = 0; index < count; index += 1) {
        // 位置在下面的分组数据里由 buildScene 写入；这里先占位，稍后统一填充。
        world.identity();
        mesh.setMatrixAt(index, world);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.frustumCulled = false;
      mesh.name = block.id;
      meshes.push({ mesh, local });
    };

    if (!parts.length) {
      const material = await textureMaterial(null, block.id);
      addInstances(material, new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));
      return meshes;
    }

    for (const part of parts) {
      const rotationX = (part.rotationX * Math.PI) / 180;
      const rotationY = (part.rotationY * Math.PI) / 180;
      for (const element of part.elements) {
        const [fx, fy, fz] = element.from;
        const [tx, ty, tz] = element.to;
        const sx = Math.max(Math.abs(tx - fx) / 16, 0.003);
        const sy = Math.max(Math.abs(ty - fy) / 16, 0.003);
        const sz = Math.max(Math.abs(tz - fz) / 16, 0.003);
        const material = await textureMaterial(element.texture, block.id);
        const local = new THREE.Matrix4()
          .makeRotationX(rotationX)
          .multiply(new THREE.Matrix4().makeRotationY(rotationY))
          .multiply(new THREE.Matrix4().makeTranslation((fx + tx) / 32, (fy + ty) / 32, (fz + tz) / 32));
        if (element.rotation) {
          local.multiply(new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(
              element.rotation.axis === 'x' ? 1 : 0,
              element.rotation.axis === 'y' ? 1 : 0,
              element.rotation.axis === 'z' ? 1 : 0,
            ),
            (element.rotation.angle * Math.PI) / 180,
          ));
        }
        local.multiply(new THREE.Matrix4().makeScale(sx, sy, sz));
        addInstances(material, local);
      }
    }
    return meshes;
  }, [textureMaterial]);

  const buildScene = useCallback(async (projection: Projection) => {
    const THREE = threeRef.current;
    const scene = sceneRef.current;
    if (!THREE || !scene) throw new Error('3D 引擎尚未就绪，请稍后重试');
    const old = scene.getObjectByName('projection-root');
    if (old) {
      old.traverse((object: any) => { if (object.isInstancedMesh) object.dispose(); });
      scene.remove(old);
    }
    const root = new THREE.Group();
    root.name = 'projection-root';
    const limit = 20000;
    const blocks = projection.blocks.slice(0, limit);

    // 先按方块状态分组，再用 InstancedMesh 按状态批量绘制。
    // 这样 2 万块通常只会产生几十到几百个 draw call，而不是每个方块一个 Mesh。
    const groups = new Map<string, { block: BlockState; positions: Array<{ x: number; y: number; z: number }> }>();
    for (const block of blocks) {
      const key = blockStateKey(block);
      const group = groups.get(key);
      if (group) group.positions.push({ x: block.x, y: block.y, z: block.z });
      else groups.set(key, { block, positions: [{ x: block.x, y: block.y, z: block.z }] });
    }

    const queue = [...groups.values()];
    let completed = 0;
    const workers = Array.from({ length: Math.min(8, Math.max(2, queue.length)) }, async () => {
      while (queue.length) {
        const item = queue.shift();
        if (!item) return;
        try {
          const meshes = await buildInstancedState(THREE, item.block, item.positions.length);
          for (const entry of meshes) {
            const world = new THREE.Matrix4();
            for (let index = 0; index < item.positions.length; index += 1) {
              const position = item.positions[index];
              world.makeTranslation(position.x, position.y, position.z).multiply(entry.local);
              entry.mesh.setMatrixAt(index, world);
            }
            entry.mesh.instanceMatrix.needsUpdate = true;
            root.add(entry.mesh);
          }
        } catch (error) {
          console.warn('无法构建方块模型', item.block.id, error);
        }
        completed += item.positions.length;
        setStatus(`构建模型 ${Math.min(completed, blocks.length)} / ${blocks.length}`);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    });
    await Promise.all(workers);

    scene.add(root);
    const size = projection.size;
    targetRef.current.set(size.x / 2, size.y / 3, size.z / 2);
    sphereRef.current.radius = Math.max(size.x, size.y, size.z) * 1.7 + 8;
    sphereRef.current.theta = Math.PI / 4;
    sphereRef.current.phi = Math.PI / 3;
    updateCamera();
    setStats({
      total: projection.blocks.length,
      size: `${size.x} × ${size.y} × ${size.z}`,
      unique: projection.counts.length,
      legend: projection.counts.slice(0, 16),
    });
    setStatus(`已渲染 ${blocks.length} 个方块${projection.blocks.length > limit ? `（超过上限，仅显示前 ${limit} 个）` : ''}`);
  }, [buildInstancedState, updateCamera]);

  const loadFile = async (file: File) => {
    setError('');
    setStatus('读取文件…');
    setStats(null);
    try {
      const projection = await parseProjectionFile(file);
      setStatus(`解析完成：${projection.blocks.length} 个方块，构建 3D 模型中…`);
      await buildScene(projection);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '无法解析这个投影文件');
      setStatus('解析失败');
    }
  };

  const rotate = (deltaX: number, deltaY: number) => {
    sphereRef.current.theta -= deltaX * 0.007;
    sphereRef.current.phi = Math.min(Math.PI - 0.1, Math.max(0.1, sphereRef.current.phi - deltaY * 0.007));
    updateCamera();
  };

  const pan = (deltaX: number, deltaY: number) => {
    const camera = cameraRef.current;
    const target = targetRef.current;
    if (!camera || !target) return;
    const scale = sphereRef.current.radius * 0.0018;
    const right = new threeRef.current.Vector3();
    const up = new threeRef.current.Vector3();
    camera.matrix.extractBasis(right, up, new threeRef.current.Vector3());
    target.addScaledVector(right, -deltaX * scale);
    target.addScaledVector(up, deltaY * scale);
    updateCamera();
  };

  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    const camera = cameraRef.current;
    const target = targetRef.current;
    if (!camera || !target) return;
    const step = Math.max(1, sphereRef.current.radius * 0.012);
    const forward = new threeRef.current.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new threeRef.current.Vector3().crossVectors(forward, new threeRef.current.Vector3(0, 1, 0)).normalize();
    if (direction === 'up') target.addScaledVector(forward, step);
    if (direction === 'down') target.addScaledVector(forward, -step);
    if (direction === 'left') target.addScaledVector(right, -step);
    if (direction === 'right') target.addScaledVector(right, step);
    updateCamera();
  };

  const onPointerDown = (event: React.PointerEvent) => {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    touchRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    pointerRef.current = { x: event.clientX, y: event.clientY, button: event.button };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!pointerRef.current) return;
    const previous = touchRef.current.get(event.pointerId);
    if (previous) touchRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (touchRef.current.size === 2) {
      const [a, b] = [...touchRef.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchRef.current != null) {
        sphereRef.current.radius = Math.max(2, sphereRef.current.radius * (pinchRef.current / distance));
        updateCamera();
      }
      pinchRef.current = distance;
      return;
    }
    const dx = event.clientX - pointerRef.current.x;
    const dy = event.clientY - pointerRef.current.y;
    pointerRef.current = { x: event.clientX, y: event.clientY, button: event.button };
    if (event.button === 2 || event.shiftKey) pan(dx, dy);
    else rotate(dx, dy);
  };

  const onPointerUp = (event: React.PointerEvent) => {
    touchRef.current.delete(event.pointerId);
    pointerRef.current = null;
    pinchRef.current = null;
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      const key = event.key.toLowerCase();
      if (key === 'w' || event.key === 'ArrowUp') { event.preventDefault(); move('up'); }
      else if (key === 's' || event.key === 'ArrowDown') { event.preventDefault(); move('down'); }
      else if (key === 'a' || event.key === 'ArrowLeft') { event.preventDefault(); move('left'); }
      else if (key === 'd' || event.key === 'ArrowRight') { event.preventDefault(); move('right'); }
      else if (key === '+' || key === '=') { event.preventDefault(); sphereRef.current.radius = Math.max(2, sphereRef.current.radius * 0.9); updateCamera(); }
      else if (key === '-' || key === '_') { event.preventDefault(); sphereRef.current.radius *= 1.1; updateCamera(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [updateCamera]);

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;
    if (!document.fullscreenElement) {
      await viewerRef.current.requestFullscreen().catch(() => null);
      setFullscreen(true);
    } else {
      await document.exitFullscreen().catch(() => null);
      setFullscreen(false);
    }
  };

  return (
    <ToolShell
      title="MC 投影查看器"
      lead="上传 .litematic / .schematic / .schem，在浏览器里查看带方块模型、朝向与不完整方块的 3D 投影。支持鼠标、触摸、WASD 与屏幕方向键。"
      meta={[
        { icon: 'cube', label: '方块模型' },
        { icon: 'image', label: '本地贴图' },
        { icon: 'globe', label: '桌面 / 移动' },
      ]}
      toc={toc}
    >
      <section className="article-card" id="viewer">
        <div className="proj-layout">
          <div className="proj-side">
            <div
              className={`proj-drop ${dragging ? 'is-dragging' : ''}`}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                const file = event.dataTransfer.files[0];
                if (file) void loadFile(file);
              }}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".litematic,.schematic,.schem,.nbt"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void loadFile(file);
                  event.target.value = '';
                }}
              />
              <OpenRegular aria-hidden />
              <strong>拖入投影文件</strong>
              <span>.litematic / .schematic / .schem</span>
            </div>
            <p className={`proj-status ${error ? 'is-error' : ''}`}>{error || status}</p>
            {stats && (
              <>
                <div className="project-stat-grid proj-stats">
                  <div><strong>{stats.total}</strong><span>方块</span></div>
                  <div><strong>{stats.unique}</strong><span>种类</span></div>
                  <div><strong>{stats.size}</strong><span>尺寸</span></div>
                </div>
                <ul className="proj-legend">
                  {stats.legend.map((item) => <li key={item.id}><span>{item.id.replace('minecraft:', '')}</span><strong>{item.count}</strong></li>)}
                </ul>
              </>
            )}
          </div>

          <div className="proj-viewer" ref={viewerRef}>
            <div className="proj-viewer__bar">
              <span><span className={`status-dot ${stats ? '' : 'is-off'}`} /> {stats ? '已加载' : '未载入'}</span>
              <div>
                <button type="button" className="icon-btn icon-btn--sm" aria-label="重置视角" onClick={() => {
                  sphereRef.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 40 };
                  updateCamera();
                }}>
                  <ArrowClockwiseRegular aria-hidden />
                </button>
                <button type="button" className="icon-btn icon-btn--sm" aria-label="全屏" onClick={toggleFullscreen}>
                  {fullscreen ? <DismissRegular aria-hidden /> : <FullScreenMaximizeRegular aria-hidden />}
                </button>
              </div>
            </div>
            <div
              className="proj-canvas"
              ref={mountRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onContextMenu={(event) => event.preventDefault()}
              onWheel={(event) => {
                event.preventDefault();
                sphereRef.current.radius = Math.max(2, sphereRef.current.radius * (1 + event.deltaY * 0.001));
                updateCamera();
              }}
            />
            <div className="proj-pad" aria-label="移动视角">
              <button type="button" className="proj-pad__up" aria-label="向前" onClick={() => move('up')}><ArrowUpRegular aria-hidden /></button>
              <button type="button" className="proj-pad__left" aria-label="向左" onClick={() => move('left')}><ArrowLeftRegular aria-hidden /></button>
              <button type="button" className="proj-pad__down" aria-label="向后" onClick={() => move('down')}><ArrowDownRegular aria-hidden /></button>
              <button type="button" className="proj-pad__right" aria-label="向右" onClick={() => move('right')}><ArrowRightRegular aria-hidden /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="article-card" id="controls">
        <p className="eyebrow">CONTROLS</p>
        <h2>操作</h2>
        <div className="project-feature-grid">
          <div><strong>桌面</strong><p>拖动旋转，右键 / Shift + 拖动平移，滚轮缩放；WASD / 方向键移动，Shift 加速。</p></div>
          <div><strong>移动端</strong><p>单指旋转，双指捏合缩放；屏幕方向键移动。全屏按钮在查看器右上角。</p></div>
          <div><strong>模型</strong><p>支持 blockstate 变体旋转、台阶 / 楼梯 / 栅栏等不完整方块模型；找不到模型时回退为彩色方块。</p></div>
        </div>
      </section>

      <section className="article-card" id="format">
        <p className="eyebrow">FORMAT</p>
        <h2>文件格式</h2>
        <ul className="project-list">
          <li><strong>.litematic</strong>：Litematica 投影，读取 Region / BlockStatePalette / BlockStates。</li>
          <li><strong>.schematic</strong>：经典 MCEdit / WorldEdit 格式，读取 Palette 与 BlockData。</li>
          <li><strong>.schem</strong>：Sponge Schematic，读取 Palette 与 Blocks。</li>
          <li>方块模型与贴图来自站点内置的 Minecraft 26.3 资源，不会上传文件。</li>
        </ul>
      </section>
    </ToolShell>
  );
}
