"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  Target, PiggyBank, Plane, Home as HomeIcon,
  ArrowLeft, TrendingUp, ShieldCheck, Utensils, Car, Tv, Popcorn, ShoppingBag,
  MoreHorizontal, CalendarCheck, Plus, X, ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadialBarChart, RadialBar, ComposedChart, PolarAngleAxis,
} from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, SliderControl, ProgressBar, Chip, IconTile, AdviceBlock } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { useSharedState, usePersistentState } from "@/lib/persistence";
import { CopySummaryButton } from "@/components/ExportActions";
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

function GroupSplitTool({ onBack, onNavigate }) {
  const [people, setPeople] = usePersistentState("groupsplit_peopleList", [
    { id: "1", name: "Yo", paid: 120 },
    { id: "2", name: "Persona 2", paid: 0 },
  ]);
  const [newName, setNewName] = useState("");

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

  // Algoritmo de liquidación mínima: empareja quien más debe con quien más le deben
  const settlements = useMemo(() => {
    const balances = people.map((p) => ({ name: p.name, balance: (p.paid || 0) - share }));
    const debtors = balances.filter((b) => b.balance < -0.01).map((b) => ({ ...b, balance: -b.balance })).sort((a, b) => b.balance - a.balance);
    const creditors = balances.filter((b) => b.balance > 0.01).sort((a, b) => b.balance - a.balance);

    const result = [];
    let di = 0, ci = 0;
    const d = debtors.map((x) => ({ ...x }));
    const c = creditors.map((x) => ({ ...x }));

    while (di < d.length && ci < c.length) {
      const amount = Math.min(d[di].balance, c[ci].balance);
      if (amount > 0.01) {
        result.push({ from: d[di].name, to: c[ci].name, amount });
      }
      d[di].balance -= amount;
      c[ci].balance -= amount;
      if (d[di].balance < 0.01) di++;
      if (c[ci].balance < 0.01) ci++;
    }
    return result;
  }, [people, share]);

  const pageTitle = "Calculadora para dividir gastos entre amigos o grupo | MetaBox";
  const pageDescription =
    "Divide un gasto compartido entre varias personas, introduce lo que pagó cada una, y calcula al instante las transferencias mínimas necesarias para saldar todas las deudas del grupo. Gratis.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/groupsplit";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="dividir gastos entre amigos, calculadora reparto de gastos, cómo repartir una cuenta entre varios, quién debe pagar a quién grupo"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/groupsplit.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/groupsplit.png" />

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
        <div className="flex flex-col gap-4">
          {people.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <input
                value={p.name}
                onChange={(e) => updateName(p.id, e.target.value)}
                style={{
                  ...fontBody, width: "6.5rem", background: T.surfaceAlt, border: `1px solid ${T.border}`,
                  borderRadius: "0.6rem", padding: "0.5rem 0.7rem", color: T.text, fontSize: "0.85rem", outline: "none", flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <SliderControl label="" value={p.paid} min={0} max={2000} step={5} unit="€" onChange={(v) => updatePaid(p.id, v)} />
              </div>
              {people.length > 2 && (
                <button
                  onClick={() => removePerson(p.id)}
                  aria-label={`Eliminar ${p.name}`}
                  style={{ background: "transparent", border: "none", color: T.coral, cursor: "pointer", padding: "0.3rem", flexShrink: 0 }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5" style={{ marginTop: "1rem" }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPerson()}
            placeholder="Nombre de la nueva persona..."
            style={{
              ...fontBody, flex: 1, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.7rem",
              padding: "0.6rem 0.9rem", color: T.text, fontSize: "0.85rem", outline: "none",
            }}
          />
          <button onClick={addPerson} aria-label="Añadir persona" style={{ background: T.lime, border: "none", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Plus size={18} color="#12200A" />
          </button>
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          Quién debe pagar a quién
        </div>
        {settlements.length === 0 ? (
          <div style={{ ...fontBody, color: T.lime, fontSize: "0.9rem", textAlign: "center" }}>
            Todo cuadra — nadie debe nada a nadie.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {settlements.map((s, i) => (
              <div key={i} className="flex items-center justify-between" style={{ background: T.surfaceAlt, borderRadius: "0.7rem", padding: "0.7rem 0.9rem" }}>
                <div className="flex items-center gap-2" style={{ ...fontBody, fontSize: "0.88rem" }}>
                  <span style={{ color: T.coral, fontWeight: 600 }}>{s.from}</span>
                  <ArrowRight size={14} color={T.textMuted} />
                  <span style={{ color: T.lime, fontWeight: 600 }}>{s.to}</span>
                </div>
                <span style={{ ...fontDisplay, color: T.text, fontWeight: 700, fontSize: "0.95rem" }}>{fmtEUR(s.amount)}</span>
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

      <RelatedTools ids={["tip"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Reparto de gastos: ${fmtEUR(total)} entre ${people.length} personas (${fmtEUR(share)} c/u). ` +
            (settlements.length === 0 ? "Nadie debe nada." : settlements.map((s) => `${s.from} debe ${fmtEUR(s.amount)} a ${s.to}`).join("; "))
          }
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
