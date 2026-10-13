"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Clock, TrendingDown, CheckCircle2 } from "lucide-react";
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
    q: "¿Qué opción me conviene más: pagar antes o pagar menos al mes?",
    a: "Si buscas ahorrar el máximo dinero posible en intereses a largo plazo, la opción de 'Reducir Plazo' (terminar antes) es matemáticamente superior. Si prefieres estar más tranquilo mes a mes o vas justo a fin de mes, 'Reducir Cuota' bajará tu recibo mensual.",
  },
  {
    q: "¿Qué es la comisión por adelantar dinero?",
    a: "Es un pequeño porcentaje que el banco te puede cobrar si devuelves parte de tu préstamo antes de tiempo. La ley limita este cobro a entre un 0% y un 0.25% dependiendo de tu contrato.",
  },
  {
    q: "¿Hay un mínimo de dinero para amortizar?",
    a: "No suele haber mínimo legal. Puedes adelantar desde 1.000 € de tus ahorros en cualquier momento para recortar tu hipoteca.",
  },
];

export default function MortgageSimulatorTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [loanAmount, setLoanAmount] = useState(() => parseFloat(initialParams?.loanAmount) || 180000);
  const [interestRate, setInterestRate] = useState(() => parseFloat(initialParams?.interestRate) || 2.8);
  const [remainingYears, setRemainingYears] = useState(() => parseFloat(initialParams?.remainingYears) || 22);
  const [extraPayment, setExtraPayment] = useState(() => parseFloat(initialParams?.extraPayment) || 10000);
  const [amortizationType, setAmortizationType] = useState(() => initialParams?.amortizationType || "term");
  const [commissionRate, setCommissionRate] = useState(() => parseFloat(initialParams?.commissionRate) || 0.15);

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

  const calcMonthly = (p, r, y) => {
    if (p <= 0 || r <= 0 || y <= 0) return 0;
    const mr = r / 100 / 12, tp = y * 12;
    return (p * mr) / (1 - Math.pow(1 + mr, -tp));
  };

  const currentMonthlyPayment = useMemo(() => calcMonthly(loanAmount, interestRate, remainingYears), [loanAmount, interestRate, remainingYears]);
  const currentTotalInterest = useMemo(() => Math.max(0, (currentMonthlyPayment * remainingYears * 12) - loanAmount), [currentMonthlyPayment, remainingYears, loanAmount]);
  const commissionCost = useMemo(() => (extraPayment * commissionRate) / 100, [extraPayment, commissionRate]);
  const effectiveExtraPayment = Math.max(0, extraPayment - commissionCost);
  const newLoanAmount = Math.max(0, loanAmount - effectiveExtraPayment);

  const newTermSimulation = useMemo(() => {
    if (newLoanAmount <= 0 || currentMonthlyPayment <= 0) return { totalMonths: 0, years: "0.0", totalInterest: 0 };
    const mr = interestRate / 100 / 12, num = 1 - (mr * newLoanAmount) / currentMonthlyPayment;
    if (num <= 0) return { totalMonths: 0, years: "0.0", totalInterest: 0 };
    const tm = -Math.log(num) / Math.log(1 + mr);
    return { totalMonths: Math.round(tm), years: (tm / 12).toFixed(1), totalInterest: Math.max(0, (currentMonthlyPayment * tm) - newLoanAmount) };
  }, [newLoanAmount, currentMonthlyPayment, interestRate]);

  const newQuotaSimulation = useMemo(() => {
    const q = calcMonthly(newLoanAmount, interestRate, remainingYears);
    return { newQuota: q, totalInterest: Math.max(0, (q * remainingYears * 12) - newLoanAmount) };
  }, [newLoanAmount, interestRate, remainingYears]);

  const newInterestValue = amortizationType === "term" ? newTermSimulation.totalInterest : newQuotaSimulation.totalInterest;
  const interestSaved = Math.max(0, currentTotalInterest - newInterestValue - commissionCost);
  const animatedSaved = useAnimatedNumber(interestSaved);

  const monthsSavedTotal = useMemo(() => {
    if (amortizationType !== "term") return 0;
    return Math.max(0, (remainingYears * 12) - newTermSimulation.totalMonths);
  }, [remainingYears, newTermSimulation, amortizationType]);

  const yearsSavedFormatted = (monthsSavedTotal / 12).toFixed(1);

  const chartData = [
    { name: "Sin adelantar", "Dinero prestado": Math.round(loanAmount), "Intereses al banco": Math.round(currentTotalInterest) },
    { name: "Con tu adelanto", "Dinero prestado": Math.round(newLoanAmount), "Intereses al banco": Math.round(newInterestValue + commissionCost) },
  ];

  const pageTitle = "Simulador de Hipoteca y Amortización: Fácil e Intuitivo | MetaBox";
  const pageDescription = "Descubre en 2 segundos cuánto dinero te ahorras y cuántos años o cuota te quitas al adelantar dinero en tu hipoteca.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/simulador-amortizacion-hipoteca";

  return (
    <div className="w-full flex flex-col gap-8 md:gap-10 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Simulador de Amortización de Hipoteca",
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

      <ToolHeader 
        title="Simulador de hipoteca" 
        subtitle="Entiende de forma rápida y transparente qué ganas al adelantar dinero a tu banco." 
        onBack={onBack} 
      />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.8rem", paddingBottom: "1.8rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.88rem", fontWeight: 500 }}>
          Ahorro directo en intereses para tu bolsillo
        </div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.6rem", fontWeight: 700, margin: "0.5rem 0" }}>
          {fmtEUR(animatedSaved)}
        </div>
        <div style={{ ...fontBody, color: T.text, fontSize: "0.9rem", marginTop: "0.5rem", padding: "0 1rem" }}>
          {amortizationType === "term" && Number(yearsSavedFormatted) > 0 ? (
            <span>
              🎉 Te quitas <strong style={{ color: T.lime }}>{yearsSavedFormatted} años</strong> de pagar hipoteca y tu mensualidad sigue fija en <strong>{fmtEUR(currentMonthlyPayment)}/mes</strong>.
            </span>
          ) : (
            <span>
              🎉 Tu recibo de cada mes baja de {fmtEUR(currentMonthlyPayment)} a <strong style={{ color: T.lime }}>{fmtEUR(newQuotaSimulation.newQuota)}/mes</strong> manteniendo la misma fecha de fin.
            </span>
          )}
        </div>
      </Card>

      <AdviceBlock
        text={
          amortizationType === "term"
            ? "💡 Al adelantar tiempo, eliminas los meses del final de tu hipoteca, que es donde más dinero te ahorras en intereses."
            : "💡 Al reducir tu cuota mensual, ganas tranquilidad económica mes a mes y liberas espacio en tu presupuesto diario."
        }
      />

      <Card style={{ paddingTop: "1.8rem", paddingBottom: "1.8rem" }}>
        <div className="flex items-center gap-2 mb-6">
          <span style={{ background: T.lime, color: "#12200A", borderRadius: "50%", width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", ...fontBody }}>1</span>
          <span style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1rem" }}>Tu hipoteca actual</span>
        </div>
        <div className="flex flex-col gap-6">
          <SliderControl label="Capital que te falta por pagar" value={loanAmount} min={10000} max={500000} step={5000} unit="€" onChange={setLoanAmount} />
          <SliderControl label="Tipo de interés de tu banco" value={interestRate} min={0.1} max={10} step={0.1} unit="%" accent="lavender" onChange={setInterestRate} />
          <SliderControl label="Años que te quedan de contrato" value={remainingYears} min={1} max={35} step={1} unit="años" accent="lavender" onChange={setRemainingYears} />
        </div>
      </Card>

      <Card style={{ paddingTop: "1.8rem", paddingBottom: "1.8rem" }}>
        <div className="flex items-center gap-2 mb-6">
          <span style={{ background: T.lime, color: "#12200A", borderRadius: "50%", width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", ...fontBody }}>2</span>
          <span style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1rem" }}>Tu adelanto de dinero</span>
        </div>
        <div className="flex flex-col gap-6">
          <SliderControl label="¿Cuánto dinero quieres adelantar hoy?" value={extraPayment} min={1000} max={loanAmount} step={1000} unit="€" onChange={setExtraPayment} />
          <SliderControl label="Comisión del banco por adelantar" value={commissionRate} min={0} max={2} step={0.05} unit="%" accent="lavender" onChange={setCommissionRate} />
          
          <div className="flex flex-col gap-3 pt-2">
            <span style={{ ...fontBody, color: T.text, fontWeight: 500, fontSize: "0.88rem" }}>¿Qué prefieres conseguir con este adelanto?</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAmortizationType("term")}
                style={{
                  ...fontBody,
                  padding: "1.1rem",
                  borderRadius: "0.9rem",
                  border: `1.5px solid ${amortizationType === "term" ? T.lime : T.border}`,
                  background: amortizationType === "term" ? `${T.lime}15` : T.surfaceAlt,
                  color: T.text,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2" style={{ fontWeight: 700, color: amortizationType === "term" ? T.lime : T.text, fontSize: "0.92rem" }}>
                    <Clock size={16} /> Reducir Años (Terminar antes)
                  </div>
                  {amortizationType === "term" && <CheckCircle2 size={16} color={T.lime} />}
                </div>
                <div style={{ color: T.textMuted, fontSize: "0.8rem", lineHeight: 1.4 }}>
                  Mantienes tu recibo mensual y acortas el tiempo. Es la opción que más dinero te ahorra.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAmortizationType("quota")}
                style={{
                  ...fontBody,
                  padding: "1.1rem",
                  borderRadius: "0.9rem",
                  border: `1.5px solid ${amortizationType === "quota" ? T.lime : T.border}`,
                  background: amortizationType === "quota" ? `${T.lime}15` : T.surfaceAlt,
                  color: T.text,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2" style={{ fontWeight: 700, color: amortizationType === "quota" ? T.lime : T.text, fontSize: "0.92rem" }}>
                    <TrendingDown size={16} /> Reducir Cuota (Pagar menos/mes)
                  </div>
                  {amortizationType === "quota" && <CheckCircle2 size={16} color={T.lime} />}
                </div>
                <div style={{ color: T.textMuted, fontSize: "0.8rem", lineHeight: 1.4 }}>
                  Mantienes los mismos años pero tu cuota mensual baja. Ideal si quieres respirar más cada mes.
                </div>
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ paddingTop: "1.8rem", paddingBottom: "1.8rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1rem", marginBottom: "0.3rem" }}>
          El reparto de tu dinero: Lo que pediste vs. Lo que te cobra el banco
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", marginBottom: "1.4rem" }}>
          Observa la diferencia total entre lo que pagas con y sin amortizar.
        </div>
        <div style={{ width: "100%", height: "230px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.lavender} stopOpacity={0.9}/>
                  <stop offset="95%" stopColor={T.lavender} stopOpacity={0.5}/>
                </linearGradient>
                <linearGradient id="colorIntereses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.lime} stopOpacity={0.95}/>
                  <stop offset="95%" stopColor={T.lime} stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke={T.textMuted} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={T.textMuted} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k€`} />
              <Tooltip formatter={(val, name) => [fmtEUR(val), name]} contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", fontSize: "13px", color: T.text }} />
              <Bar dataKey="Dinero prestado" stackId="a" fill="url(#colorCapital)" radius={[0, 0, 4, 4]} />
              <Bar dataKey="Intereses al banco" stackId="a" fill="url(#colorIntereses)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-[var(--border,rgba(255,255,255,0.08))]" style={{ ...fontBody, fontSize: "0.82rem", color: T.textMuted }}>
          <div className="flex items-center gap-2">
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: T.lavender, display: "inline-block" }}></span>
            <span>Lo que te prestó el banco</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: T.lime, display: "inline-block" }}></span>
            <span>Lo que pagas de intereses</span>
          </div>
        </div>
      </Card>

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
          
