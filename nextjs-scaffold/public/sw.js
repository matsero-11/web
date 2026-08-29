// Service Worker mínimo, escrito a mano — sin next-pwa (evita depender de
// un paquete que no se puede instalar en este entorno). Estrategia:
// cache-first para lo ya visitado, red primero para todo lo demás con
// fallback a caché si no hay conexión. Suficiente para que las
// herramientas ya abiertas funcionen offline; no pre-cachea las 20 rutas
// de golpe (eso agrandaría mucho la caché inicial sin necesidad real).

const CACHE_NAME = "raiz-v1";
const APP_SHELL = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
