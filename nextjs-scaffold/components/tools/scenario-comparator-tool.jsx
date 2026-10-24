"use client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, AdviceBlock, Button } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Para qué sirve comparar dos escenarios de ahorro?",
    a: "Te permite ver de forma clara el impacto real de subir (o bajar) tu ahorro mensual a lo largo del tiempo, algo que no siempre es intuitivo cuando solo miras la diferencia mes a mes.",
  },
  {
    q: "¿Por qué la diferencia parece pequeña al mes pero grande a 10 años?",
    a: "Porque se acumula: una diferencia de 20€ al mes son solo 240€ al año, pero a 10 años son 2.400€ — el efecto se magnifica con el tiempo, aunque cada mes por separado parezca poco relevante.",
  },
  {
    q: "¿Para qué sirve el tercer escenario?",
    a: "Muchas decisiones reales son entre tres opciones, no dos: por ejemplo, mantener el ritmo actual, un ajuste moderado o uno ambicioso. Compararlas juntas ayuda a decidir con más contexto.",
  },
];

function MoneySlider({ label, value, setValue, min = 0, max = 1000000, step = 50, accent = "lime" }) {
  const [textVal, setTextVal] = useState(String(value ?? 0));
  const accentColor = accent === "lavender" ? T.lavender : accent === "coral" ? T.coral : T.lime;

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
function ScenarioComparatorTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [current, setCurrent] = useState(() => {
    const p = initialParams?.current;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 150;
  });

  const [alternative, setAlternative] = useState(() => {
    const p = initialParams?.alternative;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 220;
  });

  const [showThird, setShowThird] = useState(() => {
    return initialParams?.showThird === "true" || initialParams?.thirdScenario !== undefined;
  });

  const [thirdScenario, setThirdScenario] = useState(() => {
    const p = initialParams?.thirdScenario;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 300;
  });

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        current,
        alternative,
        showThird: showThird ? "true" : null,
        thirdScenario: showThird ? thirdScenario : null,
      });
    }
  }, [current, alternative, showThird, thirdScenario, onStateChange]);

  const monthlyDiff = alternative - current;
  const annualDiff = monthlyDiff * 12;
  const animatedAnnualDiff = useAnimatedNumber(Math.abs(annualDiff));
  const positive = monthlyDiff >= 0;

  const barData = [1, 5, 10].map((years) => ({
    years: `${years} año${years > 1 ? "s" : ""}`,
    actual: (current || 0) * 12 * years,
    nuevo: (alternative || 0) * 12 * years,
    ...(showThird ? { tercero: (thirdScenario || 0) * 12 * years } : {}),
  }));

  const pageTitle = "Comparador de escenarios de ahorro: compara hasta 3 ritmos a la vez | MetaBox";
  const pageDescription = "Compara tu ahorro mensual actual con hasta dos escenarios alternativos y descubre la diferencia real a 1, 5 y 10 años en una gráfica interactiva. Gratis y sin registro.";
  
  // CORRECCIÓN CRÍTICA DE SEO
  const pageUrl = "https://metabox-web.vercel.app/herramientas/comparador-escenarios-ahorro";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="comparador de ahorro, comparar escenarios de ahorro, cuánto ahorraría si subo mi ahorro mensual, simulador de ahorro a largo plazo" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Comparador de escenarios",
            url: pageUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            inLanguage: "es",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            description: pageDescription,
          })}
        </script>
      </Helmet>

      <ToolHeader title="Comparador de escenarios" subtitle="Compara varias formas de ahorrar y ve la diferencia real." onBack={onBack} />

      <div className={`grid grid-cols-1 ${showThird ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
        <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem", borderTop: `3px solid ${T.textMuted}` }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginBottom: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>Situación actual</div>
          <MoneySlider label="Ahorro mensual" value={current} min={0} max={1000000} step={50} accent="lime" setValue={setCurrent} />
        </Card>
        <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem", borderTop: `3px solid ${T.lavender}` }}>
          <div style={{ ...fontBody, color: T.lavender, fontSize: "0.85rem", marginBottom: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>Nuevo escenario</div>
          <MoneySlider label="Ahorro mensual" value={alternative} min={0} max={1000000} step={50} accent="lavender" setValue={setAlternative} />
        </Card>
        {showThird && (
          <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem", borderTop: `3px solid ${T.coral}` }}>
            <div style={{ ...fontBody, color: T.coral, fontSize: "0.85rem", marginBottom: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>Tercer escenario</div>
            <MoneySlider label="Ahorro mensual" value={thirdScenario} min={0} max={1000000} step={50} accent="coral" setValue={setThirdScenario} />
          </Card>
        )}
      </div>

      {!showThird && (
        <Button variant="ghost" onClick={() => setShowThird(true)}>
          + Añadir un tercer escenario
        </Button>
      )}

      {/* HERO CARD PREMIUM */}
      <div style={{
        background: `linear-gradient(145deg, rgba(196,222,78,0.05) 0%, rgba(10,18,20,1) 100%)`,
        borderRadius: "1.5rem",
        padding: "2rem 1.5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${positive ? T.lime : T.coral}30`,
        boxShadow: `0 20px 40px -10px rgba(0,0,0,0.8)`
      }}>
        <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "100%", background: positive ? T.lime : T.coral, filter: "blur(100px)", opacity: 0.15, zIndex: 0 }} />
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {positive ? "Ahorrarías de más al año" : "Ahorrarías de menos al año"}
          </div>
          <div style={{ ...fontDisplay, color: positive ? T.lime : T.coral, fontSize: "3rem", fontWeight: 800, margin: "0.5rem 0", textShadow: "0 4px 15px rgba(0,0,0,0.5)" }}>
            {positive ? "+" : "−"}{fmtEUR(animatedAnnualDiff)}
          </div>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.9rem" }}>
            ({positive ? "+" : "−"}{fmtEUR(Math.abs(monthlyDiff))} al mes de diferencia)
          </div>
        </div>
      </div>

      <AdviceBlock
        text={
          !positive
            ? "El nuevo escenario ahorra menos que el actual. Puede tener sentido si libera gasto en otra parte, pero no lo pierdas de vista."
            : Math.abs(monthlyDiff) < 20
            ? "La diferencia mensual es pequeña, pero fíjate en el acumulado a 10 años del gráfico: ahí se nota de verdad."
            : "Buena diferencia acumulada. Compara con el tercer escenario si quieres ver un salto todavía mayor."
        }
      />

      <Card style={{ paddingBottom: "1rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          Acumulado a lo largo del tiempo
        </div>
        <div style={{ width: "100%", height: "220px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barGap={6} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.textMuted} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={T.textMuted} stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="colorNuevo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.lavender} stopOpacity={0.9}/>
                  <stop offset="95%" stopColor={T.lavender} stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="colorTercero" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.coral} stopOpacity={0.9}/>
                  <stop offset="95%" stopColor={T.coral} stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="years" tick={{ fill: T.textMuted, fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(v, n) => [fmtEUR(v), n === "actual" ? "Actual" : n === "nuevo" ? "Nuevo" : "Tercero"]}
                contentStyle={{ background: "#111c1f", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: "12px", fontSize: "13px", color: T.text, boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar dataKey="actual" fill="url(#colorActual)" radius={[6, 6, 0, 0]} maxBarSize={30} />
              <Bar dataKey="nuevo" fill="url(#colorNuevo)" radius={[6, 6, 0, 0]} maxBarSize={30} />
              {showThird && <Bar dataKey="tercero" fill="url(#colorTercero)" radius={[6, 6, 0, 0]} maxBarSize={30} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <AdSlot minHeight="0px" />
      <RelatedTools ids={["savings", "interest"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Comparador: actual ${fmtEUR(current)}/mes vs. nuevo ${fmtEUR(alternative)}/mes` +
            (showThird ? ` vs. tercero ${fmtEUR(thirdScenario)}/mes` : "") +
            ` → ${fmtEUR(Math.abs(monthlyDiff))}/mes de diferencia entre actual y nuevo.`
          }
        />
        <ExportCSVButton
          filename="comparador-de-escenarios"
          getRows={() => barData.map((r) => ({ periodo: r.years, actual: r.actual.toFixed(2), nuevo: r.nuevo.toFixed(2), ...(showThird ? { tercero: r.tercero.toFixed(2) } : {}) }))}
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          A veces cuesta ver el impacto real de ahorrar un poco más cada mes. Este comparador pone lado a lado tu ritmo actual, un nuevo escenario y, si lo necesitas, un tercero, proyectando la diferencia acumulada a 1, 5 y 10 años para que decidas con datos.
        </p>
      </div>
    </div>
  );
}

export default ScenarioComparatorTool;
