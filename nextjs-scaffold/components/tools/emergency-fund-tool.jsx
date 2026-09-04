"use client";
import React, { useState, useEffect, useMemo } from "react";
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
import GoalProjection from "@/components/engines/GoalProjection";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Cuánto dinero debería tener en mi fondo de emergencia?",
    a: "Una referencia habitual es entre 3 y 6 meses de gastos esenciales, aunque algunas personas prefieren llegar a 12 meses si sus ingresos son irregulares. Esta calculadora te permite ajustar los meses de cobertura según tu situación.",
  },
  {
    q: "¿Dónde debería guardar mi fondo de emergencia?",
    a: "Lo habitual es mantenerlo en una cuenta de fácil acceso, separada de tu cuenta corriente principal, para que esté disponible rápidamente sin necesidad de vender inversiones.",
  },
  {
    q: "¿Qué gastos cuentan como 'esenciales' para calcular el fondo?",
    a: "Generalmente vivienda, suministros, alimentación, seguros y transporte básico — no incluye ocio, suscripciones ni compras no imprescindibles. Puedes desglosarlos por separado en esta herramienta para un cálculo más preciso.",
  },
];

const ESSENTIAL_CATEGORIES = [
  { id: "vivienda", label: "Vivienda", icon: HomeIcon, default: 650 },
  { id: "suministros", label: "Suministros", icon: Tv, default: 100 },
  { id: "comida", label: "Comida", icon: Utensils, default: 250 },
  { id: "transporte", label: "Transporte", icon: Car, default: 100 },
];

function EmergencyFundTool({ onBack, onNavigate }) {
  const [monthsTarget, setMonthsTarget] = useSharedState("emergency_monthsTarget", 6);
  const [current, setCurrent] = useSharedState("emergency_current", 800);
  const [monthly, setMonthly] = useSharedState("emergency_monthly", 120);
  const [useBreakdown, setUseBreakdown] = usePersistentState("emergency_useBreakdown", false);
  const [simpleExpenses, setSimpleExpenses] = useSharedState("emergency_expenses", 1100);
  const [breakdown, setBreakdown] = usePersistentState(
    "emergency_breakdown",
    Object.fromEntries(ESSENTIAL_CATEGORIES.map((c) => [c.id, c.default]))
  );

  const breakdownTotal = useMemo(
    () => ESSENTIAL_CATEGORIES.reduce((sum, c) => sum + (breakdown[c.id] || 0), 0),
    [breakdown]
  );
  const expenses = useBreakdown ? breakdownTotal : simpleExpenses;
  const goal = expenses * monthsTarget;

  useEffect(() => {
    if (current > goal) setCurrent(goal);
  }, [goal, current]);

  const pageTitle = "Calculadora de fondo de emergencia: cuánto ahorrar y en cuántos meses | MetaBox";
  const pageDescription =
    "Calcula cuánto dinero necesitas en tu fondo de emergencia según tus gastos esenciales desglosados por categoría, cuánto llevas ahorrado y en cuántos meses lo conseguirás. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/emergency";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="fondo de emergencia, cuánto ahorrar fondo de emergencia, calculadora fondo de emergencia, meses de gastos ahorrados, desglose gastos esenciales"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/emergency.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/emergency.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Calculadora de fondo de emergencia",
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

      <ToolHeader title="Fondo de emergencia" subtitle="Cuánto necesitas ahorrar para estar cubierto ante un imprevisto." onBack={onBack} />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          {!useBreakdown ? (
            <SliderControl label="Gasto esencial mensual" value={simpleExpenses} min={300} max={4000} step={50} unit="€" onChange={setSimpleExpenses} />
          ) : (
            <div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginBottom: "0.8rem" }}>
                Gasto esencial mensual: <span style={{ color: T.lime, fontWeight: 600 }}>{fmtEUR(breakdownTotal)}</span>
              </div>
              <div className="flex flex-col gap-5">
                {ESSENTIAL_CATEGORIES.map((c) => (
                  <SliderControl
                    key={c.id}
                    label={c.label}
                    value={breakdown[c.id] || 0}
                    min={0}
                    max={2000}
                    step={10}
                    unit="€"
                    onChange={(v) => setBreakdown((b) => ({ ...b, [c.id]: v }))}
                  />
                ))}
              </div>
            </div>
          )}
          <button
            onClick={() => setUseBreakdown((v) => !v)}
            style={{ ...fontBody, background: "transparent", border: "none", color: T.lavender, fontSize: "0.8rem", cursor: "pointer", textAlign: "left", padding: 0 }}
          >
            {useBreakdown ? "Volver a un solo número" : "Desglosar por categorías (más preciso)"}
          </button>
          <div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginBottom: "0.5rem" }}>Meses de cobertura</div>
            <div className="flex gap-2">
              {[3, 6, 12].map((m) => (
                <Chip key={m} label={`${m} meses`} active={monthsTarget === m} onClick={() => setMonthsTarget(m)} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", textAlign: "center" }}>
        Objetivo calculado: <span style={{ color: T.lime, fontWeight: 600 }}>{fmtEUR(goal)}</span>
      </div>

      <GoalProjection goal={goal} current={current} monthly={monthly} extra={0} monthsSavedLabel="" />

      <AdviceBlock
        text={
          current >= goal
            ? "Ya tienes cubierto tu fondo de emergencia con este objetivo. Podrías redirigir la aportación mensual hacia otra meta."
            : monthly > 0 && Math.ceil((goal - current) / monthly) > 24
            ? "Al ritmo actual tardarás más de 2 años en completarlo. Si es posible, prioriza este fondo antes que metas menos urgentes."
            : "Vas por buen camino. Un fondo de emergencia sólido te da margen para no tocar tus otros ahorros ante un imprevisto."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Ya ahorrado" value={current} min={0} max={goal} step={50} unit="€" onChange={setCurrent} />
          <SliderControl label="Aportación mensual" value={monthly} min={10} max={1000} step={10} unit="€" onChange={setMonthly} accent="lavender" />
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["savings", "budget", "percent"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Fondo de emergencia: gasto esencial ${fmtEUR(expenses)}/mes × ${monthsTarget} meses = objetivo ${fmtEUR(goal)}. Ya ahorrado ${fmtEUR(current)}, aportando ${fmtEUR(monthly)}/mes.`
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Un fondo de emergencia es el dinero que reservas aparte para cubrir imprevistos —una avería, una baja médica, un despido— sin tener que endeudarte ni vender inversiones a mal precio. Puedes calcular el gasto esencial con un número global o desglosarlo por categorías (vivienda, suministros, comida, transporte) para un objetivo más preciso, y ver en cuántos meses lo alcanzarás con tu aportación actual.
        </p>
      </div>
    </div>
  );
}

export default EmergencyFundTool;
