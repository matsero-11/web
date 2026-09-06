"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { Card, IconTile } from "@/components/ui";
import { ALL_TOOLS, CATEGORIES } from "@/lib/tools-registry";
import { usePersistentState } from "@/lib/persistence";
import { Clock, X, Search, RotateCcw, Sparkles, ArrowRight } from "lucide-react";

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
      <div className="pt-6 pb-28 w-full view-enter">
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
    <div className="pt-6 pb-28 w-full view-enter">
      {/* Header Badge */}
      <div className="flex items-center gap-2" style={{ marginBottom: "0.5rem" }}>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.72rem] font-medium"
          style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.lime, ...fontBody }}
        >
          <Sparkles size={11} /> METABOX SUITE · 2026
        </span>
      </div>

      <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.75rem", lineHeight: 1.15, marginTop: "0.4rem" }}>
        ¿Qué quieres conseguir hoy?
      </h1>
      <p style={{ ...fontBody, color: T.textMuted, fontSize: "0.9rem", marginTop: "0.35rem" }}>
        Selecciona un acceso rápido o busca una herramienta específica.
      </p>

      {/* Recientes */}
      {recentTools.length > 0 && !query && !selectedCategory && (
        <div style={{ marginTop: "1.25rem" }}>
          <div className="flex items-center gap-1.5" style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", marginBottom: "0.5rem" }}>
            <Clock size={12} /> Utilizadas recientemente
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
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
                    borderRadius: "0.6rem",
                    padding: "0.45rem 0.75rem",
                    color: T.text,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
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

      {/* Categorías en Grid de 2 columnas (Optimizado para móvil) */}
      <div
        className="grid grid-cols-2 md:grid-cols-2 gap-2.5"
        style={{ marginTop: "1.25rem" }}
      >
        {CATEGORIES.map((c, i) => {
          const isSelected = selectedCategory === c.id;
          return (
            <div
              key={i}
              onClick={() => {
                if (c.view) {
                  setActiveToolId(c.view);
                } else if (c.id) {
                  setSelectedCategory(isSelected ? null : c.id);
                }
              }}
              className="group cursor-pointer p-3.5 rounded-xl transition-all duration-200"
              style={{
                background: isSelected ? T.surfaceAlt : T.surface,
                border: `1px solid ${isSelected ? T.lime : T.border}`,
                animation: `fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1) both`,
                animationDelay: `${i * 0.04}s`,
              }}
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <IconTile icon={c.icon} tone={c.tone} />
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" style={{ color: T.textMuted }} />
                </div>
                <div>
                  <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.88rem" }}>{c.label}</div>
                  <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem", marginTop: "0.15rem", lineHeight: 1.3 }} className="line-clamp-2">{c.desc}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Buscador y Grid Principal */}
      <div style={{ marginTop: "2.5rem" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "0.8rem" }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1rem" }}>
            {selectedCategory ? "Herramientas filtradas" : "Todas las herramientas"}
          </div>
          {(selectedCategory || query) && (
            <button
              onClick={() => { setSelectedCategory(null); setQuery(""); }}
              style={{ ...fontBody, background: "transparent", border: "none", color: T.lime, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              <RotateCcw size={12} /> Ver todo
            </button>
          )}
        </div>

        {/* Buscador con Icono Integrado */}
        <div role="search" aria-label="Buscar herramientas" style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: T.textMuted, pointerEvents: "none" }}>
            <Search size={16} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o función..."
            aria-label="Buscar herramientas por nombre o descripción"
            style={{
              ...fontBody,
              width: "100%",
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: "0.8rem",
              padding: "0.8rem 1.1rem 0.8rem 2.6rem",
              color: T.text,
              fontSize: "0.9rem",
              outline: "none",
              marginBottom: "1.25rem",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
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
                right: "0.6rem",
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
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Grid de herramientas compacto y estético */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          style={{ gap: "0.85rem" }}
        >
          {filtered.map((t, i) => (
            <Card
              key={t.id}
              onClick={() => setActiveToolId(t.id)}
              style={{ padding: "1rem", animation: `fadeInUp 0.35s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: `${i * 0.02}s` }}
            >
              <IconTile icon={t.icon} tone={t.tone} />
              <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.84rem", marginTop: "0.6rem" }}>{t.label}</div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem", marginTop: "0.2rem", lineHeight: 1.3 }} className="line-clamp-2">{t.desc}</div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", gridColumn: "1 / -1", textAlign: "center", padding: "2.5rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem" }}>
              <div>No hay resultados para "{query}".</div>
              <button
                onClick={() => { setQuery(""); setSelectedCategory(null); }}
                style={{
                  ...fontBody,
                  background: T.lime,
                  color: "#12200A",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.6rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Restablecer filtros
              </button>
            </div>
          )}
        </div>
      </div>

      <footer
        style={{
          marginTop: "3rem",
          paddingTop: "1.25rem",
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "1.25rem",
        }}
      >
        <Link href="/aviso-legal" style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", textDecoration: "none" }}>Aviso legal</Link>
        <Link href="/privacidad" style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", textDecoration: "none" }}>Privacidad</Link>
        <Link href="/cookies" style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", textDecoration: "none" }}>Cookies</Link>
      </footer>
    </div>
  );
}

export default function HomeScreen() {
  return (
    <Suspense fallback={<div className="pt-8 pb-28 w-full text-center" style={{ color: "#888", fontSize: "0.85rem" }}>Cargando panel...</div>}>
      <HomeContent />
    </Suspense>
  );
            }
