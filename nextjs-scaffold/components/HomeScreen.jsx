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

  return (
    <div className="px-5 pt-8 pb-16 max-w-md mx-auto">
      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", letterSpacing: "0.08em" }}>
        RAÍZ · PLANIFICACIÓN PERSONAL
      </div>
      <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.9rem", lineHeight: 1.15, marginTop: "0.5rem" }}>
        ¿Qué quieres conseguir?
      </h1>
      <p style={{ ...fontBody, color: T.textMuted, fontSize: "0.95rem", marginTop: "0.5rem" }}>
        Elige un punto de partida. Te llevará directo a la herramienta adecuada.
      </p>

      <div className="grid grid-cols-1 gap-3 mt-6">
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

      <div style={{ marginTop: "2.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1rem", marginBottom: "0.7rem" }}>
          Todas las herramientas
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar una herramienta..."
          style={{
            ...fontBody,
            width: "100%",
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: "0.8rem",
            padding: "0.7rem 1rem",
            color: T.text,
            fontSize: "0.9rem",
            outline: "none",
            marginBottom: "0.9rem",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.lime; e.currentTarget.style.boxShadow = `0 0 0 3px ${T.limeSoft}`; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
        />
        <div className="grid grid-cols-2 gap-2.5">
          {filtered.map((t, i) => (
            <Card
              key={t.id}
              onClick={() => onNavigate(t.id)}
              style={{ padding: "0.9rem", animation: `fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: `${i * 0.03}s` }}
            >
              <IconTile icon={t.icon} tone={t.tone} />
              <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.85rem", marginTop: "0.6rem" }}>{t.label}</div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.74rem", marginTop: "0.15rem" }}>{t.desc}</div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", gridColumn: "1 / -1", textAlign: "center", padding: "1rem 0" }}>
              No hay herramientas que coincidan con "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default HomeScreen;
