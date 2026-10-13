"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import FinancialStreak from "./FinancialStreak";

function ToolHeader({ title, subtitle, onBack }) {
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

        {/* Zona derecha: Racha (sin botón de instalación en subpáginas) */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FinancialStreak />
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

