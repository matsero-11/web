"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Clock, TrendingDown, ShieldCheck, ArrowRight } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, AdviceBlock, Button } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  { q: "¿Qué es mejor: reducir cuota o plazo?", a: "Reducir plazo ahorra más dinero en intereses totales al acortar el tiempo del préstamo. Reducir cuota da más margen de liquidez mensual." },
  { q: "¿Qué es la comisión por amortización?", a: "Es la penalización cobrada por devolver capital antes. En España está limitada entre el 0% y el 0.25% según el tipo de hipoteca y años restados." },
];

function DecimalSliderRow({ label, value, setValue, min, max, step = 1000, unit = "€", accent = "lime", subtitle }) {
  const [textVal, setTextVal] = useState(String(value ?? 0));
  useEffect(() => { if (value !== parseFloat(textVal.replace(",", "."))) setTextVal(String(value ?? 0)); }, [value]);
  const accentColor = accent === "lavender" ? T.lavender : T.lime;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-baseline">
        <span style={{ ...fontBody, color: T.text, fontSize: "0.92rem", fontWeight: 500 }}>{label}</span>
        <div className="flex items-center gap-1 bg-[var(--surface-alt,rgba(255,255,255,0.04))] px-3 py-1.5 rounded-xl border border-[var(--border,rgba(255,255,255,0.1))]">
          <input
            type="text" inputMode="decimal" value={textVal}
            onChange={(e) => { setTextVal(e.target.value); const p = parseFloat(e.target.value.replace(",", ".")); if (!isNaN(p)) setValue(p); }}
            onBlur={() => { const p = parseFloat(textVal.replace(",", ".")); if (isNaN(p)) setTextVal(String(value ?? 0)); else { setValue(p); setTextVal(String(p)); } }}
            className="bg-transparent text-right font-semibold" style={{ ...fontBody, color: accentColor, fontSize: "0.92rem", width: "85px", outline: "none" }}
          />
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem" }}>{unit}</span>
        </div>
      </div>
      {subtitle && <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>{subtitle}</div>}
      <input
        type="range" min={min} max={Math.max(max, value || 0, 1000)} step={step} value={isNaN(value) ? 0 : value}
        onChange={(e) => { const v = parseFloat(e.target.value); setValue(v); setTextVal(String(v)); }}
        className="w-full cursor-pointer h-2 rounded-lg appearance-none bg-[var(--surface-alt,rgba(255,255,255,0.12))]" style={{ accentColor }}
      />
    </div>
  );
}

export default function MortgageSimulatorTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [loanAmount, setLoanAmount] = useState(() => parseFloat(initialParams?.loanAmount) || 180000);
  const [interestRate, setInterestRate] = useState(() => parseFloat(initialParams?.interestRate) || 2.8);
  const [remainingYears, setRemainingYears] = useState(() => parseFloat(initialParams?.remainingYears) || 22);
  const [extraPayment, setExtraPayment] = useState(() => parseFloat(initialParams?.extraPayment) || 10000);
  const [amortizationType, setAmortizationType] = useState(() => initialParams?.amortizationType || "term");
  const [commissionRate, setCommissionRate] = useState(() => parseFloat(initialParams?.commissionRate) || 0.15);

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
  const newLoanAmount = Math.max(0, loanAmount - Math.max(0, extraPayment - commissionCost));

  const newTermSimulation = useMemo(() => {
    if (newLoanAmount <= 0 || currentMonthlyPayment <= 0) return { totalMonths: 0, totalInterest: 0 };
    const mr = interestRate / 100 / 12, num = 1 - (mr * newLoanAmount) / currentMonthlyPayment;
    if (num <= 0) return { totalMonths: 0, totalInterest: 0 };
    const tm = -Math.log(num) / Math.log(1 + mr);
    return { totalMonths: Math.round(tm), totalInterest: Math.max(0, (currentMonthlyPayment * tm) - newLoanAmount) };
  }, [newLoanAmount, currentMonthlyPayment, interestRate]);

  const newQuotaSimulation = useMemo(() => {
    const q = calcMonthly(newLoanAmount, interestRate, remainingYears);
    return { newQuota: q, totalInterest: Math.max(0, (q * remainingYears * 12) - newLoanAmount) };
  }, [newLoanAmount, interestRate, remainingYears]);

  const newInterestValue = amortizationType === "term" ? newTermSimulation.totalInterest : newQuotaSimulation.totalInterest;
  const interestSaved = Math.max(0, currentTotalInterest - newInterestValue - commissionCost);
  const animatedSaved = useAnimatedNumber(interestSaved);
  const yearsSaved = useMemo(() => amortizationType === "term" ? Math.max(0, ((remainingYears * 12) - newTermSimulation.totalMonths) / 12).toFixed(1) : 0, [remainingYears, newTermSimulation, amortizationType]);

  const chartData = [
    { name: "Sin Amortizar", Capital: Math.round(loanAmount), Intereses: Math.round(currentTotalInterest) },
    { name: "Con Amortización", Capital: Math.round(newLoanAmount), Intereses: Math.round(newInterestValue + commissionCost) },
  ];

  return (
    <div className="w-full flex flex-col gap-8 md:gap-10 pt-4 pb-28 view-enter">
      <Helmet>
        <title>Simulador de hipoteca y amortización anticipada | MetaBox</title>
        <meta name="description" content="Calcula cuántos miles de euros en intereses y cuántos años te ahorras al realizar una amortización parcial de tu hipoteca." />
      </Helmet>

      <ToolHeader title="Simulador de hipoteca" subtitle="Calcula el impacto exacto de amortizar tu capital pendiente." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.8rem", paddingBottom: "1.8rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.9rem" }}>Ahorro neto total en intereses</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.8rem", fontWeight: 700, margin: "0.4rem 0" }}>{fmtEUR(animatedSaved)}</div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginTop: "0.6rem" }}>
          {amortizationType === "term" && Number(yearsSaved) > 0 ? (
            <>🎉 Eliminas <strong style={{ color: T.text }}>{yearsSaved} años</strong> de hipoteca manteniendo tu cuota en {fmtEUR(currentMonthlyPayment)}/mes.</>
          ) : (
            <>🎉 Tu cuota baja de {fmtEUR(currentMonthlyPayment)} a <strong style={{ color: T.lime }}>{fmtEUR(newQuotaSimulation.newQuota)}/mes</strong>.</>
          )}
        </div>
      </Card>

      <AdviceBlock text={amortizationType === "term" ? "Reducir plazo acorta la duración y maximiza el ahorro en intereses." : "Reducir cuota baja tus costes fijos mensuales."} />

      <Card style={{ paddingBottom: "1.8rem", paddingTop: "1.8rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1.05rem", marginBottom: "1.5rem" }}>Datos de tu hipoteca actual</div>
        <div className="flex flex-col gap-6">
          <DecimalSliderRow label="Capital pendiente" value={loanAmount} min={10000} max={500000} step={5000} unit="€" accent="lime" setValue={setLoanAmount} />
          <DecimalSliderRow label="Tipo de interés (%)" value={interestRate} min={0.1} max={10} step={0.1} unit="%" accent="lavender" setValue={setInterestRate} />
          <DecimalSliderRow label="Años restantes" value={remainingYears} min={1} max={35} step={1} unit="años" accent="lavender" setValue={setRemainingYears} />
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.8rem", paddingTop: "1.8rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1.05rem", marginBottom: "1.5rem" }}>Simular aportación extraordinaria</div>
        <div className="flex flex-col gap-6">
          <DecimalSliderRow label="Aportación extra" value={extraPayment} min={1000} max={loanAmount} step={1000} unit="€" accent="lime" setValue={setExtraPayment} />
          <DecimalSliderRow label="Comisión bancaria (%)" value={commissionRate} min={0} max={2} step={0.05} unit="%" accent="lavender" subtitle={`Comisión estimada: ${fmtEUR(commissionCost)}`} setValue={setCommissionRate} />
          <div className="flex flex-col gap-3 pt-2">
            <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Estrategia de amortización:</span>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setAmortizationType("term")} style={{ ...fontBody, padding: "0.9rem", borderRadius: "0.9rem", border: `1px solid ${amortizationType === "term" ? T.lime : T.border}`, background: amortizationType === "term" ? `${T.lime}15` : T.surfaceAlt, color: amortizationType === "term" ? T.lime : T.textMuted, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <Clock size={16} /> Reducir Plazo
              </button>
              <button onClick={() => setAmortizationType("quota")} style={{ ...fontBody, padding: "0.9rem", borderRadius: "0.9rem", border: `1px solid ${amortizationType === "quota" ? T.lime : T.border}`, background: amortizationType === "quota" ? `${T.lime}15` : T.surfaceAlt, color: amortizationType === "quota" ? T.lime : T.textMuted, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <TrendingDown size={16} /> Reducir Cuota
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.5rem", paddingTop: "1.5rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "1.05rem", marginBottom: "0.4rem" }}>Coste Total: Capital vs Intereses</div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", marginBottom: "1.2rem" }}>Desglose visual antes y después de amortizar.</div>
        <div style={{ width: "100%", height: "240px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.lavender} stopOpacity={0.9}/><stop offset="95%" stopColor={T.lavender} stopOpacity={0.5}/></linearGradient>
                <linearGradient id="colorIntereses" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.lime} stopOpacity={0.95}/><stop offset="95%" stopColor={T.lime} stopOpacity={0.6}/></linearGradient>
              </defs>
              <XAxis dataKey="name" stroke={T.textMuted} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={T.textMuted} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k€`} />
              <Tooltip formatter={(val, name) => [fmtEUR(val), name === "Capital" ? "Capital pendiente" : "Intereses totales"]} contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", fontSize: "13px", color: T.text }} />
              <Bar dataKey="Capital" stackId="a" fill="url(#colorCapital)" radius={[0, 0, 4, 4]} />
              <Bar dataKey="Intereses" stackId="a" fill="url(#colorIntereses)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div style={{ background: `linear-gradient(135deg, ${T.surfaceAlt}, rgba(191,255,0,0.06))`, border: `1px solid ${T.lime}40`, borderRadius: "1.2rem", padding: "1.5rem" }} className="flex flex-col gap-3.5">
        <div className="flex items-center gap-2" style={{ color: T.lime, fontSize: "0.88rem", fontWeight: 600 }}><ShieldCheck size={18} /><span>Optimización Bancaria B2B</span></div>
        <div style={{ ...fontDisplay, color: T.text, fontSize: "1.1rem", fontWeight: 700 }}>¿Tu banco te cobra un {interestRate}%? Puedes bajar tu tipo fijo desde el 2.1% TAE</div>
        <Button variant="primary" style={{ width: "100%", marginTop: "0.5rem", background: T.lime, color: "#12200A", fontWeight: 700 }}>
          Solicitar Estudio Gratuito de Subrogación <ArrowRight size={16} />
        </Button>
      </div>

      <AdSlot minHeight="0px" />
      <RelatedTools ids={["loanpayment", "compoundinterest"]} onNavigate={onNavigate} primaryId="loanpayment" />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton getText={() => `Simulación de Hipoteca MetaBox: Capital ${fmtEUR(loanAmount)}, Aportación extra ${fmtEUR(extraPayment)}, Ahorro neto en intereses ${fmtEUR(interestSaved)}.`} />
        <ExportCSVButton filename="simulacion-hipoteca" getRows={() => [
          { concepto: "Capital pendiente", valor: loanAmount.toFixed(2) },
          { concepto: "Ahorro neto en intereses", valor: interestSaved.toFixed(2) }
        ]} />
      </div>
    </div>
  );
                                }
                
