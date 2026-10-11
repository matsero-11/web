"use client";
import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    // 1. Escuchar SIEMPRE el evento de instalación para el botón PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPWAInstallPrompt = e;
      // Notificar a componentes que escuchan el evento si fuera necesario
      window.dispatchEvent(new Event("pwa-installable"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 2. Registrar el Service Worker
    if ("serviceWorker" in navigator) {
      // Si quieres probarlo en local quita el comentario a la siguiente línea
      // if (process.env.NODE_ENV !== "production") return;

      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker de MetaBox registrado con éxito:", registration.scope);

            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker == null) return;

              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    console.log("Nueva versión de MetaBox disponible.");
                  } else {
                    console.log("MetaBox listo para uso offline.");
                  }
                }
              };
            };
          })
          .catch((err) => console.error("Error al registrar Service Worker:", err));
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}
