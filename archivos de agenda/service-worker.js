// Service Worker para NAVAJA - Agenda PWA
const CACHE_NAME = 'navaja-v1';
const urlsToCache = [
  './agenda-navaja-app.html',
  './manifest.json'
];

// Instalación - cachear archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activación - limpiar caches antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - servir desde cache, si no hay red usar cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, clonarla y guardarla en cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            // Si no está en cache, devolver respuesta básica
            return new Response('Offline - NAVAJA', {
              status: 200,
              statusText: 'OK',
              headers: new Headers({
                'Content-Type': 'text/html'
              })
            });
          });
      })
  );
});
