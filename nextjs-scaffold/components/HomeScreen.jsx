"use client";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { Card, IconTile } from "@/components/ui";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { usePersistentState } from "@/lib/persistence";
import { GUIDES } from "@/lib/guides-data";
import { Clock, X, Search, RotateCcw, ArrowRight, BookOpen, Lock } from "lucide-react";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeToolId = searchParams.get("tool");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(null);
  const [guide, setGuide] = useState(null);
  const [info, setInfo] = useState(null);
  const [recent, setRecent] = usePersistentState("metabox_recent_tools", []);
  const [total, setTotal] = usePersistentState("metabox_total_calc", 125420);

  const setTool = (id) => {
    setGuide(null); setInfo(null);
    const p = new URLSearchParams(window.location.search);
    if (id) { p.set("tool", id); setRecent(prev => [id, ...prev.filter(i => i !== id)].slice(0, 4)); setTotal(c => c + 1); }
    else p.delete("tool");
    router.push(`?${p.toString()}`, { scroll: false });
  };

  const smartRec = query.length > 2 ? ALL_TOOLS.find(t => t.id === (query.toLowerCase().includes("inver") ? "compound" : "goal")) : null;
  const filtered = ALL_TOOLS.filter(t => (t.label.toLowerCase().includes(query.toLowerCase()) || t.desc.toLowerCase().includes(query.toLowerCase())) && (!cat || t.category === cat));
  const activeTool = ALL_TOOLS.find(t => t.id === activeToolId);
  const featured = ALL_TOOLS.find(t => t.id === "goal") || ALL_TOOLS[0];
  const curGuide = GUIDES.find(g => g.id === guide);

  if (activeToolId) return (
    <div className="pt-6 pb-28 w-full px-4">
      <button onClick={() => setTool(null)} style={{ ...fontBody, background: T.surface, border: `1px solid ${T.border}`, color: T.text, padding: "0.5rem 1rem", borderRadius: "0.8rem", cursor: "pointer", marginBottom: "1.5rem", fontSize: "0.85rem" }}>← Volver</button>
      {activeTool?.component ? <activeTool.component onBack={() => setTool(null)} /> : <div style={{ color: T.coral }}>No encontrada.</div>}
    </div>
  );

  if (curGuide) return (
    <div className="pt-6 pb-28 w-full px-4 max-w-2xl mx-auto">
      <button onClick={() => setGuide(null)} style={{ ...fontBody, background: T.surface, border: `1px solid ${T.border}`, color: T.text, padding: "0.5rem 1rem", borderRadius: "0.8rem", cursor: "pointer", marginBottom: "1.5rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>← Volver al inicio</button>
      <div className="p-6 md:p-8 rounded-2xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div style={{ ...fontBody, color: T.lime, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{curGuide.badge}</div>
        <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.6rem", lineHeight: 1.2, marginBottom: "0.5rem" }}>{curGuide.title}</h1>
        <p style={{ ...fontBody, color: T.textMuted, fontSize: "0.9rem", marginBottom: "1.2rem", lineHeight: 1.5 }}>{curGuide.subtitle}</p>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", marginBottom: "1.5rem", borderBottom: `1px solid ${T.border}`, paddingBottom: "1rem" }}>{curGuide.meta}</div>
        
        {curGuide.summaryBox && (
          <div className="p-4 mb-6 rounded-xl" style={{ background: T.surfaceAlt, borderLeft: `4px solid ${T.lime}` }}>
            <span style={{ ...fontBody, color: T.lime, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.2rem" }}>{curGuide.summaryBox.label}</span>
            <p style={{ ...fontBody, color: T.text, fontSize: "0.85rem", lineHeight: 1.5 }}>{curGuide.summaryBox.text}</p>
          </div>
        )}

        {curGuide.tableOfContents && (
          <div className="p-4 mb-6 rounded-xl" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
            <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.5rem" }}>En esta guía</div>
            <div className="space-y-1.5">
              {curGuide.tableOfContents.map(item => (
                <a key={item.id} href={`#${item.id}`} style={{ ...fontBody, color: T.lime, fontSize: "0.8rem", display: "block", textDecoration: "none" }}>→ {item.label}</a>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {curGuide.sections.map(sec => (
            <div key={sec.id} id={sec.id} className="scroll-mt-20">
              <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.2rem", marginBottom: "0.5rem" }}>{sec.title}</h2>
              {sec.content && <p style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>{sec.content}</p>}
              
              {sec.example && (
                <div className="p-4 rounded-xl my-3" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                  <div style={{ ...fontBody, color: "#f59e0b", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.25rem" }}>💡 {sec.example.title}</div>
                  <p style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.5 }}>{sec.example.text}</p>
                </div>
              )}

              {sec.table && (
                <div className="overflow-x-auto my-3 rounded-xl" style={{ border: `1px solid ${T.border}` }}>
                  <table className="w-full text-left text-xs">
                    <thead style={{ background: T.surfaceAlt, color: T.text, borderBottom: `1px solid ${T.border}` }}>
                      <tr>{sec.table.headers.map((th, i) => <th key={i} className="p-2.5 font-semibold">{th}</th>)}</tr>
                    </thead>
                    <tbody>
                      {sec.table.rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                          {row.map((cell, j) => <td key={j} className="p-2.5" style={{ ...fontBody, color: T.textMuted }}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {sec.steps && (
                <div className="space-y-3 my-3">
                  {sec.steps.map((st, i) => (
                    <div key={i} className="p-3 rounded-xl flex gap-3 items-start" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                      <span style={{ ...fontDisplay, color: T.lime, fontSize: "0.8rem", fontWeight: 700 }}>{st.num}</span>
                      <div>
                        <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.15rem" }}>{st.title}</div>
                        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", lineHeight: 1.5 }}>{st.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sec.errors && (
                <div className="space-y-3 my-3">
                  {sec.errors.map((err, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                      <div style={{ ...fontBody, color: "#f87171", fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.15rem" }}>⚠️ {err.title}</div>
                      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", lineHeight: 1.5 }}>{err.desc}</div>
                    </div>
                  ))}
                </div>
              )}

              {sec.faqs && (
                <div className="space-y-3 my-3">
                  {sec.faqs.map((faq, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                      <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.15rem" }}>{faq.q}</div>
                      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", lineHeight: 1.5 }}>{faq.a}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (info) {
    const txt = { about: ["Sobre nosotros", "MetaBox democratiza la educación financiera."], methodology: ["Metodología", "Cálculos locales en tu navegador."], contact: ["Contacto", "Escríbenos a soporte@metabox.app."] }[info];
    return (
      <div className="pt-6 pb-28 w-full px-4 max-w-xl mx-auto">
        <button onClick={() => setInfo(null)} style={{ ...fontBody, background: T.surface, border: `1px solid ${T.border}`, color: T.text, padding: "0.5rem 1rem", borderRadius: "0.8rem", cursor: "pointer", marginBottom: "1.5rem", fontSize: "0.85rem" }}>← Volver</button>
        <div className="p-6 rounded-2xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}><h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.5rem", marginBottom: "0.5rem" }}>{txt[0]}</h1><p style={{ ...fontBody, color: T.textMuted, fontSize: "0.9rem" }}>{txt[1]}</p></div>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-28 w-full px-4 md:px-0">
      <div className="mb-6">
        <div style={{ ...fontBody, color: T.lime, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>MetaBox</div>
        <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.85rem" }}>Tu dinero, con un plan.</h1>
        <p style={{ ...fontBody, color: T.textMuted, fontSize: "0.9rem", marginTop: "0.3rem" }}>Calcula y planifica tus finanzas gratis.</p>
      </div>

      {recent.length > 0 && !query && !cat && (
        <div className="mb-4">
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", marginBottom: "0.3rem" }}>Recientes</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recent.map(id => { const t = ALL_TOOLS.find(x => x.id === id); return t ? <button key={id} onClick={() => setTool(t.id)} style={{ ...fontBody, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.5rem", padding: "0.3rem 0.6rem", color: T.text, fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap" }}>{t.label}</button> : null; })}
          </div>
        </div>
      )}

      <div className="relative mb-5">
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.3rem" }}><Search size={14} className="inline mr-1 text-lime" /> ¿Qué necesitas calcular?</div>
        <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder='Ej: "Ahorrar 5.000 €"...' style={{ ...fontBody, width: "100%", background: T.surface, border: `1px solid ${query ? T.lime : T.border}`, borderRadius: "0.8rem", padding: "0.8rem 1rem 0.8rem 2.4rem", color: T.text, fontSize: "0.85rem", outline: "none" }} />
        {smartRec && <div onClick={() => setTool(smartRec.id)} className="cursor-pointer mt-2 p-3 rounded-xl flex items-center justify-between" style={{ background: T.surface, border: `1px solid ${T.lime}` }}><span style={{ ...fontBody, color: T.lime, fontSize: "0.8rem", fontWeight: 600 }}>Sugerencia: {smartRec.label}</span><ArrowRight size={12} style={{ color: T.lime }} /></div>}
      </div>

      {!query && !cat && featured && (
        <div onClick={() => setTool(featured.id)} className="cursor-pointer rounded-xl p-4 mb-5" style={{ background: T.surface, border: `1px solid ${T.lime}` }}>
          <div style={{ ...fontBody, color: T.lime, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>Destacada</div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "1rem", marginTop: "0.1rem" }}>{featured.label}</div>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", marginTop: "0.2rem" }}>{featured.desc}</div>
        </div>
      )}

      {!query && (
        <div className="mb-5 grid grid-cols-2 gap-2">
          {[{ id: "ahorrar", l: "Ahorrar" }, { id: "organizar", l: "Organizar" }, { id: "planificar", l: "Planificar" }, { id: "crecer", l: "Crecer" }].map(c => (
            <div key={c.id} onClick={() => setCat(cat === c.id ? null : c.id)} className="cursor-pointer p-2.5 rounded-xl" style={{ background: cat === c.id ? T.surfaceAlt : T.surface, border: `1px solid ${cat === c.id ? T.lime : T.border}` }}>
              <span style={{ ...fontBody, color: T.lime, fontSize: "0.7rem", fontWeight: 700 }}>{c.l}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.9rem" }}>Herramientas</span>
          {(cat || query) && <button onClick={() => { setCat(null); setQuery(""); }} style={{ background: "none", border: "none", color: T.lime, fontSize: "0.75rem", cursor: "pointer" }}><RotateCcw size={11} className="inline mr-1" /> Ver todo</button>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filtered.map(t => (
            <Card key={t.id} onClick={() => setTool(t.id)} style={{ padding: "1rem", cursor: "pointer" }}>
              <IconTile icon={t.icon} tone={t.tone} />
              <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.85rem", marginTop: "0.5rem" }}>{t.label}</div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem", marginTop: "0.2rem" }} className="line-clamp-2">{t.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-6 p-4 rounded-xl text-center" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.1rem", fontWeight: 700 }}>+{total.toLocaleString()} cálculos</div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem", marginTop: "0.2rem" }}><Lock size={12} className="inline mr-1 text-lime" /> Privacidad garantizada en tu dispositivo</div>
      </div>

      <div className="mb-6">
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.5rem" }}><BookOpen size={14} className="inline mr-1 text-lime" /> Guías financieras detalladas</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {GUIDES.map(g => (
            <div key={g.id} onClick={() => setGuide(g.id)} className="p-3.5 rounded-xl cursor-pointer flex flex-col justify-between" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div>
                <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.82rem", marginBottom: "0.25rem" }}>{g.title}</div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem" }} className="line-clamp-2">{g.subtitle}</div>
              </div>
              <div style={{ ...fontBody, color: T.lime, fontSize: "0.72rem", fontWeight: 600, marginTop: "0.75rem" }} className="flex items-center gap-1">Leer guía paso a paso <ArrowRight size={11} /></div>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ paddingTop: "1.5rem", borderTop: `1px solid ${T.border}` }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "0.8rem", marginBottom: "0.4rem" }}>Herramientas</div>
          <button onClick={() => { setCat("ahorrar"); window.scrollTo({ top: 300, behavior: 'smooth' }); }} className="text-left bg-transparent border-none cursor-pointer p-0 block" style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem", marginBottom: "0.3rem" }}>Ahorro</button>
          <button onClick={() => setTool("budget")} className="text-left bg-transparent border-none cursor-pointer p-0 block" style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem" }}>Presupuesto</button>
        </div>
        <div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "0.8rem", marginBottom: "0.4rem" }}>Recursos</div>
          <button onClick={() => setGuide("fondo-emergencia")} className="text-left bg-transparent border-none cursor-pointer p-0 block" style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem", marginBottom: "0.3rem" }}>Guías</button>
          <button onClick={() => { setCat(null); setQuery(""); }} className="text-left bg-transparent border-none cursor-pointer p-0 block" style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem" }}>Calculadoras</button>
        </div>
        <div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "0.8rem", marginBottom: "0.4rem" }}>Plataforma</div>
          <button onClick={() => setInfo("about")} className="text-left bg-transparent border-none cursor-pointer p-0 block" style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem", marginBottom: "0.3rem" }}>Sobre nosotros</button>
          <button onClick={() => setInfo("contact")} className="text-left bg-transparent border-none cursor-pointer p-0 block" style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem" }}>Contacto</button>
        </div>
        <div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "0.8rem", marginBottom: "0.4rem" }}>Legal</div>
          <Link href="/privacidad" style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem", display: "block", marginBottom: "0.3rem", textDecoration: "none" }}>Privacidad</Link>
          <Link href="/aviso-legal" style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem", display: "block", textDecoration: "none" }}>Aviso legal</Link>
        </div>
      </footer>
    </div>
  );
}

export default function HomeScreen() {
  return <Suspense fallback={<div className="pt-8 pb-28 w-full text-center" style={{ color: "#888", fontSize: "0.85rem" }}>Cargando...</div>}><HomeContent /></Suspense>;
                          }
                                                                                                                                          
