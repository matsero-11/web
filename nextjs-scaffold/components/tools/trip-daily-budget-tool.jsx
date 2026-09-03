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
import { CopySummaryButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Cómo calculo cuánto puedo gastar al día durante un viaje?",
    a: "Se resta lo ya gastado del presupuesto total, y esa cantidad restante se reparte entre los días de viaje que te quedan por delante — así sabes en tiempo real cuánto margen diario tienes.",
  },
  {
    q: "¿Qué hago si voy gastando más rápido de lo previsto?",
    a: "Si tu gasto diario disponible baja respecto al plan original, puedes ajustar el ritmo en los días restantes o revisar el presupuesto total si el viaje lo permite.",
  },
];

function TripDailyBudgetTool({ onBack, onNavigate }) {
  const [totalBudget, setTotalBudget] = useSharedState("tripdaily_totalBudget", 900);
  const [totalDays, setTotalDays] = useSharedState("tripdaily_totalDays", 6);
  const [spent, setSpent] = useSharedState("tripdaily_spent", 300);
  const [daysElapsed, setDaysElapsed] = useSharedState("tripdaily_daysElapsed", 2);

  useEffect(() => {
    if (spent > totalBudget) setSpent(totalBudget);
  }, [totalBudget, spent]);
  useEffect(() => {
    if (daysElapsed > totalDays) setDaysElapsed(totalDays);
  }, [totalDays, daysElapsed]);

  const remainingBudget = Math.max(totalBudget - spent, 0);
  const remainingDays = Math.max(totalDays - daysElapsed, 0);
  const dailyAllowanceLeft = remainingDays > 0 ? remainingBudget / remainingDays : remainingBudget;
  const originalDailyPlan = totalDays > 0 ? totalBudget / totalDays : 0;

  const animatedAllowance = useAnimatedNumber(dailyAllowanceLeft);
  const onTrack = dailyAllowanceLeft >= originalDailyPlan * 0.9;

  const pageTitle = "Presupuesto diario de viaje: cuánto puedes gastar hoy | MetaBox";
  const pageDescription =
    "Controla tu presupuesto de viaje día a día: introduce lo gastado y los días que llevas, y descubre al instante cuánto puedes gastar cada día que te queda. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/tripdaily";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="presupuesto diario de viaje, cuánto puedo gastar al día en un viaje, calculadora presupuesto viaje, controlar gasto de viaje"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/tripdaily.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/tripdaily.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Presupuesto diario de viaje",
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

      <ToolHeader title="Presupuesto diario de viaje" subtitle="Ajusta lo que llevas gastado y verás cuánto te queda por día." onBack={onBack} />

      <Card glow={onTrack} result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Puedes gastar al día</div>
        <div style={{ ...fontDisplay, color: onTrack ? T.lime : T.coral, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {remainingDays > 0 ? fmtEUR(animatedAllowance) : "—"}
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>
          Plan original: {fmtEUR(originalDailyPlan)} al día · {remainingDays} {remainingDays === 1 ? "día restante" : "días restantes"}
        </div>
      </Card>

      <AdviceBlock
        text={
          !onTrack
            ? "Vas por encima del ritmo previsto. Si quieres llegar sin sobresaltos, reduce un poco el gasto de los próximos días."
            : remainingDays === 0
            ? "El viaje ha terminado según estos datos. Compara el gasto real con el plan original para el próximo viaje."
            : "Vas dentro del plan. Aun así, deja algo de margen para imprevistos de última hora."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Presupuesto total del viaje" value={totalBudget} min={50} max={10000} step={50} unit="€" onChange={setTotalBudget} />
          <SliderControl label="Días totales de viaje" value={totalDays} min={1} max={60} step={1} unit="días" onChange={setTotalDays} />
          <SliderControl label="Gastado hasta ahora" value={spent} min={0} max={totalBudget} step={10} unit="€" onChange={setSpent} accent="lavender" />
          <SliderControl label="Días ya pasados" value={daysElapsed} min={0} max={totalDays} step={1} unit="días" onChange={setDaysElapsed} accent="lavender" />
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["trip", "currency"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Presupuesto de viaje: ${fmtEUR(totalBudget)} para ${totalDays} días, gastado ${fmtEUR(spent)} en ${daysElapsed} días → ${fmtEUR(dailyAllowanceLeft)}/día restante.`
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Es fácil perder de vista el presupuesto de un viaje a mitad de las vacaciones. Esta herramienta recalcula al instante cuánto puedes gastar cada día que te queda, teniendo en cuenta lo que ya llevas gastado y los días transcurridos, para que no te lleves sorpresas al final.
        </p>
      </div>
    </div>
  );
}

export default TripDailyBudgetTool;
