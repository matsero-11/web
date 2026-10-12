const CACHE_NAME = "metabox-v3";

// Archivos clave para el funcionamiento sin conexión
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/favicon-96x96.png",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png"
];

// Instalar el Service Worker precargando recursos de forma segura
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn(`[PWA SW] No se pudo precachear ${asset}:`, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Limpiar cachés antiguas tras actualización
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Interceptor de red ultra compatible y seguro
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Filtrar peticiones no-GET, esquemas raros o peticiones internas de Next.js
  if (
    request.method !== "GET" ||
    !request.url.startsWith("http") ||
    request.url.includes("/_next/data/")
  ) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === "basic"
            ) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            return cachedResponse || caches.match("/");
          });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
               
