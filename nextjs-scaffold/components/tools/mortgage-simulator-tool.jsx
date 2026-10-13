"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  Building2, Calculator, Clock, TrendingDown, ShieldCheck,
  Percent, AlertCircle, ArrowRight
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip
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
    q: "¿Qué es mejor: reducir cuota o reducir plazo?", 
    a: "Desde el punto de vista estrictamente financiero, reducir plazo ahorra más dinero en intereses totales porque acortas el tiempo durante el cual el banco te aplica el tipo de interés. Reducir cuota da más tranquilidad financiera mes a mes." 
  },
  { 
    q: "¿Qué es la comisión por amortización anticipada?", 
    a: "Es la penalización que puede cobrarte el banco por devolver capital antes de tiempo. En España, la ley limita esta comisión a entre el 0% y el 0.25% según si la hipoteca es fija o variable y el tiempo restante." 
  },
  { 
    q: "¿Hay un mínimo o máximo para amortizar?", 
    a: "Depende de tu contrato hipotecario, pero generalmente no hay mínimo legal. Con esta calculadora puedes simular desde 1.000 € hasta la totalidad de tu deuda pendiente." 
  },
];

function DecimalSliderRow({ label, value, setValue, min, max, step = 1000, unit = "€", accent = "lime", subtitle }) {
  const [textVal, setTextVal] = useState(String(value ?? 0));
  
  useEffect(() => {
    if (value !== parseFloat(textVal.replace(",", "."))) setTextVal(String(value ?? 0));
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
            style={{ ...fontBody, color: accentColor, fontSize: "0.9rem", width: "85px", outline: "none" }}
          />
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>{unit}</span>
        </div>
      </div>
      {subtitle && <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>{subtitle}</div>}
      <input
        type="range"
        min={min}
        max={Math.max(max, value || 0, 1000)}
        step={step}
        value={isNaN(value) ? 0 : value}
        onChange={handleSliderChange}
        className="w-full cursor-pointer h-1.5 rounded-lg appearance-none bg-[var(--surface-alt,rgba(255,255,255,0.1))] accent-current"
        style={{ accentColor }}
      />
    </div>
  );
}

function MortgageSimulatorTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [loanAmount, setLoanAmount] = useState(() => parseFloat(initialParams?.loanAmount) || 180000);
  const [interestRate, setInterestRate] = useState(() => parseFloat(initialParams?.interestRate) || 2.8);
  const [remainingYears, setRemainingYears] = useState(() => parseFloat(initialParams?.remainingYears) || 22);
  const [extraPayment, setExtraPayment] = useState(() => parseFloat(initialParams?.extraPayment) || 10000);
  const [amortizationType, setAmortizationType] = useState(() => initialParams?.amortizationType || "term");
  const [commissionRate, setCommissionRate] = useState(() => parseFloat(initialParams?.commissionRate) || 0.15);

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        loanAmount,
        interestRate,
        remainingYears,
        extraPayment,
        amortizationType,
        commissionRate
      });
    }
  }, [loanAmount, interestRate, remainingYears, extraPayment, amortizationType, commissionRate, onStateChange]);

  // Cálculos matemáticos de cuota (Sistema Francés)
  const calculateMonthlyPayment = (p, r, y) => {
    if (p <= 0 || r <= 0 || y <= 0) return 0;
    const monthlyRate = r / 100 / 12;
    const totalPayments = y * 12;
    return (p * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments));
  };

  const currentMonthlyPayment = useMemo(() => {
    return calculateMonthlyPayment(loanAmount, interestRate, remainingYears);
  }, [loanAmount, interestRate, remainingYears]);

  const currentTotalInterest = useMemo(() => {
    const totalPaid = currentMonthlyPayment * remainingYears * 12;
    return Math.max(0, totalPaid - loanAmount);
  }, [currentMonthlyPayment, remainingYears, loanAmount]);

  const commissionCost = useMemo(() => (extraPayment * commissionRate) / 100, [extraPayment, commissionRate]);
  const effectiveExtraPayment = Math.max(0, extraPayment - commissionCost);
  const newLoanAmount = Math.max(0, loanAmount - effectiveExtraPayment);

  // Escenario Reducir Plazo
  const newTermSimulation = useMemo(() => {
    if (newLoanAmount <= 0 || currentMonthlyPayment <= 0) return { totalMonths: 0, years: "0.0", totalInterest: 0 };
    const monthlyRate = interestRate / 100 / 12;
    const num = 1 - (monthlyRate * newLoanAmount) / currentMonthlyPayment;
    if (num <= 0) return { totalMonths: 0, years: "0.0", totalInterest: 0 };
    
    const totalMonths = -Math.log(num) / Math.log(1 + monthlyRate);
    const totalPaid = currentMonthlyPayment * totalMonths;
    const totalInterest = Math.max(0, totalPaid - newLoanAmount);

    return {
      totalMonths: Math.round(totalMonths),
      years: (totalMonths / 12).toFixed(1),
      totalInterest
    };
  }, [newLoanAmount, currentMonthlyPayment, interestRate]);

  // Escenario Reducir Cuota
  const newQuotaSimulation = useMemo(() => {
    const newQuota = calculateMonthlyPayment(newLoanAmount, interestRate, remainingYears);
    const totalPaid = newQuota * remainingYears * 12;
    const totalInterest = Math.max(0, totalPaid - newLoanAmount);

    return {
      newQuota,
      totalInterest,
      monthlySavings: Math.max(0, currentMonthlyPayment - newQuota)
    };
  }, [newLoanAmount, interestRate, remainingYears, currentMonthlyPayment]);

  const newInterestValue = amortizationType === "term" ? newTermSimulation.totalInterest : newQuotaSimulation.totalInterest;
  const interestSaved = Math.max(0, currentTotalInterest - newInterestValue - commissionCost);
  const animatedSaved = useAnimatedNumber(interestSaved);

  const yearsSaved = useMemo(() => {
    if (amortizationType !== "term") return 0;
    const savedMonths = (remainingYears * 12) - newTermSimulation.totalMonths;
    return Math.max(0, (savedMonths / 12)).toFixed(1);
  }, [remainingYears, newTermSimulation, amortizationType]);

  const chartData = [
    { name: "Sin Amortizar", Capital: loanAmount, Intereses: Math.round(currentTotalInterest) },
    { name: "Con Amortización", Capital: loanAmount, Intereses: Math.round(newInterestValue + commissionCost) },
  ];

  const pageTitle = "Simulador de hipoteca y amortización anticipada | MetaBox";
  const pageDescription = "Calcula cuántos miles de euros en intereses y cuántos años te ahorras al realizar una amortización parcial de tu hipoteca. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/mortgage-simulator";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="simulador de hipoteca, amortización anticipada, reducir cuota o plazo, amortizar hipoteca, calculadora amortización hipoteca" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Simulador de hipoteca y amortización",
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

      <ToolHeader title="Simulador de hipoteca" subtitle="Calcula el impacto exacto de amortizar tu capital pendiente." onBack={onBack} />

      {/* Tarjeta Resultado Principal */}
      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Ahorro neto total en intereses</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {fmtEUR(animatedSaved)}
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", marginTop: "0.4rem" }}>
          {amortizationType === "term" && Number(yearsSaved) > 0 ? (
            <>🎉 Eliminas <strong style={{ color: T.text }}>{yearsSaved} años</strong> de hipoteca y tu cuota sigue en {fmtEUR(currentMonthlyPayment)}/mes.</>
          ) : (
            <>🎉 Tu cuota baja de {fmtEUR(currentMonthlyPayment)} a <strong style={{ color: T.lime }}>{fmtEUR(newQuotaSimulation.newQuota)}/mes</strong>.</>
          )}
        </div>
      </Card>

      <AdviceBlock
        text={
          amortizationType === "term"
            ? "Reducir plazo acorta la duración del préstamo y maximiza matemáticamente el ahorro final en intereses."
            : "Reducir cuota baja tus costes fijos cada mes, dejando más margen libre en tu presupuesto mensual."
        }
      />

      {/* Sliders de Configuración de Préstamo */}
      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          Datos de tu hipoteca actual
        </div>
        <div className="flex flex-col gap-5">
          <DecimalSliderRow label="Capital pendiente" value={loanAmount} min={10000} max={500000} step={5000} unit="€" accent="lime" setValue={setLoanAmount} />
          <DecimalSliderRow label="Tipo de interés (%)" value={interestRate} min={0.1} max={10} step={0.1} unit="%" accent="lavender" setValue={setInterestRate} />
          <DecimalSliderRow label="Años restantes" value={remainingYears} min={1} max={35} step={1} unit="años" accent="lavender" setValue={setRemainingYears} />
        </div>
      </Card>

      {/* Amortización Anticipada */}
      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          Simular aportación extraordinaria
        </div>
        <div className="flex flex-col gap-5">
          <DecimalSliderRow label="Aportación extra" value={extraPayment} min={1000} max={loanAmount} step={1000} unit="€" accent="lime" setValue={setExtraPayment} />
          <DecimalSliderRow label="Comisión bancaria (%)" value={commissionRate} min={0} max={2} step={0.05} unit="%" accent="lavender" subtitle={`Comisión estimada: ${fmtEUR(commissionCost)}`} setValue={setCommissionRate} />
          
          <div className="flex flex-col gap-2 pt-2">
            <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>Estrategia de amortización:</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAmortizationType("term")}
                style={{
                  ...fontBody,
                  padding: "0.75rem",
                  borderRadius: "0.8rem",
                  border: `1px solid ${amortizationType === "term" ? T.lime : T.border}`,
                  background: amortizationType === "term" ? `${T.lime}15` : T.surfaceAlt,
                  color: amortizationType === "term" ? T.lime : T.textMuted,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem"
                }}
              >
                <Clock size={16} /> Reducir Plazo
              </button>

              <button
                onClick={() => setAmortizationType("quota")}
                style={{
                  ...fontBody,
                  padding: "0.75rem",
                  borderRadius: "0.8rem",
                  border: `1px solid ${amortizationType === "quota" ? T.lime : T.border}`,
                  background: amortizationType === "quota" ? `${T.lime}15` : T.surfaceAlt,
                  color: amortizationType === "quota" ? T.lime : T.textMuted,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem"
                }}
              >
                <TrendingDown size={16} /> Reducir Cuota
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Gráfico Comparativo Recharts */}
      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.8rem" }}>
          Comparativa de intereses a pagar
        </div>
        <div style={{ width: "100%", height: "180px", marginTop: "0.4rem" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke={T.textMuted} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => [fmtEUR(value), "Intereses"]} contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "8px", fontSize: "12px", color: T.text }} />
              <Bar dataKey="Intereses" fill={T.lime} radius={[4, 4, 0, 0]} animationDuration={300} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Módulo B2B / Refinanciación */}
      <div style={{ background: `linear-gradient(135deg, ${T.surfaceAlt}, rgba(191,255,0,0.05))`, border: `1px solid ${T.lime}40`, borderRadius: "1rem", padding: "1.2rem" }} className="flex flex-col gap-3">
        <div className="flex items-center gap-2" style={{ color: T.lime, fontSize: "0.85rem", fontStyle: fontBody.fontFamily, fontWeight: 600 }}>
          <ShieldCheck size={18} />
          <span>Optimización Bancaria B2B</span>
        </div>
        <div style={{ ...fontDisplay, color: T.text, fontSize: "1.05rem", fontWeight: 700 }}>
          ¿Tu banco te cobra un {interestRate}%? Puedes bajar tu tipo fijo desde el 2.1% TAE
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>
          Brókers seleccionados renegocian tu hipoteca actual sin costes iniciales y te ayudan a evitar comisiones por amortización.
        </div>
        <Button variant="primary" style={{ width: "100%", marginTop: "0.4rem", background: T.lime, color: "#12200A", fontWeight: 700 }}>
          Solicitar Estudio Gratuito de Subrogación <ArrowRight size={16} />
        </Button>
      </div>

      <AdSlot minHeight="0px" />
      <RelatedTools ids={["loanpayment", "compoundinterest"]} onNavigate={onNavigate} primaryId="loanpayment" />

      {/* Botones de Acción Estándar */}
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton getText={() => `Simulación de Hipoteca MetaBox: Capital ${fmtEUR(loanAmount)}, Aportación extra ${fmtEUR(extraPayment)}, Ahorro neto en intereses ${fmtEUR(interestSaved)}.`} />
        <ExportCSVButton filename="simulacion-hipoteca" getRows={() => [
          { concepto: "Capital pendiente", valor: loanAmount.toFixed(2) },
          { concepto: "Tipo de interés", valor: `${interestRate}%` },
          { concepto: "Años restantes", valor: remainingYears },
          { concepto: "Aportación extra", valor: extraPayment.toFixed(2) },
          { concepto: "Comisión bancaria", valor: commissionCost.toFixed(2) },
          { concepto: "Ahorro neto en intereses", valor: interestSaved.toFixed(2) },
          { concepto: "Estrategia", valor: amortizationType }
        ]} />
      </div>

      {/* Texto Guía SEO */}
      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>Amortizar hipoteca de forma anticipada es una de las inversiones con retorno garantizado más potentes. Al reducir el capital pendiente, eliminas los intereses futuros que el banco te habría cobrado sobre ese dinero. Utiliza este simulador para valorar si te conviene más reducir la cuota mensual o acortar la duración total de tu préstamo.</p>
      </div>
    </div>
  );
}

export default MortgageSimulatorTool;
      
