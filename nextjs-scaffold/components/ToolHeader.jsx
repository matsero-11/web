"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import FinancialStreak from "./FinancialStreak";

function ToolHeader({ title, subtitle, onBack }) {
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detectar si el dispositivo es iOS / iPadOS (incluyendo iPads con IPOS/Mac UA)
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS =
      /iphone|ipad|ipod/.test(userAgent) ||
      (/macintosh/.test(userAgent) && navigator.maxTouchPoints > 1);
    setIsIOSDevice(isIOS);

    // Si ya existe un prompt capturado globalmente, lo asignamos al estado
    if (window.deferredPWAInstallPrompt) {
      setDeferredPrompt(window.deferredPWAInstallPrompt);
    }

    // Escuchar el evento de instalación nativa en tiempo real
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPWAInstallPrompt = e;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // 1. Caso iOS / iPadOS (Safari & navegadores WebKit)
    if (isIOSDevice) {
      alert(
        "Para instalar MetaBox en tu iPad o iPhone:\n\n1. Pulsa el botón 'Compartir' de tu navegador (icono del cuadrado con la flecha hacia arriba).\n2. Selecciona 'Añadir a la pantalla de inicio'."
      );
      return;
    }

    // 2. Intentar usar el prompt capturado (local o global)
    const promptEvent = deferredPrompt || (typeof window !== "undefined" ? window.deferredPWAInstallPrompt : null);

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;

        if (choiceResult.outcome === "accepted") {
          setDeferredPrompt(null);
          if (typeof window !== "undefined") {
            window.deferredPWAInstallPrompt = null;
          }
        }
        return;
      } catch (err) {
        console.error("Error al ejecutar el prompt de instalación PWA:", err);
      }
    }

    // 3. Fallback directo para Tablets Android / navegadores donde el prompt no se dispara automáticamente
    alert(
      "Para añadir MetaBox a tu pantalla de inicio:\n\n1. Pulsa el menú de opciones (icono de los 3 puntos en la esquina superior del navegador).\n2. Selecciona 'Instalar aplicación' o 'Añadir a la pantalla de inicio'."
    );
  };

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.8rem",
        }}
      >
        {/* Botón Volver */}
        <button
          onClick={onBack}
          style={{
            ...fontBody,
            color: T.textMuted || "#a1a1aa",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            transition: "color 0.2s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = T.text || "#f4f4f5")}
          onMouseOut={(e) => (e.currentTarget.style.color = T.textMuted || "#a1a1aa")}
        >
          <ArrowLeft size={15} /> Volver
        </button>

        {/* Zona derecha: Racha + Botón Instalar (Siempre visible para garantizártelo en tablet y móvil) */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FinancialStreak />

          <button
            onClick={handleInstallClick}
            style={{
              ...fontBody,
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              background: "rgba(16, 185, 129, 0.12)",
              border: `1px solid ${T.emerald || "#10B981"}`,
              borderRadius: "0.6rem",
              padding: "0.35rem 0.75rem",
              color: T.emerald || "#10B981",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = T.emerald || "#10B981";
              e.currentTarget.style.color = "#000000";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.12)";
              e.currentTarget.style.color = T.emerald || "#10B981";
            }}
          >
            <Download size={13} /> Instalar App
          </button>
        </div>
      </div>

      <h1 style={{ ...fontDisplay, color: T.text || "#f4f4f5", fontSize: "1.6rem", lineHeight: 1.2 }}>
        {title}
      </h1>
      <p style={{ ...fontBody, color: T.textMuted || "#a1a1aa", fontSize: "0.88rem", marginTop: "0.35rem" }}>
        {subtitle}
      </p>
    </div>
  );
}

export default ToolHeader;

