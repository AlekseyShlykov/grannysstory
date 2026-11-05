const CACHE = "babushka-v0.17";
const scopedUrl = (path) => new URL(path, self.registration.scope).toString();
const SHELL = [
  scopedUrl("./"),
  scopedUrl("index.html"),
  scopedUrl("data/manifest.json"),
  scopedUrl("data/world/manifest.json"),
  scopedUrl("assets/music/tea.mp3"),
  scopedUrl("assets/music/music.mp3"),
  ...[
    "chair.mp3", "countryside.mp3", "cup.mp3", "fluorescent_light.mp3", "fridge.mp3", "keys.mp3",
    "kitchen_sounds.mp3", "oil_lamp.mp3", "old_car.mp3", "old_tram.mp3", "papers.mp3", "plate.mp3",
    "rain_window.mp3", "tea2.mp3", "wardrobe.mp3", "water_sink.mp3", "window_close.mp3", "writing.mp3"
  ].map((name) => scopedUrl(`assets/music/${name}`)),
  scopedUrl("assets/icons/sound-on.png"),
  scopedUrl("assets/icons/sound-off.png")
];

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
