/**
 * 站点 Service Worker / Offline cache.
 *
 * 策略：
 * - 导航请求：network-first，离线回退到缓存页面或 offline.html；
 * - /assets/、/icons/、/media/：cache-first（Vite 资源带 hash，可长期缓存）；
 * - 其他同源 GET：stale-while-revalidate。
 *
 * 缓存版本从注册 URL 的 ?v= 读取，由 src/lib/pwa.ts 用构建 ID 注入。
 * 这样每次部署都会得到新的缓存名，activate 时清掉旧版本。
 */
const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE = `whwdzg-${VERSION}`;
const CORE = [
  '/',
  '/bilibili/',
  '/comments/',
  '/comments/github/',
  '/projects/modrinth/',
  '/projects/better-crafting-recipes/',
  '/projects/better-enchantments/',
  '/projects/better-mob-drop/',
  '/projects/magical-dye/',
  '/projects/only-survival-mode/',
  '/projects/glowing-players/',
  '/projects/asteria-player/',
  '/projects/life-simulation-wiki/',
  '/projects/github/',
  '/projects/occultation/',
  '/user/hxhej/',
  '/user/canghaishuiyu/',
  '/user/滄海水魚/',
  '/columns/',
  '/columns/update-2026-11/',
  '/tools/',
  '/tools/base64/',
  '/tools/basex/',
  '/tools/base-convert/',
  '/tools/unicode/',
  '/tools/calculator/',
  '/tools/mc-projection/',
  '/tools/mc-datapack/',
  '/tools/mc-resourcepack/',
  '/about/',
  '/manifest.webmanifest',
  '/icons/logo-192.png',
  '/icons/favicon.ico',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // 单个资源失败（例如某次部署缺少文件）不应让整个 SW 安装失败。
      await Promise.allSettled(CORE.map((url) => cache.add(new Request(url, { cache: 'reload' }))));

      // 构建插件会生成 dist/sw-assets.json（所有 JS/CSS + 首屏关键图片）。
      // 预缓存它，离线刷新时页面 chunk 不必再依赖运行时缓存。
      try {
        const manifestResponse = await fetch('/sw-assets.json', { cache: 'no-store' });
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          if (Array.isArray(manifest.assets)) {
            await Promise.allSettled(
              manifest.assets.map((url) => cache.add(new Request(url, { cache: 'reload' }))),
            );
          }
        }
      } catch {
        // 旧部署或开发环境没有清单时，继续使用下面的 HTML 解析兜底。
      }

      // 首屏的 JS/CSS 在网络返回前就已经加载，不会经过 fetch 事件，
      // 因此这里主动解析各入口 HTML，把引用的 /assets/ 资源也写入缓存，
      // 保证第一次离线刷新仍然能渲染页面。
      const assets = new Set();
      await Promise.allSettled(
        CORE.filter((url) => url.endsWith('/')).map(async (page) => {
          try {
            const response = await fetch(page, { cache: 'reload' });
            if (!response.ok) return;
            const copy = response.clone();
            const html = await response.text();
            cache.put(page, copy);
            for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) assets.add(match[1]);
          } catch {
            // 离线安装时忽略，下次激活仍可补齐。
          }
        }),
      );
      await Promise.allSettled([...assets].map((url) => cache.add(new Request(url, { cache: 'reload' }))));

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith('whwdzg-') && key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    // 预览服务器会给静态资源加 `Vary: Origin`；模块脚本/样式表请求带 Origin，
    // 若按 Vary 匹配会 miss。这里忽略 Vary，保证第一次离线刷新也能命中缓存。
    const cached =
      (await cache.match(request, { ignoreSearch: true, ignoreVary: true })) ||
      (await cache.match(request, { ignoreVary: true }));
    if (cached) return cached;
    const shell = (await cache.match('/')) || (await cache.match('/offline.html'));
    if (shell) return shell;
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreVary: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreVary: true });
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/media/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
