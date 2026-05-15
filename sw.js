const CACHE_NAME = 'lum-auto-cache';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Instalação: Salva o básico no cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => {
      return self.skipWaiting(); // Ativa imediatamente
    })
  );
});

// Ativação: Garante controle imediato das abas
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Estratégia: Network First (Rede Primeiro)
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    // Tenta buscar primeiro na rede
    fetch(event.request).then((networkResponse) => {
      // Se a resposta for válida, atualiza o cache dinamicamente
      if (networkResponse.status === 200) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
      }
      return networkResponse;
    }).catch(() => {
      // Se a rede falhar (offline), busca no cache
      return caches.match(event.request);
    })
  );
});