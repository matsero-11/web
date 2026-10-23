"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, X, ArrowRight } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { fmtEUR } from "@/lib/hooks";
import { Card, AdviceBlock } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Cómo se calcula quién debe pagar a quién?",
    a: "Cada persona tiene un balance (lo que pagó menos lo que le tocaba pagar). La herramienta calcula las transferencias mínimas necesarias para saldar todas las deudas del grupo, en vez de que cada uno le deba algo a todos los demás.",
  },
  {
    q: "¿Qué pasa si nadie pagó una parte igual?",
    a: "No pasa nada: puedes introducir exactamente lo que pagó cada persona, y el reparto a partes iguales se calcula igualmente sobre el total del grupo, mostrando quién debe compensar a quién.",
  },
];

// COMPONENTE DE INPUT DE DINERO (SIN SLIDER, MÁS RÁPIDO Y PRECISO)
function MoneyInput({ value, onChange }) {
  const [textVal, setTextVal] = useState(String(value ?? 0));

  useEffect(() => {
    if (value !== parseFloat(textVal.replace(",", "."))) {
      setTextVal(String(value ?? 0));
    }
  }, [value]);

  const handleInputChange = (e) => {
    const raw = e.target.value;
    setTextVal(raw);
    const parsed = parseFloat(raw.replace(",", "."));
    if (!isNaN(parsed)) onChange(parsed);
  };

  const handleBlur = () => {
    const parsed = parseFloat(textVal.replace(",", "."));
    if (isNaN(parsed)) {
      onChange(0);
      setTextVal("0");
    } else {
      onChange(parsed);
      setTextVal(String(parsed));
    }
  };

  return (
    <div className="flex items-center justify-end bg-[var(--surface-alt,rgba(255,255,255,0.03))] px-3 py-2 rounded-xl border border-[var(--border,rgba(255,255,255,0.08))]" style={{ width: "120px" }}>
      <input
        type="text"
        inputMode="decimal"
        value={textVal}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="bg-transparent text-right font-semibold"
        style={{ ...fontBody, color: T.lime, fontSize: "1rem", width: "100%", outline: "none" }}
      />
      <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginLeft: "4px" }}>€</span>
    </div>
  );
}
function GroupSplitTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [people, setPeople] = useState(() => {
    const p = initialParams?.people;
    if (p) {
      try {
        const parsed = JSON.parse(p);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { id: "1", name: "Yo", paid: 120 },
      { id: "2", name: "Persona 2", paid: 0 },
    ];
  });
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        people: people.length > 0 ? JSON.stringify(people) : null,
      });
    }
  }, [people, onStateChange]);

  const total = people.reduce((sum, p) => sum + (p.paid || 0), 0);
  const share = people.length > 0 ? total / people.length : 0;

  const updatePaid = (id, paid) => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, paid } : p)));
  };

  const updateName = (id, name) => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const addPerson = () => {
    const name = newName.trim() || `Persona ${people.length + 1}`;
    setPeople((prev) => [...prev, { id: `${Date.now()}`, name, paid: 0 }]);
    setNewName("");
  };

  const removePerson = (id) => {
    if (people.length <= 2) return;
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  // MATEMÁTICAS BLINDADAS (USANDO CÉNTIMOS PARA EVITAR DECIMALES INFINITOS)
  const settlements = useMemo(() => {
    const totalCents = people.reduce((sum, p) => sum + Math.round((p.paid || 0) * 100), 0);
    const shareCents = Math.round(totalCents / people.length);

    const balances = people.map((p) => ({
      name: p.name,
      balanceCents: Math.round((p.paid || 0) * 100) - shareCents,
    }));

    const debtors = balances
      .filter((b) => b.balanceCents < -1)
      .map((b) => ({ ...b, balanceCents: -b.balanceCents }))
      .sort((a, b) => b.balanceCents - a.balanceCents);

    const creditors = balances
      .filter((b) => b.balanceCents > 1)
      .sort((a, b) => b.balanceCents - a.balanceCents);

    const result = [];
    let di = 0, ci = 0;
    const d = debtors.map((x) => ({ ...x }));
    const c = creditors.map((x) => ({ ...x }));

    while (di < d.length && ci < c.length) {
      const amountCents = Math.min(d[di].balanceCents, c[ci].balanceCents);
      if (amountCents > 1) {
        result.push({
          from: d[di].name,
          to: c[ci].name,
          amount: amountCents / 100,
        });
      }
      d[di].balanceCents -= amountCents;
      c[ci].balanceCents -= amountCents;
      if (d[di].balanceCents < 1) di++;
      if (c[ci].balanceCents < 1) ci++;
    }
    return result;
  }, [people]);

  const pageTitle = "Calculadora para dividir gastos entre amigos o grupo | MetaBox";
  const pageDescription = "Divide un gasto compartido entre varias personas, introduce lo que pagó cada una, y calcula al instante las transferencias mínimas necesarias para saldar todas las deudas del grupo. Gratis.";
  
  // CORRECCIÓN CRÍTICA DE SEO
  const pageUrl = "https://metabox-web.vercel.app/herramientas/reparto-gastos-en-grupo";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="dividir gastos entre amigos, calculadora reparto de gastos, cómo repartir una cuenta entre varios, quién debe pagar a quién grupo" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Reparto de gastos en grupo",
            url: pageUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            inLanguage: "es",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            description: pageDescription,
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
      </Helmet>

      <ToolHeader title="Reparto de gastos en grupo" subtitle="Introduce lo que pagó cada persona y ve quién debe a quién." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Gasto total del grupo</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.2rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {fmtEUR(total)}
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>
          {fmtEUR(share)} por persona entre {people.length}
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          ¿Quién pagó qué?
        </div>
        <div className="flex flex-col gap-3">
          {people.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <input
                value={p.name}
                onChange={(e) => updateName(p.id, e.target.value)}
                placeholder="Nombre"
                style={{
                  ...fontBody, flex: 1, minWidth: 0, background: T.surfaceAlt, border: `1px solid ${T.border}`,
                  borderRadius: "0.7rem", padding: "0.6rem 0.8rem", color: T.text, fontSize: "0.9rem", outline: "none", fontWeight: 500
                }}
              />
              <MoneyInput value={p.paid} onChange={(v) => updatePaid(p.id, v)} />
              {people.length > 2 && (
                <button
                  onClick={() => removePerson(p.id)}
                  aria-label={`Eliminar ${p.name}`}
                  style={{ background: "transparent", border: "none", color: T.coral, cursor: "pointer", padding: "0.3rem", flexShrink: 0 }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2" style={{ marginTop: "1rem" }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPerson()}
            placeholder="Nombre de la nueva persona..."
            style={{
              ...fontBody, flex: 1, minWidth: 0, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.7rem",
              padding: "0.65rem 0.9rem", color: T.text, fontSize: "0.9rem", outline: "none",
            }}
          />
          <button onClick={addPerson} aria-label="Añadir persona" style={{ background: T.lime, border: "none", borderRadius: "0.7rem", padding: "0.65rem 1rem", display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", flexShrink: 0, ...fontBody, fontWeight: 600, color: "#0a1214" }}>
            <Plus size={18} /> Añadir
          </button>
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          Quién debe pagar a quién
        </div>
        {settlements.length === 0 ? (
          <div style={{ ...fontBody, color: T.lime, fontSize: "0.9rem", textAlign: "center", padding: "1rem 0" }}>
            Todo cuadra — nadie debe nada a nadie.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {settlements.map((s, i) => (
              <div key={i} className="flex items-center justify-between" style={{ background: T.surfaceAlt, borderRadius: "0.8rem", padding: "0.8rem 1rem", border: `1px solid ${T.border}` }}>
                <div className="flex items-center gap-2" style={{ ...fontBody, fontSize: "0.9rem" }}>
                  <span style={{ color: T.coral, fontWeight: 600 }}>{s.from}</span>
                  <ArrowRight size={14} color={T.textMuted} />
                  <span style={{ color: T.lime, fontWeight: 600 }}>{s.to}</span>
                </div>
                <span style={{ ...fontDisplay, color: T.text, fontWeight: 700, fontSize: "1.1rem" }}>{fmtEUR(s.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AdviceBlock
        text={
          settlements.length > 2
            ? "Con varias transferencias, es más fácil que una sola persona (la que más debe) pague directamente a las demás, aunque el reparto matemático diga otra cosa."
            : "Estas son las transferencias mínimas necesarias para que todo el mundo quede en paz — nadie tiene que pagar de más ni de menos."
        }
      />

      <AdSlot minHeight="0px" />
      <RelatedTools ids={["tip", "budget"]} onNavigate={onNavigate} primaryId="tip" />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Reparto de gastos: ${fmtEUR(total)} entre ${people.length} personas (${fmtEUR(share)} c/u). ` +
            (settlements.length === 0 ? "Nadie debe nada." : settlements.map((s) => `${s.from} debe ${fmtEUR(s.amount)} a ${s.to}`).join("; "))
          }
        />
        <ExportCSVButton
          filename="reparto-gastos-grupo"
          getRows={() => [
            ...people.map(p => ({ tipo: "Participante", nombre: p.name, pagado: p.paid.toFixed(2), parte_proporcional: share.toFixed(2) })),
            ...settlements.map(s => ({ tipo: "Transferencia", nombre: `${s.from} -> ${s.to}`, pagado: s.amount.toFixed(2), parte_proporcional: "" }))
          ]}
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Repartir gastos en grupo —una cena, un viaje, un alquiler compartido— se complica cuando varias personas pagan partes distintas. Esta calculadora no solo divide el total a partes iguales: calcula las transferencias mínimas exactas para que todo el grupo quede saldado, sin que nadie tenga que hacer varias transferencias pequeñas innecesarias.
        </p>
      </div>
    </div>
  );
}

export default GroupSplitTool;
