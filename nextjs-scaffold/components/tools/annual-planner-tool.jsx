
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
const Bar = dynamic(
  () => import("recharts").then((mod) => mod.Bar),
  { ssr: false }
);
const Cell = dynamic(
  () => import("recharts").then((mod) => mod.Cell),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
);

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const MIN_GOAL = 200;
const MIN_REDUCTION = 10;
const MAX_REDUCTION = 90;
const MAX_LOW_MONTHS = 11;
const TRACK_TOLERANCE = 0.5;

const FINANCIAL_MAX =
  Number.isFinite(MAX_FINANCIAL_LIMIT) && MAX_FINANCIAL_LIMIT > 0
    ? MAX_FINANCIAL_LIMIT
    : 1_000_000;

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
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const normalized = value.trim().replace(",", ".");

  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function readInitialNumber(value, fallback, min, max) {
  const parsed = parseFiniteNumber(value);
  return clamp(parsed ?? fallback, min, max);
}

function parseLowMonths(value) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  const validMonths = value
    .split(",")
    .map((item) => parseFiniteNumber(item))
    .filter(
      (month) =>
        month !== null &&
        Number.isInteger(month) &&
        month >= 0 &&
        month < MONTHS.length
    );

  return [...new Set(validMonths)]
    .slice(0, MAX_LOW_MONTHS)
    .sort((a, b) => a - b);
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
}) {
  const [textVal, setTextVal] = useState(String(value ?? 0));
  const isFocused = useRef(false);

  const accentColor = accent === "lavender" ? T.lavender : T.lime;

  useEffect(() => {
    if (!isFocused.current) {
      setTextVal(String(value ?? 0));
    }
  }, [value]);

  const commitTextValue = () => {
    isFocused.current = false;

    const parsed = parseFiniteNumber(textVal);

    if (parsed === null) {
      setTextVal(String(value ?? 0));
      return;
    }

    const nextValue = clamp(parsed, min, max);
    setValue(nextValue);
    setTextVal(String(nextValue));
  };

  const handleInputChange = (event) => {
    const raw = event.target.value;
    setTextVal(raw);

    const parsed = parseFiniteNumber(raw);

    if (parsed !== null) {
      setValue(clamp(parsed, min, max));
    }
  };

  const safeValue = clamp(
    Number.isFinite(value) ? value : min,
    min,
    max
  );

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-baseline gap-3">
        <label
          style={{
            ...fontBody,
            color: T.text,
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          {label}
        </label>

        <div className="flex items-center gap-1 bg-[var(--surface-alt,rgba(255,255,255,0.03))] px-2.5 py-1 rounded-lg border border-[var(--border,rgba(255,255,255,0.08))]">
          <input
            type="text"
            inputMode="decimal"
            value={textVal}
            aria-label={label}
            onFocus={() => {
              isFocused.current = true;
            }}
            onChange={handleInputChange}
            onBlur={commitTextValue}
            className="bg-transparent text-right font-semibold"
            style={{
              ...fontBody,
              color: accentColor,
              fontSize: "0.9rem",
              width: "85px",
              outline: "none",
            }}
          />
          <span
            style={{
              ...fontBody,
              color: T.textMuted,
              fontSize: "0.8rem",
            }}
          >
            {unit}
          </span>
        </div>
      </div>

      {subtitle && (
        <div
          style={{
            ...fontBody,
            color: T.textMuted,
            fontSize: "0.78rem",
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
          setTextVal(String(nextValue));
        }}
        className="w-full cursor-pointer h-1.5 rounded-lg appearance-none bg-[var(--surface-alt,rgba(255,255,255,0.1))] accent-current"
        style={{ accentColor }}
      />
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
    readInitialNumber(
      initialParams?.currentSaved,
      0,
      0,
      FINANCIAL_MAX
    )
  );

  const lowMonths = useMemo(
    () => new Set(lowMonthsArray),
    [lowMonthsArray]
  );

  const realMonth = new Date().getMonth();

  const evenShare = goal / 12;
  const lowShare = evenShare * (1 - reductionPct / 100);
  const lowCount = lowMonths.size;
  const normalCount = 12 - lowCount;

  const normalShare =
    normalCount > 0
      ? (goal - lowCount * lowShare) / normalCount
      : 0;

  const monthlyAmounts = useMemo(
    () =>
      MONTHS.map((_, index) =>
        lowMonths.has(index) ? lowShare : normalShare
      ),
    [lowMonths, lowShare, normalShare]
  );

  const total = monthlyAmounts.reduce((sum, amount) => sum + amount, 0);

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
      lowMonths: lowMonthsArray.length
        ? lowMonthsArray.join(",")
        : null,
    });
  }, [
    goal,
    reductionPct,
    currentSaved,
    lowMonthsArray,
    onStateChange,
  ]);

  const chartData = MONTHS.map((month, index) => ({
    mes: month,
    importe: monthlyAmounts[index],
    isLow: lowMonths.has(index),
    isCurrent: index === realMonth,
  }));

  const expectedByNow = useMemo(
    () =>
      monthlyAmounts
        .slice(0, realMonth + 1)
        .reduce((sum, amount) => sum + amount, 0),
    [monthlyAmounts, realMonth]
  );

  const diffVsPlan = currentSaved - expectedByNow;
  const animatedDiff = useAnimatedNumber(Math.abs(diffVsPlan));

  const isAhead = diffVsPlan > TRACK_TOLERANCE;
  const isBehind = diffVsPlan < -TRACK_TOLERANCE;
  const isOnTrack = !isAhead && !isBehind;

  const yearPct =
    goal > 0
      ? clamp((currentSaved / goal) * 100, 0, 100)
      : 0;

  const isGoalAchieved = currentSaved >= goal && goal > 0;

  const pageTitle =
    "Planificador de ahorro anual: reparte tu meta entre los 12 meses | MetaBox";
  const pageDescription =
    "Organiza tu objetivo de ahorro anual marcando meses flojos. El planificador recalcula el resto de meses automáticamente con soporte de decimales.";
  const pageUrl =
    "https://metabox-web.vercel.app/herramientas/annual";
  
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

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <DecimalSliderRow
            label="Objetivo anual"
            value={goal}
            setValue={setGoal}
            min={MIN_GOAL}
            max={FINANCIAL_MAX}
            step={500}
            unit="€"
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
          />
        </div>
      </Card>

      <Card glow result style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "0.4rem" }}>
          <div
            style={{
              ...fontBody,
              color: T.textMuted,
              fontSize: "0.85rem",
            }}
          >
            Total del plan
          </div>

          <div
            style={{
              ...fontDisplay,
              color: T.lime,
              fontSize: "2.2rem",
              fontWeight: 700,
              margin: "0.2rem 0",
            }}
          >
            {fmtEUR(total)}
          </div>
        </div>

        <div style={{ width: "100%", height: "170px", marginTop: "0.8rem" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
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
                  "Ahorro",
                ]}
                contentStyle={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: T.text,
                }}
              />

              <Bar
                dataKey="importe"
                radius={[4, 4, 0, 0]}
                animationDuration={300}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isLow ? T.lavender : T.lime}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-6 mt-4 flex-wrap">
          <div
            className="flex items-center gap-1.5"
            style={{ ...fontBody, fontSize: "0.8rem" }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: T.lime }}
            />
            <span style={{ color: T.text, fontWeight: 500 }}>Normal:</span>
            <span style={{ color: T.lime, fontWeight: 600 }}>
              {fmtEUR(normalShare)}
            </span>
          </div>

          {lowCount > 0 && (
            <div
              className="flex items-center gap-1.5"
              style={{ ...fontBody, fontSize: "0.8rem" }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: T.lavender }}
              />
              <span style={{ color: T.text, fontWeight: 500 }}>
                Flojo ({lowCount}):
              </span>
              <span style={{ color: T.lavender, fontWeight: 600 }}>
                {fmtEUR(lowShare)}
              </span>
            </div>
          )}
        </div>
      </Card>

      <AdviceBlock
        text={
          lowCount === 0
            ? "Prueba a marcar diciembre u otro mes caro como flojo: el resto de meses absorbe la diferencia automáticamente."
            : `Con ${lowCount} ${lowCount === 1 ? "mes flojo" : "meses flojos"}, el resto sube a ${fmtEUR(normalShare)} para seguir llegando al objetivo.`
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div
          style={{
            ...fontBody,
            color: T.text,
            fontWeight: 600,
            fontSize: "0.95rem",
            marginBottom: "1rem",
          }}
        >
          Toca un mes para marcarlo como flojo
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {MONTHS.map((month, index) => {
            const low = lowMonths.has(index);
            const amount = monthlyAmounts[index];
            const isPast = index < realMonth;
            const isCurrent = index === realMonth;

            return (
              <button
                key={month}
                type="button"
                onClick={() => toggleMonth(index)}
                aria-pressed={low}
                aria-label={`Mes de ${month}, estado: ${low ? "flojo" : "normal"}`}
                style={{
                  borderRadius: "0.8rem",
                  padding: "0.75rem 0.4rem",
                  border: `1px solid ${
                    low ? T.lavender : isCurrent ? T.lime : T.border
                  }`,
                  background: low ? T.lavenderSoft : T.surfaceAlt,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s ease",
                  opacity: isPast ? 0.7 : 1,
                  position: "relative",
                }}
              >
                {isCurrent && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-4px",
                      background: T.lime,
                      color: "#000",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      padding: "1px 4px",
                      borderRadius: "4px",
                    }}
                  >
                    HOY
                  </span>
                )}

                <div
                  style={{
                    ...fontBody,
                    color: low ? T.lavender : T.text,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}
                >
                  {month}
                </div>

                <div
                  style={{
                    ...fontBody,
                    color: T.textMuted,
                    fontSize: "0.7rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {fmtEUR(amount)}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div
          style={{
            ...fontBody,
            color: T.text,
            fontWeight: 600,
            fontSize: "0.95rem",
            marginBottom: "1rem",
          }}
        >
          ¿Vas según el plan?
        </div>

        {isGoalAchieved && (
          <div
            style={{
              background: `linear-gradient(135deg, ${T.lime}15, ${T.lavender}15)`,
              border: `1px solid ${T.lime}`,
              borderRadius: "0.8rem",
              padding: "0.9rem",
              textAlign: "center",
              marginBottom: "1.1rem",
            }}
          >
            <div
              style={{
                ...fontDisplay,
                color: T.lime,
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              🎉 ¡Objetivo anual cumplido!
            </div>

            <div
              style={{
                ...fontBody,
                color: T.textMuted,
                fontSize: "0.78rem",
                marginTop: "0.2rem",
              }}
            >
              Has alcanzado tu meta de {fmtEUR(goal)}. ¡Excelente trabajo financiero!
            </div>
          </div>
        )}

        <DecimalSliderRow
          label="Ya ahorrado este año"
          value={currentSaved}
          setValue={setCurrentSaved}
          min={0}
          max={FINANCIAL_MAX}
          step={100}
          accent="lavender"
        />

        <div style={{ marginTop: "1.1rem" }}>
          <ProgressBar pct={yearPct} gradientEnd={T.lavender} />

          <div
            style={{
              ...fontBody,
              color: T.textMuted,
              fontSize: "0.82rem",
              marginTop: "0.6rem",
            }}
          >
            Según el plan, al cierre de {MONTHS[realMonth]} deberías llevar{" "}
            {fmtEUR(expectedByNow)}
          </div>

          <div
            aria-live="polite"
            style={{
              ...fontBody,
              color: isOnTrack ? T.lime : T.coral,
              fontSize: "0.92rem",
              fontWeight: 600,
              marginTop: "0.4rem",
            }}
          >
            {isOnTrack
              ? "Vas según el plan"
              : isAhead
                ? `Vas ${fmtEUR(animatedDiff)} por delante del plan`
                : `Vas ${fmtEUR(animatedDiff)} por detrás del plan`}
          </div>
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
            `Plan de ahorro anual: objetivo ${fmtEUR(goal)}, con ${lowMonths.size} meses flojos marcados. Llevo ahorrado ${fmtEUR(currentSaved)} (el plan dice ${fmtEUR(expectedByNow)} a estas alturas).`
          }
        />

        <ExportCSVButton
          filename="planificador-ahorro-anual"
          getRows={() =>
            MONTHS.map((month, index) => ({
              mes: month,
              importe: monthlyAmounts[index].toFixed(2),
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
          lineHeight: 1.6,
          borderTop: `1px solid ${T.border}`,
          paddingTop: "1.2rem",
        }}
      >
        <p>
          Ahorrar la misma cantidad todos los meses no siempre es realista:
          hay meses con gastos extra, como vacaciones, Navidad o la vuelta al
          cole, que rompen cualquier plan fijo. Este planificador te permite
          marcar esos meses como flojos, ajustar cuánto se reduce cada uno y
          comparar tu ahorro acumulado con el que deberías llevar según tu plan.
        </p>
      </div>
    </div>
  );
}

export default AnnualPlannerTool;
            
