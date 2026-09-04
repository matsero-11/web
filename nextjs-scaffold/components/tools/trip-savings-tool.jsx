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

const FAQS = [
  {
    q: "¿Cómo calculo cuánto ahorrar cada mes para un viaje?",
    a: "Se resta lo que ya llevas ahorrado del presupuesto total del viaje, y esa diferencia se reparte entre los meses que faltan hasta la fecha del viaje.",
  },
  {
    q: "¿Qué pasa si no llego a ahorrar lo suficiente a tiempo?",
    a: "Puedes alargar unos meses la fecha del viaje para reducir la cuota mensual necesaria, o revisar el presupuesto total si hay margen para ajustarlo.",
  },
];

function monthsBetween(dateStr) {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  const now = new Date();
  const diffMs = target - now;
  if (diffMs <= 0) return 0;
  return Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30.44)), 0);
}

function TripSavingsTool({ onBack, onNavigate }) {
  const [budget, setBudget] = useSharedState("trip_budget", 1200);
  const [current, setCurrent] = useSharedState("trip_current", 200);
  const [tripDate, setTripDate] = usePersistentState("trip_date", "");
  const [monthsLeft, setMonthsLeft] = useSharedState("trip_monthsLeft", 6);

  useEffect(() => {
    if (current > budget) setCurrent(budget);
  }, [budget, current]);

  const effectiveMonths = tripDate ? monthsBetween(tripDate) : monthsLeft;

  const remaining = Math.max(budget - current, 0);
  const requiredMonthly = effectiveMonths > 0 ? remaining / effectiveMonths : remaining;
  const animatedRequired = useAnimatedNumber(requiredMonthly);
  const pct = budget > 0 ? (current / budget) * 100 : 0;
  const animatedPct = useAnimatedNumber(Math.min(pct, 100));

  const pageTitle = "Calculadora de ahorro para un viaje: cuánto ahorrar al mes | MetaBox";
  const pageDescription =
    "Calcula cuánto tienes que ahorrar cada mes para cubrir el presupuesto de tu próximo viaje, poniendo la fecha exacta del viaje o los meses que faltan. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/trip";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="cuánto ahorrar para un viaje, calculadora ahorro para viajar, cómo ahorrar para las vacaciones, cuenta atrás ahorro viaje"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/trip.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/trip.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Ahorro para un viaje",
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

      <ToolHeader title="Ahorro para un viaje" subtitle="Fija la fecha o los meses, y calculamos cuánto ahorrar cada mes." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Necesitas ahorrar al mes</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {effectiveMonths > 0 ? fmtEUR(animatedRequired) : "—"}
        </div>
        <ProgressBar pct={animatedPct} gradientEnd={T.lavender} />
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginTop: "0.6rem" }}>
          {pct.toFixed(0)}% del presupuesto ya cubierto
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.8rem" }}>
          Fecha del viaje (opcional, más preciso)
        </div>
        <input
          type="date"
          value={tripDate}
          onChange={(e) => setTripDate(e.target.value)}
          style={{
            ...fontBody, width: "100%", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.7rem",
            padding: "0.7rem 0.9rem", color: T.text, fontSize: "0.9rem", outline: "none",
          }}
        />
        {tripDate && (
          <div style={{ ...fontBody, color: T.lime, fontSize: "0.82rem", marginTop: "0.6rem" }}>
            Faltan {effectiveMonths} {effectiveMonths === 1 ? "mes" : "meses"} para el viaje
          </div>
        )}
      </Card>

      <AdviceBlock
        text={
          effectiveMonths === 0
            ? "Sin margen de tiempo, la única opción es tenerlo ya ahorrado o retrasar la fecha del viaje."
            : requiredMonthly > budget * 0.4
            ? "La cuota mensual es alta para el tiempo que queda. Si puedes mover la fecha unas semanas, el esfuerzo mensual baja bastante."
            : "El ritmo necesario es razonable. Prueba a alargar unos meses el plazo y compara cuánto baja la cuota mensual."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Presupuesto del viaje" value={budget} min={100} max={10000} step={50} unit="€" onChange={setBudget} />
          <SliderControl label="Ya ahorrado" value={current} min={0} max={budget} step={25} unit="€" onChange={setCurrent} />
          {!tripDate && (
            <SliderControl label="Meses hasta el viaje" value={monthsLeft} min={0} max={24} step={1} unit="meses" onChange={setMonthsLeft} accent="lavender" />
          )}
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["tripdaily", "currency"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Ahorro para un viaje: presupuesto ${fmtEUR(budget)}, ya ahorrado ${fmtEUR(current)}, ${effectiveMonths} meses hasta el viaje → necesitas ${fmtEUR(requiredMonthly)}/mes.`
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Ponerle fecha a un viaje ayuda a ahorrar con más disciplina que un objetivo indefinido. Introduce la fecha exacta de tu viaje (o los meses que faltan si aún no la tienes) y esta calculadora reparte lo que te falta ahorrar entre el tiempo restante.
        </p>
      </div>
    </div>
  );
}

export default TripSavingsTool;
