"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import FinancialStreak from "./FinancialStreak";

function ToolHeader({ title, subtitle, onBack }) {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Comprobar si hay un evento de instalación diferido capturado por el Service Worker
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
        <button
          onClick={onBack}
          style={{
            ...fontBody,
            color: T.textMuted,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <ArrowLeft size={15} /> Volver
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {/* Widget de Racha con la Llama Verde */}
          <FinancialStreak />

          {canInstall && (
            <button
              onClick={handleInstallClick}
              style={{
                ...fontBody,
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                background: "rgba(255, 255, 255, 0.05)",
                border: `1px solid ${T.lime}`,
                borderRadius: "0.6rem",
                padding: "0.35rem 0.75rem",
                color: T.lime,
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Download size={13} /> Instalar App
            </button>
          )}
        </div>
      </div>

      <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.6rem", lineHeight: 1.2 }}>{title}</h1>
      <p style={{ ...fontBody, color: T.textMuted, fontSize: "0.88rem", marginTop: "0.35rem" }}>{subtitle}</p>
    </div>
  );
}

export default ToolHeader;

