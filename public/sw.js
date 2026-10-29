const CACHE = "babushka-v0.3";
const scopedUrl = (path) => new URL(path, self.registration.scope).toString();
const SHELL = [scopedUrl("./"), scopedUrl("index.html"), scopedUrl("data/manifest.json"), scopedUrl("data/world/manifest.json")];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      const response = await fetch(scopedUrl("./"));
      const html = await response.clone().text();
      await cache.put(scopedUrl("./"), response);
      const assets = [...html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)]
        .map((match) => new URL(match[1], self.registration.scope).toString());
      await cache.addAll([...new Set([...SHELL, ...assets])]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fresh = fetch(event.request)
        .then((response) => {
          if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => cached);
      return cached || fresh;
    })
  );
});
