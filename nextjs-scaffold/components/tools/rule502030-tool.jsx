"use client";
import React, { useEffect, useRef, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, Chip, AdviceBlock } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Qué es la regla 50/30/20?",
    a: "Es una guía de presupuesto que propone destinar el 50% de tus ingresos a necesidades esenciales, el 30% a deseos y el 20% a ahorro, como punto de partida orientativo, no una norma rígida.",
  },
  {
    q: "¿Qué cuenta como 'necesidad' y qué como 'deseo'?",
    a: "Las necesidades son gastos imprescindibles como vivienda, suministros o alimentación básica; los deseos son gastos que mejoran tu calidad de vida pero no son esenciales, como ocio, restaurantes o suscripciones.",
  },
  {
    q: "¿Qué hago si no puedo llegar al 20% de ahorro?",
    a: "No pasa nada si empiezas con un porcentaje menor: lo importante es tener un hábito de ahorro constante y subirlo progresivamente cuando tu situación lo permita.",
  },
  {
    q: "¿Puedo usar otros porcentajes distintos a 50/30/20?",
    a: "Sí: si vives en una ciudad cara, tus necesidades pueden pesar más del 50%; si tienes pocos gastos fijos, puedes destinar más al ahorro. Ajusta los porcentajes de referencia a tu situación real.",
  },
];

function DonutChart({ data, size = 180, strokeWidth = 22 }) {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((acc, item) => acc + Math.max(item.value, 0), 0);

  let accumulatedLength = 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <circle cx={center} cy={center} r={radius} fill="none" stroke={T.surfaceAlt} strokeWidth={strokeWidth} />
        {total > 0 ? (
          data.map((item, index) => {
            const value = Math.max(item.value, 0);
            if (value === 0) return null;
            const percentage = value / total;
            const strokeLength = percentage * circumference;
            const dashArray = `${strokeLength} ${circumference - strokeLength}`;
            const dashOffset = -accumulatedLength;
            accumulatedLength += strokeLength;

            return (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{
                  transition: "stroke-dasharray 0.3s ease, stroke-dashoffset 0.3s ease",
                  transform: "rotate(-90deg)",
                  transformOrigin: "center",
                }}
              />
            );
          })
        ) : (
          <circle cx={center} cy={center} r={radius} fill="none" stroke={T.border} strokeWidth={strokeWidth} />
        )}
      </svg>
    </div>
  );
}
function DecimalSliderRow({ label, value, setValue, min, max, step = 0.01, unit = "€", accent = "lime", subtitle }) {
  const [textVal, setTextVal] = useState(String(value ?? 0));
  const ABSOLUTE_MAX = Math.max(max, value || 0, 100);

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

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setValue(val);
    setTextVal(String(val));
  };

  const safeValue = isNaN(value) ? min : Math.max(min, Math.min(value, ABSOLUTE_MAX));
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
            onBlur={() => {
              const parsed = parseFloat(textVal.replace(",", "."));
              if (isNaN(parsed)) setTextVal(String(value ?? 0));
              else { setValue(parsed); setTextVal(String(parsed)); }
            }}
            className="bg-transparent text-right font-semibold"
            style={{ ...fontBody, color: accentColor, fontSize: "0.9rem", width: "75px", outline: "none" }}
          />
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>{unit}</span>
        </div>
      </div>
      {subtitle && <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>{subtitle}</div>}
      <input
        type="range"
        min={min}
        max={ABSOLUTE_MAX}
        step={step}
        value={safeValue}
        onChange={handleSliderChange}
        className="w-full cursor-pointer h-1.5 rounded-lg appearance-none bg-[var(--surface-alt,rgba(255,255,255,0.1))] accent-current"
        style={{ accentColor }}
      />
    </div>
  );
}
function Rule502030Tool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [income, setIncome] = useState(() => Number(initialParams?.income) || 1800);
  const [needsPct, setNeedsPct] = useState(() => Number(initialParams?.needsPct) || 50);
  const [wantsPct, setWantsPct] = useState(() => Number(initialParams?.wantsPct) || 30);
  const savingsPct = Math.max(100 - needsPct - wantsPct, 0);

  const [needs, setNeeds] = useState(() => Number(initialParams?.needs) || (1800 * 50) / 100);
  const [wants, setWants] = useState(() => Number(initialParams?.wants) || (1800 * 30) / 100);
  const [savings, setSavings] = useState(() => Number(initialParams?.savings) || (1800 * 20) / 100);
  const [donutView, setDonutView] = useState(() => initialParams?.donutView || "actual");

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({ income, needsPct, wantsPct, needs, wants, savings, donutView });
    }
  }, [income, needsPct, wantsPct, needs, wants, savings, donutView, onStateChange]);

  // Sincronizar cantidades si el ingreso cambia
  const prevIncome = useRef(income);
  useEffect(() => {
    if (prevIncome.current > 0 && income !== prevIncome.current) {
      const ratio = income / prevIncome.current;
      setNeeds(Number((needs * ratio).toFixed(2)));
      setWants(Number((wants * ratio).toFixed(2)));
      setSavings(Number((savings * ratio).toFixed(2)));
    }
    prevIncome.current = income;
  }, [income]);

  // Sincronizar cantidades si los porcentajes cambian
  const prevNeedsPct = useRef(needsPct);
  const prevWantsPct = useRef(wantsPct);
  useEffect(() => {
    if (prevNeedsPct.current !== needsPct || prevWantsPct.current !== wantsPct) {
      setNeeds(Number(((income * needsPct) / 100).toFixed(2)));
      setWants(Number(((income * wantsPct) / 100).toFixed(2)));
      setSavings(Number(((income * (100 - needsPct - wantsPct)) / 100).toFixed(2)));
    }
    prevNeedsPct.current = needsPct;
    prevWantsPct.current = wantsPct;
  }, [needsPct, wantsPct, income]);

  const total = Number(needs) + Number(wants) + Number(savings);
  const diff = Number((income - total).toFixed(2));
  const animatedDiff = useAnimatedNumber(diff);

  const recNeeds = (income * needsPct) / 100;
  const recWants = (income * wantsPct) / 100;
  const recSavings = (income * savingsPct) / 100;

  const donutData = useMemo(() => {
    if (donutView === "actual") {
      return [
        { name: "Necesidades", value: Math.max(Number(needs) || 0, 0), color: T.lime },
        { name: "Deseos", value: Math.max(Number(wants) || 0, 0), color: T.lavender },
        { name: "Ahorro", value: Math.max(Number(savings) || 0, 0), color: "#00B4D8" },
      ];
    }
    return [
      { name: "Necesidades", value: Math.max(recNeeds, 0), color: T.lime },
      { name: "Deseos", value: Math.max(recWants, 0), color: T.lavender },
      { name: "Ahorro", value: Math.max(recSavings, 0), color: "#00B4D8" },
    ];
  }, [donutView, needs, wants, savings, recNeeds, recWants, recSavings]);

  const currentDonutTotal = donutData.reduce((acc, cur) => acc + cur.value, 0);

  const pageTitle = "Regla 50/30/20: reparte tu ingreso entre necesidades, deseos y ahorro | MetaBox";
  const pageDescription = "Aplica la regla 50/30/20 a tu ingreso mensual con soporte completo de decimales. Compara tu reparto real con el recomendado en un gráfico interactivo. Gratis.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/regla-50-30-20-calculadora";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="regla 50/30/20, qué es la regla 50 30 20, cómo repartir el sueldo, calculadora regla 50 30 20 personalizada" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Regla 50/30/20",
            url: pageUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            inLanguage: "es",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            description: pageDescription,
          })}
        </script>
      </Helmet>

      <ToolHeader title="Regla 50/30/20" subtitle="Reparte tu ingreso entre necesidades, deseos y ahorro." onBack={onBack} />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <DecimalSliderRow label="Ingreso mensual" value={income} min={0} max={10000} step={10} unit="€" accent="lime" setValue={setIncome} />
      </Card>

      <div style={{ background: `linear-gradient(145deg, rgba(196,222,78,0.05) 0%, rgba(10,18,20,1) 100%)`, borderRadius: "1.5rem", padding: "1.5rem", border: `1px solid ${T.border}`, textAlign: "center" }}>
        <div className="mb-4">
          <div style={{ ...fontDisplay, color: diff >= 0 ? T.lime : T.coral, fontSize: "2rem", fontWeight: 800, textShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
            {fmtEUR(Math.abs(animatedDiff))}
          </div>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {diff >= 0 ? "sin asignar" : "de más"}
          </div>
        </div>

        <DonutChart data={donutData} size={180} strokeWidth={24} />

        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          {donutData.map((item, idx) => {
            const pct = currentDonutTotal > 0 ? Math.round((item.value / currentDonutTotal) * 100) : 0;
            return (
              <div key={idx} className="flex items-center gap-1.5" style={{ ...fontBody, fontSize: "0.85rem" }}>
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                <span style={{ color: T.text, fontWeight: 500 }}>{item.name}:</span>
                <span style={{ color: item.color, fontWeight: 700 }}>{pct}%</span>
                <span style={{ color: T.textMuted }}>({fmtEUR(item.value)})</span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 justify-center mt-5">
          <Chip label="Tu reparto" active={donutView === "actual"} onClick={() => setDonutView("actual")} />
          <Chip label="Recomendado" active={donutView === "recomendado"} onClick={() => setDonutView("recomendado")} />
        </div>
      </div>

      <AdviceBlock
        text={
          diff < 0
            ? "Te pasas del ingreso disponible. Revisa primero 'Deseos': suele ser la partida más fácil de ajustar sin tocar lo esencial."
            : savings < recSavings * 0.5
            ? "Estás ahorrando bastante menos del recomendado. No hace falta llegar de golpe: sube el slider poco a poco y compáralo con el donut."
            : "Tu reparto está cerca de la referencia. Prueba a mover los sliders y compara tu reparto con el recomendado."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>Personaliza los porcentajes de referencia</div>
        <div className="flex flex-col gap-6">
          <DecimalSliderRow
            label="Necesidades (%)"
            value={needsPct}
            min={10}
            max={90}
            step={1}
            unit="%"
            accent="lime"
            setValue={(v) => {
              const maxAllowed = Math.max(10, 100 - wantsPct);
              setNeedsPct(Math.min(v, maxAllowed));
            }}
          />
          <DecimalSliderRow
            label="Deseos (%)"
            value={wantsPct}
            min={0}
            max={80}
            step={1}
            unit="%"
            accent="lavender"
            setValue={(v) => {
              const maxAllowed = Math.max(0, 100 - needsPct);
              setWantsPct(Math.min(v, maxAllowed));
            }}
          />
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>
            Ahorro (resto): <span style={{ color: T.lime, fontWeight: 700 }}>{savingsPct}%</span>
          </div>
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <DecimalSliderRow label={`Necesidades (${needsPct}%)`} value={needs} min={0} max={Math.max(income, 1000)} step={0.01} unit="€" accent="lime" subtitle={`Recomendado: ${fmtEUR(recNeeds)}`} setValue={setNeeds} />
          <DecimalSliderRow label={`Deseos (${wantsPct}%)`} value={wants} min={0} max={Math.max(income, 1000)} step={0.01} unit="€" accent="lavender" subtitle={`Recomendado: ${fmtEUR(recWants)}`} setValue={setWants} />
          <DecimalSliderRow label={`Ahorro (${savingsPct}%)`} value={savings} min={0} max={Math.max(income, 1000)} step={0.01} unit="€" accent="lime" subtitle={`Recomendado: ${fmtEUR(recSavings)}`} setValue={setSavings} />
        </div>
      </Card>

      <AdSlot minHeight="0px" />
      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
        50/30/20 es una guía orientativa, no una recomendación financiera personalizada.
      </div>
      <RelatedTools ids={["budget", "percent"]} onNavigate={onNavigate} primaryId="budget" />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton getText={() => `Regla ${needsPct}/${wantsPct}/${savingsPct} con ingreso ${fmtEUR(income)}: necesidades ${fmtEUR(needs)}, deseos ${fmtEUR(wants)}, ahorro ${fmtEUR(savings)}.`} />
        <ExportCSVButton filename="regla-50-30-20" getRows={() => [
          { categoria: "Necesidades", recomendado: recNeeds.toFixed(2), actual: Number(needs).toFixed(2) },
          { categoria: "Deseos", recomendado: recWants.toFixed(2), actual: Number(wants).toFixed(2) },
          { categoria: "Ahorro", recomendado: recSavings.toFixed(2), actual: Number(savings).toFixed(2) },
        ]} />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          La regla 50/30/20 es una de las guías de presupuesto más conocidas para organizar el sueldo, pero no encaja igual de bien a todo el mundo. Ajusta los porcentajes de referencia a tu situación real, introduce tu ingreso mensual, y compara tu reparto real con el recomendado en el gráfico.
        </p>
      </div>
    </div>
  );
}

export default Rule502030Tool;
