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
    q: "¿Cuánto debería ahorrar al mes para Navidad?",
    a: "Depende de tu presupuesto total y de cuántos meses te queden hasta diciembre. Esta calculadora lo hace por ti: reparte lo que te falta ahorrar entre los meses restantes del año.",
  },
  {
    q: "¿Cuándo es el mejor momento para empezar a ahorrar para Navidad?",
    a: "Cuanto antes, mejor: empezar en enero o febrero reparte el esfuerzo en muchos más meses, con cuotas mensuales bajas, en vez de tener que reunir todo el presupuesto en los últimos meses del año.",
  },
];

function HolidaySavingsTool({ onBack, onNavigate }) {
  const realMonth = new Date().getMonth() + 1;
  const [currentMonth, setCurrentMonth] = useSharedState("holiday_currentMonth", realMonth);
  const [budget, setBudget] = useSharedState("holiday_budget", 600);
  const [current, setCurrent] = useSharedState("holiday_current", 50);

  useEffect(() => {
    if (current > budget) setCurrent(budget);
  }, [budget, current]);

  const monthsLeft = currentMonth <= 12 ? 12 - currentMonth + 1 : 12;
  const remaining = Math.max(budget - current, 0);
  const requiredMonthly = monthsLeft > 0 ? remaining / monthsLeft : remaining;
  const animatedRequired = useAnimatedNumber(requiredMonthly);

  const pageTitle = "Calculadora de ahorro para Navidad: cuánto ahorrar al mes | MetaBox";
  const pageDescription =
    "Calcula cuánto tienes que ahorrar cada mes para llegar a diciembre con el presupuesto de Navidad cubierto, según los meses que te queden y lo que ya llevas ahorrado. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/holiday";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="ahorro para Navidad, cuánto ahorrar para Navidad, calculadora presupuesto Navidad, cómo ahorrar para regalos de Navidad"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/holiday.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/holiday.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Ahorro para Navidad",
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

      <ToolHeader title="Ahorro para Navidad" subtitle="Calculamos los meses que faltan hasta diciembre por ti." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ height: "140px", position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, value: 1 }))}
                dataKey="value"
                innerRadius="68%"
                outerRadius="95%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={4}
                stroke="none"
                isAnimationActive={true}
                animationDuration={500}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <Cell key={i} fill={i + 1 >= currentMonth ? T.lime : T.surfaceAlt} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.8rem", fontWeight: 700 }}>{monthsLeft}</div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem" }}>{monthsLeft === 1 ? "mes" : "meses"}</div>
          </div>
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginTop: "0.5rem" }}>Ahorra al mes</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {fmtEUR(animatedRequired)}
        </div>
      </Card>

      <AdviceBlock
        text={
          monthsLeft <= 2
            ? "Quedan pocos meses. Si el importe mensual aprieta, plantéate reducir el presupuesto de Navidad en vez de forzar el ahorro."
            : "Empezar pronto reparte mejor el esfuerzo. Automatizar esta cantidad cada mes evita tener que reunirla toda en diciembre."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Mes actual" value={currentMonth} min={1} max={12} step={1} unit="" onChange={setCurrentMonth} />
          <SliderControl label="Presupuesto de Navidad" value={budget} min={50} max={5000} step={25} unit="€" onChange={setBudget} />
          <SliderControl label="Ya ahorrado" value={current} min={0} max={budget} step={10} unit="€" onChange={setCurrent} accent="lavender" />
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["savings", "challenge"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Ahorro para Navidad: presupuesto ${fmtEUR(budget)}, ya ahorrado ${fmtEUR(current)}, ${monthsLeft} meses restantes → ${fmtEUR(requiredMonthly)}/mes.`
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          La Navidad llega cada año en la misma fecha, pero el gasto en regalos, comidas y viajes suele coger a muchas personas por sorpresa. Esta calculadora detecta automáticamente en qué mes estás y reparte lo que te falta ahorrar entre los meses que quedan hasta diciembre, para que llegues sin agobios.
        </p>
      </div>
    </div>
  );
}

export default HolidaySavingsTool;
