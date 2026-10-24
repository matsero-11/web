"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { CalendarDays, Plane, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, AdviceBlock } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Cómo calculo cuánto ahorrar cada mes para un viaje?",
    a: "Se resta lo que ya llevas ahorrado del presupuesto total del viaje, y esa diferencia se reparte entre los meses que faltan hasta la fecha del viaje.",
  },
  {
    q: "¿Qué pasa si no llego a ahorrar lo suficiente a tiempo?",
    a: "Puedes alargar unos meses la fecha del viaje para reducir la cuota mensual necesaria, o revisar el presupuesto total si hay margen para ajustarlo.",
  },
];

function monthsBetween(dateStr) {
  if (!dateStr) return 0;
  const target = new Date(`${dateStr}T12:00:00`);
  if (isNaN(target.getTime())) return 0;
  const now = new Date();
  const diffMs = target - now;
  if (diffMs <= 0) return 0;
  return Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30.4375)), 1);
}

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function MoneySlider({ label, value, setValue, min = 0, max = 1000000, step = 50, accent = "lime" }) {
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

function TimeSlider({ label, value, setValue, min = 0, max = 60, unit = "meses" }) {
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

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setValue(val);
    setTextVal(String(val));
  };

  const safeValue = isNaN(value) ? min : Math.max(min, Math.min(value, max));

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
            style={{ ...fontBody, color: T.lavender, fontSize: "0.9rem", width: "60px", outline: "none" }}
          />
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={safeValue}
        onChange={handleSliderChange}
        className="w-full cursor-pointer h-1.5 rounded-lg appearance-none bg-[var(--surface-alt,rgba(255,255,255,0.1))]"
        style={{ accentColor: T.lavender }}
      />
    </div>
  );
}
function TripSavingsTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [budget, setBudget] = useState(() => Number(initialParams?.budget) || 1200);
  const [current, setCurrent] = useState(() => Number(initialParams?.current) || 200);
  const [tripDate, setTripDate] = useState(() => (typeof initialParams?.tripDate === "string" ? initialParams.tripDate : ""));
  const [monthsLeft, setMonthsLeft] = useState(() => Number(initialParams?.monthsLeft) || 6);

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        budget, current, tripDate: tripDate ? tripDate : null, monthsLeft: !tripDate ? monthsLeft : null,
      });
    }
  }, [budget, current, tripDate, monthsLeft, onStateChange]);

  const safeBudget = Number.isFinite(budget) ? budget : 0;
  const safeCurrent = Number.isFinite(current) ? current : 0;
  
  const effectiveMonths = tripDate ? monthsBetween(tripDate) : (monthsLeft || 1);

  const remaining = Math.max(safeBudget - safeCurrent, 0);
  const requiredMonthly = effectiveMonths > 0 ? remaining / effectiveMonths : remaining;
  const animatedRequired = useAnimatedNumber(requiredMonthly);
  
  const pct = safeBudget > 0 ? (safeCurrent / safeBudget) * 100 : 0;
  const animatedPct = useAnimatedNumber(Math.min(pct, 100));
  
  // DATOS PARA EL GRÁFICO DE ANILLO (DONUT)
  const pieData = safeBudget <= 0 
    ? [{ name: "Empty", value: 1 }] 
    : [
        { name: "Ahorrado", value: Math.max(safeCurrent, 0) },
        { name: "Restante", value: Math.max(remaining, 0) }
      ];

  const pageTitle = "Calculadora de ahorro para un viaje: cuánto ahorrar al mes | MetaBox";
  const pageDescription = "Calcula cuánto tienes que ahorrar cada mes para cubrir el presupuesto de tu próximo viaje, poniendo la fecha exacta del viaje o los meses que faltan. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/ahorro-para-un-viaje";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="cuánto ahorrar para un viaje, calculadora ahorro para viajar, cómo ahorrar para las vacaciones, cuenta atrás ahorro viaje" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Ahorro para un viaje",
            url: pageUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            inLanguage: "es",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            description: pageDescription,
          })}
        </script>
      </Helmet>

      <ToolHeader title="Ahorro para un viaje" subtitle="Fija la fecha o los meses, y calculamos cuánto ahorrar cada mes." onBack={onBack} />

      {/* HERO CARD PREMIUM CON ICONO DE FONDO Y NEÓN */}
      <div style={{
        background: `linear-gradient(145deg, rgba(196,222,78,0.05) 0%, rgba(10,18,20,1) 100%)`,
        borderRadius: "1.5rem",
        padding: "2.5rem 1.5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${T.lime}40`,
        boxShadow: `0 20px 40px -10px rgba(0,0,0,0.8), inset 0 0 20px ${T.lime}10`
      }}>
        <Plane size={180} style={{ position: "absolute", top: "-10%", right: "-10%", color: T.lime, opacity: 0.03, transform: "rotate(-15deg)" }} />
        <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "100%", background: T.lime, filter: "blur(100px)", opacity: 0.15, zIndex: 0 }} />
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Necesitas ahorrar al mes
          </div>
          <div style={{ 
            ...fontDisplay, 
            color: T.lime, 
            fontSize: "3.5rem", 
            fontWeight: 800, 
            margin: "0.5rem 0", 
            textShadow: `0 0 20px ${T.lime}60, 0 4px 10px rgba(0,0,0,0.5)` 
          }}>
            {effectiveMonths > 0 ? fmtEUR(animatedRequired) : "—"}
          </div>
        </div>
      </div>

      {/* NUEVO GRÁFICO DE ANILLO PREMIUM */}
      <Card style={{ paddingBottom: "1rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
          <TrendingUp size={16} color={T.lime} /> Progreso de tu viaje
        </div>
        <div style={{ height: "180px", position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius="70%"
                outerRadius="95%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={pieData.length > 1 ? 3 : 0}
                stroke="none"
                isAnimationActive={true}
                animationDuration={500}
                cornerRadius={6}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === "Ahorrado" ? T.lime : T.surfaceAlt} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#111c1f", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: "12px", fontSize: "13px", color: T.text, boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                formatter={(v, name) => [fmtEUR(v), name === "Restante" ? "Falta" : "Ahorrado"]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.2rem", fontWeight: 800, textShadow: `0 0 10px ${T.lime}40` }}>{animatedPct.toFixed(0)}%</div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>cubierto</div>
          </div>
        </div>
      </Card>

      {/* TARJETA DE FECHA PREMIUM */}
      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CalendarDays size={16} color={T.lime} /> Fecha del viaje
        </div>
        <input
          type="date"
          value={tripDate}
          min={todayISO()}
          onChange={(e) => setTripDate(e.target.value)}
          style={{
            ...fontBody, width: "100%", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.8rem",
            padding: "0.75rem 1rem", color: T.text, fontSize: "0.95rem", outline: "none",
          }}
        />
        {tripDate && (
          <div style={{ ...fontBody, color: T.lime, fontSize: "0.85rem", marginTop: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Plane size={14} /> Faltan {effectiveMonths} {effectiveMonths === 1 ? "mes" : "meses"} para el viaje
          </div>
        )}
      </Card>

      <AdviceBlock
        text={
          effectiveMonths === 0
            ? "Sin margen de tiempo, la única opción es tenerlo ya ahorrado o retrasar la fecha del viaje."
            : requiredMonthly > safeBudget * 0.4
            ? "La cuota mensual es alta para el tiempo que queda. Si puedes mover la fecha unas semanas, el esfuerzo mensual baja bastante."
            : "El ritmo necesario es razonable. Prueba a alargar unos meses el plazo y compara cuánto baja la cuota mensual."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <MoneySlider label="Presupuesto del viaje" value={budget} min={100} max={100000} step={50} accent="lime" setValue={setBudget} />
          <MoneySlider label="Ya ahorrado" value={current} min={0} max={100000} step={25} accent="lavender" setValue={setCurrent} />
          {!tripDate && (
            <TimeSlider label="Meses hasta el viaje" value={monthsLeft} min={1} max={60} unit="meses" setValue={setMonthsLeft} />
          )}
        </div>
      </Card>

      <AdSlot minHeight="0px" />
      <RelatedTools ids={["tripdaily", "currency"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Ahorro para un viaje: presupuesto ${fmtEUR(safeBudget)}, ya ahorrado ${fmtEUR(safeCurrent)}, ${effectiveMonths} meses hasta el viaje → necesitas ${fmtEUR(requiredMonthly)}/mes.`
          }
        />
        <ExportCSVButton
          filename="ahorro-para-un-viaje"
          getRows={() => [
            {
              presupuesto: safeBudget,
              ya_ahorrado: safeCurrent,
              meses_restantes: effectiveMonths,
              necesario_mensual: requiredMonthly.toFixed(2),
              porcentaje_cubierto: pct.toFixed(1) + "%",
            },
          ]}
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Ponerle fecha a un viaje ayuda a ahorrar con más disciplina que un objetivo indefinido. Introduce la fecha exacta de tu viaje (o los meses que faltan si aún no la tienes) y esta calculadora reparte lo que te falta ahorrar entre el tiempo restante.
        </p>
      </div>
    </div>
  );
}

export default TripSavingsTool;
