"use client";

import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";

import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { fmtEUR, useAnimatedNumber } from "@/lib/hooks";
import { Card, AdviceBlock, ProgressBar, DecimalSliderRow } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";
import { MAX_FINANCIAL_LIMIT } from "@/lib/financial-constants";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const MIN_GOAL = 100;
const MIN_REDUCTION = 5;
const MAX_REDUCTION = 50;
const MAX_LOW_MONTHS = 11;

function toCents(val) {
  const num = Number(val);
  return Number.isFinite(num) ? Math.round(num * 100) : 0;
}

function fromCents(cents) {
  const num = Number(cents);
  return Number.isFinite(num) ? num / 100 : 0;
}

export function AnnualPlannerTool({ onBack, onNavigate }) {
  const pageUrl = typeof window !== "undefined" ? window.location.href : "https://metabox.app/herramientas/planificador-anual";
  const pageDescription = "Planifica tu ahorro anual marcando los meses más difíciles y ajustando el resto de forma inteligente.";

  const [goal, setGoal] = useState(6000);
  const [reductionPct, setReductionPct] = useState(20);
  const [lowMonths, setLowMonths] = useState(() => new Set([7, 11])); // Agosto y Diciembre por defecto
  const [currentSaved, setCurrentSaved] = useState(1200);

  const goalCents = toCents(goal);
  const savedCents = toCents(currentSaved);

  const toggleMonth = (index) => {
    setLowMonths((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        if (next.size < MAX_LOW_MONTHS) {
          next.add(index);
        }
      }
      return next;
    });
  };

  const lowCount = lowMonths.size;
  const normalCount = 12 - lowCount;

  // Cálculo matemático preciso con céntimos
  const { monthlyCents, normalCents, lowTargetCents, totalCents } = useMemo(() => {
    if (normalCount <= 0) {
      const base = Math.round(goalCents / 12);
      const arr = Array(12).fill(base);
      return { monthlyCents: arr, normalCents: base, lowTargetCents: base, totalCents: base * 12 };
    }

    const baseMonthlyRef = goalCents / 12;
    const reductionFactor = reductionPct / 100;
    const lowTarget = Math.max(0, Math.round(baseMonthlyRef * (1 - reductionFactor)));
    
    const totalLowCents = lowTarget * lowCount;
    const remainingCents = goalCents - totalLowCents;
    const normalTarget = Math.max(0, Math.round(remainingCents / normalCount));

    const arr = MONTHS.map((_, i) => (lowMonths.has(i) ? lowTarget : normalTarget));
    const computedTotal = arr.reduce((acc, val) => acc + val, 0);

    return {
      monthlyCents: arr,
      normalCents: normalTarget,
      lowTargetCents: lowTarget,
      totalCents: computedTotal,
    };
  }, [goalCents, reductionPct, lowMonths, normalCount]);

  const today = useMemo(() => new Date(), []);
  const realMonth = today ? today.getMonth() : null;

  const yearPct = goalCents > 0 ? Math.min(100, Math.max(0, (savedCents / goalCents) * 100)) : 0;
  const isGoalAchieved = savedCents >= goalCents;

  const expectedCents = useMemo(() => {
    if (realMonth === null) return 0;
    let sum = 0;
    for (let i = 0; i <= realMonth; i++) {
      sum += monthlyCents[i] || 0;
    }
    const daysInMonth = new Date(today.getFullYear(), realMonth + 1, 0).getDate();
    const dayProgress = today.getDate() / daysInMonth;
    const currentMonthProrated = (monthlyCents[realMonth] || 0) * dayProgress;
    const pastMonthsSum = sum - (monthlyCents[realMonth] || 0);
    return Math.round(pastMonthsSum + currentMonthProrated);
  }, [monthlyCents, realMonth, today]);

  const diffCents = savedCents - (expectedCents || 0);
  const isOnTrack = Math.abs(diffCents) < 5000;
  const isAhead = diffCents >= 5000;
  const animatedDiff = useAnimatedNumber(Math.abs(fromCents(diffCents)));

  const chartData = useMemo(() => {
    return MONTHS.map((month, index) => ({
      mes: month.slice(0, 3),
      importe: fromCents(monthlyCents[index]),
      isLow: lowMonths.has(index),
      isCurrent: index === realMonth,
    }));
  }, [monthlyCents, lowMonths, realMonth]);

  const FAQS = [
    {
      q: "¿Cómo se calculan los meses flojos?",
      a: "Los meses flojos reducen su aportación según el porcentaje elegido, y la diferencia se redistribuye entre los meses normales restantes."
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 pb-12">
      <Helmet>
        <title>Planificador de ahorro anual | MetaBox</title>
        <meta name="description" content={pageDescription} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Planificador de ahorro anual",
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
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          })}
        </script>
      </Helmet>

      <ToolHeader
        title="Planificador de ahorro anual"
        subtitle="Marca los meses más difíciles: el resto se ajusta solo para llegar al objetivo."
        onBack={onBack}
      />

      <Card style={{ padding: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <div>
            <div style={{ ...fontDisplay, color: T.text, fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.35rem" }}>
              Diseña tu objetivo
            </div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.5 }}>
              Ajusta la meta y la reducción que quieres aplicar a los meses con más gastos.
            </div>
          </div>

          <DecimalSliderRow
            label="Objetivo anual"
            value={goal}
            onChange={setGoal}
            min={MIN_GOAL}
            max={MAX_FINANCIAL_LIMIT}
            step={50}
            unit="€"
            subtitle="Cantidad total que quieres ahorrar durante los 12 meses."
          />

          <DecimalSliderRow
            label="Reducción en meses flojos"
            value={reductionPct}
            onChange={setReductionPct}
            min={MIN_REDUCTION}
            max={MAX_REDUCTION}
            step={1}
            unit="%"
            accent="lavender"
            subtitle="Porcentaje menos que un mes flojo respecto al reparto mensual inicial."
          />
        </div>
      </Card>

      <Card glow result style={{ padding: "1.2rem" }}>
        <div className="text-center">
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>
            Objetivo anual planificado
          </div>

          <div style={{ ...fontDisplay, color: T.lime, fontSize: "clamp(2rem, 8vw, 2.7rem)", fontWeight: 800, lineHeight: 1.15, margin: "0.35rem 0" }}>
            {fmtEUR(fromCents(totalCents))}
          </div>

          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>
            {lowCount === 0
              ? "Repartido entre los 12 meses"
              : `${lowCount} ${lowCount === 1 ? "mes flojo" : "meses flojos"} · ${normalCount} ${normalCount === 1 ? "mes normal" : "meses normales"}`}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div style={{ background: T.surfaceAlt, padding: "0.9rem", borderRadius: "0.8rem", textAlign: "center" }}>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem" }}>Mes normal</div>
            <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.1rem", fontWeight: 700, marginTop: "0.2rem" }}>
              {fmtEUR(fromCents(normalCents))}
            </div>
          </div>
          <div style={{ background: T.surfaceAlt, padding: "0.9rem", borderRadius: "0.8rem", textAlign: "center" }}>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem" }}>Mes flojo</div>
            <div style={{ ...fontDisplay, color: T.lavender, fontSize: "1.1rem", fontWeight: 700, marginTop: "0.2rem" }}>
              {fmtEUR(fromCents(lowTargetCents))}
            </div>
          </div>
        </div>

        {/* Gráfica SVG interactiva adaptativa */}
        <div
          className="mt-6"
          role="img"
          aria-label="Gráfica de barras del ahorro previsto para cada mes"
          style={{ width: "100%", height: "220px", position: "relative" }}
        >
          <svg viewBox="0 0 360 220" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ display: "block" }}>
            {Array.from({ length: 4 }, (_, index) => {
              const y = 18 + index * 48;
              return <line key={`grid-${index}`} x1="8" x2="354" y1={y} y2={y} stroke={T.border} strokeWidth="1" strokeDasharray="3 4" />;
            })}

            {chartData.map((entry, index) => {
              const maxAmount = Math.max(...chartData.map((item) => item.importe), 1);
              const chartTop = 18;
              const chartHeight = 150;
              const barWidth = 17;
              const gap = 11.5;
              const x = 11 + index * (barWidth + gap);
              const barHeight = Math.max(3, (entry.importe / maxAmount) * chartHeight);
              const y = chartTop + chartHeight - barHeight;
              const barColor = entry.isLow ? T.lavender : T.lime;

              return (
                <g key={`bar-${entry.mes}`}>
                  <rect x={x} y={y} width={barWidth} height={barHeight} rx="3" fill={barColor} opacity={entry.isCurrent ? 1 : 0.85} />
                  {entry.isCurrent && (
                    <rect x={x - 2} y={y - 3} width={barWidth + 4} height={barHeight + 6} rx="4" fill="none" stroke={T.text} strokeWidth="1" opacity="0.7" />
                  )}
                  <text x={x + barWidth / 2} y="188" fill={T.textMuted} fontSize="9" textAnchor="middle">{entry.mes}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex justify-center gap-x-5 gap-y-2 mt-2 flex-wrap">
          <div className="flex items-center gap-2" style={{ ...fontBody, fontSize: "0.8rem" }}>
            <span className="inline-block rounded-full w-2.5 h-2.5" style={{ backgroundColor: T.lime }} />
            <span style={{ color: T.text }}>Mes normal</span>
          </div>
          <div className="flex items-center gap-2" style={{ ...fontBody, fontSize: "0.8rem" }}>
            <span className="inline-block rounded-full w-2.5 h-2.5" style={{ backgroundColor: T.lavender }} />
            <span style={{ color: T.text }}>Mes flojo</span>
          </div>
        </div>
      </Card>

      <AdviceBlock
        text={
          lowCount === 0
            ? "Tu objetivo está repartido entre los 12 meses. Marca los meses en los que prevés más gastos para ajustar el plan a tu realidad."
            : `Has marcado ${lowCount} ${lowCount === 1 ? "mes flojo" : "meses flojos"}. Los meses normales se ajustan para mantener el objetivo anual de ${fmtEUR(fromCents(goalCents))}.`
        }
      />

      <Card style={{ padding: "1.2rem" }}>
        <div className="flex flex-col gap-2 mb-4">
          <div style={{ ...fontDisplay, color: T.text, fontWeight: 700, fontSize: "1.1rem" }}>
            Personaliza cada mes
          </div>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.5 }}>
            Selecciona los meses en los que necesitas ahorrar menos. Puedes marcar hasta 11.
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {MONTHS.map((month, index) => {
            const low = lowMonths.has(index);
            const isCurrent = index === realMonth;

            return (
              <button
                key={month}
                type="button"
                onClick={() => toggleMonth(index)}
                aria-pressed={low}
                style={{
                  borderRadius: "0.9rem",
                  padding: "0.85rem 0.35rem",
                  border: `1px solid ${low ? T.lavender : isCurrent ? T.lime : T.border}`,
                  background: low ? T.lavenderSoft : T.surfaceAlt,
                  color: T.text,
                  cursor: "pointer",
                  textAlign: "center",
                  position: "relative",
                  minHeight: "76px",
                }}
              >
                {isCurrent && (
                  <span style={{ position: "absolute", top: "-7px", right: "-4px", background: T.lime, color: "#111", fontSize: "0.58rem", fontWeight: 800, padding: "2px 5px", borderRadius: "5px" }}>
                    ACTUAL
                  </span>
                )}
                <div style={{ ...fontBody, color: low ? T.lavender : T.text, fontSize: "0.8rem", fontWeight: 700 }}>
                  {month}
                </div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem", marginTop: "0.35rem" }}>
                  {fmtEUR(fromCents(monthlyCents[index]))}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card style={{ padding: "1.2rem" }}>
        <div style={{ ...fontDisplay, color: T.text, fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem" }}>
          Tu seguimiento anual
        </div>

        {isGoalAchieved && (
          <div style={{ background: `linear-gradient(135deg, ${T.lime}15, ${T.lavender}15)`, border: `1px solid ${T.lime}`, borderRadius: "0.9rem", padding: "1rem", textAlign: "center", marginBottom: "1.1rem" }}>
            <div style={{ ...fontDisplay, color: T.lime, fontSize: "1rem", fontWeight: 800 }}>Objetivo anual cumplido</div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", marginTop: "0.3rem" }}>Has alcanzado tu meta de {fmtEUR(fromCents(goalCents))}. ¡Enhorabuena!</div>
          </div>
        )}

        <DecimalSliderRow
          label="Ya ahorrado este año"
          value={currentSaved}
          onChange={setCurrentSaved}
          min={0}
          max={MAX_FINANCIAL_LIMIT}
          step={50}
          accent="lavender"
          subtitle="Introduce el total que has ahorrado desde el comienzo del año."
        />

        <div className="mt-5">
          <div className="flex justify-between items-baseline gap-3 mb-2">
            <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>Progreso hacia tu meta</span>
            <span style={{ ...fontBody, color: T.text, fontSize: "0.85rem", fontWeight: 700 }}>
              {yearPct.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%
            </span>
          </div>
          <ProgressBar pct={yearPct} gradientEnd={T.lavender} />
          <div className="flex justify-between gap-3 mt-2" style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>
            <span>Ahorrado: {fmtEUR(fromCents(savedCents))}</span>
            <span>Meta: {fmtEUR(fromCents(goalCents))}</span>
          </div>
        </div>

        <div aria-live="polite" className="rounded-xl p-4 mt-5" style={{ background: T.surfaceAlt, border: `1px solid ${isOnTrack ? T.border : isAhead ? T.lime : T.coral}` }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", marginBottom: "0.35rem" }}>
            {today ? `Referencia a ${today.getDate()} de ${MONTHS[today.getMonth()]}` : "Calculando referencia"}
          </div>
          <div style={{ ...fontBody, color: T.text, fontSize: "0.9rem", lineHeight: 1.5 }}>
            Según tu plan, a estas alturas deberías llevar <strong>{fmtEUR(fromCents(expectedCents))}</strong>.
          </div>
          <div style={{ ...fontDisplay, color: isOnTrack || isAhead ? T.lime : T.coral, fontSize: "1rem", fontWeight: 800, marginTop: "0.5rem" }}>
            {isOnTrack ? "Vas según el plan" : isAhead ? `Vas ${fmtEUR(animatedDiff)} por delante` : `Vas ${fmtEUR(animatedDiff)} por detrás`}
          </div>
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["savings", "challenge"]} onNavigate={onNavigate} primaryId="savings" />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton getText={() => `Plan de ahorro anual: objetivo ${fmtEUR(fromCents(goalCents))}; ${lowCount} meses flojos.`} />
        <ExportCSVButton filename="planificador-ahorro-anual" getRows={() => MONTHS.map((m, i) => ({ mes: m, importe: fromCents(monthlyCents[i]).toFixed(2) }))} />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.7, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>Ahorrar la misma cantidad todos los meses no siempre es realista. Este planificador te permite marcar meses flojos y comparar tu progreso real con tu planificación orientativa.</p>
      </div>
    </div>
  );
}

export default AnnualPlannerTool;
                    
