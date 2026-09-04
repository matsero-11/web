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
import { Card, SliderControl, ProgressBar, Chip, IconTile, AdviceBlock, Button } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { useSharedState, usePersistentState } from "@/lib/persistence";
import { CopySummaryButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Qué porcentaje de mis ingresos debería ahorrar?",
    a: "Una referencia habitual es ahorrar al menos entre el 10% y el 20% de tus ingresos mensuales, aunque el porcentaje ideal depende de tus gastos fijos y objetivos personales.",
  },
  {
    q: "¿Por qué es útil ver el ahorro en porcentaje y no solo en euros?",
    a: "El porcentaje te permite comparar tu capacidad de ahorro de forma constante aunque tus ingresos cambien, y es más fácil marcarte objetivos realistas ('ahorrar el 15%') que una cifra fija que puede no ajustarse a tu situación.",
  },
  {
    q: "¿Para qué sirve guardar el histórico?",
    a: "Guardando tu porcentaje cada mes puedes ver si tu tasa de ahorro mejora, empeora o se mantiene estable a lo largo del tiempo, en vez de mirar solo el mes actual de forma aislada.",
  },
];

function SavingsPercentTool({ onBack, onNavigate }) {
  const [income, setIncome] = useSharedState("percent_income", 1800);
  const [savings, setSavings] = useSharedState("percent_savings", 250);
  const [period, setPeriod] = usePersistentState("percent_period", "mes");
  const [history, setHistory] = usePersistentState("percent_history", []);

  useEffect(() => {
    if (savings > income) setSavings(income);
  }, [income, savings]);

  const pct = income > 0 ? (savings / income) * 100 : 0;
  const animatedPct = useAnimatedNumber(pct);

  let band = { text: "Por debajo del 10%", color: T.coral };
  if (pct >= 20) band = { text: "Por encima del 20%", color: T.lime };
  else if (pct >= 10) band = { text: "Entre el 10% y el 20%", color: T.lavender };

  const gaugeData = [{ name: "ahorro", value: Math.min(pct, 100), fill: band.color }];
  const displayAmount = period === "mes" ? savings : savings * 12;

  const saveSnapshot = () => {
    const snapshot = { label: new Date().toLocaleDateString("es-ES", { month: "short", year: "2-digit" }), pct: Number(pct.toFixed(1)) };
    setHistory((prev) => [...prev.slice(-11), snapshot]);
  };

  const pageTitle = "Calculadora de porcentaje de ahorro sobre tu sueldo | MetaBox";
  const pageDescription =
    "Calcula qué porcentaje de tu sueldo estás ahorrando cada mes, guarda tu histórico y comprueba si tu tasa de ahorro mejora con el tiempo. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/percent";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="porcentaje de ahorro sobre el sueldo, cuánto debería ahorrar de mi sueldo, calculadora porcentaje de ahorro, evolución tasa de ahorro"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/percent.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/percent.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Porcentaje de ahorro",
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

      <ToolHeader title="Porcentaje de ahorro" subtitle="Qué parte de tu ingreso estás ahorrando." onBack={onBack} />

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div className="flex gap-2 justify-center">
          <Chip label="Al mes" active={period === "mes"} onClick={() => setPeriod("mes")} />
          <Chip label="Al año" active={period === "año"} onClick={() => setPeriod("año")} />
        </div>
      </Card>

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ height: "170px", position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="72%"
              outerRadius="100%"
              data={gaugeData}
              startAngle={180}
              endAngle={0}
              barSize={16}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={{ fill: T.surfaceAlt }}
                isAnimationActive={true}
                animationDuration={500}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: "0.6rem" }}>
            <div style={{ ...fontDisplay, color: band.color, fontSize: "2.4rem", fontWeight: 700 }}>{animatedPct.toFixed(1)}%</div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>de tu ingreso</div>
          </div>
        </div>
        <div style={{ ...fontBody, color: band.color, fontSize: "0.88rem", marginTop: "0.5rem", fontWeight: 500 }}>
          {band.text}
        </div>
      </Card>

      <div style={{ ...fontBody, color: T.text, textAlign: "center", fontSize: "0.98rem" }}>
        Eso son <span style={{ color: T.lime, fontWeight: 600 }}>{fmtEUR(displayAmount)}</span> {period === "mes" ? "cada mes" : "cada año"}
      </div>

      <AdviceBlock
        text={
          pct < 10
            ? "Un margen reducido no siempre es un problema: antes de subirlo, revisa en 'Presupuesto mensual' si hay gastos variables con recorte."
            : pct < 20
            ? "Estás en un rango saludable. Mueve el ahorro mensual unos euros y mira cuánto sube el porcentaje."
            : "Tienes un margen amplio. Podrías comprobar en 'Objetivo de ahorro' cuánto antes alcanzarías una meta concreta con este ritmo."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Ingreso mensual" value={income} min={0} max={6000} step={50} unit="€" onChange={setIncome} />
          <SliderControl label="Ahorro mensual" value={savings} min={0} max={income} step={10} unit="€" onChange={setSavings} accent="lavender" />
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: history.length > 0 ? "1rem" : 0 }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem" }}>
            Evolución de tu tasa de ahorro
          </div>
          <Button variant="ghost" onClick={saveSnapshot} style={{ width: "auto", padding: "0.5rem 0.9rem", fontSize: "0.8rem" }}>
            Guardar este mes
          </Button>
        </div>
        {history.length > 0 ? (
          <div style={{ width: "100%", height: "150px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" stroke={T.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                  formatter={(v) => [`${v}%`, "Tasa de ahorro"]}
                />
                <Line type="monotone" dataKey="pct" stroke={T.lime} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem" }}>
            Guarda tu primer mes para empezar a ver la evolución de tu tasa de ahorro.
          </div>
        )}
      </Card>

      <AdSlot minHeight="0px" />

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
        Referencia orientativa, no un dato verificado ni una recomendación personalizada.
      </div>

      <RelatedTools ids={["savings", "rule502030"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() => `Porcentaje de ahorro: ${fmtEUR(savings)} de ${fmtEUR(income)} = ${pct.toFixed(1)}%.`}
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Saber qué porcentaje de tu sueldo ahorras es más útil que fijarte solo en la cifra en euros, porque te permite compararte con referencias estándar y adaptar el objetivo si tus ingresos cambian. Guarda tu porcentaje cada mes para ver si tu tasa de ahorro mejora con el tiempo.
        </p>
      </div>
    </div>
  );
}

export default SavingsPercentTool;
