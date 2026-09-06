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
      <div className="pt-6 pb-28 w-full view-enter">
        <button onClick={() => setActiveToolId(null)} style={{ ...fontBody, background: T.surface, border: `1px solid ${T.border}`, color: T.text, padding: "0.5rem 1rem", borderRadius: "0.8rem", cursor: "pointer", marginBottom: "1.5rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          ← Volver al inicio
        </button>
        {selectedTool?.component ? <selectedTool.component onBack={() => setActiveToolId(null)} /> : <div style={{ color: T.coral }}>Herramienta no encontrada.</div>}
      </div>
    );
  }

  return (
    <div className="pt-6 pb-28 w-full view-enter">
      {/* Hero */}
      <div className="mb-8">
        <div style={{ ...fontBody, color: T.lime, fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "0.4rem", textTransform: "uppercase" }}>MetaBox · Finanzas Inteligentes</div>
        <h1 style={{ ...fontDisplay, color: T.text, fontSize: "2.1rem", lineHeight: 1.15 }}>Tu dinero, con un plan.</h1>
        <p style={{ ...fontBody, color: T.textMuted, fontSize: "0.95rem", marginTop: "0.5rem", maxWidth: "600px" }}>Calcula, organiza y planifica tus finanzas con herramientas gratuitas diseñadas para tomar decisiones con claridad absoluta.</p>
      </div>

      {/* Recientes */}
      {recentTools.length > 0 && !query && !selectedCategory && (
        <div className="mb-6">
          <div className="flex items-center gap-1.5" style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", marginBottom: "0.5rem" }}><Clock size={12} /> Utilizadas recientemente</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentTools.map(id => {
              const t = ALL_TOOLS.find(x => x.id === id);
              if (!t) return null;
              return (
                <button key={id} onClick={() => setActiveToolId(t.id)} style={{ ...fontBody, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.6rem", padding: "0.45rem 0.75rem", color: T.text, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: T.lime }} />{t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Buscador + Intención Semántica */}
      <div className="relative mb-8">
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Search size={14} style={{ color: T.lime }} /> ¿Qué necesitas calcular o planificar?
        </div>
        <div className="relative">
          <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder='Ej: "Ahorrar 5.000 €", "fondo de emergencia"...' style={{ ...fontBody, width: "100%", background: T.surface, border: `1px solid ${query ? T.lime : T.border}`, borderRadius: "0.9rem", padding: "0.95rem 1.2rem 0.95rem 2.8rem", color: T.text, fontSize: "0.92rem", outline: "none", boxShadow: query ? `0 0 0 3px ${T.limeSoft}` : "none" }} />
          <span className="absolute left-4 top-1/2 -translate-y-1/2">🔎</span>
          {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer" style={{ color: T.textMuted }}><X size={16} /></button>}
        </div>

        {smartRec && (
          <div onClick={() => setActiveToolId(smartRec.id)} className="cursor-pointer mt-3 p-3.5 rounded-xl flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${T.surface} 0%, ${T.surfaceAlt} 100%)`, border: `1px solid ${T.lime}` }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: T.limeSoft, color: T.lime }}><Sparkles size={16} /></div>
              <div>
                <div style={{ ...fontBody, color: T.lime, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" }}>Recomendación inteligente</div>
                <div style={{ ...fontBody, color: T.text, fontSize: "0.88rem", fontWeight: 600 }}>Te sugerimos usar: {smartRec.label}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: T.lime, ...fontBody }}>Abrir <ArrowRight size={13} /></div>
          </div>
        )}
      </div>

      {/* Herramienta Protagonista */}
      {!query && !selectedCategory && featuredTool && (
        <div className="mb-8">
          <div onClick={() => setActiveToolId(featuredTool.id)} className="cursor-pointer rounded-2xl relative overflow-hidden p-6" style={{ background: `linear-gradient(135deg, ${T.surface} 0%, ${T.surfaceAlt} 100%)`, border: `1px solid ${T.lime}` }}>
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold" style={{ background: T.limeSoft, color: T.lime, ...fontBody }}>
              <Star size={11} fill={T.lime} /> La más utilizada
            </div>
            <div className="flex items-start gap-4">
              <IconTile icon={featuredTool.icon} tone={featuredTool.tone} />
              <div>
                <div style={{ ...fontBody, color: T.lime, fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase" }}>Herramienta Destacada</div>
                <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "1.15rem", marginTop: "0.2rem" }}>{featuredTool.label}</div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginTop: "0.3rem" }}>Calcula exactamente cuánto apartar de forma periódica para alcanzar cualquier objetivo.</div>
                <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: T.lime, ...fontBody }}>Calcular en 30 segundos <ArrowRight size={13} /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categorías */}
      {!query && (
        <div className="mb-8">
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1rem", marginBottom: "1rem" }}>Explora por categorías</div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: "ahorrar", label: "AHORRAR", desc: "Objetivos · Retos · Fondo de emergencia" },
              { id: "organizar", label: "ORGANIZAR", desc: "Presupuesto · Gastos · Ingresos" },
              { id: "planificar", label: "PLANIFICAR", desc: "Viajes · Compras · Grandes metas" },
              { id: "crecer", label: "HACER CRECER", desc: "Interés compuesto · Inversión" }
            ].map((cat) => {
              const isSel = selectedCategory === cat.id;
              return (
                <div key={cat.id} onClick={() => setSelectedCategory(isSel ? null : cat.id)} className="cursor-pointer p-3.5 rounded-xl transition-all" style={{ background: isSel ? T.surfaceAlt : T.surface, border: `1px solid ${isSel ? T.lime : T.border}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ ...fontBody, color: T.lime, fontSize: "0.72rem", fontWeight: 700 }}>{cat.label}</span>
                    <ArrowRight size={13} style={{ color: T.textMuted }} />
                  </div>
                  <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }} className="line-clamp-2">{cat.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Listado */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1rem" }}>{selectedCategory ? `Filtrado por "${selectedCategory.toUpperCase()}"` : "Todas las herramientas"}</div>
          {(selectedCategory || query) && (
            <button onClick={() => { setSelectedCategory(null); setQuery(""); }} style={{ background: "none", border: "none", color: T.lime, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <RotateCcw size={12} /> Ver todo
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((t) => (
            <Card key={t.id} onClick={() => setActiveToolId(t.id)} style={{ padding: "1.2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer" }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <IconTile icon={t.icon} tone={t.tone} />
                  <span style={{ fontSize: "0.7rem", color: T.textMuted, ...fontBody }}>⚡ Rápido</span>
                </div>
                <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.92rem" }}>{t.label}</div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", marginTop: "0.3rem" }} className="line-clamp-2">{t.desc}. Descubre cuánto reservar.</div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-[0.78rem] font-medium" style={{ color: T.lime, ...fontBody }}>Calcular en 30 segundos →</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Contador & Confianza */}
      <div className="mb-8 grid gap-4">
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "1rem", padding: "1.5rem", textAlign: "center" }}>
          <div className="grid grid-cols-3 divide-x" style={{ borderColor: T.border }}>
            <div>
              <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.25rem", fontWeight: 700 }}>+{totalCalc.toLocaleString()}</div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem", marginTop: "0.2rem" }}>Cálculos realizados</div>
            </div>
            <div>
              <div style={{ ...fontDisplay, color: T.text, fontSize: "1.25rem", fontWeight: 700 }}>20+</div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem", marginTop: "0.2rem" }}>Herramientas gratis</div>
            </div>
            <div>
              <div style={{ ...fontDisplay, color: T.text, fontSize: "1.25rem", fontWeight: 700 }}>0</div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem", marginTop: "0.2rem" }}>Registros necesarios</div>
            </div>
          </div>
        </div>

        <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "1rem", padding: "1.25rem 1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <Lock size={20} style={{ color: T.lime, flexShrink: 0 }} />
          <div>
            <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.85rem" }}>Privacidad garantizada y sin registro</div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", marginTop: "0.2rem" }}>Tus datos permanecen en tu dispositivo. Propósito puramente orientativo.</div>
          </div>
        </div>
      </div>

      {/* Editorial */}
      <div className="mb-10">
        <div className="flex items-center gap-1.5" style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1rem", marginBottom: "1rem" }}>
          <BookOpen size={16} style={{ color: T.lime }} /> Aprende a tomar mejores decisiones con tu dinero
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: "Cómo crear un fondo de emergencia desde cero", desc: "La red de seguridad indispensable antes de empezar a invertir." },
            { title: "Cuánto ahorrar cada mes según tu objetivo", desc: "Métodos prácticos para automatizar tus metas sin renunciar a tu día a día." },
            { title: "Cómo funciona el interés compuesto", desc: "El secreto mejor guardado para multiplicar tus ahorros a largo plazo." }
          ].map((art, i) => (
            <div key={i} className="p-4 rounded-xl cursor-pointer" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.85rem" }}>{art.title}</div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", marginTop: "0.3rem" }}>{art.desc}</div>
              <div className="mt-3 text-[0.75rem] font-medium" style={{ color: T.lime, ...fontBody }}>Leer guía rápida →</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ paddingTop: "2.5rem", borderTop: `1px solid ${T.border}` }} className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.8rem" }}>Herramientas</div>
          <div className="flex flex-col gap-1.5" style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>
            <span>Ahorro y Metas</span><span>Presupuesto Diario</span><span>Planificación Anual</span>
          </div>
        </div>
        <div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.8rem" }}>Recursos</div>
          <div className="flex flex-col gap-1.5" style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>
            <span>Guías Financieras</span><span>Calculadoras</span><span>Blog</span>
          </div>
        </div>
        <div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.8rem" }}>La Plataforma</div>
          <div className="flex flex-col gap-1.5" style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>
            <span>Sobre nosotros</span><span>Metodología</span><span>Contacto</span>
          </div>
        </div>
        <div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.8rem" }}>Legal</div>
          <div className="flex flex-col gap-1.5" style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>
            <Link href="/privacidad" style={{ color: "inherit", textDecoration: "none" }}>Privacidad</Link>
            <Link href="/cookies" style={{ color: "inherit", textDecoration: "none" }}>Cookies</Link>
            <Link href="/aviso-legal" style={{ color: "inherit", textDecoration: "none" }}>Aviso legal</Link>
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
                                                                                                     
