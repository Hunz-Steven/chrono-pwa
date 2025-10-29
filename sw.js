const CACHE = 'chrono-pwa-v2';
const FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .catch(err => console.log('Cache install error:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE)
        .map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Toujours servir depuis le cache pour les fichiers locaux
  if (e.request.url.startsWith(location.origin)) {
    e.respondWith(
      caches.open(CACHE).then(cache => {
        return cache.match(e.request)
          .then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            return fetch(e.request)
              .catch(() => cache.match('/index.html')); // Fallback
          });
      })
    );
  }
});
