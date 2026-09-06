"use client";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { Card, IconTile } from "@/components/ui";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { usePersistentState } from "@/lib/persistence";
import { Clock, X, Search, RotateCcw, ArrowRight, Star, BookOpen, Lock, Sparkles } from "lucide-react";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeToolId = searchParams.get("tool");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [recentTools, setRecentTools] = usePersistentState("metabox_recent_tools", []);
  const [totalCalc, setTotalCalc] = usePersistentState("metabox_total_calc", 125420);

  const setActiveToolId = (id) => {
    const p = new URLSearchParams(window.location.search);
    if (id) {
      p.set("tool", id);
      setRecentTools(prev => [id, ...prev.filter(i => i !== id)].slice(0, 4));
      setTotalCalc(c => c + 1);
    } else p.delete("tool");
    router.push(`?${p.toString()}`, { scroll: false });
  };

  const getSmartIntent = (txt) => {
    const l = txt.toLowerCase();
    if (l.includes("emergencia") || l.includes("colchón")) return ALL_TOOLS.find(t => t.id === "emergency" || t.id === "goal");
    if (l.includes("viaje") || l.includes("vacaciones") || l.includes("meta")) return ALL_TOOLS.find(t => t.id === "goal");
    if (l.includes("interes") || l.includes("invertir")) return ALL_TOOLS.find(t => t.id === "compound");
    if (l.includes("presupuesto") || l.includes("gasto")) return ALL_TOOLS.find(t => t.id === "budget");
    return null;
  };

  const smartRec = query.trim().length > 2 ? getSmartIntent(query) : null;
  const filtered = ALL_TOOLS.filter(t => {
    const matchesQ = t.label.toLowerCase().includes(query.toLowerCase()) || t.desc.toLowerCase().includes(query.toLowerCase());
    return matchesQ && (selectedCategory ? t.category === selectedCategory : true);
  });

  const selectedTool = ALL_TOOLS.find(t => t.id === activeToolId);
  const featuredTool = ALL_TOOLS.find(t => t.id === "goal" || t.id === "annual") || ALL_TOOLS[0];

  if (activeToolId) {
    return (
      <div className="pt-6 pb-28 w-full view-enter px-4">
        <button onClick={() => setActiveToolId(null)} style={{ ...fontBody, background: T.surface, border: `1px solid ${T.border}`, color: T.text, padding: "0.5rem 1rem", borderRadius: "0.8rem", cursor: "pointer", marginBottom: "1.5rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          ← Volver al inicio
        </button>
        {selectedTool?.component ? <selectedTool.component onBack={() => setActiveToolId(null)} /> : <div style={{ color: T.coral }}>Herramienta no encontrada.</div>}
      </div>
    );
  }

  return (
    <div className="pt-6 pb-28 w-full view-enter px-4 md:px-0">
      {/* Hero */}
      <div className="mb-6">
        <div style={{ ...fontBody, color: T.lime, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "0.3rem", textTransform: "uppercase" }}>MetaBox · Finanzas Inteligentes</div>
        <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.85rem", lineHeight: 1.15 }}>Tu dinero, con un plan.</h1>
        <p style={{ ...fontBody, color: T.textMuted, fontSize: "0.9rem", marginTop: "0.4rem" }}>Calcula, organiza y planifica tus finanzas con herramientas gratuitas y claridad absoluta.</p>
      </div>

      {/* Recientes */}
      {recentTools.length > 0 && !query && !selectedCategory && (
        <div className="mb-5">
          <div className="flex items-center gap-1.5" style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", marginBottom: "0.4rem" }}><Clock size={12} /> Utilizadas recientemente</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentTools.map(id => {
              const t = ALL_TOOLS.find(x => x.id === id);
              if (!t) return null;
              return (
                <button key={id} onClick={() => setActiveToolId(t.id)} style={{ ...fontBody, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.6rem", padding: "0.4rem 0.7rem", color: T.text, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", whiteSpace: "nowrap" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: T.lime }} />{t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Buscador + Intención Semántica */}
      <div className="relative mb-6">
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Search size={14} style={{ color: T.lime }} /> ¿Qué necesitas calcular o planificar?
        </div>
        <div className="relative">
          <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder='Ej: "Ahorrar 5.000 €", "fondo de emergencia"...' style={{ ...fontBody, width: "100%", background: T.surface, border: `1px solid ${query ? T.lime : T.border}`, borderRadius: "0.85rem", padding: "0.9rem 1rem 0.9rem 2.6rem", color: T.text, fontSize: "0.88rem", outline: "none", boxShadow: query ? `0 0 0 3px ${T.limeSoft}` : "none" }} />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2">🔎</span>
          {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer" style={{ color: T.textMuted }}><X size={16} /></button>}
        </div>

        {smartRec && (
          <div onClick={() => setActiveToolId(smartRec.id)} className="cursor-pointer mt-3 p-3 rounded-xl flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${T.surface} 0%, ${T.surfaceAlt} 100%)`, border: `1px solid ${T.lime}` }}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg" style={{ background: T.limeSoft, color: T.lime }}><Sparkles size={15} /></div>
              <div>
                <div style={{ ...fontBody, color: T.lime, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>Recomendación inteligente</div>
                <div style={{ ...fontBody, color: T.text, fontSize: "0.84rem", fontWeight: 600 }}>Usa: {smartRec.label}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: T.lime, ...fontBody }}>Abrir <ArrowRight size={12} /></div>
          </div>
        )}
      </div>

      {/* Herramienta Protagonista */}
      {!query && !selectedCategory && featuredTool && (
        <div className="mb-6">
          <div onClick={() => setActiveToolId(featuredTool.id)} className="cursor-pointer rounded-2xl relative overflow-hidden p-5" style={{ background: `linear-gradient(135deg, ${T.surface} 0%, ${T.surfaceAlt} 100%)`, border: `1px solid ${T.lime}` }}>
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.68rem] font-semibold" style={{ background: T.limeSoft, color: T.lime, ...fontBody }}>
              <Star size={10} fill={T.lime} /> Destacada
            </div>
            <div className="flex items-start gap-3.5">
              <IconTile icon={featuredTool.icon} tone={featuredTool.tone} />
              <div>
                <div style={{ ...fontBody, color: T.lime, fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase" }}>Herramienta estrella</div>
                <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "1.05rem", marginTop: "0.15rem" }}>{featuredTool.label}</div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", marginTop: "0.25rem", lineHeight: 1.35 }}>Calcula cuánto apartar de forma periódica para alcanzar tu meta.</div>
                <div className="flex items-center gap-1 mt-2.5 text-xs font-semibold" style={{ color: T.lime, ...fontBody }}>Calcular en 30 segundos <ArrowRight size={12} /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categorías */}
      {!query && (
        <div className="mb-6">
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.75rem" }}>Explora por categorías</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "ahorrar", label: "AHORRAR", desc: "Objetivos · Retos · Fondo" },
              { id: "organizar", label: "ORGANIZAR", desc: "Presupuesto · Gastos" },
              { id: "planificar", label: "PLANIFICAR", desc: "Viajes · Metas" },
              { id: "crecer", label: "HACER CRECER", desc: "Interés compuesto" }
            ].map((cat) => {
              const isSel = selectedCategory === cat.id;
              return (
                <div key={cat.id} onClick={() => setSelectedCategory(isSel ? null : cat.id)} className="cursor-pointer p-3 rounded-xl transition-all" style={{ background: isSel ? T.surfaceAlt : T.surface, border: `1px solid ${isSel ? T.lime : T.border}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ ...fontBody, color: T.lime, fontSize: "0.68rem", fontWeight: 700 }}>{cat.label}</span>
                    <ArrowRight size={12} style={{ color: T.textMuted }} />
                  </div>
                  <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem" }} className="line-clamp-1">{cat.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Listado */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem" }}>{selectedCategory ? `Categoría: ${selectedCategory.toUpperCase()}` : "Todas las herramientas"}</div>
          {(selectedCategory || query) && (
            <button onClick={() => { setSelectedCategory(null); setQuery(""); }} style={{ background: "none", border: "none", color: T.lime, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <RotateCcw size={11} /> Ver todo
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t) => (
            <Card key={t.id} onClick={() => setActiveToolId(t.id)} style={{ padding: "1.1rem", display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer" }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <IconTile icon={t.icon} tone={t.tone} />
                  <span style={{ fontSize: "0.68rem", color: T.textMuted, ...fontBody }}>⚡ Rápido</span>
                </div>
                <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.88rem" }}>{t.label}</div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", marginTop: "0.25rem" }} className="line-clamp-2">{t.desc}</div>
              </div>
              <div className="flex items-center gap-1 mt-3.5 text-[0.75rem] font-medium" style={{ color: T.lime, ...fontBody }}>Calcular en 30 segundos →</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Contador & Confianza */}
      <div className="mb-6 grid gap-3">
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "0.9rem", padding: "1.25rem", textAlign: "center" }}>
          <div className="grid grid-cols-3 divide-x" style={{ borderColor: T.border }}>
            <div>
              <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.1rem", fontWeight: 700 }}>+{totalCalc.toLocaleString()}</div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.7rem", marginTop: "0.15rem" }}>Cálculos</div>
            </div>
            <div>
              <div style={{ ...fontDisplay, color: T.text, fontSize: "1.1rem", fontWeight: 700 }}>20+</div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.7rem", marginTop: "0.15rem" }}>Gratis</div>
            </div>
            <div>
              <div style={{ ...fontDisplay, color: T.text, fontSize: "1.1rem", fontWeight: 700 }}>0</div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.7rem", marginTop: "0.15rem" }}>Registros</div>
            </div>
          </div>
        </div>

        <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.9rem", padding: "1.1rem", display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
          <Lock size={18} style={{ color: T.lime, flexShrink: 0, marginTop: "0.1rem" }} />
          <div>
            <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.82rem" }}>Privacidad garantizada</div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", marginTop: "0.15rem", lineHeight: 1.35 }}>Tus datos se quedan en tu dispositivo. Uso puramente orientativo.</div>
          </div>
        </div>
      </div>

      {/* Editorial */}
      <div className="mb-8">
        <div className="flex items-center gap-1.5" style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.75rem" }}>
          <BookOpen size={15} style={{ color: T.lime }} /> Guías financieras rápidas
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {[
            { title: "Cómo crear un fondo de emergencia", desc: "La red de seguridad indispensable." },
            { title: "Cuánto ahorrar cada mes según tu meta", desc: "Métodos prácticos para automatizar." },
            { title: "Cómo funciona el interés compuesto", desc: "El secreto para multiplicar ahorros." }
          ].map((art, i) => (
            <div key={i} className="p-3.5 rounded-xl cursor-pointer" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.82rem", lineHeight: 1.3 }}>{art.title}</div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem", marginTop: "0.2rem" }}>{art.desc}</div>
              <div className="mt-2.5 text-[0.72rem] font-medium" style={{ color: T.lime, ...fontBody }}>Leer guía →</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Corregido (Enlaces con display block para evitar que se junten) */}
      <footer style={{ paddingTop: "2rem", borderTop: `1px solid ${T.border}` }} className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.6rem" }}>Herramientas</div>
          <div className="flex flex-col gap-1.5">
            <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", display: "block" }}>Ahorro y Metas</span>
            <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", display: "block" }}>Presupuesto Diario</span>
            <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", display: "block" }}>Planificación Anual</span>
          </div>
        </div>
        <div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.6rem" }}>Recursos</div>
          <div className="flex flex-col gap-1.5">
            <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", display: "block" }}>Guías Financieras</span>
            <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", display: "block" }}>Calculadoras</span>
            <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", display: "block" }}>Blog</span>
          </div>
        </div>
        <div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.6rem" }}>La Plataforma</div>
          <div className="flex flex-col gap-1.5">
            <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", display: "block" }}>Sobre nosotros</span>
            <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", display: "block" }}>Metodología</span>
            <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", display: "block" }}>Contacto</span>
          </div>
        </div>
        <div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.6rem" }}>Legal</div>
          <div className="flex flex-col gap-1.5">
            <Link href="/privacidad" style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", display: "block", textDecoration: "none" }}>Privacidad</Link>
            <Link href="/cookies" style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", display: "block", textDecoration: "none" }}>Cookies</Link>
            <Link href="/aviso-legal" style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", display: "block", textDecoration: "none" }}>Aviso legal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomeScreen() {
  return (
    <Suspense fallback={<div className="pt-8 pb-28 w-full text-center" style={{ color: "#888", fontSize: "0.85rem" }}>Cargando...</div>}>
      <HomeContent />
    </Suspense>
  );
    }
        
