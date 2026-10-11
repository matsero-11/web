"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import FinancialStreak from "./FinancialStreak";

function ToolHeader({ title, subtitle, onBack }) {
  const [canInstall, setCanInstall] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Detectar si el dispositivo es iOS (iPhone / iPad / iPod)
    const userAgent = typeof window !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    setIsIOSDevice(isIOS);

    // En iOS siempre se habilita la opción de instalación guiada
    if (isIOS) {
      setCanInstall(true);
    } else if (typeof window !== "undefined" && window.deferredPWAInstallPrompt) {
      setCanInstall(true);
    }

    const handleInstallable = () => setCanInstall(true);

    window.addEventListener("beforeinstallprompt", handleInstallable);
    window.addEventListener("pwa-installable", handleInstallable);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallable);
      window.removeEventListener("pwa-installable", handleInstallable);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOSDevice) {
      alert(
        "Para instalar MetaBox en tu iPhone o iPad:\n\n1. Pulsa el botón 'Compartir' en Safari (icono de la casilla con flecha arriba).\n2. Selecciona 'Añadir a la pantalla de inicio'."
      );
      return;
    }

    const promptEvent = typeof window !== "undefined" ? window.deferredPWAInstallPrompt : null;

    if (!promptEvent) {
      alert("MetaBox ya está instalada o tu navegador gestiona la instalación desde su menú principal.");
      return;
    }

    try {
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;

      if (choiceResult.outcome === "accepted") {
        setCanInstall(false);
        if (typeof window !== "undefined") {
          window.deferredPWAInstallPrompt = null;
        }
      }
    } catch (err) {
      console.error("Error al ejecutar el prompt de instalación PWA:", err);
    }
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

        {/* Zona derecha: Racha + Botón Instalar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FinancialStreak />

          {canInstall && (
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
          )}
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
