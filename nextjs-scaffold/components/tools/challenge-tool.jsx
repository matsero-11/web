"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  Target, PiggyBank, Plane, Home as HomeIcon,
  ArrowLeft, TrendingUp, ShieldCheck, Utensils, Car, Tv, Popcorn, ShoppingBag,
  MoreHorizontal, CalendarCheck, Shuffle,
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
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Cómo funciona el reto de ahorro de 52 semanas?",
    a: "Cada semana ahorras una cantidad progresiva: la semana 1 ahorras el importe base, la semana 2 el doble, y así sucesivamente. Al final del reto habrás acumulado el total de todas las semanas.",
  },
  {
    q: "¿Qué pasa si me salto una semana del reto?",
    a: "No pasa nada: puedes marcarla como pendiente y recuperarla más adelante, combinando dos semanas en una si lo necesitas, sin perder el objetivo final del reto.",
  },
  {
    q: "¿Es mejor el reto de 26 o el de 52 semanas?",
    a: "El de 26 semanas es más intenso pero más corto; el de 52 semanas reparte el esfuerzo en todo el año con cuotas más bajas. Depende de cuánto margen mensual tengas disponible.",
  },
  {
    q: "¿Qué es el modo aleatorio del reto?",
    a: "En vez de ahorrar cantidades crecientes en orden predecible, el modo aleatorio baraja qué semana corresponde a cada importe, para que no sepas de antemano cuándo llega la semana más cara.",
  },
];

// Genera un orden barajado y estable (mismo resultado mientras no cambie la semilla)
function shuffleWithSeed(array, seed) {
  const arr = [...array];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function ChallengeTool({ onBack, onNavigate }) {
  const [weeks, setWeeks] = useSharedState("challenge_weeks", 26);
  const [baseAmount, setBaseAmount] = useSharedState("challenge_baseAmount", 5);
  const [doneArray, setDoneArray] = usePersistentState("challenge_done", []);
  const [shuffleMode, setShuffleMode] = usePersistentState("challenge_shuffleMode", false);
  const [shuffleSeed] = usePersistentState("challenge_shuffleSeed", Math.floor(Math.random() * 100000));
  const [startDate, setStartDate] = usePersistentState("challenge_startDate", null);

  const done = useMemo(() => new Set(doneArray), [doneArray]);

  useEffect(() => {
    const filtered = doneArray.filter((w) => w <= weeks);
    if (filtered.length !== doneArray.length) setDoneArray(filtered);
  }, [weeks]);

  useEffect(() => {
    if (!startDate) setStartDate(new Date().toISOString());
  }, [startDate]);

  const baseAmounts = useMemo(() => Array.from({ length: weeks }, (_, i) => baseAmount * (i + 1)), [weeks, baseAmount]);
  const orderedAmounts = useMemo(
    () => (shuffleMode ? shuffleWithSeed(baseAmounts, shuffleSeed) : baseAmounts),
    [shuffleMode, baseAmounts, shuffleSeed]
  );
  const weekAmount = (w) => orderedAmounts[w - 1] || 0;

  const totalGoal = useMemo(() => baseAmounts.reduce((s, v) => s + v, 0), [baseAmounts]);
  const savedSoFar = useMemo(() => {
    let sum = 0;
    done.forEach((w) => (sum += weekAmount(w)));
    return sum;
  }, [done, orderedAmounts]);

  const pct = totalGoal > 0 ? (savedSoFar / totalGoal) * 100 : 0;
  const animatedSaved = useAnimatedNumber(savedSoFar);
  const animatedPct = useAnimatedNumber(Math.min(pct, 100));

  const toggleWeek = (w) => {
    const next = new Set(done);
    if (next.has(w)) next.delete(w);
    else next.add(w);
    setDoneArray([...next]);
  };

  const chartData = useMemo(() => {
    return Array.from({ length: weeks }, (_, i) => ({
      semana: `S${i + 1}`,
      importe: weekAmount(i + 1),
    }));
  }, [weeks, orderedAmounts]);

  // Seguimiento por fecha real
  const weeksElapsed = startDate
    ? Math.min(Math.max(Math.floor((Date.now() - new Date(startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)), 0), weeks)
    : 0;
  const onTrack = done.size >= weeksElapsed;

  const toggleShuffle = () => {
    setShuffleMode((s) => !s);
  };

  const pageTitle = "Reto de ahorro de 26 o 52 semanas gratis | MetaBox";
  const pageDescription =
    "Sigue un reto de ahorro progresivo semana a semana, con modo aleatorio opcional, seguimiento real por fecha y 26 o 52 semanas a elegir. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/challenge";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="reto de ahorro 52 semanas, reto de ahorro 26 semanas, cómo hacer el reto de las 52 semanas, calculadora reto de ahorro, reto de ahorro aleatorio"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/challenge.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/challenge.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Reto de ahorro",
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

      <ToolHeader title="Reto de ahorro" subtitle="Cada semana ahorras un poco más. Marca las semanas completadas." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Llevas ahorrado</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {fmtEUR(animatedSaved)}
        </div>
        <ProgressBar pct={animatedPct} gradientEnd={T.lavender} />
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", marginTop: "0.6rem" }}>
          Objetivo del reto: {fmtEUR(totalGoal)} en {weeks} semanas
        </div>
        {weeksElapsed > 0 && (
          <div style={{ ...fontBody, color: onTrack ? T.lime : T.coral, fontSize: "0.85rem", marginTop: "0.5rem", fontWeight: 600 }}>
            {onTrack
              ? `Al día: llevas ${done.size} de las ${weeksElapsed} semanas esperadas`
              : `Vas ${weeksElapsed - done.size} ${weeksElapsed - done.size === 1 ? "semana" : "semanas"} por detrás`}
          </div>
        )}
      </Card>

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "0.8rem" }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem" }}>
            Evolución del ahorro semanal
          </div>
          <button
            onClick={toggleShuffle}
            title="Activar/desactivar orden aleatorio"
            style={{
              display: "flex", alignItems: "center", gap: "0.3rem",
              background: shuffleMode ? T.limeSoft : "transparent",
              border: `1px solid ${shuffleMode ? T.lime : T.border}`,
              borderRadius: "999px", padding: "0.35rem 0.7rem", cursor: "pointer",
              color: shuffleMode ? T.lime : T.textMuted, fontSize: "0.75rem", ...fontBody,
            }}
          >
            <Shuffle size={12} /> Aleatorio
          </button>
        </div>
        <div style={{ width: "100%", height: "180px", marginTop: "0.4rem" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorImporte" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.lime} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={T.lime} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="semana" stroke={T.textMuted} fontSize={11} tickLine={false} axisLine={false} interval={weeks > 26 ? 6 : 3} />
              <Tooltip 
                formatter={(value) => [`${value} €`, "Ahorro semanal"]}
                contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "8px", fontSize: "12px", color: T.text }}
              />
              <Area type="monotone" dataKey="importe" stroke={T.lime} strokeWidth={2} fillOpacity={1} fill="url(#colorImporte)" animationDuration={400} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <AdviceBlock
        text={
          done.size === 0
            ? "Empieza marcando la semana 1: al ser progresivo, las primeras semanas son las más fáciles para coger ritmo."
            : pct >= 90
            ? "Estás a punto de completar el reto. Las últimas semanas son las más caras: puedes repartirlas en pagos parciales si te aprieta."
            : "Vas avanzando bien. Si te saltas una semana, no pasa nada: puedes recuperarla más adelante sin perder el objetivo total."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <div className="flex gap-2.5">
            <Chip label="26 semanas" active={weeks === 26} onClick={() => setWeeks(26)} />
            <Chip label="52 semanas" active={weeks === 52} onClick={() => setWeeks(52)} />
          </div>
          <SliderControl label="Incremento semanal base" value={baseAmount} min={1} max={20} step={1} unit="€" onChange={setBaseAmount} accent="lavender" />
        </div>
      </Card>

      <Card>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          Tus semanas
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
          {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => {
            const active = done.has(w);
            return (
              <button
                key={w}
                onClick={() => toggleWeek(w)}
                title={`Semana ${w}: ${fmtEUR(weekAmount(w))}`}
                style={{
                  aspectRatio: "1",
                  borderRadius: "0.6rem",
                  border: `1px solid ${active ? T.lime : T.border}`,
                  background: active ? T.limeSoft : T.surfaceAlt,
                  color: active ? T.lime : T.textMuted,
                  ...fontBody,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {w}
              </button>
            );
          })}
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["savings", "roundup"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Reto de ahorro: ${weeks} semanas, incremento base ${fmtEUR(baseAmount)} — objetivo total ${fmtEUR(totalGoal)}, llevas ahorrado ${fmtEUR(savedSoFar)}.`
          }
        />
        <ExportCSVButton
          filename="reto-de-ahorro"
          getRows={() =>
            Array.from({ length: weeks }, (_, i) => i + 1).map((w) => ({
              semana: w,
              importe: weekAmount(w).toFixed(2),
              completada: done.has(w) ? "sí" : "no",
            }))
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          El reto de ahorro progresivo (26 o 52 semanas) es una forma popular de ahorrar sin apenas notarlo: empiezas con cantidades pequeñas y vas subiendo semana a semana. Marca aquí las semanas que completes, activa el modo aleatorio si prefieres no saber de antemano cuándo toca la semana más cara, y consulta si vas al día según la fecha en que empezaste el reto.
        </p>
      </div>
    </div>
  );
}

export default ChallengeTool;
