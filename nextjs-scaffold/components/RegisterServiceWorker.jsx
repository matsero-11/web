"use client";
import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return; // evita cachear en desarrollo
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("No se pudo registrar el Service Worker:", err));
  }, []);

  return null;
}
