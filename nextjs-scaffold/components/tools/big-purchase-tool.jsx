"use client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Target, PiggyBank, Plane, Home as HomeIcon,
  ArrowLeft, TrendingUp, ShieldCheck, Utensils, Car, Tv, Popcorn, ShoppingBag,
  MoreHorizontal, CalendarCheck,
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

const PURCHASE_TYPES = [
  { id: "coche", label: "Coche", icon: Car, defaultBudget: 12000 },
  { id: "vivienda", label: "Vivienda (entrada)", icon: HomeIcon, defaultBudget: 30000 },
  { id: "otro", label: "Otra compra", icon: ShoppingBag, defaultBudget: 3000 },
];

const FAQS = [
  {
    q: "¿Cuánto necesito ahorrar de entrada para un coche o una vivienda?",
    a: "Para un coche depende del modelo y si lo financias; para una vivienda, lo habitual es que los bancos exijan al menos un 20% de entrada más gastos de compraventa. Ajusta el presupuesto en la herramienta según tu caso concreto.",
  },
  {
    q: "¿Es mejor ahorrar más al mes o alargar el plazo?",
    a: "Alargar el plazo reduce el esfuerzo mensual pero retrasa la compra; ahorrar más al mes acelera la fecha pero exige más disciplina. Prueba distintos plazos en el slider para ver qué cuota mensual te resulta cómoda.",
  },
];

function BigPurchaseTool({ onBack, onNavigate }) {
  const [type, setType] = usePersistentState("bigpurchase_type", "coche");
  const typeInfo = PURCHASE_TYPES.find((t) => t.id === type) || PURCHASE_TYPES[0];
  const [budget, setBudget] = useSharedState("bigpurchase_budget", typeInfo.defaultBudget);
  const [current, setCurrent] = useSharedState("bigpurchase_current", 1000);
  const [monthsLeft, setMonthsLeft] = useSharedState("bigpurchase_monthsLeft", 18);

  const changeType = (id) => {
    setType(id);
    const info = PURCHASE_TYPES.find((t) => t.id === id);
    if (info) {
      setBudget(info.defaultBudget);
      setCurrent((c) => Math.min(c, info.defaultBudget));
    }
  };

  useEffect(() => {
    if (current > budget) setCurrent(budget);
  }, [budget, current]);

  const remaining = Math.max(budget - current, 0);
  const requiredMonthly = monthsLeft > 0 ? remaining / monthsLeft : remaining;
  const animatedRequired = useAnimatedNumber(requiredMonthly);
  const pct = budget > 0 ? (current / budget) * 100 : 0;
  const animatedPct = useAnimatedNumber(Math.min(pct, 100));

  const pageTitle = "Cuánto ahorrar al mes para un coche, vivienda o compra grande | MetaBox";
  const pageDescription =
    "Calcula cuánto tienes que ahorrar cada mes para comprarte un coche, dar la entrada de una vivienda o cualquier compra grande, según tu presupuesto, lo ya ahorrado y el plazo que te marques. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/bigpurchase";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="cuánto ahorrar para un coche, ahorro entrada vivienda, calculadora compra grande, cuánto ahorrar al mes para comprar coche"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/bigpurchase.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/bigpurchase.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Ahorro para una compra grande",
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

      <ToolHeader title="Ahorro para una compra grande" subtitle="Elige qué quieres comprar y cuándo, y calculamos el resto." onBack={onBack} />

      <div className="flex flex-wrap gap-2.5 justify-center">
        {PURCHASE_TYPES.map((t) => (
          <Chip key={t.id} label={t.label} active={type === t.id} onClick={() => changeType(t.id)} />
        ))}
      </div>

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ height: "170px", position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Ahorrado", value: current },
                  { name: "Restante", value: remaining },
                ]}
                dataKey="value"
                innerRadius="65%"
                outerRadius="95%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                stroke="none"
                isAnimationActive={true}
                animationDuration={400}
              >
                <Cell fill={T.lime} />
                <Cell fill={T.surfaceAlt} />
              </Pie>
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v) => fmtEUR(v)}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.9rem", fontWeight: 700 }}>{animatedPct.toFixed(0)}%</div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem" }}>cubierto</div>
          </div>
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginTop: "0.6rem" }}>Necesitas ahorrar al mes</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.2rem", fontWeight: 700, margin: "0.2rem 0" }}>
          {monthsLeft > 0 ? fmtEUR(animatedRequired) : "—"}
        </div>
      </Card>

      <AdviceBlock
        text={
          requiredMonthly > 800
            ? "La cuota mensual es alta. Alargar el plazo aunque sea un año puede bajarla de forma importante — pruébalo con el slider."
            : pct >= 50
            ? "Ya llevas más de la mitad. Mantén el ritmo actual o compara qué pasa si adelantas unos meses la fecha objetivo."
            : "Este tipo de compra suele beneficiarse de plazos largos: cuanto más tiempo des, menos esfuerzo mensual necesitas."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Presupuesto" value={budget} min={200} max={80000} step={100} unit="€" onChange={setBudget} />
          <SliderControl label="Ya ahorrado" value={current} min={0} max={budget} step={50} unit="€" onChange={setCurrent} />
          <SliderControl label="Meses para conseguirlo" value={monthsLeft} min={0} max={60} step={1} unit="meses" onChange={setMonthsLeft} accent="lavender" />
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["savings", "loan"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Ahorro para ${typeInfo.label}: presupuesto ${fmtEUR(budget)}, ya ahorrado ${fmtEUR(current)}, ${monthsLeft} meses → necesitas ${fmtEUR(requiredMonthly)}/mes.`
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Ya sea la entrada de un coche, la entrada de una vivienda o cualquier otra compra grande, planificar el ahorro con antelación evita tener que recurrir a financiación cara de última hora. Esta calculadora reparte el importe que te falta entre los meses que tienes por delante, para que sepas exactamente cuánto apartar cada mes.
        </p>
      </div>
    </div>
  );
}

export default BigPurchaseTool;
