"use client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Calendar, Wallet, Plus, TrendingDown } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, AdviceBlock, Button, Chip } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Cómo calculo cuánto puedo gastar al día durante un viaje?",
    a: "Se resta lo ya gastado del presupuesto total, y esa cantidad restante se reparte entre los días de viaje que te quedan por delante — así sabes en tiempo real cuánto margen diario tienes.",
  },
  {
    q: "¿Qué hago si voy gastando más rápido de lo previsto?",
    a: "Si tu gasto diario disponible baja respecto al plan original, puedes ajustar el ritmo en los días restantes o revisar el presupuesto total si el viaje lo permite.",
  },
];

function TimeSlider({ label, value, setValue, min = 1, max = 365, unit = "días" }) {
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

function MoneySlider({ label, value, setValue, min = 0, max = 100000, step = 50, accent = "lime" }) {
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
function TripDailyBudgetTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [totalBudget, setTotalBudget] = useState(() => Number(initialParams?.totalBudget) || 900);
  const [spent, setSpent] = useState(() => Number(initialParams?.spent) || 300);
  const [todaySpend, setTodaySpend] = useState("");
  
  const [timeUnit, setTimeUnit] = useState("dias");
  const [totalDays, setTotalDays] = useState(() => Number(initialParams?.totalDays) || 6);
  const [daysElapsed, setDaysElapsed] = useState(() => Number(initialParams?.daysElapsed) || 2);

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({ totalBudget, totalDays, spent, daysElapsed });
    }
  }, [totalBudget, totalDays, spent, daysElapsed, onStateChange]);

  const safeBudget = Number.isFinite(totalBudget) ? totalBudget : 0;
  const safeSpent = Number.isFinite(spent) ? spent : 0;
  const safeTotalDays = Number.isFinite(totalDays) && totalDays > 0 ? totalDays : 1;
  const safeDaysElapsed = Number.isFinite(daysElapsed) ? daysElapsed : 0;

  const remainingBudget = Math.max(safeBudget - safeSpent, 0);
  const remainingDays = Math.max(safeTotalDays - safeDaysElapsed, 0);
  const dailyAllowanceLeft = remainingDays > 0 ? remainingBudget / remainingDays : remainingBudget;
  const originalDailyPlan = safeBudget / safeTotalDays;

  const animatedAllowance = useAnimatedNumber(dailyAllowanceLeft);
  const onTrack = dailyAllowanceLeft >= originalDailyPlan * 0.9;
  const spentPct = safeBudget > 0 ? Math.min((safeSpent / safeBudget) * 100, 100) : 0;

  const logToday = () => {
    const amount = parseFloat(String(todaySpend).replace(",", "."));
    if (!isNaN(amount) && amount > 0) {
      setSpent((s) => Math.min(s + amount, safeBudget));
      setDaysElapsed((d) => Math.min(d + 1, safeTotalDays));
      setTodaySpend("");
    }
  };

  const isMeses = timeUnit === "meses";
  const isAnos = timeUnit === "anos";
  
  const displayTotalTime = isAnos ? Math.round(safeTotalDays / 365) : isMeses ? Math.ceil(safeTotalDays / 30) : safeTotalDays;
  const displayElapsedTime = isAnos ? Math.round(safeDaysElapsed / 365) : isMeses ? Math.ceil(safeDaysElapsed / 30) : safeDaysElapsed;

  const handleTotalTimeChange = (val) => {
    if (isAnos) setTotalDays(val * 365);
    else if (isMeses) setTotalDays(val * 30);
    else setTotalDays(val);
    if (val === 0) setDaysElapsed(0); 
  };

  const handleElapsedTimeChange = (val) => {
    if (isAnos) setDaysElapsed(val * 365);
    else if (isMeses) setDaysElapsed(val * 30);
    else setDaysElapsed(val);
  };

  const pageTitle = "Presupuesto diario de viaje: cuánto puedes gastar hoy | MetaBox";
  const pageDescription = "Controla tu presupuesto de viaje día a día: registra lo gastado hoy y descubre al instante cuánto puedes gastar cada día que te queda. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/presupuesto-diario-de-viaje";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="presupuesto diario de viaje, cuánto puedo gastar al día en un viaje, calculadora presupuesto viaje, registrar gasto diario viaje" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Presupuesto diario de viaje",
            url: pageUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            inLanguage: "es",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            description: pageDescription,
          })}
        </script>
      </Helmet>

      <ToolHeader title="Presupuesto diario de viaje" subtitle="Registra lo gastado hoy y verás cuánto te queda por día." onBack={onBack} />

      {/* DASHBOARD DE RESUMEN */}
      <div className="grid grid-cols-3 gap-3">
        <div style={{ background: T.surfaceAlt, padding: "1rem", borderRadius: "1rem", border: `1px solid ${T.border}`, textAlign: "center" }}>
          <Wallet size={16} color={T.textMuted} style={{ margin: "0 auto 0.4rem" }} />
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 600 }}>Total</div>
          <div style={{ ...fontDisplay, color: T.text, fontSize: "1.1rem", fontWeight: 700 }}>{fmtEUR(safeBudget)}</div>
        </div>
        <div style={{ background: T.surfaceAlt, padding: "1rem", borderRadius: "1rem", border: `1px solid ${T.border}`, textAlign: "center" }}>
          <TrendingDown size={16} color={T.coral} style={{ margin: "0 auto 0.4rem" }} />
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 600 }}>Gastado</div>
          <div style={{ ...fontDisplay, color: T.coral, fontSize: "1.1rem", fontWeight: 700 }}>{fmtEUR(safeSpent)}</div>
        </div>
        <div style={{ background: T.surfaceAlt, padding: "1rem", borderRadius: "1rem", border: `1px solid ${T.border}`, textAlign: "center" }}>
          <Calendar size={16} color={T.lime} style={{ margin: "0 auto 0.4rem" }} />
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 600 }}>Queda</div>
          <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.1rem", fontWeight: 700 }}>{fmtEUR(remainingBudget)}</div>
        </div>
      </div>

      {/* HERO CARD PREMIUM */}
      <div style={{
        background: `linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(10,18,20,1) 100%)`,
        borderRadius: "1.5rem",
        padding: "2.5rem 1.5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${onTrack ? T.lime : T.coral}40`,
        boxShadow: `0 20px 50px -10px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.03)`
      }}>
        <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "100%", background: onTrack ? T.lime : T.coral, filter: "blur(120px)", opacity: 0.15, zIndex: 0 }} />
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.08)", padding: "0.4rem 1rem", borderRadius: "999px", marginBottom: "1rem" }}>
            <span style={{ ...fontBody, color: T.text, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Límite diario</span>
          </div>
          
          <div style={{ ...fontDisplay, color: onTrack ? T.lime : T.coral, fontSize: "3.8rem", fontWeight: 800, lineHeight: 1, textShadow: `0 4px 20px ${onTrack ? T.lime : T.coral}40` }}>
            {remainingDays > 0 ? fmtEUR(animatedAllowance) : "—"}
          </div>
          
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.9rem", marginTop: "0.8rem", marginBottom: "1.5rem" }}>
            Te quedan <strong>{remainingDays}</strong> {remainingDays === 1 ? "día" : "días"} de viaje.
          </div>

          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "999px", height: "10px", overflow: "hidden", marginBottom: "2rem", maxWidth: "320px", margin: "0 auto 2rem" }}>
            <div style={{ width: `${spentPct}%`, height: "100%", background: spentPct > 90 ? T.coral : T.lime, transition: "width 0.4s ease", boxShadow: `0 0 10px ${spentPct > 90 ? T.coral : T.lime}` }} />
          </div>

          <div style={{ display: "flex", gap: "0.6rem", maxWidth: "340px", margin: "0 auto" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: "1rem", padding: "0 1rem" }}>
              <input
                value={todaySpend}
                onChange={(e) => setTodaySpend(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && logToday()}
                placeholder="Gasto de hoy"
                inputMode="decimal"
                style={{
                  ...fontBody, flex: 1, background: "transparent", border: "none",
                  padding: "0.8rem 0", color: "#fff", fontSize: "1rem", outline: "none", textAlign: "center",
                }}
              />
              <span style={{ color: T.textMuted, ...fontBody }}>€</span>
            </div>
            <button onClick={logToday} style={{ background: T.lime, border: "none", borderRadius: "1rem", width: "56px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 4px 15px ${T.lime}40`, transition: "transform 0.1s" }} onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"} onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}>
              <Plus size={24} color="#0a1214" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      <AdviceBlock
        text={
          !onTrack
            ? "Vas por encima del ritmo previsto. Si quieres llegar sin sobresaltos, reduce un poco el gasto de los próximos días."
            : remainingDays === 0
            ? "El viaje ha terminado según estos datos. Compara el gasto real con el plan original para el próximo viaje."
            : "Vas dentro del plan. Aun assim, deja algo de margen para imprevistos de última hora."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <MoneySlider label="Presupuesto total del viaje" value={totalBudget} min={50} max={100000} step={50} accent="lime" setValue={setTotalBudget} />
          
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: "1rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <Chip label="Días" active={timeUnit === "dias"} onClick={() => setTimeUnit("dias")} />
              <Chip label="Meses" active={timeUnit === "meses"} onClick={() => setTimeUnit("meses")} />
              <Chip label="Años" active={timeUnit === "anos"} onClick={() => setTimeUnit("anos")} />
            </div>
            
            <TimeSlider 
              label={`${isAnos ? "Años" : isMeses ? "Meses" : "Días"} totales de viaje`} 
              value={displayTotalTime} 
              setValue={handleTotalTimeChange} 
              min={1} 
              max={isAnos ? 5 : isMeses ? 60 : 365} 
              unit={isAnos ? "años" : isMeses ? "meses" : "días"} 
            />
          </div>
          
          <MoneySlider label="Gastado hasta ahora" value={spent} min={0} max={totalBudget} step={10} accent="lavender" setValue={setSpent} />
          
          <div>
            <TimeSlider 
              label={`${isAnos ? "Años" : isMeses ? "Meses" : "Días"} ya pasados`} 
              value={displayElapsedTime} 
              setValue={handleElapsedTimeChange} 
              min={0} 
              max={displayTotalTime} 
              unit={isAnos ? "años" : isMeses ? "meses" : "días"} 
            />
          </div>
        </div>
      </Card>

      <AdSlot minHeight="0px" />
      <RelatedTools ids={["trip", "currency"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Presupuesto de viaje: ${fmtEUR(totalBudget)} para ${totalDays} días, gastado ${fmtEUR(spent)} en ${daysElapsed} días → ${fmtEUR(dailyAllowanceLeft)}/día restante.`
          }
        />
        <ExportCSVButton
          filename="presupuesto-diario-de-viaje"
          getRows={() => [
            {
              presupuesto_total: totalBudget,
              dias_totales: totalDays,
              gastado: spent,
              dias_pasados: daysElapsed,
              presupuesto_diario_restante: dailyAllowanceLeft.toFixed(2),
            },
          ]}
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Es fácil perder de vista el presupuesto de un viaje a mitad de las vacaciones. Registra lo que gastas cada día directamente desde el resultado, y esta herramienta recalcula al instante cuánto puedes gastar en los días que te quedan, sin sorpresas al final.
        </p>
      </div>
    </div>
  );
}

export default TripDailyBudgetTool;
