"use client";
import React, { useState } from "react";
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
import { useSharedState } from "@/lib/persistence";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Para qué sirve comparar dos escenarios de ahorro?",
    a: "Te permite ver de forma clara el impacto real de subir (o bajar) tu ahorro mensual a lo largo del tiempo, algo que no siempre es intuitivo cuando solo miras la diferencia mes a mes.",
  },
  {
    q: "¿Por qué la diferencia parece pequeña al mes pero grande a 10 años?",
    a: "Porque se acumula: una diferencia de 20€ al mes son solo 240€ al año, pero a 10 años son 2.400€ — el efecto se magnifica con el tiempo, aunque cada mes por separado parezca poco relevante.",
  },
  {
    q: "¿Para qué sirve el tercer escenario?",
    a: "Muchas decisiones reales son entre tres opciones, no dos: por ejemplo, mantener el ritmo actual, un ajuste moderado o uno ambicioso. Compararlas juntas ayuda a decidir con más contexto.",
  },
];

function ScenarioComparatorTool({ onBack, onNavigate }) {
  const [current, setCurrent] = useSharedState("comparator_current", 150);
  const [alternative, setAlternative] = useSharedState("comparator_alternative", 220);
  const [showThird, setShowThird] = useState(false);
  const [thirdScenario, setThirdScenario] = useSharedState("comparator_third", 300);

  const monthlyDiff = alternative - current;
  const annualDiff = monthlyDiff * 12;
  const animatedAnnualDiff = useAnimatedNumber(Math.abs(annualDiff));
  const positive = monthlyDiff >= 0;

  const barData = [1, 5, 10].map((years) => ({
    years: `${years} año${years > 1 ? "s" : ""}`,
    actual: current * 12 * years,
    nuevo: alternative * 12 * years,
    ...(showThird ? { tercero: thirdScenario * 12 * years } : {}),
  }));

  const pageTitle = "Comparador de escenarios de ahorro: compara hasta 3 ritmos a la vez | MetaBox";
  const pageDescription =
    "Compara tu ahorro mensual actual con hasta dos escenarios alternativos y descubre la diferencia real a 1, 5 y 10 años en una gráfica interactiva. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/comparator";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="comparador de ahorro, comparar escenarios de ahorro, cuánto ahorraría si subo mi ahorro mensual, simulador de ahorro a largo plazo"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/comparator.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/comparator.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Comparador de escenarios",
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

      <ToolHeader title="Comparador de escenarios" subtitle="Compara varias formas de ahorrar y ve la diferencia real." onBack={onBack} />

      <div className={`grid grid-cols-1 ${showThird ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
        <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", marginBottom: "0.8rem" }}>Situación actual</div>
          <SliderControl label="Ahorro mensual" value={current} min={0} max={2000} step={10} unit="€" onChange={setCurrent} />
        </Card>
        <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
          <div style={{ ...fontBody, color: T.lavender, fontSize: "0.82rem", marginBottom: "0.8rem" }}>Nuevo escenario</div>
          <SliderControl label="Ahorro mensual" value={alternative} min={0} max={2000} step={10} unit="€" onChange={setAlternative} accent="lavender" />
        </Card>
        {showThird && (
          <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
            <div style={{ ...fontBody, color: T.coral, fontSize: "0.82rem", marginBottom: "0.8rem" }}>Tercer escenario</div>
            <SliderControl label="Ahorro mensual" value={thirdScenario} min={0} max={2000} step={10} unit="€" onChange={setThirdScenario} />
          </Card>
        )}
      </div>

      {!showThird && (
        <Button variant="ghost" onClick={() => setShowThird(true)}>
          Añadir un tercer escenario
        </Button>
      )}

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>
          {positive ? "Ahorrarías de más al año" : "Ahorrarías de menos al año"} (actual vs. nuevo)
        </div>
        <div style={{ ...fontDisplay, color: positive ? T.lime : T.coral, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {positive ? "+" : "−"}{fmtEUR(animatedAnnualDiff)}
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>
          {positive ? "+" : "−"}{fmtEUR(Math.abs(monthlyDiff))} al mes de diferencia
        </div>
      </Card>

      <AdviceBlock
        text={
          !positive
            ? "El nuevo escenario ahorra menos que el actual. Puede tener sentido si libera gasto en otra parte, pero no lo pierdas de vista."
            : Math.abs(monthlyDiff) < 20
            ? "La diferencia mensual es pequeña, pero fíjate en el acumulado a 10 años del gráfico: ahí se nota de verdad."
            : "Buena diferencia acumulada. Compara con el tercer escenario si quieres ver un salto todavía mayor."
        }
      />

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.8rem" }}>
          Acumulado a lo largo del tiempo
        </div>
        <div style={{ width: "100%", height: "200px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barGap={6} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <XAxis dataKey="years" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v, n) => [fmtEUR(v), n === "actual" ? "Actual" : n === "nuevo" ? "Nuevo" : "Tercero"]}
              />
              <Bar dataKey="actual" fill={T.textMuted} radius={[6, 6, 0, 0]} maxBarSize={20} isAnimationActive={true} animationDuration={400} />
              <Bar dataKey="nuevo" fill={T.lavender} radius={[6, 6, 0, 0]} maxBarSize={20} isAnimationActive={true} animationDuration={400} />
              {showThird && <Bar dataKey="tercero" fill={T.coral} radius={[6, 6, 0, 0]} maxBarSize={20} isAnimationActive={true} animationDuration={400} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["savings", "interest"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Comparador: actual ${fmtEUR(current)}/mes vs. nuevo ${fmtEUR(alternative)}/mes` +
            (showThird ? ` vs. tercero ${fmtEUR(thirdScenario)}/mes` : "") +
            ` → ${fmtEUR(Math.abs(monthlyDiff))}/mes de diferencia entre actual y nuevo.`
          }
        />
        <ExportCSVButton
          filename="comparador-de-escenarios"
          getRows={() => barData.map((r) => ({ periodo: r.years, actual: r.actual.toFixed(2), nuevo: r.nuevo.toFixed(2), ...(showThird ? { tercero: r.tercero.toFixed(2) } : {}) }))}
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          A veces cuesta ver el impacto real de ahorrar un poco más cada mes. Este comparador pone lado a lado tu ritmo actual, un nuevo escenario y, si lo necesitas, un tercero, proyectando la diferencia acumulada a 1, 5 y 10 años para que decidas con datos.
        </p>
      </div>
    </div>
  );
}

export default ScenarioComparatorTool;
