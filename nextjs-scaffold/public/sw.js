const CACHE_NAME = "metabox-v2";

// Archivos clave para el funcionamiento sin conexión (Offline App Shell)
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/favicon-96x96.png",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png"
];

// Instalar el Service Worker y precargar recursos básicos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
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

  // Solo interceptar peticiones GET dentro de nuestro origen (ignora extensiones o scripts de terceros)
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        // Petición de red en segundo plano para refrescar la caché
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Si la red falla y no hay caché, muestra la página principal precargada
            return cachedResponse || cache.match("/");
          });

        // Devolver respuesta cacheada inmediatamente si existe, si no esperar a la red
        return cachedResponse || fetchPromise;
      });
    })
  );
});

