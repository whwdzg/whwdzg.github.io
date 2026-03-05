/**
 * [站点注释 Site Note]
 * 文件: D:\Documents\GitHub\whwdzg.github.io\js\pwa\service-worker.js
 * 作用: 前端交互逻辑与功能模块实现。
 * English: Implements client-side interactions and feature logic.
 */
// Service worker for offline-first navigation and light asset caching

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE_VERSION = 'shuiyu-pwa-v3';
const OFFLINE_URL = '/offline.html';
const CACHE_NAMES = {
  precache: `${CACHE_VERSION}-precache`,
  pages: `${CACHE_VERSION}-pages`,
  assets: `${CACHE_VERSION}-assets`,
  images: `${CACHE_VERSION}-images`
};

const RECORDED_PAGES = [
  '/',
  '/index.html',
  '/about.html',
  '/readme.html',
  '/404.html',
  OFFLINE_URL,
  '/column/comments.html',
  '/media/music.html',
  '/media/video.html',
  '/media/bilibili.html',
  '/projects/better-crafting-recipes.html',
  '/projects/better-enchantments.html',
  '/projects/better-mob-drop.html',
  '/projects/github.html',
  '/projects/magical-dye.html',
  '/projects/modrinth.html',
  '/tool/base-convert.html',
  '/tool/base64.html',
  '/tool/basex.html',
  '/tool/mc-projection.html',
  '/tool/scientific-calculator.html',
  '/tool/unicode.html',
  '/media/bilibili.html',
  '/includes/shell.html',
  '/includes/setting.html'
];

const PRECACHE_URLS = Array.from(new Set([
  '/',
  OFFLINE_URL,
  '/manifest.json',
  ...RECORDED_PAGES,
  '/css/variables.css',
  '/css/media-player.css',
  '/css/video-archive.css',
  '/js/media/common.js',
  '/js/media/music.js',
  '/js/media/video.js',
  '/js/video-archive.js',
  '/resource/font/FluentSystemIcons-Regular.css',
  '/resource/font/FluentSystemIcons-Regular.woff2',
  '/resource/img/logo/logo.png',
  '/resource/img/logo/logo-192.png',
  '/resource/img/shell/favicon.ico'
]));

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.precache)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const expected = Object.values(CACHE_NAMES);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => !expected.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

const pageStrategy = new workbox.strategies.NetworkFirst({
  cacheName: CACHE_NAMES.pages,
  networkTimeoutSeconds: 3,
  plugins: [
    new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
    new workbox.expiration.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 24 * 60 * 60 })
  ]
});

workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      const preload = await event.preloadResponse;
      if (preload) {
        return preload;
      }

      const response = await pageStrategy.handle({ event });
      if (response) {
        return response;
      }
      throw new Error('No response from page strategy');
    } catch (error) {
      const cache = await caches.open(CACHE_NAMES.precache);
      const cachedResp = await cache.match(OFFLINE_URL);
      return cachedResp || Response.error();
    }
  }
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',
  new workbox.strategies.StaleWhileRevalidate({ cacheName: CACHE_NAMES.assets })
);

workbox.routing.registerRoute(
  ({ url, request }) => {
    if (request.method !== 'GET' || url.origin !== self.location.origin) {
      return false;
    }
    return url.pathname.endsWith('.html') || url.pathname.startsWith('/includes/');
  },
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE_NAMES.pages,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      new workbox.expiration.ExpirationPlugin({ maxEntries: 240, maxAgeSeconds: 60 * 24 * 60 * 60 })
    ]
  })
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new workbox.strategies.CacheFirst({
    cacheName: CACHE_NAMES.images,
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })
    ]
  })
);