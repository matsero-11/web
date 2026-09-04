"use client";
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Target, PiggyBank, Plane, Home as HomeIcon,
  ArrowLeft, TrendingUp, ShieldCheck, Utensils, Car, Tv, Popcorn, ShoppingBag,
  MoreHorizontal, CalendarCheck, Plus, X,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadialBarChart, RadialBar, ComposedChart, PolarAngleAxis,
} from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, SliderControl, ProgressBar, Chip, IconTile, AdviceBlock, Button } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { useSharedState, usePersistentState } from "@/lib/persistence";
import { CopySummaryButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Cuánto es habitual dejar de propina en un restaurante?",
    a: "En España no existe una norma fija, pero suele rondar entre el 5% y el 10% de la cuenta por un buen servicio; en otros países como Estados Unidos la propina esperada es mucho más alta.",
  },
  {
    q: "¿Cómo se reparte la cuenta con propina entre varias personas?",
    a: "Por defecto se divide a partes iguales, pero también puedes repartirla según lo que consumió cada persona, para que quien pidió más caro pague proporcionalmente más.",
  },
];

function TipCalculatorTool({ onBack, onNavigate }) {
  const [bill, setBill] = useSharedState("tip_bill", 45);
  const [tipPct, setTipPct] = useSharedState("tip_tipPct", 10);
  const [people, setPeople] = useSharedState("tip_people", 2);
  const [byConsumption, setByConsumption] = useState(false);
  const [consumers, setConsumers] = usePersistentState("tip_consumers", [
    { id: "1", name: "Persona 1", amount: 22.5 },
    { id: "2", name: "Persona 2", amount: 22.5 },
  ]);

  const tipAmount = bill * (tipPct / 100);
  const total = bill + tipAmount;
  const perPerson = people > 0 ? total / people : total;
  const animatedTotal = useAnimatedNumber(total);
  const animatedPerPerson = useAnimatedNumber(perPerson);

  const consumersTotal = consumers.reduce((sum, c) => sum + (c.amount || 0), 0);

  const updateConsumer = (id, amount) => {
    setConsumers((prev) => prev.map((c) => (c.id === id ? { ...c, amount } : c)));
  };
  const updateConsumerName = (id, name) => {
    setConsumers((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  };
  const addConsumer = () => {
    setConsumers((prev) => [...prev, { id: `${Date.now()}`, name: `Persona ${prev.length + 1}`, amount: 0 }]);
  };
  const removeConsumer = (id) => {
    if (consumers.length <= 2) return;
    setConsumers((prev) => prev.filter((c) => c.id !== id));
  };

  const consumerShare = (amount) => {
    if (consumersTotal === 0) return 0;
    const proportion = amount / consumersTotal;
    return bill * proportion + tipAmount * proportion;
  };

  const pageTitle = "Calculadora de propina y reparto de cuenta entre amigos | MetaBox";
  const pageDescription =
    "Calcula la propina de un restaurante y reparte el total entre varias personas a partes iguales o según lo que consumió cada una. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/tip";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="calculadora de propina, cuánto dejar de propina, dividir cuenta con propina entre amigos, reparto propina por consumo"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/tip.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/tip.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Calculadora de propina",
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

      <ToolHeader title="Calculadora de propina" subtitle="Añade la propina y reparte la cuenta sin hacer cuentas a mano." onBack={onBack} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Total con propina</div>
          <div style={{ ...fontDisplay, color: T.lime, fontSize: "2rem", fontWeight: 700, marginTop: "0.3rem" }}>{fmtEUR(animatedTotal)}</div>
        </Card>
        <Card style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>{byConsumption ? "Personas" : "Por persona"}</div>
          <div style={{ ...fontDisplay, color: T.lavender, fontSize: "2rem", fontWeight: 700, marginTop: "0.3rem" }}>
            {byConsumption ? consumers.length : fmtEUR(animatedPerPerson)}
          </div>
        </Card>
      </div>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginBottom: "0.8rem" }}>Composición del total</div>
        <div style={{ display: "flex", height: "22px", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{ width: `${total > 0 ? (bill / total) * 100 : 50}%`, background: T.surfaceAlt, transition: "width 0.4s ease" }} />
          <div style={{ width: `${total > 0 ? (tipAmount / total) * 100 : 50}%`, background: T.lime, transition: "width 0.4s ease" }} />
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>Cuenta: {fmtEUR(bill)}</span>
          <span style={{ ...fontBody, color: T.lime, fontSize: "0.78rem" }}>Propina: {fmtEUR(tipAmount)}</span>
        </div>
      </Card>

      <div className="flex gap-2 justify-center">
        <Chip label="Partes iguales" active={!byConsumption} onClick={() => setByConsumption(false)} />
        <Chip label="Según lo que pidió cada uno" active={byConsumption} onClick={() => setByConsumption(true)} />
      </div>

      {byConsumption && (
        <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
            Lo que pidió cada uno
          </div>
          <div className="flex flex-col gap-4">
            {consumers.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <input
                  value={c.name}
                  onChange={(e) => updateConsumerName(c.id, e.target.value)}
                  style={{
                    ...fontBody, width: "6rem", background: T.surfaceAlt, border: `1px solid ${T.border}`,
                    borderRadius: "0.6rem", padding: "0.5rem 0.7rem", color: T.text, fontSize: "0.82rem", outline: "none", flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <SliderControl label="" value={c.amount} min={0} max={200} step={0.5} unit="€" onChange={(v) => updateConsumer(c.id, v)} />
                </div>
                <div style={{ ...fontBody, color: T.lime, fontSize: "0.8rem", fontWeight: 600, width: "4rem", textAlign: "right", flexShrink: 0 }}>
                  {fmtEUR(consumerShare(c.amount))}
                </div>
                {consumers.length > 2 && (
                  <button onClick={() => removeConsumer(c.id)} aria-label={`Eliminar ${c.name}`} style={{ background: "transparent", border: "none", color: T.coral, cursor: "pointer", flexShrink: 0 }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addConsumer}
            style={{ ...fontBody, display: "flex", alignItems: "center", gap: "0.35rem", background: "transparent", border: `1px dashed ${T.border}`, borderRadius: "0.7rem", padding: "0.55rem", color: T.textMuted, fontSize: "0.82rem", cursor: "pointer", marginTop: "0.8rem", justifyContent: "center" }}
          >
            <Plus size={14} /> Añadir persona
          </button>
          {Math.abs(consumersTotal - bill) > 0.5 && (
            <div style={{ ...fontBody, color: T.coral, fontSize: "0.75rem", marginTop: "0.6rem", textAlign: "center" }}>
              Lo pedido suma {fmtEUR(consumersTotal)}, pero la cuenta es {fmtEUR(bill)} — ajusta para que cuadre.
            </div>
          )}
        </Card>
      )}

      <AdviceBlock
        text={
          byConsumption
            ? "Este reparto es proporcional a lo que cada persona pidió, así que quien consumió más paga más — sin cálculos manuales."
            : people > 1
            ? "El reparto es a partes iguales. Si alguien pidió mucho más caro, cambia a 'Según lo que pidió cada uno' arriba."
            : "Sube o baja el porcentaje según el servicio — no hay un porcentaje único correcto en todos los sitios."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <div className="flex gap-2 justify-center">
            {[5, 10, 15, 20].map((p) => (
              <Chip key={p} label={`${p}%`} active={tipPct === p} onClick={() => setTipPct(p)} />
            ))}
          </div>
          <SliderControl label="Importe de la cuenta" value={bill} min={0} max={500} step={1} unit="€" onChange={setBill} />
          <SliderControl label="Propina" value={tipPct} min={0} max={30} step={1} unit="%" onChange={setTipPct} accent="lavender" />
          {!byConsumption && (
            <SliderControl label="Personas" value={people} min={1} max={15} step={1} unit="personas" onChange={setPeople} />
          )}
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["groupsplit"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            byConsumption
              ? `Cuenta ${fmtEUR(bill)} + propina ${tipPct}% = ${fmtEUR(total)}. Reparto por consumo: ` + consumers.map((c) => `${c.name} ${fmtEUR(consumerShare(c.amount))}`).join(", ")
              : `Cuenta ${fmtEUR(bill)} + propina ${tipPct}% = ${fmtEUR(total)} total, ${fmtEUR(perPerson)}/persona entre ${people}.`
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Calcular la propina y repartir la cuenta a mano al final de una cena en grupo suele acabar en discusiones. Esta calculadora reparte a partes iguales o, si lo prefieres, de forma proporcional a lo que pidió cada persona, para que nadie pague de más ni de menos.
        </p>
      </div>
    </div>
  );
}

export default TipCalculatorTool;
