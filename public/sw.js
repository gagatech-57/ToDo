const CACHE_NAME = 'gaga-todo-cache-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/checklist.png',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Always use Network-First for HTML/page requests to avoid cache traps
  const isPageRequest = e.request.mode === 'navigate' || 
                        e.request.url.endsWith('/') || 
                        e.request.url.endsWith('index.html');

  if (isPageRequest) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          // Update cache with the fresh response
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match(e.request)) // Fallback to cache if offline
    );
  } else {
    // Cache-first for static assets
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        return cachedResponse || fetch(e.request);
      })
    );
  }
});
