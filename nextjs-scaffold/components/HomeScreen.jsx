"use client";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { Card, IconTile } from "@/components/ui";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { usePersistentState } from "@/lib/persistence";
import { GUIDES } from "@/lib/guides-data";
import { Search, RotateCcw, ArrowRight, BookOpen, Lock } from "lucide-react";

function HomeContent() {
  const router = useRouter(), sp = useSearchParams(), toolId = sp.get("tool");
  const [q, setQ] = useState(""), [cat, setCat] = useState(null), [g, setG] = useState(null), [inf, setInf] = useState(null);
  const [recent, setRecent] = usePersistentState("metabox_recent_tools", []);
  const [total, setTotal] = usePersistentState("metabox_total_calc", 125420);

  const top = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const setTool = id => { setG(null); setInf(null); top(); const p = new URLSearchParams(window.location.search); id ? (p.set("tool", id), setRecent(r => [id, ...r.filter(x => x !== id)].slice(0, 4)), setTotal(c => c + 1)) : p.delete("tool"); router.push(`?${p.toString()}`, { scroll: false }); };
  
  const curG = GUIDES.find(x => x.id === g), activeT = ALL_TOOLS.find(x => x.id === toolId), feat = ALL_TOOLS.find(x => x.id === "goal") || ALL_TOOLS[0];
  const smart = q.length > 2 ? ALL_TOOLS.find(x => x.id === (q.toLowerCase().includes("inver") ? "compound" : "goal")) : null;
  const filtered = ALL_TOOLS.filter(x => (x.label.toLowerCase().includes(q.toLowerCase()) || x.desc.toLowerCase().includes(q.toLowerCase())) && (!cat || x.category === cat));

  if (toolId) return (
    <div className="pt-6 pb-28 w-full px-4">
      <button onClick={() => setTool(null)} className="active:scale-[0.98] transition-transform" style={{ ...fontBody, background: T.surface, border: `1px solid ${T.border}`, color: T.text, padding: ".5rem 1rem", borderRadius: ".8rem", cursor: "pointer", marginBottom: "1.5rem", fontSize: ".85rem" }}>← Volver</button>
      {activeT?.component ? <activeT.component onBack={() => setTool(null)} /> : <div style={{ color: T.coral }}>No encontrada.</div>}
    </div>
  );

  if (curG) return (
    <div className="pt-6 pb-28 w-full px-4 max-w-2xl mx-auto">
      <button onClick={() => setG(null)} className="active:scale-[0.98] transition-transform" style={{ ...fontBody, background: T.surface, border: `1px solid ${T.border}`, color: T.text, padding: ".5rem 1rem", borderRadius: ".8rem", cursor: "pointer", marginBottom: "1.5rem", fontSize: ".85rem", display: "inline-flex", alignItems: "center", gap: ".4rem" }}>← Volver al inicio</button>
      <div className="p-6 md:p-8 rounded-2xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div style={{ ...fontBody, color: T.lime, fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: ".5rem" }}>{curG.badge}</div>
        <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.6rem", lineHeight: 1.2, marginBottom: ".5rem" }}>{curG.title}</h1>
        <p style={{ ...fontBody, color: T.textMuted, fontSize: ".9rem", marginBottom: "1.2rem", lineHeight: 1.5 }}>{curG.subtitle}</p>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: ".75rem", marginBottom: "1.5rem", borderBottom: `1px solid ${T.border}`, paddingBottom: "1rem" }}>{curG.meta}</div>
        
        {curG.summaryBox && (
          <div className="p-4 mb-6 rounded-xl" style={{ background: T.surfaceAlt, borderLeft: `4px solid ${T.lime}` }}>
            <span style={{ ...fontBody, color: T.lime, fontSize: ".75rem", fontWeight: 700, display: "block", marginBottom: ".2rem" }}>{curG.summaryBox.label}</span>
            <p style={{ ...fontBody, color: T.text, fontSize: ".85rem", lineHeight: 1.5 }}>{curG.summaryBox.text}</p>
          </div>
        )}
        {curG.tableOfContents && (
          <div className="p-4 mb-6 rounded-xl" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
            <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: ".85rem", marginBottom: ".5rem" }}>En esta guía</div>
            <div className="space-y-1.5">{curG.tableOfContents.map(i => <a key={i.id} href={`#${i.id}`} style={{ ...fontBody, color: T.lime, fontSize: ".8rem", display: "block", textDecoration: "none" }}>→ {i.label}</a>)}</div>
          </div>
        )}
        <div className="space-y-8">{curG.sections.map(s => (
          <div key={s.id} id={s.id} className="scroll-mt-20">
            <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.2rem", marginBottom: ".5rem" }}>{s.title}</h2>
            {s.content && <p style={{ ...fontBody, color: T.textMuted, fontSize: ".85rem", lineHeight: 1.6, marginBottom: ".75rem" }}>{s.content}</p>}
            {s.example && (
              <div className="p-4 rounded-xl my-3" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                <div style={{ ...fontBody, color: "#f59e0b", fontSize: ".78rem", fontWeight: 700, marginBottom: ".25rem" }}>💡 {s.example.title}</div>
                <p style={{ ...fontBody, color: T.textMuted, fontSize: ".82rem", lineHeight: 1.5 }}>{s.example.text}</p>
              </div>
            )}
            {s.table && (
              <div className="my-3 space-y-2">{s.table.rows.map((r, idx) => (
                <div key={idx} className="p-3 rounded-xl overflow-x-auto" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                  {r.map((c, j) => (
                    <div key={j} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-1.5 text-xs gap-1" style={{ borderBottom: j < r.length - 1 ? `1px solid ${T.border}` : "none" }}>
                      <span style={{ ...fontBody, color: T.lime, fontWeight: 700, minWidth: "110px" }}>{s.table.headers[j]}:</span>
                      <span style={{ ...fontBody, color: T.textMuted, textAlign: "left", wordBreak: "break-word" }}>{c}</span>
                    </div>
                  ))}
                </div>
              ))}</div>
            )}
            {s.steps && <div className="space-y-3 my-3">{s.steps.map((st, idx) => (
              <div key={idx} className="p-3 rounded-xl flex gap-3 items-start" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                <span style={{ ...fontDisplay, color: T.lime, fontSize: ".8rem", fontWeight: 700 }}>{st.num}</span>
                <div><div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: ".82rem", marginBottom: ".15rem" }}>{st.title}</div><div style={{ ...fontBody, color: T.textMuted, fontSize: ".78rem", lineHeight: 1.5 }}>{st.desc}</div></div>
              </div>
            ))}</div>}
            {s.errors && <div className="space-y-3 my-3">{s.errors.map((e, idx) => (
              <div key={idx} className="p-3 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <div style={{ ...fontBody, color: "#f87171", fontWeight: 700, fontSize: ".82rem", marginBottom: ".15rem" }}>⚠️ {e.title}</div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: ".78rem", lineHeight: 1.5 }}>{e.desc}</div>
              </div>
            ))}</div>}
            {s.faqs && <div className="space-y-3 my-3">{s.faqs.map((f, idx) => (
              <div key={idx} className="p-3 rounded-xl" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: ".82rem", marginBottom: ".15rem" }}>{f.q}</div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: ".78rem", lineHeight: 1.5 }}>{f.a}</div>
              </div>
            ))}</div>}
          </div>
        ))}</div>
      </div>
    </div>
  );

  if (inf === "about") return (
    <div className="pt-6 pb-28 w-full px-4 max-w-xl mx-auto">
      <button onClick={() => setInf(null)} className="active:scale-[0.98] transition-transform" style={{ ...fontBody, background: T.surface, border: `1px solid ${T.border}`, color: T.text, padding: ".5rem 1rem", borderRadius: ".8rem", cursor: "pointer", marginBottom: "1.5rem", fontSize: ".85rem" }}>← Volver al inicio</button>
      <div className="p-6 md:p-8 rounded-2xl space-y-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div style={{ ...fontBody, color: T.lime, fontSize: ".75rem", fontWeight: 700, textTransform: "uppercase" }}>Manifiesto MetaBox</div>
        <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.6rem", lineHeight: 1.2 }}>Sobre nosotros y nuestra misión</h1>
        <p style={{ ...fontBody, color: T.textMuted, fontSize: ".88rem", lineHeight: 1.6 }}>MetaBox nace con una convicción clara: la educación y planificación financiera personal no deben ser complejas, estar ocultas tras muros de pago ni comprometer tu privacidad.</p>
        <div className="p-4 rounded-xl" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
          <h3 style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: ".9rem", marginBottom: ".3rem" }}>🔒 Privacidad radical local</h3>
          <p style={{ ...fontBody, color: T.textMuted, fontSize: ".82rem", lineHeight: 1.5 }}>Todos tus cálculos, datos y simulaciones se procesan localmente en tu propio dispositivo mediante tu navegador. Ningún dato financiero personal sale jamás de tu teléfono ni se almacena en servidores externos.</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
          <h3 style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: ".9rem", marginBottom: ".3rem" }}>⚡️ Simplicidad y rigor técnico</h3>
          <p style={{ ...fontBody, color: T.textMuted, fontSize: ".82rem", lineHeight: 1.5 }}>Diseñamos cada herramienta y guía bajo el principio de claridad absoluta. Sin rodeos comerciales ni letra pequeña: matemáticas transparentes para que tomes el control real de tu economía desde el primer segundo.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-6 pb-28 w-full px-4 md:px-0">
      <div className="mb-6">
        <div style={{ ...fontBody, color: T.lime, fontSize: ".75rem", fontWeight: 600, textTransform: "uppercase" }}>MetaBox</div>
        <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.85rem" }}>Tu dinero, con un plan.</h1>
        <p style={{ ...fontBody, color: T.textMuted, fontSize: ".9rem", marginTop: ".3rem" }}>Calcula y planifica tus finanzas gratis.</p>
      </div>

      {recent.length > 0 && !q && !cat && (
        <div className="mb-4">
          <div style={{ ...fontBody, color: T.textMuted, fontSize: ".75rem", marginBottom: ".3rem" }}>Recientes</div>
          <div className="flex gap-2 overflow-x-auto pb-1">{recent.map(id => { const t = ALL_TOOLS.find(x => x.id === id); return t ? <button key={id} onClick={() => setTool(t.id)} className="active:scale-[0.98] transition-transform" style={{ ...fontBody, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: ".5rem", padding: ".3rem .6rem", color: T.text, fontSize: ".75rem", cursor: "pointer", whiteSpace: "nowrap" }}>{t.label}</button> : null; })}</div>
        </div>
      )}

      <div className="relative mb-5">
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: ".85rem", marginBottom: ".3rem" }}><Search size={14} className="inline mr-1 text-lime" /> ¿Qué necesitas calcular?</div>
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder='Ej: "Ahorrar 5.000 €"...' style={{ ...fontBody, width: "100%", background: T.surface, border: `1px solid ${q ? T.lime : T.border}`, borderRadius: ".8rem", padding: ".8rem 1rem .8rem 2.4rem", color: T.text, fontSize: ".85rem", outline: "none" }} />
        {smart && <div onClick={() => setTool(smart.id)} className="cursor-pointer mt-2 p-3 rounded-xl flex items-center justify-between active:scale-[0.98] transition-transform" style={{ background: T.surface, border: `1px solid ${T.lime}` }}><span style={{ ...fontBody, color: T.lime, fontSize: ".8rem", fontWeight: 600 }}>Sugerencia: {smart.label}</span><ArrowRight size={12} style={{ color: T.lime }} /></div>}
      </div>

      {!q && !cat && feat && (
        <div onClick={() => setTool(feat.id)} className="cursor-pointer rounded-xl p-4 mb-5 active:scale-[0.98] transition-transform" style={{ background: T.surface, border: `1px solid ${T.lime}` }}>
          <div style={{ ...fontBody, color: T.lime, fontSize: ".7rem", fontWeight: 700, textTransform: "uppercase" }}>Destacada</div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: "1rem", marginTop: ".1rem" }}>{feat.label}</div>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: ".78rem", marginTop: ".2rem" }}>{feat.desc}</div>
        </div>
      )}

      {!q && (
        <div className="mb-5 grid grid-cols-2 gap-2">{[{ id: "ahorrar", l: "Ahorrar" }, { id: "organizar", l: "Organizar" }, { id: "planificar", l: "Planificar" }, { id: "crecer", l: "Crecer" }].map(c => (
          <div key={c.id} onClick={() => setCat(cat === c.id ? null : c.id)} className="cursor-pointer p-2.5 rounded-xl active:scale-[0.98] transition-transform" style={{ background: cat === c.id ? T.surfaceAlt : T.surface, border: `1px solid ${cat === c.id ? T.lime : T.border}` }}>
            <span style={{ ...fontBody, color: T.lime, fontSize: ".7rem", fontWeight: 700 }}>{c.l}</span>
          </div>
        ))}</div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: ".9rem" }}>Herramientas</span>
          {(cat || q) && <button onClick={() => { setCat(null); setQ(""); }} className="active:scale-[0.98] transition-transform" style={{ background: "none", border: "none", color: T.lime, fontSize: ".75rem", cursor: "pointer" }}><RotateCcw size={11} className="inline mr-1" /> Ver todo</button>}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8 p-4 rounded-xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p style={{ ...fontBody, color: T.textMuted, fontSize: ".85rem", marginBottom: ".75rem" }}>No encontramos herramientas que coincidan con tu búsqueda.</p>
            <button onClick={() => { setQ(""); setCat(null); }} className="active:scale-[0.98] transition-transform" style={{ ...fontBody, background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.lime, padding: ".5rem 1rem", borderRadius: ".8rem", cursor: "pointer", fontSize: ".8rem", fontWeight: 600 }}>Limpiar búsqueda</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">{filtered.map(t => (
            <Card key={t.id} onClick={() => setTool(t.id)} className="active:scale-[0.98] transition-transform" style={{ padding: "1rem", cursor: "pointer" }}>
              <IconTile icon={t.icon} tone={t.tone} />
              <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: ".85rem", marginTop: ".5rem" }}>{t.label}</div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: ".72rem", marginTop: ".2rem" }} className="line-clamp-2">{t.desc}</div>
            </Card>
          ))}</div>
        )}
      </div>

      <div className="mb-6 p-4 rounded-xl text-center" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.1rem", fontWeight: 700 }}>+{total.toLocaleString()} cálculos</div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: ".72rem", marginTop: ".2rem" }}><Lock size={12} className="inline mr-1 text-lime" /> Privacidad garantizada en tu dispositivo</div>
      </div>

      <div className="mb-6">
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: ".9rem", marginBottom: ".5rem" }}><BookOpen size={14} className="inline mr-1 text-lime" /> Guías financieras detalladas</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">{GUIDES.map(gItem => (
          <div key={gItem.id} onClick={() => { setG(gItem.id); top(); }} className="p-3.5 rounded-xl cursor-pointer flex flex-col justify-between active:scale-[0.98] transition-transform" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div>
              <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: ".82rem", marginBottom: ".25rem" }}>{gItem.title}</div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: ".72rem" }} className="line-clamp-2">{gItem.subtitle}</div>
            </div>
            <div style={{ ...fontBody, color: T.lime, fontSize: ".72rem", fontWeight: 600, marginTop: ".75rem" }} className="flex items-center gap-1">Leer guía paso a paso <ArrowRight size={11} /></div>
          </div>
        ))}</div>
      </div>

      <footer style={{ paddingTop: "1.5rem", borderTop: `1px solid ${T.border}` }} className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: ".8rem", marginBottom: ".4rem" }}>Herramientas</div>
          <button onClick={() => { setCat("ahorrar"); window.scrollTo({ top: 300, behavior: 'smooth' }); }} className="text-left bg-transparent border-none cursor-pointer p-0 block active:scale-[0.98] transition-transform" style={{ ...fontBody, color: T.textMuted, fontSize: ".72rem", marginBottom: ".3rem" }}>Ahorro</button>
          <button onClick={() => setTool("budget")} className="text-left bg-transparent border-none cursor-pointer p-0 block active:scale-[0.98] transition-transform" style={{ ...fontBody, color: T.textMuted, fontSize: ".72rem" }}>Presupuesto</button>
        </div>
        <div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: ".8rem", marginBottom: ".4rem" }}>Recursos</div>
          <button onClick={() => { setG("fondo-emergencia"); top(); }} className="text-left bg-transparent border-none cursor-pointer p-0 block active:scale-[0.98] transition-transform" style={{ ...fontBody, color: T.textMuted, fontSize: ".72rem", marginBottom: ".3rem" }}>Guías</button>
          <button onClick={() => { setCat(null); setQ(""); setG(null); setInf(null); top(); }} className="text-left bg-transparent border-none cursor-pointer p-0 block active:scale-[0.98] transition-transform" style={{ ...fontBody, color: T.textMuted, fontSize: ".72rem" }}>Calculadoras</button>
        </div>
        <div>
          <div style={{ ...fontBody, color: T.text, fontWeight: 700, fontSize: ".8rem", marginBottom: ".4rem" }}>Plataforma</div>
          <button onClick={() => { setInf("about"); top(); }} className="text-left bg-transparent border-none cursor-pointer p-0 block active:scale-[0.98] transition-transform" style={{ ...fontBody, color: T.textMuted, fontSize: ".72rem", marginBottom: ".3rem" }}>Sobre nosotros</button>
          <Link href="/privacidad" style={{ ...fontBody, color: T.textMuted, fontSize: ".72rem", display: "block", textDecoration: "none" }}>Privacidad</Link>
        </div>
      </footer>
    </div>
  );
}

export default function HomeScreen() {
  return <Suspense fallback={<div className="pt-8 pb-28 w-full text-center" style={{ color: "#888", fontSize: ".85rem" }}>Cargando...</div>}><HomeContent /></Suspense>;
                                                           }
  
