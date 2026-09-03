"use client";
import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, Tooltip
} from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { fmtEUR, useAnimatedNumber } from "@/lib/hooks";
import { Card, SliderControl, AdviceBlock, ProgressBar } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { useSharedState, usePersistentState } from "@/lib/persistence";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const FAQS = [
  {
    q: "¿Cómo reparto mi ahorro anual entre los 12 meses?",
    a: "Puedes dividir tu objetivo anual a partes iguales entre los 12 meses, o marcar los meses más caros (como diciembre o vacaciones) como 'flojos' para que el resto de meses absorba automáticamente esa diferencia.",
  },
  {
    q: "¿Qué hago si no llego a ahorrar en un mes concreto?",
    a: "Márcalo como mes flojo en la herramienta: el planificador recalcula al instante cuánto tendrás que ahorrar en los meses restantes para seguir llegando a tu objetivo anual.",
  },
  {
    q: "¿Cómo sé si voy adelantado o atrasado respecto a mi plan?",
    a: "Introduce cuánto llevas ahorrado hasta ahora: la herramienta compara esa cifra con lo que tu plan dice que deberías tener acumulado en el mes actual, y te avisa si vas por detrás.",
  },
];

function AnnualPlannerTool({ onBack, onNavigate }) {
  const [goal, setGoal] = useSharedState("annual_goal", 3600);
  const [lowMonthsArray, setLowMonthsArray] = usePersistentState("annual_lowMonths", []);
  const [reductionPct, setReductionPct] = useSharedState("annual_reductionPct", 50);
  const [currentSaved, setCurrentSaved] = useSharedState("annual_currentSaved", 0);

  const lowMonths = useMemo(() => new Set(lowMonthsArray), [lowMonthsArray]);
  const realMonth = new Date().getMonth(); // 0-11, índice directo en MONTHS

  const evenShare = goal / 12;
  const lowShare = evenShare * (1 - reductionPct / 100);
  const lowCount = lowMonths.size;
  const normalCount = 12 - lowCount;
  const totalLow = lowShare * lowCount;
  const normalShare = normalCount > 0 ? (goal - totalLow) / normalCount : 0;

  const toggleMonth = (i) => {
    const next = new Set(lowMonths);
    if (next.has(i)) next.delete(i);
    else if (next.size < 11) next.add(i);
    setLowMonthsArray([...next]);
  };

  const total = lowCount * lowShare + normalCount * normalShare;

  const chartData = MONTHS.map((m, i) => ({
    mes: m,
    importe: Math.round(lowMonths.has(i) ? lowShare : normalShare),
  }));

  // Cuánto deberías llevar acumulado según el plan hasta el mes actual (incluido)
  const expectedByNow = useMemo(() => {
    let sum = 0;
    for (let i = 0; i <= realMonth; i++) {
      sum += lowMonths.has(i) ? lowShare : normalShare;
    }
    return sum;
  }, [realMonth, lowMonths, lowShare, normalShare]);

  const diffVsPlan = currentSaved - expectedByNow;
  const animatedDiff = useAnimatedNumber(Math.abs(diffVsPlan));
  const onTrack = diffVsPlan >= -0.5;
  const yearPct = goal > 0 ? Math.min((currentSaved / goal) * 100, 100) : 0;

  const pageTitle = "Planificador de ahorro anual: reparte tu objetivo en 12 meses | MetaBox";
  const pageDescription =
    "Reparte tu objetivo de ahorro anual entre los 12 meses del año, marca los meses más difíciles (vacaciones, Navidad) y haz seguimiento real de si vas adelantado o atrasado respecto a tu plan. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/annual";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="planificador de ahorro anual, cómo repartir el ahorro anual, plan de ahorro 12 meses, calculadora de ahorro anual, seguimiento de ahorro anual"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/annual.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/annual.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Planificador de ahorro anual",
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

      <ToolHeader title="Planificador de ahorro anual" subtitle="Marca los meses más difíciles: el resto se ajusta solo para llegar al objetivo." onBack={onBack} />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Objetivo anual" value={goal} min={200} max={20000} step={100} unit="€" onChange={setGoal} />
          <SliderControl label="Reducción en meses flojos" value={reductionPct} min={10} max={90} step={5} unit="%" onChange={setReductionPct} accent="lavender" />
        </div>
      </Card>

      <Card glow result style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "0.4rem" }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Total del plan</div>
          <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.2rem", fontWeight: 700, margin: "0.2rem 0" }}>
            {fmtEUR(total)}
          </div>
        </div>

        <div style={{ width: "100%", height: "170px", marginTop: "0.8rem" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="mes" stroke={T.textMuted} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                formatter={(value) => [`${value} €`, "Ahorro"]}
                contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "8px", fontSize: "12px", color: T.text }}
              />
              <Bar dataKey="importe" fill={T.lime} radius={[4, 4, 0, 0]} animationDuration={300} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <AdviceBlock
        text={
          lowCount === 0
            ? "Prueba a marcar diciembre u otro mes caro como 'flojo': el resto de meses absorbe la diferencia automáticamente."
            : `Con ${lowCount} ${lowCount === 1 ? "mes flojo" : "meses flojos"}, el resto sube a ${fmtEUR(normalShare)} para seguir llegando al objetivo.`
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          Toca un mes para marcarlo como "flojo"
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {MONTHS.map((m, i) => {
            const low = lowMonths.has(i);
            const amount = low ? lowShare : normalShare;
            const isPast = i < realMonth;
            const isCurrent = i === realMonth;
            return (
              <button
                key={m}
                onClick={() => toggleMonth(i)}
                style={{
                  borderRadius: "0.8rem",
                  padding: "0.75rem 0.4rem",
                  border: `1px solid ${low ? T.lavender : isCurrent ? T.lime : T.border}`,
                  background: low ? T.lavenderSoft : T.surfaceAlt,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s ease",
                  opacity: isPast ? 0.6 : 1,
                  position: "relative",
                }}
              >
                <div style={{ ...fontBody, color: low ? T.lavender : T.text, fontSize: "0.78rem", fontWeight: 600 }}>{m}</div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.7rem", marginTop: "0.25rem" }}>{fmtEUR(amount)}</div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          ¿Vas según el plan?
        </div>
        <SliderControl label="Ya ahorrado este año" value={currentSaved} min={0} max={goal} step={25} unit="€" onChange={setCurrentSaved} accent="lavender" />
        <div style={{ marginTop: "1.1rem" }}>
          <ProgressBar pct={yearPct} gradientEnd={T.lavender} />
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", marginTop: "0.6rem" }}>
            Según el plan, en {MONTHS[realMonth]} deberías llevar {fmtEUR(expectedByNow)}
          </div>
          <div style={{ ...fontBody, color: onTrack ? T.lime : T.coral, fontSize: "0.92rem", fontWeight: 600, marginTop: "0.4rem" }}>
            {onTrack
              ? `Vas ${fmtEUR(animatedDiff)} por delante del plan`
              : `Vas ${fmtEUR(animatedDiff)} por detrás del plan`}
          </div>
        </div>
      </Card>
      
      <AdSlot minHeight="0px" />

      <RelatedTools ids={["savings", "challenge"]} onNavigate={onNavigate} />
      
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Plan de ahorro anual: objetivo ${fmtEUR(goal)}, con ${lowMonths.size} meses flojos marcados. Llevo ahorrado ${fmtEUR(currentSaved)} (el plan dice ${fmtEUR(expectedByNow)} a estas alturas).`
          }
        />
        <ExportCSVButton
          filename="planificador-ahorro-anual"
          getRows={() =>
            MONTHS.map((m, i) => ({
              mes: m,
              importe: (lowMonths.has(i) ? lowShare : normalShare).toFixed(2),
              tipo: lowMonths.has(i) ? "flojo" : "normal",
            }))
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Ahorrar la misma cantidad todos los meses no siempre es realista: hay meses con gastos extra (vacaciones, Navidad, vuelta al cole) que rompen cualquier plan fijo. Este planificador de ahorro anual te deja marcar esos meses como "flojos", ajustar cuánto se reduce cada uno, y hace seguimiento real comparando lo que llevas ahorrado con lo que tu plan dice que deberías tener a estas alturas del año.
        </p>
      </div>
    </div>
  );
}

export default AnnualPlannerTool;
