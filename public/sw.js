// Brasil Caramelo Service Worker (PWA Offline Cache)
const CACHE_NAME = "brasil-caramelo-v2.38.0";
const OFFLINE_URL = "/feed";

const PRECACHE_ASSETS = [
  "/",
  "/feed",
  "/explorar",
  "/cachorro",
  "/casinhas",
  "/favicon.ico",
  "/manifest.json",
  "/icons/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Apenas intercepta requisições GET
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Pula rotas de API, Next data, WebSockets e autenticação para evitar conflito com redirects
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/") ||
    url.pathname.startsWith("/.well-known/")
  ) {
    return;
  }

  // Para navegações de página (HTML), deixa a rede processar redirecionamentos nativamente
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        return (await caches.match(OFFLINE_URL)) || (await caches.match("/"));
      })
    );
    return;
  }

  // Stale-while-revalidate para recursos estáticos (CSS, JS, imagens, ícones)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            !networkResponse.redirected &&
            (networkResponse.type === "basic" || networkResponse.type === "cors")
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
