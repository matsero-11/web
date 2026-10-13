"use client";

import { useEffect } from "react";

export default function ClientProviders({ children }) {
  useEffect(() => {
    // Capturar el evento de instalación PWA de forma global para todo el sitio
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPWAInstallPrompt = e;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Evitamos el bloqueo global eliminando HelmetProvider y usando un contenedor seguro
  return <>{children}</>;
}

