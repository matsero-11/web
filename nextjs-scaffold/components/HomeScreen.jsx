"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { Card, IconTile } from "@/components/ui";
import { ALL_TOOLS, CATEGORIES } from "@/lib/tools-registry";
import { usePersistentState } from "@/lib/persistence";
import { Clock, X, RotateCcw } from "lucide-react";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeToolId = searchParams.get("tool");

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [recentTools, setRecentTools] = usePersistentState("metabox_recent_tools", []);

  const setActiveToolId = (id) => {
    const params = new URLSearchParams(window.location.search);
    if (id) {
      params.set("tool", id);
      setRecentTools((prev) => {
        const filtered = prev.filter((item) => item !== id);
        return [id, ...filtered].slice(0, 4);
      });
    } else {
      params.delete("tool");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const filtered = ALL_TOOLS.filter((t) => {
    const matchesQuery =
      t.label.toLowerCase().includes(query.toLowerCase()) ||
      t.desc.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory ? t.category === selectedCategory : true;
    return matchesQuery && matchesCategory;
  });

  const selectedTool = ALL_TOOLS.find((t) => t.id === activeToolId);

  if (activeToolId) {
    return (
      <div className="pt-8 pb-28 w-full view-enter">
        <button
          onClick={() => setActiveToolId(null)}
          style={{
            ...fontBody,
            background: T.surface,
            border: `1px solid ${T.border}`,
            color: T.text,
            padding: "0.5rem 1rem",
            borderRadius: "0.8rem",
            cursor: "pointer",
            marginBottom: "1.5rem",
            fontWeight: 500,
            fontSize: "0.85rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.lime; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; }}
        >
          ← Volver al inicio
        </button>

        {selectedTool && selectedTool.component ? (
          (() => {
            const ToolComponent = selectedTool.component;
            return <ToolComponent onBack={() => setActiveToolId(null)} />;
          })()
        ) : (
          <div style={{ ...fontBody, color: T.coral, padding: "2rem 0", textAlign: "center" }}>
            Falta asignar el componente para la herramienta ID: "{activeToolId}" en `tools-registry.js`.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pt-8 pb-28 w-full view-enter">
      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", letterSpacing: "0.08em" }}>
        METABOX · HERRAMIENTAS FINANCIERAS
      </div>
      <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.9rem", lineHeight: 1.15, marginTop: "0.5rem" }}>
        ¿Qué quieres conseguir?
      </h1>
      <p style={{ ...fontBody, color: T.textMuted, fontSize: "0.95rem", marginTop: "0.5rem" }}>
        Elige un punto de partida o usa el buscador inteligente.
      </p>

      {recentTools.length > 0 && !query && !selectedCategory && (
        <div style={{ marginTop: "1.5rem" }}>
          <div className="flex items-center gap-1.5" style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", marginBottom: "0.6rem" }}>
            <Clock size={13} /> Recientes
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {recentTools.map((id) => {
              const tool = ALL_TOOLS.find((t) => t.id === id);
              if (!tool) return null;
              return (
                <button
                  key={id}
                  onClick={() => setActiveToolId(tool.id)}
                  style={{
                    ...fontBody,
                    background: T.surfaceAlt,
                    border: `1px solid ${T.border}`,
                    borderRadius: "0.7rem",
                    padding: "0.5rem 0.85rem",
                    color: T.text,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    transition: "border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.lime; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; }}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: T.lime }} />
                  {tool.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ gap: "1rem", marginTop: "1.75rem" }}
      >
        {CATEGORIES.map((c, i) => {
          const isSelected = selectedCategory === c.id;
          return (
            <Card
              key={i}
              onClick={() => {
                if (c.view) {
                  setActiveToolId(c.view);
                } else if (c.id) {
                  setSelectedCategory(isSelected ? null : c.id);
                }
              }}
              style={{
                animation: `fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both`,
                animationDelay: `${i * 0.05}s`,
                borderColor: isSelected ? T.lime : T.border,
                background: isSelected ? T.surfaceAlt : T.surface,
              }}
            >
              <div className="flex items-center gap-3.5">
                <IconTile icon={c.icon} tone={c.tone} />
                <div>
                  <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.98rem" }}>{c.label}</div>
                  <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem" }}>{c.desc}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ marginTop: "3.5rem" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "1rem" }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1.1rem" }}>
            {selectedCategory ? "Herramientas de la categoría" : "Todas las herramientas"}
          </div>
          {(selectedCategory || query) && (
            <button
              onClick={() => { setSelectedCategory(null); setQuery(""); }}
              style={{ ...fontBody, background: "transparent", border: "none", color: T.lime, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              <RotateCcw size={13} /> Ver todas
            </button>
          )}
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
              onClick={() => setQuery("")}
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
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          style={{ gap: "1rem" }}
        >
          {filtered.map((t, i) => (
            <Card
              key={t.id}
              onClick={() => setActiveToolId(t.id)}
              style={{ padding: "1.2rem", animation: `fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: `${i * 0.03}s` }}
            >
              <IconTile icon={t.icon} tone={t.tone} />
              <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.88rem", marginTop: "0.7rem" }}>{t.label}</div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.76rem", marginTop: "0.3rem" }}>{t.desc}</div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", gridColumn: "1 / -1", textAlign: "center", padding: "2.5rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <div>No hay herramientas que coincidan con "{query}".</div>
              <button
                onClick={() => { setQuery(""); setSelectedCategory(null); }}
                style={{
                  ...fontBody,
                  background: T.lime,
                  color: "#12200A",
                  border: "none",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "0.7rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Limpiar filtros y ver todas
              </button>
            </div>
          )}
        </div>
      </div>

      <footer
        style={{
          marginTop: "3.5rem",
          paddingTop: "1.5rem",
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "1.25rem",
        }}
      >
        <Link href="/aviso-legal" style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textDecoration: "none" }}>Aviso legal</Link>
        <Link href="/privacidad" style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textDecoration: "none" }}>Privacidad</Link>
        <Link href="/cookies" style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textDecoration: "none" }}>Cookies</Link>
      </footer>
    </div>
  );
}

export default function HomeScreen() {
  return (
    <Suspense fallback={<div className="pt-8 pb-28 w-full text-center" style={{ color: "#888" }}>Cargando...</div>}>
      <HomeContent />
    </Suspense>
  );
                                                             }
                  
