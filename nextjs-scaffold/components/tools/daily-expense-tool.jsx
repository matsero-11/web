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
import { useSharedState } from "@/lib/persistence";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Cuánto suma un gasto pequeño diario al año?",
    a: "Un gasto de 6€ al día equivale a 2.190€ al año — mucho más de lo que suele parecer a simple vista, precisamente porque se paga en cantidades pequeñas y repetidas.",
  },
  {
    q: "¿Merece la pena recortar 1 o 2 euros al día?",
    a: "Sí: al multiplicarse por 365 días, incluso un pequeño recorte diario puede generar un ahorro anual significativo sin que el cambio en el día a día se note apenas.",
  },
];

function DailyExpenseTool({ onBack, onNavigate }) {
  const [daily, setDaily] = useSharedState("daily_daily", 6);
  const [reduction, setReduction] = useSharedState("daily_reduction", 0);

  useEffect(() => {
    if (reduction > daily) setReduction(daily);
  }, [daily, reduction]);

  const effectiveDaily = Math.max(daily - reduction, 0);
  const weekly = effectiveDaily * 7;
  const monthly = effectiveDaily * 30;
  const annual = effectiveDaily * 365;
  const annualSavingsFromReduction = reduction * 365;

  const animatedReductionSavings = useAnimatedNumber(annualSavingsFromReduction);

  const barData = [
    { periodo: "Semana", valor: weekly },
    { periodo: "Mes", valor: monthly },
    { periodo: "Año", valor: annual },
  ];

  const pageTitle = "De gasto diario a gasto anual: calculadora de pequeños gastos | MetaBox";
  const pageDescription =
    "Descubre cuánto supone realmente un gasto diario pequeño al mes y al año, y cuánto ahorrarías reduciéndolo unos céntimos. Café, tabaco, snacks... Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/daily";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="cuánto gasto al día, calculadora gasto diario a anual, cuánto gasto en café al año, pequeños gastos que suman"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/daily.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/daily.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Gastos diarios",
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

      <ToolHeader title="Gastos diarios" subtitle="Un gasto pequeño cada día también se acumula. Míralo en conjunto." onBack={onBack} />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <SliderControl label="Gasto diario" value={daily} min={0} max={60} step={0.5} unit="€" onChange={setDaily} />
      </Card>

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div style={{ width: "100%", height: "190px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <XAxis type="number" hide domain={[0, "auto"]} />
              <YAxis type="category" dataKey="periodo" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v) => [fmtEUR(v), "Total"]}
              />
              <Bar dataKey="valor" radius={[0, 8, 8, 0]} maxBarSize={26} animationDuration={400}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={[T.textMuted, T.lime, T.lavender][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <AdviceBlock
        text={
          annual > 3000
            ? "Este gasto diario supera los 3.000€ al año. Un pequeño recorte aquí se nota mucho más que en gastos ocasionales."
            : reduction === 0
            ? "Mueve el control de abajo aunque sea 1€: en un gasto diario, hasta un ajuste pequeño se multiplica por 365 al año."
            : "Buen ajuste. Compara ese ahorro anual con lo que necesitarías en 'Fondo de emergencia' o en un objetivo concreto."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          ¿Y si lo reduces un poco?
        </div>
        <div className="flex flex-col gap-6">
          <SliderControl label="Reducir gasto diario en" value={reduction} min={0} max={daily} step={0.5} unit="€" onChange={setReduction} accent="lavender" />
        </div>
        {reduction > 0 && (
          <div style={{ ...fontBody, color: T.lavender, fontSize: "0.88rem", marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <TrendingUp size={14} /> Ahorrarías {fmtEUR(animatedReductionSavings)} al año
          </div>
        )}
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["roundup", "budget"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() => `Gasto diario: ${fmtEUR(daily)}/día → ${fmtEUR(monthly)}/mes, ${fmtEUR(annual)}/año.`}
        />
        <ExportCSVButton filename="gastos-diarios" getRows={() => barData.map((r) => ({ periodo: r.periodo, importe: r.valor.toFixed(2) }))} />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Los gastos pequeños y repetidos —un café, el tabaco, el pincho del mediodía— son fáciles de ignorar porque cada uno por separado parece insignificante. Esta calculadora convierte tu gasto diario en su equivalente semanal, mensual y anual, para que veas el impacto real y decidas con datos si merece la pena recortarlo.
        </p>
      </div>
    </div>
  );
}

export default DailyExpenseTool;
