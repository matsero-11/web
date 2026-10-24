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
    q: "¿Cómo calculo el ingreso mínimo que necesito ganar?",
    a: "Se suman tus gastos fijos mensuales más el ahorro que quieres conseguir cada mes. El resultado es el ingreso neto mínimo necesario para cubrir ambas cosas sin quedarte corto.",
  },
  {
    q: "¿Este cálculo tiene en cuenta impuestos?",
    a: "El resultado principal es el ingreso neto (lo que necesitas recibir en la cuenta). Puedes activar la estimación de bruto anual para tener una referencia orientativa de cuánto negociar en una oferta de trabajo.",
  },
  {
    q: "¿Es exacta la conversión de neto a bruto?",
    a: "No, es una aproximación simplificada con un porcentaje medio de retención en España. La retención real depende de tu situación personal, comunidad autónoma y tipo de contrato — consúltalo con una gestoría para cifras exactas.",
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

function PercentSlider({ label, value, onChange, accent = "lavender" }) {
  const accentColor = accent === "lavender" ? T.lavender : T.lime;
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-baseline">
        <span style={{ ...fontBody, color: T.text, fontSize: "0.9rem", fontWeight: 500 }}>{label}</span>
        <div className="flex items-center gap-1 bg-[var(--surface-alt,rgba(255,255,255,0.03))] px-2.5 py-1 rounded-lg border border-[var(--border,rgba(255,255,255,0.08))]">
          <span style={{ ...fontBody, color: accentColor, fontSize: "0.9rem", fontWeight: 700 }}>{value}%</span>
        </div>
      </div>
      <input
        type="range"
        min={5}
        max={45}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer h-1.5 rounded-lg appearance-none bg-[var(--surface-alt,rgba(255,255,255,0.1))]"
        style={{ accentColor }}
      />
    </div>
  );
}
function TargetIncomeTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [expenses, setExpenses] = useState(() => {
    const p = initialParams?.expenses;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 1200;
  });

  const [desiredSavings, setDesiredSavings] = useState(() => {
    const p = initialParams?.desiredSavings;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 300;
  });

  const [showGross, setShowGross] = useState(() => {
    return initialParams?.showGross === "true" || initialParams?.retentionPct !== undefined;
  });

  const [retentionPct, setRetentionPct] = useState(() => {
    const p = initialParams?.retentionPct;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 20;
  });

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        expenses,
        desiredSavings,
        showGross: showGross ? "true" : null,
        retentionPct: showGross ? retentionPct : null,
      });
    }
  }, [expenses, desiredSavings, showGross, retentionPct, onStateChange]);

  const safeExpenses = Number.isFinite(expenses) ? expenses : 0;
  const safeSavings = Number.isFinite(desiredSavings) ? desiredSavings : 0;
  
  const requiredIncome = safeExpenses + safeSavings;
  const animatedIncome = useAnimatedNumber(requiredIncome);
  const annualNet = requiredIncome * 12;
  
  // Blindaje matemático: retención máxima del 99% para evitar división por cero
  const safeRetention = Math.min(retentionPct, 99);
  const annualGross = annualNet / (1 - safeRetention / 100);

  const pageTitle = "Calculadora de cuánto necesito ganar según mis gastos y ahorro | MetaBox";
  const pageDescription = "Calcula el ingreso neto mínimo que necesitas ganar al mes según tus gastos y ahorro deseado, y una estimación orientativa del salario bruto anual equivalente. Gratis y sin registro.";
  
  // CORRECCIÓN CRÍTICA DE SEO
  const pageUrl = "https://metabox-web.vercel.app/herramientas/cuanto-necesito-ganar-ingreso-minimo";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="cuánto necesito ganar al mes, calculadora ingreso mínimo necesario, salario bruto necesario, calculadora neto a bruto" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Cuánto necesito ganar",
            url: pageUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            inLanguage: "es",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            description: pageDescription,
          })}
        </script>
      </Helmet>

      <ToolHeader title="Cuánto necesito ganar" subtitle="A partir de tus gastos y lo que quieres ahorrar, el ingreso mínimo que necesitas." onBack={onBack} />

      {/* HERO CARD PREMIUM */}
      <div style={{
        background: `linear-gradient(145deg, rgba(196,222,78,0.08) 0%, rgba(10,18,20,1) 100%)`,
        borderRadius: "1.5rem",
        padding: "2.5rem 1.5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${T.lime}40`,
        boxShadow: `0 20px 40px -10px rgba(0,0,0,0.8)`
      }}>
        <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "100%", background: T.lime, filter: "blur(100px)", opacity: 0.15, zIndex: 0 }} />
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Necesitas ingresar al mes (neto)
          </div>
          <div style={{ ...fontDisplay, color: T.lime, fontSize: "3.2rem", fontWeight: 800, margin: "0.5rem 0", textShadow: "0 4px 15px rgba(0,0,0,0.5)" }}>
            {fmtEUR(animatedIncome)}
          </div>
          <div style={{ ...fontBody, color: T.text, fontSize: "0.95rem" }}>
            Para cubrir {fmtEUR(safeExpenses)} de gastos y ahorrar {fmtEUR(safeSavings)}.
          </div>
        </div>
      </div>

      <Card style={{ paddingBottom: "1rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          De qué se compone
        </div>
        <div style={{ width: "100%", height: "110px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ nombre: "Ingreso", gastos: safeExpenses, ahorro: safeSavings }]} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <defs>
                <linearGradient id="colorGastos" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={T.textMuted} stopOpacity={0.8}/>
                  <stop offset="100%" stopColor={T.textMuted} stopOpacity={0.5}/>
                </linearGradient>
                <linearGradient id="colorAhorro" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={T.lime} stopOpacity={0.9}/>
                  <stop offset="100%" stopColor={T.lime} stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <XAxis type="number" hide domain={[0, "auto"]} />
              <YAxis type="category" dataKey="nombre" hide />
              <Tooltip
                contentStyle={{ background: "#111c1f", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: "12px", fontSize: "13px", color: T.text, boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                formatter={(v, n) => [fmtEUR(v), n === "gastos" ? "Gastos" : "Ahorro"]}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar dataKey="gastos" stackId="a" fill="url(#colorGastos)" radius={[6, 0, 0, 6]} barSize={34} />
              <Bar dataKey="ahorro" stackId="a" fill="url(#colorAhorro)" radius={[0, 6, 6, 0]} barSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Gastos: <strong style={{ color: T.text }}>{fmtEUR(safeExpenses)}</strong></span>
          <span style={{ ...fontBody, color: T.lime, fontSize: "0.85rem" }}>Ahorro: <strong>{fmtEUR(safeSavings)}</strong></span>
        </div>
      </Card>

      {!showGross ? (
        <Button variant="ghost" onClick={() => setShowGross(true)}>
          Ver estimación en salario bruto anual
        </Button>
      ) : (
        <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
            Estimación de bruto anual
          </div>
          <PercentSlider label="Retención estimada (IRPF + SS)" value={retentionPct} onChange={setRetentionPct} />
          
          <div style={{ background: T.surfaceAlt, borderRadius: "0.9rem", padding: "1.5rem", textAlign: "center", marginTop: "1.5rem", border: `1px solid ${T.lavender}30` }}>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Bruto anual aproximado necesario</div>
            <div style={{ ...fontDisplay, color: T.lavender, fontSize: "2rem", fontWeight: 800, marginTop: "0.5rem", textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>{fmtEUR(annualGross)}</div>
          </div>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", textAlign: "center", marginTop: "0.8rem" }}>
            Estimación orientativa, no un cálculo fiscal exacto.
          </div>
        </Card>
      )}

      <AdviceBlock
        text={
          requiredIncome > 0 && safeSavings / requiredIncome > 0.25
            ? "Estás pidiendo un ahorro ambicioso sobre el total. Si el ingreso real es más bajo, prueba primero con un objetivo de ahorro menor y súbelo con el tiempo."
            : "Este ingreso te cubre gastos y ahorro. Compáralo con lo que ganas hoy en 'Porcentaje de ahorro' para ver la diferencia real."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <MoneySlider label="Gastos fijos mensuales" value={expenses} min={0} max={1000000} step={50} accent="lime" setValue={setExpenses} />
          <MoneySlider label="Cuánto quieres ahorrar" value={desiredSavings} min={0} max={1000000} step={25} accent="lavender" setValue={setDesiredSavings} />
        </div>
      </Card>

      <AdSlot minHeight="0px" />
      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
        No incluye impuestos ni retenciones exactas: el neto es el mínimo necesario según lo que indiques.
      </div>
      
      <RelatedTools ids={["percent", "budget"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Gastos ${fmtEUR(safeExpenses)} + ahorro deseado ${fmtEUR(safeSavings)} = necesitas ganar ${fmtEUR(requiredIncome)}/mes neto.` +
            (showGross ? ` Bruto anual aproximado: ${fmtEUR(annualGross)}.` : "")
          }
        />
        <ExportCSVButton
          filename="cuanto-necesito-ganar"
          getRows={() => [
            {
              concepto: "Objetivo de ingresos",
              gastos_mes: safeExpenses,
              ahorro_deseado_mes: safeSavings,
              ingreso_neto_mes: requiredIncome,
              bruto_anual_aprox: showGross ? annualGross.toFixed(2) : "N/A",
            },
          ]}
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Ya sea para negociar un sueldo, evaluar una oferta de trabajo o planificar un cambio de vida, saber el ingreso mínimo real que necesitas es un dato clave. Esta calculadora suma tus gastos y ahorro deseado, y opcionalmente estima el salario bruto anual equivalente para que tengas una referencia al negociar.
        </p>
      </div>
    </div>
  );
}

export default TargetIncomeTool;
