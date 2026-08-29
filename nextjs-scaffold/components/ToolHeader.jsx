"use client";
import React from "react";
import { ArrowLeft } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";

function ToolHeader({ title, subtitle, onBack }) {
  return (
    <>
      <button
        onClick={onBack}
        style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.35rem", background: "none", border: "none", cursor: "pointer", marginBottom: "1.2rem" }}
      >
        <ArrowLeft size={15} /> Volver
      </button>
      <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.6rem" }}>{title}</h1>
      <p style={{ ...fontBody, color: T.textMuted, fontSize: "0.88rem", marginTop: "0.3rem" }}>{subtitle}</p>
    </>
  );
}

export default ToolHeader;
