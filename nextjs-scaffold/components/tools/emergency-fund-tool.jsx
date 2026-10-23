"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  Home as HomeIcon,
  Tv, Utensils, Car,
} from "lucide-react";
import { T, fontBody } from "@/lib/design-tokens";
import { fmtEUR } from "@/lib/hooks";
import { Card, Chip, AdviceBlock } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import GoalProjection from "@/components/engines/GoalProjection";
import AdSlot from "@/components/AdSlot";
import { MAX_FINANCIAL_LIMIT } from "@/lib/financial-constants";

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

// SLIDER HÍBRIDO BLINDADO
function DecimalSliderRow({ label, value, setValue, min, max, step = 1, unit = "€", accent = "lime", subtitle, useDynamicMax = true }) {
  const [textVal, setTextVal] = useState(String(value ?? 0));
  const ABSOLUTE_MAX = Math.max(max, MAX_FINANCIAL_LIMIT || 10000000);

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
      const clamped = Math.min(Math.max(parsed, min), ABSOLUTE_MAX);
      setValue(clamped);
      setTextVal(String(clamped));
    }
  };

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      setValue(val);
      setTextVal(String(val));
    }
  };

  const safeValue = isNaN(value) ? min : Math.max(min, Math.min(value, ABSOLUTE_MAX));
  
  const dynamicMax = useDynamicMax ? Math.max(safeValue * 2, 5000, min + 1000) : max;
  const sliderPos = Math.max(0, Math.min(safeValue, dynamicMax));
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
        max={dynamicMax}
        step={step}
        value={sliderPos}
        onChange={handleSliderChange}
        className="w-full cursor-pointer h-1.5 rounded-lg appearance-none bg-[var(--surface-alt,rgba(255,255,255,0.1))] accent-current"
        style={{ accentColor }}
      />
    </div>
  );
}
function EmergencyFundTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [monthsTarget, setMonthsTarget] = useState(() => {
    const p = initialParams?.monthsTarget;
    return p !== undefined && !isNaN(parseInt(p, 10)) ? parseInt(p, 10) : 6;
  });

  const [current, setCurrent] = useState(() => {
    const p = initialParams?.current;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 800;
  });

  const [monthly, setMonthly] = useState(() => {
    const p = initialParams?.monthly;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 120;
  });

  const [useBreakdown, setUseBreakdown] = useState(() => {
    return initialParams?.useBreakdown === "true";
  });

  const [simpleExpenses, setSimpleExpenses] = useState(() => {
    const p = initialParams?.simpleExpenses;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 1100;
  });

  const [breakdown, setBreakdown] = useState(() => {
    const p = initialParams?.breakdown;
    if (p) {
      try {
        const parsed = JSON.parse(p);
        if (parsed && typeof parsed === "object") {
          return { ...Object.fromEntries(ESSENTIAL_CATEGORIES.map((c) => [c.id, c.default])), ...parsed };
        }
      } catch (e) {}
    }
    return Object.fromEntries(ESSENTIAL_CATEGORIES.map((c) => [c.id, c.default]));
  });

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        monthsTarget,
        current,
        monthly,
        useBreakdown: useBreakdown ? "true" : null,
        simpleExpenses: !useBreakdown ? simpleExpenses : null,
        breakdown: useBreakdown ? JSON.stringify(breakdown) : null,
      });
    }
  }, [monthsTarget, current, monthly, useBreakdown, simpleExpenses, breakdown, onStateChange]);

  const breakdownTotal = useMemo(
    () => ESSENTIAL_CATEGORIES.reduce((sum, c) => sum + (breakdown[c.id] || 0), 0),
    [breakdown]
  );
  const expenses = useBreakdown ? breakdownTotal : simpleExpenses;
  
  // SANITIZACIÓN PARA EVITAR QUE LA GRÁFICA SE ROMPA
  const safeExpenses = Number.isFinite(expenses) ? expenses : 0;
  const safeMonths = Number.isFinite(monthsTarget) ? monthsTarget : 0;
  const goal = Math.min(safeExpenses * safeMonths, MAX_FINANCIAL_LIMIT);
  
  const safeGoal = Number.isFinite(goal) ? goal : 0;
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const safeMonthly = Number.isFinite(monthly) ? monthly : 0;

  const pageTitle = "Calculadora de fondo de emergencia: cuánto ahorrar y en cuántos meses | MetaBox";
  const pageDescription = "Calcula cuánto dinero necesitas en tu fondo de emergencia según tus gastos esenciales desglosados por categoría, cuánto llevas ahorrado y en cuántos meses lo conseguirás. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/fondo-de-emergencia";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="fondo de emergencia, cuánto ahorrar fondo de emergencia, calculadora fondo de emergencia, meses de gastos ahorrados, desglose gastos esenciales" />
        <link rel="canonical" href={pageUrl} />
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
            <DecimalSliderRow label="Gasto esencial mensual" value={simpleExpenses} min={300} max={MAX_FINANCIAL_LIMIT} step={50} unit="€" setValue={setSimpleExpenses} useDynamicMax={true} />
          ) : (
            <div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginBottom: "0.8rem" }}>
                Gasto esencial mensual: <span style={{ color: T.lime, fontWeight: 600 }}>{fmtEUR(breakdownTotal)}</span>
              </div>
              <div className="flex flex-col gap-5">
                {ESSENTIAL_CATEGORIES.map((c) => (
                  <DecimalSliderRow
                    key={c.id}
                    label={c.label}
                    value={breakdown[c.id] || 0}
                    min={0}
                    max={MAX_FINANCIAL_LIMIT}
                    step={10}
                    unit="€"
                    setValue={(v) => setBreakdown((b) => ({ ...b, [c.id]: v }))}
                    useDynamicMax={true}
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
        Objetivo calculado: <span style={{ color: T.lime, fontWeight: 600 }}>{fmtEUR(safeGoal)}</span>
      </div>

      <GoalProjection goal={safeGoal} current={safeCurrent} monthly={safeMonthly} extra={0} monthsSavedLabel="" />

      <AdviceBlock
        text={
          safeCurrent >= safeGoal
            ? "Ya tienes cubierto tu fondo de emergencia con este objetivo. Podrías redirigir la aportación mensual hacia otra meta."
            : safeMonthly > 0 && Math.ceil((safeGoal - safeCurrent) / safeMonthly) > 24
            ? "Al ritmo actual tardarás más de 2 años en completarlo. Si es posible, prioriza este fondo antes que metas menos urgentes."
            : "Vas por buen camino. Un fondo de emergencia sólido te da margen para no tocar tus otros ahorros ante un imprevisto."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <DecimalSliderRow label="Ya ahorrado" value={current} min={0} max={MAX_FINANCIAL_LIMIT} step={50} unit="€" setValue={setCurrent} useDynamicMax={true} />
          <DecimalSliderRow label="Aportación mensual" value={monthly} min={10} max={MAX_FINANCIAL_LIMIT} step={10} unit="€" accent="lavender" setValue={setMonthly} useDynamicMax={true} />
        </div>
      </Card>

      <AdSlot minHeight="0px" />
      <RelatedTools ids={["savings", "budget", "percent"]} onNavigate={onNavigate} primaryId="savings" />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Fondo de emergencia: gasto esencial ${fmtEUR(safeExpenses)}/mes × ${safeMonths} meses = objetivo ${fmtEUR(safeGoal)}. Ya ahorrado ${fmtEUR(safeCurrent)}, aportando ${fmtEUR(safeMonthly)}/mes.`
          }
        />
        <ExportCSVButton
          filename="fondo-emergencia"
          getRows={() => [
            { metrica: "Gasto esencial mensual", valor: safeExpenses.toFixed(2) },
            { metrica: "Meses de cobertura", valor: safeMonths },
            { metrica: "Objetivo total", valor: safeGoal.toFixed(2) },
            { metrica: "Ya ahorrado", valor: safeCurrent.toFixed(2) },
            { metrica: "Aportación mensual", valor: safeMonthly.toFixed(2) },
          ]}
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
