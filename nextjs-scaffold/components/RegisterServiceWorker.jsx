"use client";
import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return; // Evita cachear durante el desarrollo
    if (!("serviceWorker" in navigator)) return;

    // Capturar el evento de instalación para uso global (botón personalizado de instalación)
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      window.deferredPWAInstallPrompt = e;
    });

    // Registrar el Service Worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Escuchar si hay una nueva versión disponible de la Web App
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                console.log("Nueva versión de MetaBox disponible. Se aplicará en el próximo reinicio.");
              } else {
                console.log("Contenido almacenado en caché para uso sin conexión (Offline).");
              }
            }
          };
        };
      })
      .catch((err) => console.error("Error al registrar el Service Worker de MetaBox:", err));
  }, []);

  return null;
}

