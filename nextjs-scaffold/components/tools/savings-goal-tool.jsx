"use client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { T, fontBody } from "@/lib/design-tokens";
import { fmtEUR } from "@/lib/hooks";
import { Card, AdviceBlock } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import GoalProjection from "@/components/engines/GoalProjection";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Cómo puedo calcular el tiempo necesario para alcanzar mi meta?",
    a: "Introduciendo el importe total de tu objetivo, el dinero que ya tienes ahorrado y lo que puedes aportar cada mes. La herramienta calcula automáticamente los meses o años necesarios.",
  },
  {
    q: "¿Qué pasa si añado una aportación extra mensual?",
    a: "El simulador recalcula de forma instantánea el tiempo de consecución para mostrarte cuánto antes alcanzarás tu meta financiera.",
  },
];

// SLIDER DE DINERO PREMIUM (SIN ATASCOS)
function MoneySlider({ label, value, setValue, min = 0, max = 1000000, step = 1000, accent = "lime", subtitle }) {
  const [textVal, setTextVal] = useState(String(value ?? 0));
  const accentColor = accent === "lavender" ? T.lavender : T.lime;

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

  const safeValue = isNaN(value) ? 0 : Math.max(min, Math.min(value, max));

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
            style={{ ...fontBody, color: accentColor, fontSize: "0.9rem", width: "85px", outline: "none" }}
          />
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>€</span>
        </div>
      </div>
      {subtitle && <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>{subtitle}</div>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeValue}
        onChange={handleSliderChange}
        className="w-full cursor-pointer h-1.5 rounded-lg appearance-none bg-[var(--surface-alt,rgba(255,255,255,0.1))]"
        style={{ accentColor }}
      />
    </div>
  );
}
function SavingsGoalTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [goal, setGoal] = useState(() => {
    const p = initialParams?.goal;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 10000;
  });

  const [current, setCurrent] = useState(() => {
    const p = initialParams?.current;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 1500;
  });

  const [monthly, setMonthly] = useState(() => {
    const p = initialParams?.monthly;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 300;
  });

  const [extra, setExtra] = useState(() => {
    const p = initialParams?.extra;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 0;
  });

  // ELIMINADO el useEffect que forzaba current <= goal

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({ goal, current, monthly, extra });
    }
  }, [goal, current, monthly, extra, onStateChange]);

  // Saneamos los datos para el componente externo (evitamos que se rompa si current > goal)
  const safeGoal = Math.max(500, Number.isFinite(goal) ? goal : 500);
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const safeMonthly = Number.isFinite(monthly) ? monthly : 0;
  const safeExtra = Number.isFinite(extra) ? extra : 0;

  const pageTitle = "Calculadora de objetivo de ahorro: cuánto tardarás en llegar a tu meta | MetaBox";
  const pageDescription = "Calcula cuánto tardarás en alcanzar tu objetivo de ahorro introduciendo tu meta, lo que ya tienes y tu aportación mensual o extra. Gratis y sin registro.";
  
  // CORRECCIÓN CRÍTICA DE SEO
  const pageUrl = "https://metabox-web.vercel.app/herramientas/calculadora-objetivo-ahorro";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="objetivo de ahorro, calculadora meta de ahorro, cuánto tardaré en ahorrar, planificador de ahorro" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Objetivo de ahorro",
            url: pageUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            inLanguage: "es",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            description: pageDescription,
          })}
        </script>
      </Helmet>

      <ToolHeader title="Objetivo de ahorro" subtitle="Gestiona una o varias metas y verás el resultado al instante." onBack={onBack} />

      {/* Contenedor Premium para el componente externo */}
      <div style={{
        background: `linear-gradient(145deg, rgba(196,222,78,0.05) 0%, rgba(10,18,20,1) 100%)`,
        borderRadius: "1.5rem",
        padding: "1.5rem",
        border: `1px solid ${T.border}`,
        boxShadow: `0 10px 30px rgba(0,0,0,0.3)`
      }}>
        <GoalProjection goal={safeGoal} current={safeCurrent} monthly={safeMonthly} extra={safeExtra} monthsSavedLabel="meses menos" />
      </div>

      <AdviceBlock
        text={
          safeCurrent >= safeGoal
            ? "¡Ya has alcanzado o superado tu objetivo! Puedes marcar una nueva meta más ambiciosa."
            : safeMonthly + safeExtra === 0
            ? "Introduce una aportación mensual o extra superior a 0 € para poder calcular el tiempo estimado."
            : "Al ritmo actual mantienes una constancia sólida. Subir la aportación mensual, aunque sea poco, acorta el plazo de forma notable."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <MoneySlider label="Objetivo" value={goal} min={500} max={1000000} step={500} accent="lime" setValue={setGoal} />
          <MoneySlider label="Ya ahorrado" value={current} min={0} max={1000000} step={100} accent="lime" setValue={setCurrent} />
          <MoneySlider label="Ahorro mensual" value={monthly} min={0} max={1000000} step={50} accent="lavender" setValue={setMonthly} />
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.8rem" }}>
          ¿Y si ahorras un poco más al mes?
        </div>
        <MoneySlider label="Ahorro extra" value={extra} min={0} max={1000000} step={25} accent="lavender" setValue={setExtra} />
      </Card>

      <AdSlot minHeight="0px" />
      <RelatedTools ids={["budget", "percent", "emergency"]} onNavigate={onNavigate} primaryId="budget" />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton getText={() => `Objetivo de ahorro: Meta de ${fmtEUR(goal)}, ya ahorrado ${fmtEUR(current)}, aportando ${fmtEUR(monthly + extra)}/mes.`} />
        <ExportCSVButton filename="objetivo-de-ahorro" getRows={() => [
          { metrica: "Objetivo", valor: goal.toFixed(2) },
          { metrica: "Ya ahorrado", valor: current.toFixed(2) },
          { metrica: "Ahorro mensual", valor: monthly.toFixed(2) },
          { metrica: "Ahorro extra", valor: extra.toFixed(2) },
        ]} />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Ya sea para un objetivo concreto o un ahorro general, saber cuándo lo vas a conseguir ayuda a mantener la motivación. Esta calculadora te permite gestionar tus objetivos a la vez —cada uno con su nombre, su progreso y su propia proyección— y ver el efecto de sumar un ahorro extra a la fecha de consecución de cada uno.
        </p>
      </div>
    </div>
  );
}

export default SavingsGoalTool;
