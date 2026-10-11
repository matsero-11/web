"use client";

import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";

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

  return <HelmetProvider>{children}</HelmetProvider>;
}

