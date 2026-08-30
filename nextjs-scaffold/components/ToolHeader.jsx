"use client";
import React from "react";
import { ArrowLeft } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";

function ToolHeader({ title, subtitle, onBack }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <button
        onClick={onBack}
        style={{
          ...fontBody,
          color: T.textMuted,
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          marginBottom: "0.8rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <ArrowLeft size={15} /> Volver
      </button>
      <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.6rem", lineHeight: 1.2 }}>{title}</h1>
      <p style={{ ...fontBody, color: T.textMuted, fontSize: "0.88rem", marginTop: "0.35rem" }}>{subtitle}</p>
    </div>
  );
}

export default ToolHeader;
