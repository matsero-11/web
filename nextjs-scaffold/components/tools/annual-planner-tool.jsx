"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Helmet } from "react-helmet-async";

import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { fmtEUR, useAnimatedNumber } from "@/lib/hooks";
import { Card, AdviceBlock, ProgressBar } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";
import { MAX_FINANCIAL_LIMIT } from "@/lib/financial-constants";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
  ssr: false,
});
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
  ssr: false,
});

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const MIN_GOAL = 200;
const MIN_REDUCTION = 10;
const MAX_REDUCTION = 90;
const MAX_LOW_MONTHS = 11;
const TRACK_TOLERANCE_CENTS = 50;
const FINANCIAL_MAX =
  Number.isFinite(MAX_FINANCIAL_LIMIT) && MAX_FINANCIAL_LIMIT > 0
    ? MAX_FINANCIAL_LIMIT
    : 1_000_000;
const MAX_CENTS = Math.round(FINANCIAL_MAX * 100);

const FAQS = [
  {
    q: "¿Cómo reparto mi ahorro anual entre los 12 meses?",
    a: "Puedes dividir tu objetivo anual a partes iguales entre los 12 meses, o marcar los meses más caros como flojos para que el resto de meses absorba automáticamente esa diferencia.",
  },
  {
    q: "¿Qué hago si no llego a ahorrar en un mes concreto?",
    a: "Márcalo como mes flojo: el planificador recalcula cuánto tendrás que ahorrar en los meses normales para llegar a tu objetivo anual.",
  },
  {
    q: "¿Cómo sé si voy adelantado o atrasado respecto a mi plan?",
    a: "Introduce cuánto llevas ahorrado hasta ahora: la herramienta compara esa cifra con lo que deberías haber acumulado según tu plan.",
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function parseFiniteNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;

  const normalized = value.trim().replace(",", ".");
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function readInitialNumber(value, fallback, min, max) {
  const parsed = parseFiniteNumber(value);
  return clamp(parsed ?? fallback, min, max);
}

function toCents(amount) {
  return Math.round((amount + Number.EPSILON) * 100);
}

function fromCents(cents) {
  return cents / 100;
}

function formatInputNumber(value) {
  return Number.isFinite(value) ? String(value) : "0";
}

function parseLowMonths(value) {
  if (typeof value !== "string" || !value.trim()) return [];

  return [...new Set(
    value
      .split(",")
      .map(parseFiniteNumber)
      .filter(
        (month) =>
          month !== null &&
          Number.isInteger(month) &&
          month >= 0 &&
          month < MONTHS.length
      )
  )]
    .slice(0, MAX_LOW_MONTHS)
    .sort((a, b) => a - b);
}

/**
 * Divides an integer-cent total into nearly equal integer-cent amounts.
 * Any remainder is assigned one cent at a time, so the sum always matches.
 */
function distributeCents(totalCents, count) {
  if (count <= 0) return [];
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;

  return Array.from({ length: count }, (_, index) =>
    base + (index < remainder ? 1 : 0)
  );
}

function buildMonthlyPlan(goal, reductionPct, lowMonthIndexes) {
  const goalCents = toCents(goal);
  const lowCount = lowMonthIndexes.length;
  const normalCount = 12 - lowCount;
  const lowTargetCents = Math.round(
    (goalCents / 12) * (1 - reductionPct / 100)
  );
  const lowTotalCents = lowTargetCents * lowCount;
  const normalPoolCents = Math.max(0, goalCents - lowTotalCents);
  const normalAmounts = distributeCents(normalPoolCents, normalCount);
  let normalIndex = 0;

  const monthlyCents = MONTHS.map((_, index) => {
    if (lowMonthIndexes.includes(index)) return lowTargetCents;
    const amount = normalAmounts[normalIndex] ?? 0;
    normalIndex += 1;
    return amount;
  });

  // Guard against rounding drift while keeping low months at the selected reduction.
  const currentTotal = monthlyCents.reduce((sum, amount) => sum + amount, 0);
  const difference = goalCents - currentTotal;
  if (difference !== 0 && normalCount > 0) {
    const firstNormalIndex = MONTHS.findIndex(
      (_, index) => !lowMonthIndexes.includes(index)
    );
    monthlyCents[firstNormalIndex] += difference;
  }

  const normalCents = normalCount > 0
    ? Math.round(
        monthlyCents.reduce(
          (sum, amount, index) =>
            sum + (lowMonthIndexes.includes(index) ? 0 : amount),
          0
        ) / normalCount
      )
    : 0;

  return {
    monthlyCents,
    goalCents,
    lowTargetCents,
    normalCents,
    lowCount,
    normalCount,
  };
}

function getExpectedByDate(monthlyCents, date) {
  if (!date) return null;

  const month = date.getMonth();
  const day = date.getDate();
  const daysInMonth = new Date(date.getFullYear(), month + 1, 0).getDate();

  const completedMonthsCents = monthlyCents
    .slice(0, month)
    .reduce((sum, amount) => sum + amount, 0);
  const currentMonthCents = Math.round(
    (monthlyCents[month] * day) / daysInMonth
  );

  return completedMonthsCents + currentMonthCents;
}

function DecimalSliderRow({
  label,
  value,
  setValue,
  min,
  max,
  step = 0.01,
  unit = "€",
  accent = "lime",
  subtitle,
  id,
}) {
  const generatedId = useId();
  const inputId = id ?? `decimal-${generatedId}`;
  const subtitleId = `${inputId}-description`;
  const [textVal, setTextVal] = useState(formatInputNumber(value));
  const isFocused = useRef(false);
  const accentColor = accent === "lavender" ? T.lavender : T.lime;

  useEffect(() => {
    if (!isFocused.current) setTextVal(formatInputNumber(value));
  }, [value]);

  const commitTextValue = () => {
    isFocused.current = false;
    const parsed = parseFiniteNumber(textVal);

    if (parsed === null) {
      setTextVal(formatInputNumber(value));
      return;
    }

    const nextValue = clamp(parsed, min, max);
    setValue(nextValue);
    setTextVal(formatInputNumber(nextValue));
  };

  const handleInputChange = (event) => {
    const raw = event.target.value;
    setTextVal(raw);
    const parsed = parseFiniteNumber(raw);
    if (parsed !== null) setValue(clamp(parsed, min, max));
  };

  const safeValue = clamp(Number.isFinite(value) ? value : min, min, max);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-center gap-3">
        <label
          htmlFor={inputId}
          style={{
            ...fontBody,
            color: T.text,
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          {label}
        </label>

        <div
          className="flex items-center gap-1 rounded-xl border px-2.5 py-2"
          style={{
            background: T.surfaceAlt,
            borderColor: T.border,
          }}
        >
          <input
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={textVal}
            aria-describedby={subtitle ? subtitleId : undefined}
            onFocus={() => { isFocused.current = true; }}
            onChange={handleInputChange}
            onBlur={commitTextValue}
            className="bg-transparent text-right font-semibold"
            style={{
              ...fontBody,
              color: accentColor,
              fontSize: "0.95rem",
              width: "clamp(64px, 18vw, 90px)",
              outline: "none",
            }}
          />
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>
            {unit}
          </span>
        </div>
      </div>

      {subtitle && (
        <div
          id={subtitleId}
          style={{
            ...fontBody,
            color: T.textMuted,
            fontSize: "0.78rem",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </div>
      )}

      <input
        type="range"
        aria-label={`${label}, deslizador`}
        min={min}
        max={max}
        step={step}
        value={safeValue}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          if (!Number.isFinite(parsed)) return;
          const nextValue = clamp(parsed, min, max);
          setValue(nextValue);
          setTextVal(formatInputNumber(nextValue));
        }}
        className="w-full cursor-pointer h-1.5 rounded-lg appearance-none bg-[var(--surface-alt,rgba(255,255,255,0.1))] accent-current"
        style={{ accentColor }}
      />
      <div
        className="flex justify-between"
        style={{ ...fontBody, color: T.textMuted, fontSize: "0.7rem" }}
      >
        <span>{unit === "%" ? `${min}%` : fmtEUR(min)}</span>
        <span>{unit === "%" ? `${max}%` : fmtEUR(max)}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, detail, accent = T.lime }) {
  return (
    <div
      className="rounded-xl p-3 sm:p-4"
      style={{
        background: T.surfaceAlt,
        border: `1px solid ${T.border}`,
      }}
    >
      <div
        style={{
          ...fontBody,
          color: T.textMuted,
          fontSize: "0.76rem",
          marginBottom: "0.35rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          ...fontDisplay,
          color: accent,
          fontSize: "clamp(1.05rem, 4vw, 1.4rem)",
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      {detail && (
        <div
          style={{
            ...fontBody,
            color: T.textMuted,
            fontSize: "0.72rem",
            marginTop: "0.35rem",
            lineHeight: 1.45,
          }}
        >
          {detail}
        </div>
      )}
    </div>
  );
}

function AnnualPlannerTool({
  onBack,
  onNavigate,
  initialParams = {},
  onStateChange,
}) {
  const [goal, setGoal] = useState(() =>
    readInitialNumber(initialParams?.goal, 3600, MIN_GOAL, FINANCIAL_MAX)
  );
  const [lowMonthsArray, setLowMonthsArray] = useState(() =>
    parseLowMonths(initialParams?.lowMonths)
  );
  const [reductionPct, setReductionPct] = useState(() =>
    readInitialNumber(
      initialParams?.reductionPct,
      50,
      MIN_REDUCTION,
      MAX_REDUCTION
    )
  );
  const [currentSaved, setCurrentSaved] = useState(() =>
    readInitialNumber(initialParams?.currentSaved, 0, 0, FINANCIAL_MAX)
  );
  const [today, setToday] = useState(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const lowMonths = useMemo(() => new Set(lowMonthsArray), [lowMonthsArray]);
  const plan = useMemo(
    () => buildMonthlyPlan(goal, reductionPct, lowMonthsArray),
    [goal, reductionPct, lowMonthsArray]
  );
  const {
    monthlyCents,
    goalCents,
    lowTargetCents,
    normalCents,
    lowCount,
    normalCount,
  } = plan;
  const monthlyAmounts = useMemo(
    () => monthlyCents.map(fromCents),
    [monthlyCents]
  );
  const totalCents = monthlyCents.reduce((sum, amount) => sum + amount, 0);
  const realMonth = today ? today.getMonth() : null;
  const expectedCents = getExpectedByDate(monthlyCents, today);
  const savedCents = toCents(clamp(currentSaved, 0, FINANCIAL_MAX));
  const diffCents = expectedCents === null ? 0 : savedCents - expectedCents;
  const animatedDiff = useAnimatedNumber(Math.abs(fromCents(diffCents)));
  const isAhead = diffCents > TRACK_TOLERANCE_CENTS;
  const isBehind = diffCents < -TRACK_TOLERANCE_CENTS;
  const isOnTrack = !isAhead && !isBehind;
  const yearPct = goalCents > 0
    ? clamp((savedCents / goalCents) * 100, 0, 100)
    : 0;
  const isGoalAchieved = savedCents >= goalCents && goalCents > 0;

  const chartData = MONTHS.map((month, index) => ({
    mes: month,
    importe: fromCents(monthlyCents[index]),
    isLow: lowMonths.has(index),
    isCurrent: index === realMonth,
  }));

  const toggleMonth = (index) => {
    setLowMonthsArray((previous) => {
      const next = new Set(previous);
      if (next.has(index)) {
        next.delete(index);
      } else if (next.size < MAX_LOW_MONTHS) {
        next.add(index);
      }
      return [...next].sort((a, b) => a - b);
    });
  };

  useEffect(() => {
    if (typeof onStateChange !== "function") return;
    onStateChange({
      goal,
      reductionPct,
      currentSaved,
      lowMonths: lowMonthsArray.length ? lowMonthsArray.join(",") : null,
    });
  }, [goal, reductionPct, currentSaved, lowMonthsArray, onStateChange]);

  const pageTitle =
    "Planificador de ahorro anual: reparte tu meta entre los 12 meses | MetaBox";
  const pageDescription =
    "Organiza tu objetivo de ahorro anual marcando meses flojos. El planificador recalcula el resto de meses automáticamente con soporte de decimales.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/annual";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Planificador de ahorro anual",
            url: pageUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            inLanguage: "es",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
            },
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
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
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
            <div
              style={{
                ...fontDisplay,
                color: T.text,
                fontSize: "1.1rem",
                fontWeight: 700,
                marginBottom: "0.35rem",
              }}
            >
              Diseña tu objetivo
            </div>
            <div
              style={{
                ...fontBody,
                color: T.textMuted,
                fontSize: "0.82rem",
                lineHeight: 1.5,
              }}
            >
              Ajusta la meta y la reducción que quieres aplicar a los meses con más gastos.
            </div>
          </div>

          <DecimalSliderRow
            label="Objetivo anual"
            value={goal}
            setValue={setGoal}
            min={MIN_GOAL}
            max={FINANCIAL_MAX}
            step={50}
            unit="€"
            subtitle="Cantidad total que quieres ahorrar durante los 12 meses."
            id="annual-savings-goal"
          />

          <DecimalSliderRow
            label="Reducción en meses flojos"
            value={reductionPct}
            setValue={setReductionPct}
            min={MIN_REDUCTION}
            max={MAX_REDUCTION}
            step={1}
            unit="%"
            accent="lavender"
            subtitle="Porcentaje menos que un mes flojo respecto al reparto mensual inicial."
            id="annual-savings-reduction"
          />
        </div>
      </Card>

      <Card glow result style={{ padding: "1.2rem" }}>
        <div className="text-center">
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>
            Objetivo anual planificado
          </div>
          <div
            style={{
              ...fontDisplay,
              color: T.lime,
              fontSize: "clamp(2rem, 8vw, 2.7rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              margin: "0.35rem 0",
            }}
          >
            {fmtEUR(fromCents(totalCents))}
          </div>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>
            {lowCount === 0
              ? "Repartido entre los 12 meses"
              : `${lowCount} ${lowCount === 1 ? "mes flojo" : "meses flojos"} · ${normalCount} ${normalCount === 1 ? "mes normal" : "meses normales"}`}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <Stat
            label="Mes normal"
            value={fmtEUR(fromCents(normalCents))}
            detail="Ahorro aproximado por mes"
            accent={T.lime}
          />
          <Stat
            label="Mes flojo"
            value={fmtEUR(fromCents(lowTargetCents))}
            detail={`${reductionPct}% menos que la referencia inicial`}
            accent={T.lavender}
          />
        </div>

        <div
          className="mt-5"
          style={{ width: "100%", height: "210px" }}
          role="img"
          aria-label="Gráfica del ahorro previsto para cada mes"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
            >
              <XAxis
                dataKey="mes"
                stroke={T.textMuted}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => [
                  fmtEUR(Number(value)),
                  "Ahorro previsto",
                ]}
                contentStyle={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: T.text,
                }}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar
                dataKey="importe"
                radius={[5, 5, 0, 0]}
                animationDuration={350}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`month-${index}`}
                    fill={entry.isLow ? T.lavender : T.lime}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-x-5 gap-y-2 mt-3 flex-wrap">
          <div
            className="flex items-center gap-2"
            style={{ ...fontBody, fontSize: "0.8rem" }}
          >
            <span
              className="inline-block rounded-full w-2.5 h-2.5"
              style={{ backgroundColor: T.lime }}
            />
            <span style={{ color: T.text }}>Mes normal</span>
          </div>
          <div
            className="flex items-center gap-2"
            style={{ ...fontBody, fontSize: "0.8rem" }}
          >
            <span
              className="inline-block rounded-full w-2.5 h-2.5"
              style={{ backgroundColor: T.lavender }}
            />
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
          <div
            style={{
              ...fontDisplay,
              color: T.text,
              fontWeight: 700,
              fontSize: "1.1rem",
            }}
          >
            Personaliza cada mes
          </div>
          <div
            style={{
              ...fontBody,
              color: T.textMuted,
              fontSize: "0.82rem",
              lineHeight: 1.5,
            }}
          >
            Selecciona los meses en los que necesitas ahorrar menos. Puedes marcar hasta 11 para que quede al menos un mes normal que absorba la diferencia.
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {MONTHS.map((month, index) => {
            const low = lowMonths.has(index);
            const isPast = realMonth !== null && index < realMonth;
            const isCurrent = index === realMonth;

            return (
              <button
                key={month}
                type="button"
                onClick={() => toggleMonth(index)}
                aria-pressed={low}
                aria-label={`${month}: ${low ? "mes flojo" : "mes normal"}. ${fmtEUR(fromCents(monthlyCents[index]))} previstos`}
                style={{
                  borderRadius: "0.9rem",
                  padding: "0.85rem 0.35rem",
                  border: `1px solid ${low ? T.lavender : isCurrent ? T.lime : T.border}`,
                  background: low ? T.lavenderSoft : T.surfaceAlt,
                  color: T.text,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "border-color 160ms ease, background 160ms ease, transform 160ms ease",
                  opacity: isPast ? 0.78 : 1,
                  position: "relative",
                  minHeight: "76px",
                }}
              >
                {isCurrent && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-7px",
                      right: "-4px",
                      background: T.lime,
                      color: "#111",
                      fontSize: "0.58rem",
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      padding: "2px 5px",
                      borderRadius: "5px",
                    }}
                  >
                    ACTUAL
                  </span>
                )}

                <div
                  style={{
                    ...fontBody,
                    color: low ? T.lavender : T.text,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  {month}
                </div>
                <div
                  style={{
                    ...fontBody,
                    color: T.textMuted,
                    fontSize: "0.72rem",
                    marginTop: "0.35rem",
                  }}
                >
                  {fmtEUR(fromCents(monthlyCents[index]))}
                </div>
                <div
                  style={{
                    ...fontBody,
                    color: low ? T.lavender : T.textMuted,
                    fontSize: "0.63rem",
                    marginTop: "0.2rem",
                  }}
                >
                  {low ? "Flojo" : "Normal"}
                </div>
              </button>
            );
          })}
        </div>

        {lowCount === MAX_LOW_MONTHS && (
          <p
            role="status"
            style={{
              ...fontBody,
              color: T.textMuted,
              fontSize: "0.78rem",
              lineHeight: 1.5,
              marginTop: "0.8rem",
            }}
          >
            Has marcado el máximo de meses flojos. Desmarca uno para poder seleccionar otro.
          </p>
        )}
      </Card>

      <Card style={{ padding: "1.2rem" }}>
        <div
          style={{
            ...fontDisplay,
            color: T.text,
            fontWeight: 700,
            fontSize: "1.1rem",
            marginBottom: "1rem",
          }}
        >
          Tu seguimiento anual
        </div>

        {isGoalAchieved && (
          <div
            role="status"
            style={{
              background: `linear-gradient(135deg, ${T.lime}15, ${T.lavender}15)`,
              border: `1px solid ${T.lime}`,
              borderRadius: "0.9rem",
              padding: "1rem",
              textAlign: "center",
              marginBottom: "1.1rem",
            }}
          >
            <div
              style={{
                ...fontDisplay,
                color: T.lime,
                fontSize: "1rem",
                fontWeight: 800,
              }}
            >
              Objetivo anual cumplido
            </div>
            <div
              style={{
                ...fontBody,
                color: T.textMuted,
                fontSize: "0.8rem",
                marginTop: "0.3rem",
                lineHeight: 1.5,
              }}
            >
              Has alcanzado tu meta de {fmtEUR(fromCents(goalCents))}. ¡Buen trabajo manteniendo tu plan!
            </div>
          </div>
        )}

        <DecimalSliderRow
          label="Ya ahorrado este año"
          value={currentSaved}
          setValue={setCurrentSaved}
          min={0}
          max={FINANCIAL_MAX}
          step={50}
          accent="lavender"
          subtitle="Introduce el total que has ahorrado desde el comienzo del año."
          id="annual-savings-current"
        />

        <div className="mt-5">
          <div className="flex justify-between items-baseline gap-3 mb-2">
            <span
              style={{
                ...fontBody,
                color: T.textMuted,
                fontSize: "0.8rem",
              }}
            >
              Progreso hacia tu meta
            </span>
            <span
              style={{
                ...fontBody,
                color: T.text,
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            >
              {yearPct.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%
            </span>
          </div>

          <ProgressBar pct={yearPct} gradientEnd={T.lavender} />

          <div
            className="flex justify-between gap-3 mt-2"
            style={{
              ...fontBody,
              color: T.textMuted,
              fontSize: "0.78rem",
            }}
          >
            <span>Ahorrado: {fmtEUR(fromCents(savedCents))}</span>
            <span>Meta: {fmtEUR(fromCents(goalCents))}</span>
          </div>
        </div>

        <div
          aria-live="polite"
          className="rounded-xl p-4 mt-5"
          style={{
            background: T.surfaceAlt,
            border: `1px solid ${isOnTrack ? T.border : isAhead ? T.lime : T.coral}`,
          }}
        >
          <div
            style={{
              ...fontBody,
              color: T.textMuted,
              fontSize: "0.78rem",
              marginBottom: "0.35rem",
            }}
          >
            {today
              ? `Referencia a ${today.getDate()} de ${MONTHS[today.getMonth()]}`
              : "Calculando referencia del año"}
          </div>

          {expectedCents === null ? (
            <div style={{ ...fontBody, color: T.text, fontSize: "0.88rem" }}>
              Preparando el seguimiento del año…
            </div>
          ) : (
            <>
              <div
                style={{
                  ...fontBody,
                  color: T.text,
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                }}
              >
                Según tu plan, a estas alturas deberías llevar{" "}
                <strong>{fmtEUR(fromCents(expectedCents))}</strong>.
              </div>

              <div
                style={{
                  ...fontDisplay,
                  color: isOnTrack ? T.lime : isAhead ? T.lime : T.coral,
                  fontSize: "1rem",
                  fontWeight: 800,
                  marginTop: "0.5rem",
                }}
              >
                {isOnTrack
                  ? "Vas según el plan"
                  : isAhead
                    ? `Vas ${fmtEUR(animatedDiff)} por delante`
                    : `Vas ${fmtEUR(animatedDiff)} por detrás`}
              </div>

              <div
                style={{
                  ...fontBody,
                  color: T.textMuted,
                  fontSize: "0.75rem",
                  lineHeight: 1.5,
                  marginTop: "0.35rem",
                }}
              >
                La referencia se prorratea por los días transcurridos del mes actual; es una guía orientativa, no una obligación diaria.
              </div>
            </>
          )}
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools
        ids={["savings", "challenge"]}
        onNavigate={onNavigate}
        primaryId="savings"
      />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Plan de ahorro anual: objetivo ${fmtEUR(fromCents(goalCents))}; ${lowCount} meses flojos; ahorro acumulado ${fmtEUR(fromCents(savedCents))}; referencia del plan ${expectedCents === null ? "pendiente de calcular" : fmtEUR(fromCents(expectedCents))}.`
          }
        />

        <ExportCSVButton
          filename="planificador-ahorro-anual"
          getRows={() =>
            MONTHS.map((month, index) => ({
              mes: month,
              importe: fromCents(monthlyCents[index]).toFixed(2),
              tipo: lowMonths.has(index) ? "flojo" : "normal",
            }))
          }
        />
      </div>

      <div
        style={{
          ...fontBody,
          color: T.textMuted,
          fontSize: "0.82rem",
          lineHeight: 1.7,
          borderTop: `1px solid ${T.border}`,
          paddingTop: "1.2rem",
        }}
      >
        <p>
          Ahorrar la misma cantidad todos los meses no siempre es realista: hay
          meses con gastos extra, como vacaciones, Navidad o la vuelta al cole,
          que rompen cualquier plan fijo. Este planificador te permite marcar
          esos meses como flojos, ajustar cuánto se reduce cada uno y comparar
          tu ahorro acumulado con el que deberías llevar según tu plan. Las
          cifras son una planificación orientativa y no constituyen
          asesoramiento financiero.
        </p>
      </div>
    </div>
  );
}

export default AnnualPlannerTool;
