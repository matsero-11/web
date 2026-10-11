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

// Instalar el Service Worker precargando recursos de forma segura (sin bloquear la instalación)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usamos Promise.allSettled o fetch individual para evitar que un fallo 404 rompa la PWA
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

// Estrategia Stale-While-Revalidate para máxima velocidad
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Solo interceptar peticiones GET dentro de nuestro propio dominio
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            return cachedResponse || cache.match("/");
          });

        return cachedResponse || fetchPromise;
      });
    })
  );
});

