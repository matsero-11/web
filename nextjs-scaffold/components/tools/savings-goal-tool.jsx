"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { fmtEUR } from "@/lib/hooks";
import { Card, AdviceBlock } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
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

function MoneySlider({ label, value, setValue, min = 0, max = 1000000, step = 1000, accent = "lime" }) {
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

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({ goal, current, monthly, extra });
    }
  }, [goal, current, monthly, extra, onStateChange]);

  // Lógica de cálculo segura
  const safeGoal = Math.max(0, Number.isFinite(goal) ? goal : 0);
  const safeCurrent = Math.max(0, Number.isFinite(current) ? current : 0);
  const totalMonthly = Math.max(0, (Number.isFinite(monthly) ? monthly : 0) + (Number.isFinite(extra) ? extra : 0));

  const remaining = Math.max(0, safeGoal - safeCurrent);
  const monthsNeeded = totalMonthly > 0 ? Math.ceil(remaining / totalMonthly) : 0;
  const isGoalAchieved = remaining === 0 && safeGoal > 0;
  const yearsNeeded = (monthsNeeded / 12).toFixed(1);

  const heroTitle = isGoalAchieved 
    ? "¡Objetivo alcanzado!" 
    : totalMonthly === 0 
    ? "Aportación necesaria" 
    : `Lo conseguirás en ${monthsNeeded} ${monthsNeeded === 1 ? "mes" : "meses"}`;

  const heroSubtitle = isGoalAchieved 
    ? "Ya tienes todo el dinero para tu meta."
    : totalMonthly === 0
    ? "Introduce una aportación mensual para ver el tiempo."
    : `Equivale a ${yearsNeeded} ${yearsNeeded === "1.0" ? "año" : "años"} ahorrando.`;

  // Generación de datos para la gráfica
  const chartData = useMemo(() => {
    if (isGoalAchieved) return [{ mes: 0, ahorro: safeCurrent }, { mes: 1, ahorro: safeCurrent }];
    if (totalMonthly === 0 || safeGoal === 0) return [{ mes: 0, ahorro: safeCurrent }];

    const data = [];
    let acc = safeCurrent;
    const maxMonths = Math.min(monthsNeeded, 120); // Limitar a 10 años visualmente
    const step = maxMonths > 36 ? Math.ceil(maxMonths / 36) : 1;

    data.push({ mes: 0, ahorro: acc });
    for (let m = 1; m <= monthsNeeded; m++) {
      acc += totalMonthly;
      if (m % step === 0 || m === monthsNeeded) {
        data.push({ mes: m, ahorro: Math.min(acc, safeGoal) });
      }
    }
    return data;
  }, [isGoalAchieved, safeCurrent, totalMonthly, safeGoal, monthsNeeded]);

  const pageTitle = "Calculadora de objetivo de ahorro: cuánto tardarás en llegar a tu meta | MetaBox";
  const pageDescription = "Calcula cuánto tardarás en alcanzar tu objetivo de ahorro introduciendo tu meta, lo que ya tienes y tu aportación mensual o extra. Gratis y sin registro.";
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

      <ToolHeader title="Objetivo de ahorro" subtitle="Gestiona tu meta y verás el tiempo estimado al instante." onBack={onBack} />

      {/* HERO CARD PREMIUM */}
      <div style={{
        background: `linear-gradient(145deg, rgba(196,222,78,0.08) 0%, rgba(10,18,20,1) 100%)`,
        borderRadius: "1.5rem",
        padding: "2.5rem 1.5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        border: `1px solid rgba(196,222,78,0.2)`,
        boxShadow: `0 20px 40px -10px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)`
      }}>
        <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "100%", background: T.lime, filter: "blur(120px)", opacity: 0.15, zIndex: 0 }} />
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ ...fontDisplay, color: "#fff", fontSize: monthsNeeded > 99 ? "2.2rem" : "3rem", fontWeight: 800, lineHeight: 1.1, textShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            {heroTitle}
          </div>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.95rem", marginTop: "0.8rem", lineHeight: 1.5 }}>
            {heroSubtitle}
          </div>
        </div>
      </div>

      <AdviceBlock
        text={
          isGoalAchieved
            ? "¡Ya tienes todo el dinero para tu meta! Es el momento perfecto para empezar a buscar ofertas."
            : totalMonthly === 0
            ? "Introduce una aportación mensual o extra superior a 0 € para poder calcular el tiempo estimado."
            : "Al ritmo actual mantienes una constancia sólida. Subir la aportación mensual, aunque sea poco, acorta el plazo de forma notable."
        }
      />

      {/* GRÁFICO PREMIUM */}
      <Card style={{ paddingBottom: "1rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          Tu evolución hacia la meta
        </div>
        <div style={{ width: "100%", height: "220px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAhorro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.lime} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={T.lime} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={20} />
              <YAxis hide domain={[0, safeGoal * 1.05]} />
              <Tooltip 
                formatter={(value) => [fmtEUR(value), "Ahorrado"]}
                labelFormatter={(label) => label === 0 ? "Hoy" : `Mes ${label}`}
                contentStyle={{ background: "#111c1f", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: "12px", fontSize: "13px", color: T.text, boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }} 
                cursor={{ stroke: T.lime, strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area type="monotone" dataKey="ahorro" stroke={T.lime} strokeWidth={3} fill="url(#colorAhorro)" activeDot={{ r: 6, stroke: "#0a1214", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <MoneySlider label="Objetivo" value={goal} min={0} max={1000000} step={500} accent="lime" setValue={setGoal} />
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
