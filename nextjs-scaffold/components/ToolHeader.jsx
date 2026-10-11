"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import FinancialStreak from "./FinancialStreak";

function ToolHeader({ title, subtitle, onBack }) {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Comprobar si hay un evento de instalación diferido capturado
    const checkInstallability = () => {
      if (window.deferredPWAInstallPrompt) {
        setCanInstall(true);
      }
    };

    checkInstallability();
    window.addEventListener("beforeinstallprompt", checkInstallability);

    return () => {
      window.removeEventListener("beforeinstallprompt", checkInstallability);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = window.deferredPWAInstallPrompt;
    if (!promptEvent) return;

    promptEvent.prompt();
    const choiceResult = await promptEvent.userChoice;

    if (choiceResult.outcome === "accepted") {
      setCanInstall(false);
      window.deferredPWAInstallPrompt = null;
    }
  };

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div
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

      <h1 style={{ ...fontDisplay, color: T.text || "#f4f4f5", fontSize: "1.6rem", lineHeight: 1.2 }}>{title}</h1>
      <p style={{ ...fontBody, color: T.textMuted || "#a1a1aa", fontSize: "0.88rem", marginTop: "0.35rem" }}>{subtitle}</p>
    </div>
  );
}

export default ToolHeader;
