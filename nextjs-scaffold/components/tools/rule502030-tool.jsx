"use client";
import React, { useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { Helmet } from "react-helmet-async";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, SliderControl, Chip, AdviceBlock } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { useSharedState, usePersistentState } from "@/lib/persistence";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });

const FAQS = [
  {
    q: "¿Qué es la regla 50/30/20?",
    a: "Es una guía de presupuesto que propone destinar el 50% de tus ingresos a necesidades esenciales, el 30% a deseos y el 20% a ahorro, como punto de partida orientativo, no una norma rígida.",
  },
  {
    q: "¿Qué cuenta como 'necesidad' y qué como 'deseo'?",
    a: "Las necesidades son gastos imprescindibles como vivienda, suministros o alimentación básica; los deseos son gastos que mejoran tu calidad de vida pero no son esenciales, como ocio, restaurantes o suscripciones.",
  },
  {
    q: "¿Qué hago si no puedo llegar al 20% de ahorro?",
    a: "No pasa nada si empiezas con un porcentaje menor: lo importante es tener un hábito de ahorro constante y subirlo progresivamente cuando tu situación lo permita.",
  },
  {
    q: "¿Puedo usar otros porcentajes distintos a 50/30/20?",
    a: "Sí: si vives en una ciudad cara, tus necesidades pueden pesar más del 50%; si tienes pocos gastos fijos, puedes destinar más al ahorro. Ajusta los porcentajes de referencia a tu situación real.",
  },
];

function Rule502030Tool({ onBack, onNavigate }) {
  const [income, setIncome] = useSharedState("rule502030_income", 1800);
  const [needsPct, setNeedsPct] = usePersistentState("rule502030_needsPct", 50);
  const [wantsPct, setWantsPct] = usePersistentState("rule502030_wantsPct", 30);
  const savingsPct = Math.max(100 - needsPct - wantsPct, 0);

  const recNeeds = income * (needsPct / 100);
  const recWants = income * (wantsPct / 100);
  const recSavings = income * (savingsPct / 100);

  const [needs, setNeeds] = useSharedState("rule502030_needs", recNeeds);
  const [wants, setWants] = useSharedState("rule502030_wants", recWants);
  const [savings, setSavings] = useSharedState("rule502030_savings", recSavings);
  const [donutView, setDonutView] = usePersistentState("rule502030_donutView", "actual");

  const prevIncome = useRef(income);
  useEffect(() => {
    const ratio = prevIncome.current > 0 ? income / prevIncome.current : 1;
    if (ratio !== 1) {
      setNeeds((n) => n * ratio);
      setWants((w) => w * ratio);
      setSavings((s) => s * ratio);
    }
    prevIncome.current = income;
  }, [income]);

  const total = needs + wants + savings;
  const diff = income - total;
  const animatedDiff = useAnimatedNumber(diff);

  const donutData = useMemo(() => {
    if (donutView === "actual") {
      return [
        { name: "Necesidades", value: Math.max(needs, 0), color: T.lime },
        { name: "Deseos", value: Math.max(wants, 0), color: T.lavender },
        { name: "Ahorro", value: Math.max(savings, 0), color: "#7FA8C9" },
      ];
    }
    return [
      { name: "Necesidades", value: Math.max(recNeeds, 0), color: T.lime },
      { name: "Deseos", value: Math.max(recWants, 0), color: T.lavender },
      { name: "Ahorro", value: Math.max(recSavings, 0), color: "#7FA8C9" },
    ];
  }, [donutView, needs, wants, savings, recNeeds, recWants, recSavings]);

  const Row = ({ label, value, setValue, rec, accent }) => (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span style={{ ...fontBody, color: T.text, fontSize: "0.9rem", fontWeight: 500 }}>{label}</span>
        <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>recomendado: {fmtEUR(rec)}</span>
      </div>
      <SliderControl label="" value={Number(value.toFixed(2))} min={0} max={income} step={1} unit="€" onChange={setValue} accent={accent} />
    </div>
  );

  const pageTitle = "Regla 50/30/20: reparte tu ingreso entre necesidades, deseos y ahorro | MetaBox";
  const pageDescription =
    "Aplica la regla 50/30/20 a tu ingreso mensual, o personaliza los porcentajes a tu situación. Compara tu reparto real con el recomendado en un gráfico interactivo. Gratis.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/rule502030";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="regla 50/30/20, qué es la regla 50 30 20, cómo repartir el sueldo, calculadora regla 50 30 20 personalizada"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/rule502030.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/rule502030.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Regla 50/30/20",
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

      <ToolHeader title="Regla 50/30/20" subtitle="Reparte tu ingreso entre necesidades, deseos y ahorro." onBack={onBack} />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <SliderControl label="Ingreso mensual" value={income} min={0} max={6000} step={1} unit="€" onChange={setIncome} />
      </Card>

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div className="mb-4">
          <div style={{ ...fontDisplay, color: diff >= 0 ? T.lime : T.coral, fontSize: "1.8rem", fontWeight: 700 }}>
            {fmtEUR(Math.abs(animatedDiff))}
          </div>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem" }}>{diff >= 0 ? "sin asignar" : "de más"}</div>
        </div>

        <div style={{ height: "180px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={3}
                stroke="none"
                isAnimationActive={true}
                animationDuration={300}
              >
                {donutData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v, n) => [fmtEUR(v), n]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-2 justify-center mt-3">
          <Chip label="Tu reparto" active={donutView === "actual"} onClick={() => setDonutView("actual")} />
          <Chip label="Recomendado" active={donutView === "recomendado"} onClick={() => setDonutView("recomendado")} />
        </div>
      </Card>

      <AdviceBlock
        text={
          diff < 0
            ? "Te pasas del ingreso disponible. Revisa primero 'Deseos': suele ser la partida más fácil de ajustar sin tocar lo esencial."
            : savings < recSavings * 0.5
            ? "Estás ahorrando bastante menos del recomendado. No hace falta llegar de golpe: sube el slider poco a poco y compáralo con el donut."
            : "Tu reparto está cerca de la referencia. Prueba a mover los sliders y compara tu reparto con el recomendado."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          Personaliza los porcentajes de referencia
        </div>
        <div className="flex flex-col gap-6">
          <SliderControl label="Necesidades" value={needsPct} min={20} max={80} step={1} unit="%" onChange={(v) => setNeedsPct(Math.min(v, 100 - wantsPct))} />
          <SliderControl label="Deseos" value={wantsPct} min={0} max={60} step={1} unit="%" onChange={(v) => setWantsPct(Math.min(v, 100 - needsPct))} accent="lavender" />
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem" }}>
            Ahorro (resto): <span style={{ color: T.lime, fontWeight: 600 }}>{savingsPct}%</span>
          </div>
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <Row label={`Necesidades (${needsPct}%)`} value={needs} setValue={setNeeds} rec={recNeeds} accent="lime" />
          <Row label={`Deseos (${wantsPct}%)`} value={wants} setValue={setWants} rec={recWants} accent="lavender" />
          <Row label={`Ahorro (${savingsPct}%)`} value={savings} setValue={setSavings} rec={recSavings} accent="lime" />
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
        50/30/20 es una guía orientativa, no una recomendación financiera personalizada.
      </div>

      <RelatedTools ids={["budget", "percent"]} onNavigate={onNavigate} primaryId="budget" />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Regla ${needsPct}/${wantsPct}/${savingsPct} con ingreso ${fmtEUR(income)}: necesidades ${fmtEUR(needs)}, deseos ${fmtEUR(wants)}, ahorro ${fmtEUR(savings)}.`
          }
        />
        <ExportCSVButton
          filename="regla-50-30-20"
          getRows={() => [
            { categoria: "Necesidades", recomendado: recNeeds.toFixed(2), actual: needs.toFixed(2) },
            { categoria: "Deseos", recomendado: recWants.toFixed(2), actual: wants.toFixed(2) },
            { categoria: "Ahorro", recomendado: recSavings.toFixed(2), actual: savings.toFixed(2) },
          ]}
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          La regla 50/30/20 es una de las guías de presupuesto más conocidas para organizar el sueldo, pero no encaja igual de bien a todo el mundo. Ajusta los porcentajes de referencia a tu situación real, introduce tu ingreso mensual, y compara tu reparto real con el recomendado en el gráfico.
        </p>
      </div>
    </div>
  );
}

export default Rule502030Tool;
                      
