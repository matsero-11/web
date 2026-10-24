"use client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis,
} from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, Chip, AdviceBlock, Button } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { usePersistentState } from "@/lib/persistence";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Qué porcentaje de mis ingresos debería ahorrar?",
    a: "Una referencia habitual es ahorrar al menos entre el 10% y el 20% de tus ingresos mensuales, aunque el porcentaje ideal depende de tus gastos fijos y objetivos personales.",
  },
  {
    q: "¿Por qué es útil ver el ahorro en porcentaje y no solo en euros?",
    a: "El porcentaje te permite comparar tu capacidad de ahorro de forma constante aunque tus ingresos cambien, y es más fácil marcarte objetivos realistas ('ahorrar el 15%') que una cifra fija que puede no ajustarse a tu situación.",
  },
  {
    q: "¿Para qué sirve guardar el histórico?",
    a: "Guardando tu porcentaje cada mes puedes ver si tu tasa de ahorro mejora, empeora o se mantiene estable a lo largo del tiempo, en vez de mirar solo el mes actual de forma aislada.",
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
function SavingsPercentTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [income, setIncome] = useState(() => {
    const p = initialParams?.income;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 1800;
  });

  const [savings, setSavings] = useState(() => {
    const p = initialParams?.savings;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 250;
  });

  const [period, setPeriod] = useState(() => {
    const p = initialParams?.period;
    return typeof p === "string" && p.trim() !== "" ? p : "mes";
  });

  const [history, setHistory] = usePersistentState("percent_history", () => {
    const p = initialParams?.history;
    if (p) {
      try {
        const parsed = JSON.parse(p);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        income,
        savings,
        period: period !== "mes" ? period : null,
        history: history.length > 0 ? JSON.stringify(history) : null,
      });
    }
  }, [income, savings, period, history, onStateChange]);

  const rawPct = income > 0 ? (savings / income) * 100 : 0;
  const safePct = Number.isFinite(rawPct) ? Math.max(0, rawPct) : 0;
  const animatedPct = useAnimatedNumber(safePct);
  
  let band = { text: "Por debajo del 10%", color: T.coral };
  if (safePct >= 20) band = { text: "Por encima del 20%", color: T.lime };
  else if (safePct >= 10) band = { text: "Entre el 10% y el 20%", color: T.lavender };

  const gaugeData = [{ name: "ahorro", value: Math.min(safePct, 100), fill: band.color }];
  const displayAmount = period === "mes" ? savings : savings * 12;
  
  const pctString = animatedPct.toFixed(1);
  const numSize = pctString.length > 6 ? "2rem" : pctString.length > 4 ? "2.8rem" : "3.5rem";

  const saveSnapshot = () => {
    const snapshot = { 
      id: Date.now(),
      label: new Date().toLocaleDateString("es-ES", { day: '2-digit', month: "short" }), 
      pct: Number(safePct.toFixed(1)) 
    };
    setHistory((prev) => [snapshot, ...prev].slice(0, 12));
  };

  const pageTitle = "Calculadora de porcentaje de ahorro sobre tu sueldo | MetaBox";
  const pageDescription = "Calcula qué porcentaje de tu sueldo estás ahorrando cada mes, guarda tu histórico y comprueba si tu tasa de ahorro mejora con el tiempo. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/porcentaje-de-ahorro";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="porcentaje de ahorro sobre el sueldo, cuánto debería ahorrar de mi sueldo, calculadora porcentaje de ahorro, evolución tasa de ahorro" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Porcentaje de ahorro",
            url: pageUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            inLanguage: "es",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            description: pageDescription,
          })}
        </script>
      </Helmet>

      <ToolHeader title="Porcentaje de ahorro" subtitle="Qué parte de tu ingreso estás ahorrando." onBack={onBack} />

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div className="flex gap-2 justify-center">
          <Chip label="Al mes" active={period === "mes"} onClick={() => setPeriod("mes")} />
          <Chip label="Al año" active={period === "año"} onClick={() => setPeriod("año")} />
        </div>
      </Card>

      <div style={{
        background: `linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(10,18,20,1) 100%)`,
        borderRadius: "1.5rem",
        padding: "2rem 1.5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${band.color}40`,
        boxShadow: `0 20px 40px -10px rgba(0,0,0,0.8), inset 0 0 20px ${band.color}10`
      }}>
        <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "100%", background: band.color, filter: "blur(100px)", opacity: 0.15, zIndex: 0 }} />
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ height: "160px", position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="72%"
                outerRadius="100%"
                data={gaugeData}
                startAngle={180}
                endAngle={0}
                barSize={16}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar
                  dataKey="value"
                  cornerRadius={8}
                  fill={band.color}
                  background={{ fill: "rgba(255,255,255,0.03)" }}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "40px" }}>
              <div style={{ 
                ...fontDisplay, 
                color: "#ffffff", 
                fontSize: numSize, 
                fontWeight: 800, 
                lineHeight: 1,
                textShadow: "0 4px 15px rgba(0,0,0,0.8)"
              }}>
                {pctString}%
              </div>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginTop: "0.3rem" }}>de tu ingreso</div>
            </div>
          </div>
          
          <div style={{ ...fontBody, color: band.color, fontSize: "0.95rem", fontWeight: 600, marginTop: "0.5rem" }}>
            {band.text}
          </div>
          <div style={{ ...fontBody, color: T.text, fontSize: "1.05rem", marginTop: "0.5rem" }}>
            Eso son <span style={{ color: T.lime, fontWeight: 700 }}>{fmtEUR(displayAmount)}</span> {period === "mes" ? "cada mes" : "cada año"}
          </div>
        </div>
      </div>

      <AdviceBlock
        text={
          safePct < 10
            ? "Un margen reducido no siempre es un problema: antes de subirlo, revisa en 'Presupuesto mensual' si hay gastos variables con recorte."
            : safePct < 20
            ? "Estás en un rango saludable. Mueve el ahorro mensual unos euros y mira cuánto sube el porcentaje."
            : "Tienes un margen amplio. Podrías comprobar en 'Objetivo de ahorro' cuánto antes alcanzarías una meta concreta con este ritmo."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <MoneySlider label="Ingreso mensual" value={income} min={0} max={1000000} step={100} accent="lime" setValue={setIncome} />
          <MoneySlider label="Ahorro mensual" value={savings} min={0} max={1000000} step={50} accent="lavender" setValue={setSavings} />
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "1rem" }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem" }}>
            Historial de meses guardados
          </div>
          <Button variant="ghost" onClick={saveSnapshot} style={{ width: "auto", padding: "0.5rem 0.9rem", fontSize: "0.8rem", border: `1px solid ${T.lime}` }}>
            Guardar este mes
          </Button>
        </div>
        
        {history.length > 0 ? (
          <div style={{ display: "flex", gap: "0.8rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
            {history.map((item) => (
              <div key={item.id} style={{ 
                background: T.surfaceAlt, 
                padding: "1rem", 
                borderRadius: "1rem", 
                border: `1px solid ${T.border}`, 
                minWidth: "100px", 
                textAlign: "center" 
              }}>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", marginBottom: "0.4rem" }}>{item.label}</div>
                <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.3rem", fontWeight: 700 }}>{item.pct}%</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", padding: "1rem 0", textAlign: "center", background: T.surfaceAlt, borderRadius: "0.8rem" }}>
            Aún no has guardado ningún mes. Pulsa "Guardar este mes" para empezar tu historial.
          </div>
        )}
      </Card>

      <AdSlot minHeight="0px" />
      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
        Referencia orientativa, no un dato verificado ni una recomendación personalizada.
      </div>
      
      <RelatedTools ids={["savings", "rule502030"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton getText={() => `Porcentaje de ahorro: ${fmtEUR(savings)} de ${fmtEUR(income)} = ${safePct.toFixed(1)}%.`} />
        <ExportCSVButton
          filename="tasa-de-ahorro"
          getRows={() =>
            history.length > 0
              ? history.map((item) => ({ mes: item.label, tasa_ahorro_pct: item.pct }))
              : [{ mes: "Actual", ingreso: income, ahorro: savings, tasa_ahorro_pct: safePct.toFixed(1) }]
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Saber qué porcentaje de tu sueldo ahorras es más útil que fijarte solo en la cifra en euros, porque te permite compararte con referencias estándar y adaptar el objetivo si tus ingresos cambian. Guarda tu porcentaje cada mes para ver si tu tasa de ahorro mejora con el tiempo.
        </p>
      </div>
    </div>
  );
}

export default SavingsPercentTool;
