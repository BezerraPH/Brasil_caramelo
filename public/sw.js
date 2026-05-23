const CACHE_SHELL = "brasil-caramelo-shell-v3";
const CACHE_MEDIA = "brasil-caramelo-media-v3";
const PRECACHE = ["/", "/feed", "/cachorro", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_SHELL)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_SHELL && k !== CACHE_MEDIA)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function cacheFirstMedia(request) {
  const cache = await caches.open(CACHE_MEDIA);
  const cached = await cache.match(request);
  if (cached) {
    fetch(request)
      .then((res) => {
        if (res.ok) void cache.put(request, res.clone());
      })
      .catch(() => {});
    return cached;
  }
  const res = await fetch(request);
  if (res.ok) void cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === "GET" && url.pathname.startsWith("/api/media/")) {
    event.respondWith(cacheFirstMedia(event.request));
    return;
  }

  if (event.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_SHELL).then((c) => c.put(event.request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(event.request).then((r) => r || caches.match("/feed")),
      ),
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "bc-post-sync") {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "BC_FLUSH_OFFLINE_POSTS" });
        });
      }),
    );
  }
});
