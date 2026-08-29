"use client";
import React, { useState } from "react";
import { Copy, Download, Check } from "lucide-react";
import { T, fontBody } from "@/lib/design-tokens";
import { copyToClipboard, exportToCSV } from "@/lib/export-utils";

export function CopySummaryButton({ getText }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        const ok = await copyToClipboard(getText());
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }
      }}
      style={{
        ...fontBody,
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        background: "transparent",
        border: `1px solid ${T.border}`,
        borderRadius: "0.7rem",
        padding: "0.55rem 0.9rem",
        color: copied ? T.lime : T.textMuted,
        fontSize: "0.82rem",
        cursor: "pointer",
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copiado" : "Copiar resumen"}
    </button>
  );
}

export function ExportCSVButton({ getRows, filename }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        const ok = exportToCSV(getRows(), filename);
        if (ok) {
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        }
      }}
      style={{
        ...fontBody,
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        background: "transparent",
        border: `1px solid ${T.border}`,
        borderRadius: "0.7rem",
        padding: "0.55rem 0.9rem",
        color: done ? T.lime : T.textMuted,
        fontSize: "0.82rem",
        cursor: "pointer",
      }}
    >
      {done ? <Check size={14} /> : <Download size={14} />}
      {done ? "Descargado" : "Exportar CSV"}
    </button>
  );
}
