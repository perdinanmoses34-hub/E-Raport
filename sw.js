// E-Raport SMP Service Worker - Safe Network-First Cache
const CACHE_NAME = 'e-raport-smp-v2';
const STATIC_ASSETS = [
  '/icon.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-caching non-fatal warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Safe Fetch: Always prioritize network, never block or return undefined
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Never intercept vite dev server, hot reload, api calls, or script modules
  if (
    url.pathname.includes('/@') ||
    url.pathname.includes('/src/') ||
    url.pathname.includes('/node_modules/') ||
    url.pathname.includes('/api/') ||
    url.search.includes('v=')
  ) {
    return;
  }

  // Only handle static assets (images, icons)
  const isStatic = url.pathname.endsWith('.svg') ||
                   url.pathname.endsWith('.png') ||
                   url.pathname.endsWith('.ico') ||
                   url.pathname.endsWith('.json');

  if (isStatic) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      }).catch(() => fetch(event.request))
    );
  }
});
