const CACHE = 'chrono-pwa-v3';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  console.log('Service Worker: Installing...');
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(FILES);
      })
      .catch(err => console.log('Cache install error:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  console.log('Service Worker: Activating...');
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE)
        .map(key => {
          console.log('Service Worker: Removing old cache', key);
          return caches.delete(key);
        })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Servir depuis le cache pour les fichiers de l'app
  if (e.request.url.includes(self.registration.scope)) {
    e.respondWith(
      caches.open(CACHE).then(cache => {
        return cache.match(e.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              console.log('Service Worker: Serving from cache', e.request.url);
              return cachedResponse;
            }
            console.log('Service Worker: Fetching', e.request.url);
            return fetch(e.request)
              .then(response => {
                // Mettre en cache les nouvelles requêtes
                if (response.status === 200) {
                  cache.put(e.request, response.clone());
                }
                return response;
              })
              .catch(() => cache.match('./index.html')); // Fallback
          });
      })
    );
  }
});
