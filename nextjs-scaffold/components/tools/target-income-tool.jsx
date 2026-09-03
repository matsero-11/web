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
    q: "¿Cómo calculo el ingreso mínimo que necesito ganar?",
    a: "Se suman tus gastos fijos mensuales más el ahorro que quieres conseguir cada mes. El resultado es el ingreso neto mínimo necesario para cubrir ambas cosas sin quedarte corto.",
  },
  {
    q: "¿Este cálculo tiene en cuenta impuestos?",
    a: "No, el resultado es el ingreso neto mínimo según los datos que introduzcas — no incluye impuestos ni retenciones, que varían según tu situación laboral y fiscal.",
  },
];

function TargetIncomeTool({ onBack, onNavigate }) {
  const [expenses, setExpenses] = useSharedState("targetincome_expenses", 1200);
  const [desiredSavings, setDesiredSavings] = useSharedState("targetincome_desiredSavings", 300);

  const requiredIncome = expenses + desiredSavings;
  const animatedIncome = useAnimatedNumber(requiredIncome);

  const pageTitle = "Calculadora de cuánto necesito ganar según mis gastos y ahorro | MetaBox";
  const pageDescription =
    "Calcula el ingreso mínimo que necesitas ganar al mes para cubrir tus gastos fijos y alcanzar el ahorro que te propones, con un desglose visual entre gastos y ahorro. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/targetincome";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="cuánto necesito ganar al mes, calculadora ingreso mínimo necesario, cuánto tengo que ganar para ahorrar, salario mínimo según gastos"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/targetincome.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/targetincome.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Cuánto necesito ganar",
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

      <ToolHeader title="Cuánto necesito ganar" subtitle="A partir de tus gastos y lo que quieres ahorrar, el ingreso mínimo que necesitas." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Necesitas ingresar al mes</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {fmtEUR(animatedIncome)}
        </div>
      </Card>

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.8rem" }}>
          De qué se compone
        </div>
        <div style={{ width: "100%", height: "110px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ nombre: "Ingreso", gastos: expenses, ahorro: desiredSavings }]} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <XAxis type="number" hide domain={[0, "auto"]} />
              <YAxis type="category" dataKey="nombre" hide />
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v, n) => [fmtEUR(v), n === "gastos" ? "Gastos" : "Ahorro"]}
              />
              <Bar dataKey="gastos" stackId="a" fill={T.textMuted} radius={[6, 0, 0, 6]} barSize={34} isAnimationActive={true} animationDuration={400} />
              <Bar dataKey="ahorro" stackId="a" fill={T.lime} radius={[0, 6, 6, 0]} barSize={34} isAnimationActive={true} animationDuration={400} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>Gastos: {fmtEUR(expenses)}</span>
          <span style={{ ...fontBody, color: T.lime, fontSize: "0.78rem" }}>Ahorro: {fmtEUR(desiredSavings)}</span>
        </div>
      </Card>

      <AdviceBlock
        text={
          requiredIncome > 0 && desiredSavings / requiredIncome > 0.25
            ? "Estás pidiendo un ahorro ambicioso sobre el total. Si el ingreso real es más bajo, prueba primero con un objetivo de ahorro menor y súbelo con el tiempo."
            : "Este ingreso te cubre gastos y ahorro. Compáralo con lo que ganas hoy en 'Porcentaje de ahorro' para ver la diferencia real."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Gastos fijos mensuales" value={expenses} min={0} max={5000} step={25} unit="€" onChange={setExpenses} />
          <SliderControl label="Cuánto quieres ahorrar" value={desiredSavings} min={0} max={3000} step={10} unit="€" onChange={setDesiredSavings} accent="lavender" />
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
        No incluye impuestos ni retenciones: es el ingreso neto mínimo necesario según lo que indiques.
      </div>

      <RelatedTools ids={["percent", "budget"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Gastos ${fmtEUR(expenses)} + ahorro deseado ${fmtEUR(desiredSavings)} = necesitas ganar ${fmtEUR(requiredIncome)}/mes.`
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Ya sea para negociar un sueldo, evaluar una oferta de trabajo o planificar un cambio de vida, saber el ingreso mínimo real que necesitas es un dato clave. Esta calculadora suma tus gastos fijos mensuales al ahorro que te propones conseguir, para darte una cifra clara de cuánto necesitas ganar cada mes.
        </p>
      </div>
    </div>
  );
}

export default TargetIncomeTool;
