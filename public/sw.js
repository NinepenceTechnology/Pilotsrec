// Pilot's Records Service Worker - Auto-Update & Suporte Offline para Dispositivos
const CACHE_NAME = 'pilots-records-v3.4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-maskable.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/favicon-32.png'
];

// 1. Instalação do Service Worker - ativação imediata sem esperar
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

// 2. Ativação do Service Worker - purga caches antigas e assume controlo de imediato
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Mensagem para forçar skipWaiting se solicitado pelo cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. Interceção de requisições
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Não intercetar chamadas de API
  if (event.request.url.includes('/api/')) return;

  // ESTRATÉGIA NETWORK-FIRST PARA NAVEGAÇÃO / HTML:
  // Se estiver online, obtém SEMPRE a versão mais recente do HTML (com novos hashes de bundle).
  // Se estiver offline ou a rede falhar, recorre à versão em cache.
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => cached || caches.match('/index.html'));
        })
    );
    return;
  }

  // ESTRATÉGIA PARA OUTROS ASSETS (JS, CSS, IMAGENS): Cache-First com atualização
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});