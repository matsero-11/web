"use client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Plane, Calendar, Wallet } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, AdviceBlock, Button, SliderControl } from "@/components/ui";
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
function TripDailyBudgetTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [totalBudget, setTotalBudget] = useState(() => {
    const p = initialParams?.totalBudget;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 900;
  });

  const [totalDays, setTotalDays] = useState(() => {
    const p = initialParams?.totalDays;
    return p !== undefined && !isNaN(parseInt(p, 10)) ? parseInt(p, 10) : 6;
  });

  const [spent, setSpent] = useState(() => {
    const p = initialParams?.spent;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 300;
  });

  const [daysElapsed, setDaysElapsed] = useState(() => {
    const p = initialParams?.daysElapsed;
    return p !== undefined && !isNaN(parseInt(p, 10)) ? parseInt(p, 10) : 2;
  });

  const [todaySpend, setTodaySpend] = useState("");

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
  
  // Barra de progreso: % de presupuesto gastado
  const spentPct = safeBudget > 0 ? Math.min((safeSpent / safeBudget) * 100, 100) : 0;

  const logToday = () => {
    // BUG CORREGIDO: Ahora sí suma +1 día al registrar un gasto
    const amount = parseFloat(String(todaySpend).replace(",", "."));
    if (!isNaN(amount) && amount > 0) {
      setSpent((s) => Math.min(s + amount, safeBudget));
      setDaysElapsed((d) => Math.min(d + 1, safeTotalDays));
      setTodaySpend("");
    }
  };

  const pageTitle = "Presupuesto diario de viaje: cuánto puedes gastar hoy | MetaBox";
  const pageDescription = "Controla tu presupuesto de viaje día a día: registra lo gastado hoy y descubre al instante cuánto puedes gastar cada día que te queda. Gratis y sin registro.";
  
  // CORRECCIÓN CRÍTICA DE SEO
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

      {/* HERO CARD PREMIUM CON PROGRESO */}
      <div style={{
        background: `linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(10,18,20,1) 100%)`,
        borderRadius: "1.5rem",
        padding: "2rem 1.5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${onTrack ? T.lime : T.coral}40`,
        boxShadow: `0 20px 40px -10px rgba(0,0,0,0.8)`
      }}>
        <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "100%", background: onTrack ? T.lime : T.coral, filter: "blur(100px)", opacity: 0.15, zIndex: 0 }} />
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Puedes gastar al día
          </div>
          <div style={{ ...fontDisplay, color: onTrack ? T.lime : T.coral, fontSize: "3.2rem", fontWeight: 800, margin: "0.5rem 0", textShadow: "0 4px 15px rgba(0,0,0,0.5)" }}>
            {remainingDays > 0 ? fmtEUR(animatedAllowance) : "—"}
          </div>
          
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginBottom: "1rem" }}>
            Plan original: {fmtEUR(originalDailyPlan)} / día · Quedan {remainingDays} {remainingDays === 1 ? "día" : "días"}
          </div>

          {/* Barra de progreso del presupuesto */}
          <div style={{ background: T.surfaceAlt, borderRadius: "999px", height: "8px", overflow: "hidden", marginBottom: "1.5rem", maxWidth: "300px", margin: "0 auto 1.5rem" }}>
            <div style={{ width: `${spentPct}%`, height: "100%", background: spentPct > 90 ? T.coral : T.lime, transition: "width 0.3s ease" }} />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", maxWidth: "320px", margin: "0 auto" }}>
            <input
              value={todaySpend}
              onChange={(e) => setTodaySpend(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && logToday()}
              placeholder="¿Cuánto gastaste hoy?"
              inputMode="decimal"
              style={{
                ...fontBody, flex: 1, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.8rem",
                padding: "0.6rem 0.9rem", color: T.text, fontSize: "0.9rem", outline: "none", textAlign: "center",
              }}
            />
            <Button onClick={logToday} style={{ width: "auto", padding: "0.6rem 1.2rem" }}>Añadir</Button>
          </div>
        </div>
      </div>

      <AdviceBlock
        text={
          !onTrack
            ? "Vas por encima del ritmo previsto. Si quieres llegar sin sobresaltos, reduce un poco el gasto de los próximos días."
            : remainingDays === 0
            ? "El viaje ha terminado según estos datos. Compara el gasto real con el plan original para el próximo viaje."
            : "Vas dentro del plan. Aun así, deja algo de margen para imprevistos de última hora."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <MoneySlider label="Presupuesto total del viaje" value={totalBudget} min={50} max={100000} step={50} accent="lime" setValue={setTotalBudget} />
          
          <div>
            <div style={{ ...fontBody, color: T.text, fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>Días totales de viaje</div>
            <SliderControl label="" value={totalDays} min={1} max={60} step={1} unit="días" onChange={setTotalDays} />
          </div>
          
          <MoneySlider label="Gastado hasta ahora" value={spent} min={0} max={totalBudget} step={10} accent="lavender" setValue={setSpent} />
          
          <div>
            <div style={{ ...fontBody, color: T.text, fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>Días ya pasados</div>
            <SliderControl label="" value={daysElapsed} min={0} max={totalDays} step={1} unit="días" onChange={setDaysElapsed} accent="lavender" />
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
