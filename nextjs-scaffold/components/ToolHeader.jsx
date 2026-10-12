"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Download, X, Smartphone } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import FinancialStreak from "./FinancialStreak";

function ToolHeader({ title, subtitle, onBack }) {
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Comprobar si la app ya se está ejecutando desde la pantalla de inicio (PWA instalada)
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(isInstalled);

    // 2. Detectar si el dispositivo es iOS / iPadOS
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS =
      /iphone|ipad|ipod/.test(userAgent) ||
      (/macintosh/.test(userAgent) && navigator.maxTouchPoints > 1);
    setIsIOSDevice(isIOS);

    // 3. Sincronización inmediata con la variable capturada globalmente por layout.js
    if (window.deferredPWAInstallPrompt) {
      setDeferredPrompt(window.deferredPWAInstallPrompt);
    }

    // 4. Escuchar evento de instalación nativo
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPWAInstallPrompt = e;
    };

    // 5. Escuchar el evento personalizado emito por el hack en layout.js
    const handlePwaInstallable = () => {
      if (window.deferredPWAInstallPrompt) {
        setDeferredPrompt(window.deferredPWAInstallPrompt);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("pwa-installable", handlePwaInstallable);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("pwa-installable", handlePwaInstallable);
    };
  }, []);

  const handleInstallClick = async () => {
    // Si ya está abierta como app de escritorio/móvil, notificamos
    if (isStandalone) {
      alert("¡MetaBox ya está ejecutándose como aplicación instalada!");
      return;
    }

    // Intentar activar el prompt nativo capturado (local o globalmente desde layout.js)
    const promptEvent =
      deferredPrompt ||
      (typeof window !== "undefined" ? window.deferredPWAInstallPrompt : null);

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

    // Fallback Infalible: Si no salta el prompt automático (iOS, Brave estricto, o tablets),
    // desplegamos la ventana guía interactiva para garantizar que siempre haya respuesta.
    setShowGuideModal(true);
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

          {!isStandalone && (
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

      {/* MODAL INFALIBLE DE GUÍA DE INSTALACIÓN */}
      {showGuideModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#0D181B",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "1rem",
              padding: "1.5rem",
              maxWidth: "380px",
              width: "100%",
              textAlign: "center",
              position: "relative",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            }}
          >
            <button
              onClick={() => setShowGuideModal(false)}
              style={{
                position: "absolute",
                top: "0.8rem",
                right: "0.8rem",
                background: "none",
                border: "none",
                color: T.textMuted || "#a1a1aa",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>

            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                color: T.emerald || "#10B981",
              }}
            >
              <Smartphone size={24} />
            </div>

            <h3 style={{ ...fontDisplay, color: T.text || "#ffffff", fontSize: "1.15rem", marginBottom: "0.5rem" }}>
              Añadir MetaBox al Inicio
            </h3>

            <p style={{ ...fontBody, color: T.textMuted || "#a1a1aa", fontSize: "0.8rem", marginBottom: "1.2rem", lineHeight: 1.4 }}>
              Instala la aplicación en tu pantalla de inicio para un acceso rápido y privado:
            </p>

            <div
              style={{
                textAlign: "left",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "0.75rem",
                padding: "0.85rem",
                marginBottom: "1.2rem",
                fontSize: "0.78rem",
                color: T.text || "#e4e4e7",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              {isIOSDevice ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ backgroundColor: "#18282C", padding: "0.15rem 0.4rem", borderRadius: "0.25rem", fontWeight: "bold" }}>1</span>
                    <span>Pulsa el botón <strong>Compartir</strong> ⎘ en la barra de Safari.</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ backgroundColor: "#18282C", padding: "0.15rem 0.4rem", borderRadius: "0.25rem", fontWeight: "bold" }}>2</span>
                    <span>Selecciona <strong>"Añadir a la pantalla de inicio"</strong> ➕.</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ backgroundColor: "#18282C", padding: "0.15rem 0.4rem", borderRadius: "0.25rem", fontWeight: "bold" }}>1</span>
                    <span>Toca el menú de <strong>3 puntos</strong> arriba a la derecha.</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ backgroundColor: "#18282C", padding: "0.15rem 0.4rem", borderRadius: "0.25rem", fontWeight: "bold" }}>2</span>
                    <span>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a inicio"</strong>.</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              style={{
                ...fontBody,
                width: "100%",
                backgroundColor: T.emerald || "#10B981",
                color: "#000000",
                fontWeight: 700,
                padding: "0.65rem",
                borderRadius: "0.6rem",
                border: "none",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ToolHeader;
                               
