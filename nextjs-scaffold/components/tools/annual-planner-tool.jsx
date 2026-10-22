"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { fmtEUR, useAnimatedNumber } from "@/lib/hooks";
import { Card, AdviceBlock, ProgressBar } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";
import { MAX_FINANCIAL_LIMIT } from "@/lib/financial-constants";

// IMPORTACIÓN CORRECTA (Sin dynamic para que Recharts funcione)
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from "recharts";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const FAQS = [
  {
    q: "¿Cómo reparto mi ahorro anual entre los 12 meses?",
    a: "Puedes dividir tu objetivo anual a partes iguales entre los 12 meses, o marcar los meses más caros (como diciembre o vacaciones) como 'flojos' para que el resto de meses absorba automáticamente esa diferencia.",
  },
  {
    q: "¿Qué hago si no llego a ahorrar en un mes concreto?",
    a: "Márcalo como mes flojo en la herramienta: el planificador recalcula al instante cuánto tendrás que ahorrar en los meses restantes para seguir llegando a tu objetivo anual.",
  },
  {
    q: "¿Cómo sé si voy adelantado o atrasado respecto a mi plan?",
    a: "Introduce cuánto llevas ahorrado hasta ahora: la herramienta compara esa cifra con lo que tu plan dice que deberías tener acumulado en el mes actual, y te avisa si vas por detrás.",
  },
];

function DecimalSliderRow({ label, value, setValue, min, max, step = 0.01, unit = "€", accent = "lime", subtitle }) {
  const [textVal, setTextVal] = useState(String(value ?? 0));

  useEffect(() => {
    if (value !== parseFloat(textVal.replace(",", "."))) {
      setTextVal(String(value ?? 0));
    }
  }, [value]);

  const handleInputChange = (e) => {
    const raw = e.target.value;
    setTextVal(raw);
    const parsed = parseFloat(raw.replace(",", "."));
    if (!isNaN(parsed)) setValue(parsed);
  };

  const handleBlur = () => {
    const parsed = parseFloat(textVal.replace(",", "."));
    if (isNaN(parsed)) {
      setValue(min);
      setTextVal(String(min));
    } else {
      setValue(parsed);
      setTextVal(String(parsed));
    }
  };

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setValue(val);
    setTextVal(String(val));
  };

  const accentColor = accent === "lavender" ? T.lavender : T.lime;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-baseline">
        <span style={{ ...fontBody, color: T.text, fontSize: "0.9rem", fontWeight: 500 }}>{label}</span>
        <div className="flex items-center gap-1 bg-[var(--surface-alt,rgba(255,255,255,0.03))] px-2.5 py-1 rounded-lg border border-[var(--border,rgba(255,255,255,0.08))]">
          <input
            type="text"
            inputMode="decimal"
            value={textVal}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="bg-transparent text-right font-semibold"
            style={{ ...fontBody, color: accentColor, fontSize: "0.9rem", width: "85px", outline: "none" }}
          />
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>{unit}</span>
        </div>
      </div>
      {subtitle && <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>{subtitle}</div>}
      <input
        type="range"
        min={min}
        max={Math.max(max, value || 0, 100)}
        step={step}
        value={isNaN(value) ? 0 : value}
        onChange={handleSliderChange}
        className="w-full cursor-pointer h-1.5 rounded-lg appearance-none bg-[var(--surface-alt,rgba(255,255,255,0.1))] accent-current"
        style={{ accentColor }}
      />
    </div>
  );
}

function AnnualPlannerTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [goal, setGoal] = useState(() => {
    const p = initialParams?.goal;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 3600;
  });

  const [lowMonthsArray, setLowMonthsArray] = useState(() => {
    const p = initialParams?.lowMonths;
    if (p) return p.split(",").map(Number).filter((n) => !isNaN(n));
    return [];
  });

  const [reductionPct, setReductionPct] = useState(() => {
    const p = initialParams?.reductionPct;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 50;
  });

  const [currentSaved, setCurrentSaved] = useState(() => {
    const p = initialParams?.currentSaved;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 0;
  });

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        goal,
        reductionPct,
        currentSaved,
        lowMonths: lowMonthsArray.length > 0 ? lowMonthsArray.join(",") : null,
      });
    }
  }, [goal, reductionPct, currentSaved, lowMonthsArray, onStateChange]);

  const lowMonths = useMemo(() => new Set(lowMonthsArray), [lowMonthsArray]);
  const realMonth = new Date().getMonth();

  const evenShare = goal / 12;
  const lowShare = evenShare * (1 - reductionPct / 100);
  const lowCount = lowMonths.size;
  const normalCount = 12 - lowCount;
  const totalLow = lowShare * lowCount;
  const normalShare = normalCount > 0 ? (goal - totalLow) / normalCount : 0;

  const toggleMonth = (i) => {
    const next = new Set(lowMonths);
    if (next.has(i)) next.delete(i);
    else if (next.size < 11) next.add(i);
    setLowMonthsArray([...next]);
  };

  const total = lowCount * lowShare + normalCount * normalShare;

  const chartData = MONTHS.map((m, i) => ({
    mes: m,
    importe: Math.round(lowMonths.has(i) ? lowShare : normalShare),
    isLow: lowMonths.has(i),
    isCurrent: i === realMonth,
  }));

  const expectedByNow = useMemo(() => {
    let sum = 0;
    for (let i = 0; i <= realMonth; i++) {
      sum += lowMonths.has(i) ? lowShare : normalShare;
    }
    return sum;
  }, [realMonth, lowMonths, lowShare, normalShare]);

  const diffVsPlan = currentSaved - expectedByNow;
  const animatedDiff = useAnimatedNumber(Math.abs(diffVsPlan));
  const onTrack = diffVsPlan >= -0.5;
  const yearPct = goal > 0 ? Math.min((currentSaved / goal) * 100, 100) : 0;
  const isGoalAchieved = currentSaved >= goal && goal > 0;

  const pageTitle = "Planificador de ahorro anual: reparte tu meta entre los 12 meses | MetaBox";
  const pageDescription = "Organiza tu objetivo de ahorro anual marcando meses flojos. El planificador recalcula el resto de meses automáticamente con soporte de decimales.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/planificador-ahorro-anual";

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

      <ToolHeader title="Planificador de ahorro anual" subtitle="Marca los meses más difíciles: el resto se ajusta solo para llegar al objetivo." onBack={onBack} />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <DecimalSliderRow label="Objetivo anual" value={goal} min={200} max={MAX_FINANCIAL_LIMIT} step={500} unit="€" accent="lime" setValue={setGoal} />
          <DecimalSliderRow label="Reducción en meses flojos" value={reductionPct} min={10} max={90} step={1} unit="%" accent="lavender" setValue={setReductionPct} />
        </div>
      </Card>

      <Card glow result style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "0.4rem" }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Total del plan</div>
          <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.2rem", fontWeight: 700, margin: "0.2rem 0" }}>
            {fmtEUR(total)}
          </div>
        </div>

        <div style={{ width: "100%", height: "170px", marginTop: "0.8rem" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.lime} stopOpacity={0.9}/>
                  <stop offset="95%" stopColor={T.lime} stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="colorLavender" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.lavender} stopOpacity={0.9}/>
                  <stop offset="95%" stopColor={T.lavender} stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" stroke={T.textMuted} fontSize={11} tickLine={false} axisLine={false} />
              {/* AÑADIDO EL YAXIS OCULTO PARA QUE EL GRÁFICO CALCULE LA ALTURA */}
              <YAxis hide />
              <Tooltip
                formatter={(value) => [`${value} €`, "Ahorro"]}
                contentStyle={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "12px", fontSize: "12px", color: T.text, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar dataKey="importe" radius={[6, 6, 0, 0]} animationDuration={500}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isLow ? "url(#colorLavender)" : "url(#colorLime)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-6 mt-4 flex-wrap">
          <div className="flex items-center gap-1.5" style={{ ...fontBody, fontSize: "0.8rem" }}>
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: T.lime }} />
            <span style={{ color: T.text, fontWeight: 500 }}>Normal:</span>
            <span style={{ color: T.lime, fontWeight: 600 }}>{fmtEUR(normalShare)}</span>
          </div>
          {lowCount > 0 && (
            <div className="flex items-center gap-1.5" style={{ ...fontBody, fontSize: "0.8rem" }}>
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: T.lavender }} />
              <span style={{ color: T.text, fontWeight: 500 }}>Flojo ({lowCount}):</span>
              <span style={{ color: T.lavender, fontWeight: 600 }}>{fmtEUR(lowShare)}</span>
            </div>
          )}
        </div>
      </Card>

      <AdviceBlock
        text={
          lowCount === 0
            ? "Prueba a marcar diciembre u otro mes caro como 'flojo': el resto de meses absorbe la diferencia automáticamente."
            : `Con ${lowCount} ${lowCount === 1 ? "mes flojo" : "meses flojos"}, el resto sube a ${fmtEUR(normalShare)} para seguir llegando al objetivo.`
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          Toca un mes para marcarlo como "flojo"
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {MONTHS.map((m, i) => {
            const low = lowMonths.has(i);
            const amount = low ? lowShare : normalShare;
            const isPast = i < realMonth;
            const isCurrent = i === realMonth;
            return (
              <button
                key={m}
                onClick={() => toggleMonth(i)}
                aria-pressed={low}
                aria-label={`Mes de ${m}, estado: ${low ? "flojo" : "normal"}`}
                style={{
                  borderRadius: "0.8rem",
                  padding: "0.75rem 0.4rem",
                  border: `1px solid ${low ? T.lavender : isCurrent ? T.lime : T.border}`,
                  background: low ? T.lavenderSoft : T.surfaceAlt,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s ease",
                  opacity: isPast ? 0.5 : 1,
                  position: "relative",
                  boxShadow: isCurrent ? `0 0 12px ${T.lime}40` : "none"
                }}
              >
                {isCurrent && (
                  <span style={{ position: "absolute", top: "-6px", right: "-4px", background: T.lime, color: "#000", fontSize: "0.6rem", fontWeight: 700, padding: "1px 4px", borderRadius: "4px" }}>
                    HOY
                  </span>
                )}
                <div style={{ ...fontBody, color: low ? T.lavender : T.text, fontSize: "0.78rem", fontWeight: 600 }}>{m}</div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.7rem", marginTop: "0.25rem" }}>{fmtEUR(amount)}</div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          ¿Vas según el plan?
        </div>

        {isGoalAchieved && (
          <div style={{
            background: `linear-gradient(135deg, ${T.lime}15, ${T.lavender}15)`,
            border: `1px solid ${T.lime}`,
            borderRadius: "0.8rem",
            padding: "0.9rem",
            textAlign: "center",
            marginBottom: "1.1rem",
            boxShadow: `0 4px 15px ${T.lime}20`
          }}>
            <div style={{ ...fontDisplay, color: T.lime, fontSize: "1rem", fontWeight: 700 }}>
              🎉 ¡Objetivo anual cumplido!
            </div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", marginTop: "0.2rem" }}>
              Has alcanzado tu meta de {fmtEUR(goal)}. ¡Excelente trabajo financiero!
            </div>
          </div>
        )}

        <DecimalSliderRow label="Ya ahorrado este año" value={currentSaved} min={0} max={MAX_FINANCIAL_LIMIT} step={100} unit="€" accent="lavender" setValue={setCurrentSaved} />
        <div style={{ marginTop: "1.1rem" }}>
          <ProgressBar pct={yearPct} gradientEnd={T.lavender} />
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", marginTop: "0.6rem" }}>
            Según el plan, en {MONTHS[realMonth]} deberías llevar {fmtEUR(expectedByNow)}
          </div>
          <div style={{ ...fontBody, color: onTrack ? T.lime : T.coral, fontSize: "0.92rem", fontWeight: 600, marginTop: "0.4rem" }}>
            {onTrack
              ? `Vas ${fmtEUR(animatedDiff)} por delante del plan`
              : `Vas ${fmtEUR(animatedDiff)} por detrás del plan`}
          </div>
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["savings", "challenge"]} onNavigate={onNavigate} primaryId="savings" />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Plan de ahorro anual: objetivo ${fmtEUR(goal)}, con ${lowMonths.size} meses flojos marcados. Llevo ahorrado ${fmtEUR(currentSaved)} (el plan dice ${fmtEUR(expectedByNow)} a estas alturas).`
          }
        />
        <ExportCSVButton
          filename="planificador-ahorro-anual"
          getRows={() =>
            MONTHS.map((m, i) => ({
              mes: m,
              importe: (lowMonths.has(i) ? lowShare : normalShare).toFixed(2),
              tipo: lowMonths.has(i) ? "flojo" : "normal",
            }))
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Ahorrar la misma cantidad todos los meses no siempre es realista: hay meses con gastos extra (vacaciones, Navidad, vuelta al cole) que rompen cualquier plan fijo. Este planificador de ahorro anual te deja marcar esos meses como "flojos", ajustar cuánto se reduce cada uno, y hace seguimiento real comparando lo que llevas ahorrado con lo que tu plan dice que deberías tener a estas alturas del año.
        </p>
      </div>
    </div>
  );
}

export default AnnualPlannerTool;
