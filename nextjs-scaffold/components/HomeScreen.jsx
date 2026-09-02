"use client";

import React, { useState } from "react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { Card, IconTile } from "@/components/ui";
import { ALL_TOOLS, CATEGORIES } from "@/lib/tools-registry";

function HomeScreen({ onNavigate }) {
  const [query, setQuery] = useState("");
  const filtered = ALL_TOOLS.filter(
    (t) =>
      t.label.toLowerCase().includes(query.toLowerCase()) ||
      t.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleClear = () => {
    setQuery("");
  };

  return (
    <div className="pt-8 pb-28 w-full">
      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", letterSpacing: "0.08em" }}>
        METABOX · HERRAMIENTAS FINANCIERAS
      </div>
      <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.9rem", lineHeight: 1.15, marginTop: "0.5rem" }}>
        ¿Qué quieres conseguir?
      </h1>
      <p style={{ ...fontBody, color: T.textMuted, fontSize: "0.95rem", marginTop: "0.5rem" }}>
        Elige un punto de partida. Te llevará directo a la herramienta adecuada.
      </p>

      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ gap: "1rem", marginTop: "1.75rem" }}
      >
        {CATEGORIES.map((c, i) => (
          <Card
            key={i}
            onClick={c.view ? () => onNavigate(c.view) : undefined}
            disabled={!c.view}
            style={{ animation: `fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center gap-3.5">
              <IconTile icon={c.icon} tone={c.tone} />
              <div>
                <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.98rem" }}>{c.label}</div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem" }}>{c.desc}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: "3.5rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1.1rem", marginBottom: "1rem" }}>
          Todas las herramientas
        </div>

        <div role="search" aria-label="Buscar herramientas" style={{ position: "relative" }}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar una herramienta..."
            aria-label="Buscar herramientas por nombre o descripción"
            style={{
              ...fontBody,
              width: "100%",
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: "0.8rem",
              padding: "0.85rem 1.1rem",
              color: T.text,
              fontSize: "0.95rem",
              outline: "none",
              marginBottom: "1.5rem",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              paddingRight: query ? "2.5rem" : "1.1rem",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = T.lime; e.currentTarget.style.boxShadow = `0 0 0 3px ${T.limeSoft}`; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpiar búsqueda"
              style={{
                position: "absolute",
                right: "0.7rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: T.textMuted,
                cursor: "pointer",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "44px",
                minWidth: "44px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = T.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = T.textMuted; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <div aria-live="polite" style={{ position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", border: "0" }}>
          {query ? `${filtered.length} herramientas encontradas` : `${ALL_TOOLS.length} herramientas disponibles`}
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          style={{ gap: "1rem" }}
        >
          {filtered.map((t, i) => (
            <Card
              key={t.id}
              onClick={() => onNavigate(t.id)}
              style={{ padding: "1.2rem", animation: `fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: `${i * 0.03}s` }}
            >
              <IconTile icon={t.icon} tone={t.tone} />
              <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.88rem", marginTop: "0.7rem" }}>{t.label}</div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.76rem", marginTop: "0.3rem" }}>{t.desc}</div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", gridColumn: "1 / -1", textAlign: "center", padding: "2rem 0" }}>
              No hay herramientas que coincidan con "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
