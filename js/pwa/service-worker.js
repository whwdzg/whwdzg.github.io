// Service worker for offline-first navigation and light asset caching

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE_VERSION = 'shuiyu-pwa-v1';
const OFFLINE_URL = '/offline.html';
const CACHE_NAMES = {
  precache: `${CACHE_VERSION}-precache`,
  pages: `${CACHE_VERSION}-pages`,
  assets: `${CACHE_VERSION}-assets`,
  images: `${CACHE_VERSION}-images`
};

const PRECACHE_URLS = [
  '/',
  OFFLINE_URL,
  '/manifest.json',
  '/css/variables.css',
  '/resource/img/logo/logo.png',
  '/resource/img/logo/logo-192.png',
  '/resource/img/shell/favicon.ico'
];

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
  plugins: [
    new workbox.expiration.ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 })
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
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new workbox.strategies.CacheFirst({
    cacheName: CACHE_NAMES.images,
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })
    ]
  })
);