"use client";
import React, { useState, useRef } from "react";
import { Copy, Download, Check, ShieldCheck, Upload } from "lucide-react";
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

/* =========================================================
   NUEVOS COMPONENTES: BÓVEDA DE DATOS LOCAL (EXPORT / IMPORT JSON)
   ========================================================= */

// Exporta todo el localStorage privado en un archivo JSON comprimido
export function ExportVaultButton() {
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    try {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }

      const payload = {
        app: "MetaBox",
        version: "1.0",
        timestamp: new Date().toISOString(),
        vaultData: data,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `metabox-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExported(true);
      setTimeout(() => setExported(false), 2000);
    } catch (err) {
      console.error("Error al exportar la Bóveda:", err);
    }
  };

  return (
    <button
      onClick={handleExport}
      style={{
        ...fontBody,
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        background: "transparent",
        border: `1px solid ${T.border}`,
        borderRadius: "0.7rem",
        padding: "0.55rem 0.9rem",
        color: exported ? T.lime : T.textMuted,
        fontSize: "0.82rem",
        cursor: "pointer",
      }}
    >
      {exported ? <ShieldCheck size={14} /> : <Download size={14} />}
      {exported ? "Bóveda Exportada" : "Copia Bóveda (JSON)"}
    </button>
  );
}

// Importa un archivo JSON de respaldo para restaurar los datos
export function ImportVaultButton({ onImportSuccess }) {
  const [imported, setImported] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.app === "MetaBox" && parsed.vaultData) {
          Object.keys(parsed.vaultData).forEach((key) => {
            localStorage.setItem(key, parsed.vaultData[key]);
          });
          setImported(true);
          if (onImportSuccess) onImportSuccess();
          setTimeout(() => {
            setImported(false);
            window.location.reload(); // Recarga para aplicar los datos restaurados
          }, 1500);
        } else {
          alert("El archivo no es una copia válida de la Bóveda de MetaBox.");
        }
      } catch (err) {
        alert("Error al leer el archivo de la Bóveda.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        style={{
          ...fontBody,
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "transparent",
          border: `1px solid ${T.border}`,
          borderRadius: "0.7rem",
          padding: "0.55rem 0.9rem",
          color: imported ? T.lime : T.textMuted,
          fontSize: "0.82rem",
          cursor: "pointer",
        }}
      >
        {imported ? <Check size={14} /> : <Upload size={14} />}
        {imported ? "Restaurado con éxito" : "Restaurar Bóveda"}
      </button>
    </>
  );
        }

