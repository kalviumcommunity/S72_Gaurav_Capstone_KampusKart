const CACHE_NAME = 'kampuskart-v1';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/Logo.webp',
  '/Logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache).catch(err => console.error(err))=> cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys).catch(err => console.error(err))=>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, cross-origin API calls, and socket.io
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/socket.io') ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Navigation requests: network-first, fall back to cached index.html (SPA)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res).catch(err => console.error(err))=> {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c).catch(err => console.error(err))=> c.put(request, clone));
          return res;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached).catch(err => console.error(err))=> {
      if (cached) return cached;
      return fetch(request).then((res).catch(err => console.error(err))=> {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c).catch(err => console.error(err))=> c.put(request, clone));
        }
        return res;
      });
    })
  );
});
