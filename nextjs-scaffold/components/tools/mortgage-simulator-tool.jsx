"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Clock, TrendingDown, CheckCircle2, ShieldCheck } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, SliderControl, AdviceBlock } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Qué es mejor, reducir años o reducir cuota?",
    a: "Reducir años te ahorra más dinero en intereses totales, ya que terminas de pagar antes. Reducir cuota te da más liquidez mensual, pero pagarás más intereses a largo plazo.",
  },
  {
    q: "¿El banco me cobra comisiones por amortizar?",
    a: "Depende de tu contrato y de si el interés es fijo o variable. En esta herramienta puedes ajustar el porcentaje de comisión para ver cómo afecta a tu ahorro real.",
  },
];

function calculateMonthlyPayment(principal, annualRate, years) {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate <= 0) return principal / (years * 12);
  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = years * 12;
  const denominator = 1 - Math.pow(1 + monthlyRate, -totalPayments);
  if (denominator <= 0) return principal / totalPayments;
  return (principal * monthlyRate) / denominator;
}

export default function MortgageSimulatorTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [loanAmount, setLoanAmount] = useState(() => Number(initialParams?.loanAmount) || 180000);
  const [interestRate, setInterestRate] = useState(() => Number(initialParams?.interestRate) || 2.8);
  const [remainingYears, setRemainingYears] = useState(() => Number(initialParams?.remainingYears) || 22);
  const [extraPayment, setExtraPayment] = useState(() => Number(initialParams?.extraPayment) || 10000);
  const [amortizationType, setAmortizationType] = useState(() => initialParams?.amortizationType || "term");
  const [commissionRate, setCommissionRate] = useState(() => Number(initialParams?.commissionRate) || 0.15);

  useEffect(() => {
    if (extraPayment > loanAmount) {
      setExtraPayment(loanAmount);
    }
  }, [loanAmount, extraPayment]);

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({ loanAmount, interestRate, remainingYears, extraPayment, amortizationType, commissionRate });
    }
  }, [loanAmount, interestRate, remainingYears, extraPayment, amortizationType, commissionRate, onStateChange]);

  const currentMonthlyPayment = useMemo(
    () => calculateMonthlyPayment(loanAmount, interestRate, remainingYears),
    [loanAmount, interestRate, remainingYears]
  );
  
  const totalOriginalMonths = remainingYears * 12;
  const currentTotalInterest = useMemo(() => {
    const total = (currentMonthlyPayment * totalOriginalMonths) - loanAmount;
    return Math.max(0, isNaN(total) ? 0 : total);
  }, [currentMonthlyPayment, totalOriginalMonths, loanAmount]);

  const commissionCost = useMemo(() => (extraPayment * commissionRate) / 100, [extraPayment, commissionRate]);
  const effectiveExtraPayment = Math.max(0, extraPayment - commissionCost);
  const newLoanAmount = Math.max(0, loanAmount - effectiveExtraPayment);

  const newTermSimulation = useMemo(() => {
    if (newLoanAmount <= 0 || currentMonthlyPayment <= 0) return { totalMonths: 0, years: "0.0", totalInterest: 0 };
    if (interestRate <= 0) {
      const months = Math.ceil(newLoanAmount / (currentMonthlyPayment));
      return { totalMonths: months, years: (months / 12).toFixed(1), totalInterest: 0 };
    }
    const mr = interestRate / 100 / 12;
    const num = 1 - (mr * newLoanAmount) / currentMonthlyPayment;
    if (num <= 0) return { totalMonths: totalOriginalMonths, years: remainingYears.toFixed(1), totalInterest: currentTotalInterest };
    const tm = -Math.log(num) / Math.log(1 + mr);
    const validTm = isNaN(tm) || tm < 0 ? 0 : Math.round(tm);
    const totalInt = Math.max(0, (currentMonthlyPayment * validTm) - newLoanAmount);
    return { totalMonths: validTm, years: (validTm / 12).toFixed(1), totalInterest: totalInt };
  }, [newLoanAmount, currentMonthlyPayment, interestRate, totalOriginalMonths, remainingYears, currentTotalInterest]);

  const newQuotaSimulation = useMemo(() => {
    const q = calculateMonthlyPayment(newLoanAmount, interestRate, remainingYears);
    const validQ = isNaN(q) ? 0 : q;
    const totalInt = Math.max(0, (validQ * totalOriginalMonths) - newLoanAmount);
    return { newQuota: validQ, totalInterest: totalInt };
  }, [newLoanAmount, interestRate, remainingYears, totalOriginalMonths]);

  const newInterestValue = amortizationType === "term" ? newTermSimulation.totalInterest : newQuotaSimulation.totalInterest;
  const interestSaved = Math.max(0, currentTotalInterest - newInterestValue - commissionCost);
  const animatedSaved = useAnimatedNumber(isNaN(interestSaved) ? 0 : interestSaved);

  const monthsSavedTotal = useMemo(() => {
    if (amortizationType !== "term") return 0;
    return Math.max(0, totalOriginalMonths - newTermSimulation.totalMonths);
  }, [totalOriginalMonths, newTermSimulation, amortizationType]);

  const yearsSavedFormatted = (monthsSavedTotal / 12).toFixed(1);

  const chartData = [
    { name: "Sin adelantar", "Dinero prestado": Math.round(loanAmount), "Intereses al banco": Math.round(currentTotalInterest) },
    { name: "Con tu adelanto", "Dinero prestado": Math.round(newLoanAmount), "Intereses al banco": Math.round(newInterestValue + commissionCost) },
  ];

  const pageTitle = "Simulador de hipoteca: reduce tu cuota o plazo | MetaBox";
  const pageDescription = "Calcula cuánto puedes ahorrar en intereses y tiempo si adelantas dinero en tu hipoteca. Simula la reducción de años o de cuota de forma transparente.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/simulador-amortizacion-hipoteca";
  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="simulador hipoteca, amortización anticipada hipoteca, reducir años hipoteca, reducir cuota hipoteca, calculadora hipoteca" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Simulador de hipoteca",
            url: pageUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            inLanguage: "es",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            description: pageDescription,
          })}
        </script>
      </Helmet>

      <ToolHeader 
        title="Simulador de hipoteca" 
        subtitle="Entiende de forma rápida y transparente qué ganas al adelantar dinero a tu banco." 
        onBack={onBack} 
      />

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
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(196,222,78,0.15)", padding: "0.4rem 1rem", borderRadius: "999px", marginBottom: "1rem" }}>
            <ShieldCheck size={16} color={T.lime} />
            <span style={{ ...fontBody, color: T.lime, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.05em" }}>AHORRO ESTIMADO</span>
          </div>
          
          <div style={{ ...fontDisplay, color: "#fff", fontSize: "3.5rem", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em", textShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            {fmtEUR(animatedSaved)}
          </div>

          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.95rem", marginTop: "1rem", padding: "0 1rem", lineHeight: 1.5 }}>
            {amortizationType === "term" ? (
              <span>
                Te quitas <strong style={{ color: T.lime }}>{yearsSavedFormatted} años</strong> de hipoteca.<br/>
                Tu cuota se mantiene en <strong>{fmtEUR(currentMonthlyPayment)}/mes</strong>.
              </span>
            ) : (
              <span>
                Tu cuota baja a <strong style={{ color: T.lime }}>{fmtEUR(newQuotaSimulation.newQuota)}/mes</strong>.<br/>
                Mantienes la misma fecha de fin.
              </span>
            )}
          </div>
        </div>
      </div>

      <AdviceBlock
        text={
          amortizationType === "term"
            ? "💡 Al adelantar tiempo, eliminas los meses del final de tu hipoteca, que es donde más dinero te ahorras en intereses."
            : "💡 Al reducir tu cuota mensual, ganas tranquilidad económica mes a mes y liberas espacio en tu presupuesto diario."
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "1.2rem", padding: "1.5rem", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          <div className="flex items-center gap-3 mb-6">
            <span style={{ background: T.lime, color: "#12200A", borderRadius: "50%", width: "28px", height: "28px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem", ...fontBody }}>1</span>
            <span style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1.05rem" }}>Tu hipoteca actual</span>
          </div>
          <div className="flex flex-col gap-6">
            <SliderControl label="Capital pendiente" value={loanAmount} min={10000} max={1000000} step={5000} unit="€" onChange={setLoanAmount} />
            <SliderControl label="Tipo de interés" value={interestRate} min={0.1} max={10} step={0.1} unit="%" accent="lavender" onChange={setInterestRate} />
            <SliderControl label="Años restantes" value={remainingYears} min={1} max={35} step={1} unit="años" accent="lavender" onChange={setRemainingYears} />
          </div>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "1.2rem", padding: "1.5rem", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          <div className="flex items-center gap-3 mb-6">
            <span style={{ background: T.lime, color: "#12200A", borderRadius: "50%", width: "28px", height: "28px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem", ...fontBody }}>2</span>
            <span style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1.05rem" }}>Tu adelanto</span>
          </div>
          <div className="flex flex-col gap-6">
            <SliderControl label="Dinero a adelantar" value={extraPayment} min={1000} max={loanAmount} step={1000} unit="€" onChange={setExtraPayment} />
            <SliderControl label="Comisión del banco" value={commissionRate} min={0} max={2} step={0.05} unit="%" accent="lavender" onChange={setCommissionRate} />
            
            <div className="flex flex-col gap-3 pt-2">
              <span style={{ ...fontBody, color: T.text, fontWeight: 500, fontSize: "0.88rem" }}>Elige tu estrategia:</span>
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setAmortizationType("term")}
                  style={{
                    ...fontBody, padding: "1rem", borderRadius: "1rem",
                    border: `1px solid ${amortizationType === "term" ? T.lime : T.border}`,
                    background: amortizationType === "term" ? `linear-gradient(145deg, rgba(196,222,78,0.1), transparent)` : T.surfaceAlt,
                    color: T.text, textAlign: "left", cursor: "pointer", transition: "all 0.2s ease",
                    boxShadow: amortizationType === "term" ? `0 4px 15px rgba(196,222,78,0.15)` : "none"
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2" style={{ fontWeight: 700, color: amortizationType === "term" ? T.lime : T.text, fontSize: "0.95rem" }}>
                      <Clock size={16} /> Reducir Años
                    </div>
                    {amortizationType === "term" && <CheckCircle2 size={16} color={T.lime} />}
                  </div>
                  <div style={{ color: T.textMuted, fontSize: "0.8rem" }}>Terminas antes y pagas menos intereses.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAmortizationType("quota")}
                  style={{
                    ...fontBody, padding: "1rem", borderRadius: "1rem",
                    border: `1px solid ${amortizationType === "quota" ? T.lime : T.border}`,
                    background: amortizationType === "quota" ? `linear-gradient(145deg, rgba(196,222,78,0.1), transparent)` : T.surfaceAlt,
                    color: T.text, textAlign: "left", cursor: "pointer", transition: "all 0.2s ease",
                    boxShadow: amortizationType === "quota" ? `0 4px 15px rgba(196,222,78,0.15)` : "none"
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2" style={{ fontWeight: 700, color: amortizationType === "quota" ? T.lime : T.text, fontSize: "0.95rem" }}>
                      <TrendingDown size={16} /> Reducir Cuota
                    </div>
                    {amortizationType === "quota" && <CheckCircle2 size={16} color={T.lime} />}
                  </div>
                  <div style={{ color: T.textMuted, fontSize: "0.8rem" }}>Pagas menos al mes para respirar mejor.</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "1.2rem", padding: "1.5rem", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1.05rem", marginBottom: "0.3rem" }}>
          El reparto de tu dinero
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          Compara lo que pagas al banco en total.
        </div>
        
        <div style={{ width: "100%", height: "240px" }}>
          <ResponsiveContainer width="100%" height="100%">
            {/* AÑADIDO barCategoryGap PARA BARRAS MÁS ANCHAS */}
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="25%">
              <defs>
                <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.lavender} stopOpacity={0.9}/>
                  <stop offset="95%" stopColor={T.lavender} stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="colorIntereses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.lime} stopOpacity={0.9}/>
                  <stop offset="95%" stopColor={T.lime} stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke={T.textMuted} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={T.textMuted} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k€`} />
              <Tooltip 
                formatter={(val, name) => [fmtEUR(val), name]} 
                contentStyle={{ background: "#111c1f", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: "12px", fontSize: "13px", color: T.text, boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }} 
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              {/* AUMENTADO maxBarSize A 80 */}
              <Bar dataKey="Dinero prestado" stackId="a" fill="url(#colorCapital)" radius={[0, 0, 4, 4]} maxBarSize={80} />
              <Bar dataKey="Intereses al banco" stackId="a" fill="url(#colorIntereses)" radius={[8, 8, 0, 0]} maxBarSize={80} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[var(--border,rgba(255,255,255,0.08))]" style={{ ...fontBody, fontSize: "0.85rem", color: T.textMuted }}>
          <div className="flex items-center gap-2">
            <span style={{ width: "12px", height: "12px", borderRadius: "4px", background: T.lavender, display: "inline-block" }}></span>
            <span>Capital prestado</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ width: "12px", height: "12px", borderRadius: "4px", background: T.lime, display: "inline-block" }}></span>
            <span>Intereses pagados</span>
          </div>
        </div>
      </div>

      <AdSlot minHeight="0px" />
      <RelatedTools ids={["loanpayment", "compoundinterest", "emergency"]} onNavigate={onNavigate} primaryId="loanpayment" />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton getText={() => `Simulación Hipoteca MetaBox: Deuda ${fmtEUR(loanAmount)}, Adelanto ${fmtEUR(extraPayment)}, Ahorro neto en intereses ${fmtEUR(interestSaved)}.`} />
        <ExportCSVButton filename="simulacion-hipoteca" getRows={() => [
          { concepto: "Capital pendiente", valor: loanAmount.toFixed(2) },
          { concepto: "Interés actual", valor: `${interestRate}%` },
          { concepto: "Adelanto extraordinario", valor: extraPayment.toFixed(2) },
          { concepto: "Ahorro total en intereses", valor: interestSaved.toFixed(2) },
          { concepto: "Estrategia elegida", valor: amortizationType === "term" ? "Reducir Años" : "Reducir Cuota" }
        ]} />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.4rem" }}>
        <p>
          Adelantar capital en una hipoteca es una de las decisiones financieras más efectivas para reducir tu deuda. Al amortizar de forma anticipada, compras tranquilidad eliminando los intereses futuros que el banco te habría cobrado sobre ese dinero. Utiliza este simulador para valorar libremente si te conviene acortar la duración de tu préstamo o reducir tu mensualidad habitual.
        </p>
      </div>
    </div>
  );
           }
