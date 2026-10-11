"use client";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { Card, IconTile } from "@/components/ui";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { usePersistentState } from "@/lib/persistence";
import { GUIDES } from "@/lib/guides-data";
import { Search, RotateCcw, ArrowRight, BookOpen, Lock } from "lucide-react";

function HomeContent() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(null);
  const [g, setG] = useState(null);
  const [inf, setInf] = useState(null);
  const [total] = usePersistentState("metabox_total_calc", 125420);

  const top = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const curG = GUIDES.find(x => x.id === g);
  const feat = ALL_TOOLS.find(x => x.id === "savings") || ALL_TOOLS[0];
  const smart = q.length > 2 ? ALL_TOOLS.find(x => x.id === (q.toLowerCase().includes("inver") ? "interest" : "savings")) : null;

  const filtered = ALL_TOOLS.filter(x => {
    const matchQ = !q || x.label.toLowerCase().includes(q.toLowerCase()) || x.desc.toLowerCase().includes(q.toLowerCase());
    if (!cat) return matchQ;
    const tc = (x.category || "").toLowerCase(), tt = `${x.label} ${x.desc} ${x.id}`.toLowerCase();
    const matchCat = 
      cat === "ahorrar" ? tc.includes("ahorr") || tt.includes("ahorr") || tt.includes("meta") :
      cat === "organizar" ? tc.includes("organiz") || tt.includes("presupuesto") || tt.includes("gasto") :
      cat === "planificar" ? tc.includes("plan") || tt.includes("hipoteca") || tt.includes("préstamo") :
      cat === "crecer" ? tc.includes("crec") || tt.includes("inversión") || tt.includes("interés") : true;
    return matchQ && matchCat;
  });

  if (curG) return (
    <article className="pt-6 pb-28 w-full px-4 max-w-2xl mx-auto">
      <button onClick={() => setG(null)} aria-label="Volver" style={{ ...fontBody, background: T.surface, border: `1px solid ${T.border}`, color: T.text, padding: ".5rem 1rem", borderRadius: ".8rem", cursor: "pointer", marginBottom: "1.5rem", fontSize: ".85rem" }}>← Volver</button>
      <div className="p-6 md:p-8 rounded-2xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div style={{ ...fontBody, color: T.lime, fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", marginBottom: ".5rem" }}>{curG.badge}</div>
        <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.6rem", lineHeight: 1.2, marginBottom: ".5rem" }}>{curG.title}</h2>
        <p style={{ ...fontBody, color: T.textMuted, fontSize: ".9rem", marginBottom: "1.2rem" }}>{curG.subtitle}</p>
        <div className="space-y-6 mt-6">
          {curG.sections.map(s => (
            <div key={s.id} id={s.id} className="scroll-mt-20">
              <h3 style={{ ...fontDisplay, color: T.text, fontSize: "1.15rem", marginBottom: ".4rem" }}>{s.title}</h3>
              {s.content && <p style={{ ...fontBody, color: T.textMuted, fontSize: ".85rem", lineHeight: 1.6 }}>{s.content}</p>}
            </div>
          ))}
        </div>
      </div>
    </article>
  );

  if (inf === "about") return (
    <article className="pt-6 pb-28 w-full px-4 max-w-xl mx-auto">
      <button onClick={() => setInf(null)} aria-label="Volver" style={{ ...fontBody, background: T.surface, border: `1px solid ${T.border}`, color: T.text, padding: ".5rem 1rem", borderRadius: ".8rem", cursor: "pointer", marginBottom: "1.5rem", fontSize: ".85rem" }}>← Volver al inicio</button>
      <div className="p-6 md:p-8 rounded-2xl space-y-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div style={{ color: T.lime, fontSize: ".75rem", fontWeight: 700, textTransform: "uppercase" }}>Manifiesto MetaBox</div>
        <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.6rem", lineHeight: 1.2 }}>Sobre nosotros y nuestra misión</h2>
        <p style={{ ...fontBody, color: T.textMuted, fontSize: ".88rem", lineHeight: 1.6 }}>Privacidad radical local y simplicidad absoluta sin muros de pago.</p>
      </div>
    </article>
  );

  return (
    <div className="pt-6 pb-28 w-full px-4 md:px-0">
      <div className="mb-6">
        <div style={{ color: T.lime, fontSize: ".75rem", fontWeight: 600, textTransform: "uppercase" }}>MetaBox</div>
        <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.85rem" }}>Tu dinero, con un plan.</h2>
        <p style={{ ...fontBody, color: T.textMuted, fontSize: ".9rem", marginTop: ".3rem" }}>Calcula y planifica tus finanzas gratis.</p>
      </div>

      <div className="relative mb-5">
        <label htmlFor="search-tools" style={{ color: T.text, fontWeight: 600, fontSize: ".85rem", marginBottom: ".3rem", display: "block" }}>
          <Search size={14} className="inline mr-1 text-lime" /> ¿Qué necesitas calcular?
        </label>
        <input id="search-tools" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder='Ej: "Ahorrar 5.000 €"...' style={{ width: "100%", background: T.surface, border: `1px solid ${q ? T.lime : T.border}`, borderRadius: ".8rem", padding: ".8rem 1rem .8rem 2.4rem", color: T.text, fontSize: ".85rem", outline: "none" }} />
        {smart && (
          <Link href={`/herramientas/${smart.slug}`} className="block mt-2 p-3 rounded-xl flex items-center justify-between no-underline" style={{ background: T.surface, border: `1px solid ${T.lime}` }}>
            <span style={{ color: T.lime, fontSize: ".8rem", fontWeight: 600 }}>Sugerencia: {smart.label}</span>
            <ArrowRight size={12} style={{ color: T.lime }} />
          </Link>
        )}
      </div>

      {!q && !cat && feat && (
        <Link href={`/herramientas/${feat.slug}`} className="block rounded-xl p-4 mb-5 no-underline" style={{ background: T.surface, border: `1px solid ${T.lime}` }}>
          <div style={{ color: T.lime, fontSize: ".7rem", fontWeight: 700, textTransform: "uppercase" }}>Destacada</div>
          <div style={{ color: T.text, fontWeight: 700, fontSize: "1rem" }}>{feat.label}</div>
          <div style={{ color: T.textMuted, fontSize: ".78rem" }}>{feat.desc}</div>
        </Link>
      )}

      {!q && (
        <div className="mb-5 grid grid-cols-2 gap-2">
          {[{id:"ahorrar",l:"Ahorrar"},{id:"organizar",l:"Organizar"},{id:"planificar",l:"Planificar"},{id:"crecer",l:"Crecer"}].map(c => (
            <div key={c.id} onClick={() => setCat(cat === c.id ? null : c.id)} className="cursor-pointer p-2.5 rounded-xl" style={{ background: cat === c.id ? T.surfaceAlt : T.surface, border: `1px solid ${cat === c.id ? T.lime : T.border}` }}>
              <span style={{ color: T.lime, fontSize: ".7rem", fontWeight: 700 }}>{c.l}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span style={{ color: T.text, fontWeight: 600, fontSize: ".9rem" }}>Herramientas</span>
          {(cat || q) && (
            <button onClick={() => { setCat(null); setQ(""); }} style={{ background: "none", border: "none", color: T.lime, fontSize: ".75rem", cursor: "pointer" }}>
              <RotateCcw size={11} className="inline mr-1" /> Ver todo
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8 p-4 rounded-xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p style={{ color: T.textMuted, fontSize: ".85rem", marginBottom: ".75rem" }}>No encontramos resultados.</p>
            <button onClick={() => { setQ(""); setCat(null); }} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.lime, padding: ".5rem 1rem", borderRadius: ".8rem", cursor: "pointer", fontSize: ".8rem", fontWeight: 600 }}>Limpiar búsqueda</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filtered.map(t => (
              <Link key={t.id} href={`/herramientas/${t.slug}`} className="no-underline block">
                <Card style={{ padding: "1rem", cursor: "pointer", height: "100%" }}>
                  <IconTile icon={t.icon} tone={t.tone} />
                  <div style={{ color: T.text, fontWeight: 600, fontSize: ".85rem", marginTop: ".5rem" }}>{t.label}</div>
                  <div style={{ color: T.textMuted, fontSize: ".72rem", marginTop: ".2rem" }} className="line-clamp-2">{t.desc}</div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 p-4 rounded-xl text-center" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.1rem", fontWeight: 700 }}>+{total.toLocaleString()} cálculos</div>
        <div style={{ color: T.textMuted, fontSize: ".72rem", marginTop: ".2rem" }}><Lock size={12} className="inline mr-1 text-lime" /> Privacidad garantizada</div>
      </div>

      <div className="mb-6">
        <div style={{ color: T.text, fontWeight: 600, fontSize: ".9rem", marginBottom: ".5rem" }}><BookOpen size={14} className="inline mr-1 text-lime" /> Guías financieras</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {GUIDES.map(gItem => (
            <div key={gItem.id} onClick={() => { setG(gItem.id); top(); }} className="p-3.5 rounded-xl cursor-pointer flex flex-col justify-between" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div>
                <div style={{ color: T.text, fontWeight: 600, fontSize: ".82rem" }}>{gItem.title}</div>
                <div style={{ color: T.textMuted, fontSize: ".72rem" }} className="line-clamp-2">{gItem.subtitle}</div>
              </div>
              <div style={{ color: T.lime, fontSize: ".72rem", fontWeight: 600, marginTop: ".75rem" }} className="flex items-center gap-1">Leer guía <ArrowRight size={11} /></div>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ paddingTop: "1.5rem", borderTop: `1px solid ${T.border}` }} className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div><div style={{ color: T.text, fontWeight: 700, fontSize: ".8rem", marginBottom: ".4rem" }}>Herramientas</div><button onClick={() => { setCat("ahorrar"); window.scrollTo({ top: 300, behavior: 'smooth' }); }} style={{ background: "none", border: "none", color: T.textMuted, fontSize: ".72rem", cursor: "pointer", textAlign: "left", padding: 0 }}>Ahorro</button></div>
        <div><div style={{ color: T.text, fontWeight: 700, fontSize: ".8rem", marginBottom: ".4rem" }}>Recursos</div><button onClick={() => { setG("fondo-emergencia"); top(); }} style={{ background: "none", border: "none", color: T.textMuted, fontSize: ".72rem", cursor: "pointer", textAlign: "left", padding: 0 }}>Guías</button></div>
        <div><div style={{ color: T.text, fontWeight: 700, fontSize: ".8rem", marginBottom: ".4rem" }}>Plataforma</div><button onClick={() => { setInf("about"); top(); }} style={{ background: "none", border: "none", color: T.textMuted, fontSize: ".72rem", cursor: "pointer", textAlign: "left", padding: 0 }}>Sobre nosotros</button></div>
      </footer>
    </div>
  );
}

export default function HomeScreen() {
  return <Suspense fallback={<div className="pt-8 pb-28 w-full text-center" style={{ color: "#888", fontSize: ".85rem" }}>Cargando...</div>}><HomeContent /></Suspense>;
        }
      
