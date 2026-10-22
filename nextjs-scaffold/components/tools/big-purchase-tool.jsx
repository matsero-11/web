"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Car, Home as HomeIcon, ShoppingBag } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis
} from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, SliderControl, Chip, AdviceBlock, Button } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";
import { MAX_FINANCIAL_LIMIT } from "@/lib/financial-constants";

const PURCHASE_TYPES = [
  { id: "coche", label: "Coche", icon: Car, defaultBudget: 12000 },
  { id: "vivienda", label: "Vivienda (entrada)", icon: HomeIcon, defaultBudget: 30000 },
  { id: "otro", label: "Otra compra", icon: ShoppingBag, defaultBudget: 3000 },
];

const FAQS = [
  {
    q: "¿Cuánto necesito ahorrar de entrada para un coche o una vivienda?",
    a: "Para un coche depende del modelo y si lo financias; para una vivienda, lo habitual es que los bancos exijan al menos un 20% de entrada más gastos de compraventa.",
  },
  {
    q: "¿Es mejor ahorrar más al mes o alargar el plazo?",
    a: "Alargar el plazo reduce el esfuerzo mensual pero retrasa la compra; ahorrar más al mes acelera la fecha pero exige más disciplina.",
  },
  {
    q: "¿Me conviene ahorrar todo o financiar una parte?",
    a: "Financiar reduce el esfuerzo de ahorro inicial pero añade intereses al coste total. Usa el comparador para ver la diferencia exacta.",
  },
];

function DecimalSliderRow({ label, value, setValue, min, max, step = 1, unit = "€", accent = "lime", subtitle, useDynamicMax = true }) {
  const [textVal, setTextVal] = useState(String(value ?? 0));
  const ABSOLUTE_MAX = Math.max(max, MAX_FINANCIAL_LIMIT || 10000000);

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

  const handleBlur = () => {
    const parsed = parseFloat(textVal.replace(",", "."));
    if (isNaN(parsed)) {
      setValue(min);
      setTextVal(String(min));
    } else {
      const clamped = Math.min(Math.max(parsed, min), ABSOLUTE_MAX);
      setValue(clamped);
      setTextVal(String(clamped));
    }
  };

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setValue(val);
    setTextVal(String(val));
  };

  const safeValue = isNaN(value) ? min : Math.max(min, Math.min(value, ABSOLUTE_MAX));
  
  const dynamicMax = useDynamicMax ? Math.max(safeValue * 2, 5000, min + 1000) : max;
  const sliderPos = Math.max(0, Math.min(safeValue, dynamicMax));

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
            onBlur={handleBlur}
            className="bg-transparent text-right font-semibold"
            style={{ ...fontBody, color: accentColor, fontSize: "0.9rem", width: "100px", outline: "none" }}
          />
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>{unit}</span>
        </div>
      </div>
      {subtitle && <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>{subtitle}</div>}
      <input
        type="range"
        min={min}
        max={dynamicMax}
        step={step}
        value={sliderPos}
        onChange={handleSliderChange}
        className="w-full cursor-pointer h-1.5 rounded-lg appearance-none bg-[var(--surface-alt,rgba(255,255,255,0.1))] accent-current"
        style={{ accentColor }}
      />
    </div>
  );
}
function BigPurchaseTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [type, setType] = useState(() => {
    const p = initialParams?.type;
    return PURCHASE_TYPES.some((t) => t.id === p) ? p : "coche";
  });

  const typeInfo = PURCHASE_TYPES.find((t) => t.id === type) || PURCHASE_TYPES[0];

  const [budget, setBudget] = useState(() => {
    const p = initialParams?.budget;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : typeInfo.defaultBudget;
  });

  const [current, setCurrent] = useState(() => {
    const p = initialParams?.current;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 1000;
  });

  const [monthsLeft, setMonthsLeft] = useState(() => {
    const p = initialParams?.monthsLeft;
    return p !== undefined && !isNaN(parseInt(p, 10)) ? parseInt(p, 10) : 18;
  });

  const [showFinancing, setShowFinancing] = useState(() => {
    return initialParams?.showFinancing === "true" || initialParams?.financePct !== undefined;
  });

  const [financePct, setFinancePct] = useState(() => {
    const p = initialParams?.financePct;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 30;
  });

  const [financeRate, setFinanceRate] = useState(() => {
    const p = initialParams?.financeRate;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 7;
  });

  const [financeMonths, setFinanceMonths] = useState(() => {
    const p = initialParams?.financeMonths;
    return p !== undefined && !isNaN(parseInt(p, 10)) ? parseInt(p, 10) : 48;
  });

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        type, budget, current, monthsLeft,
        showFinancing: showFinancing ? "true" : null,
        financePct: showFinancing ? financePct : null,
        financeRate: showFinancing ? financeRate : null,
        financeMonths: showFinancing ? financeMonths : null,
      });
    }
  }, [type, budget, current, monthsLeft, showFinancing, financePct, financeRate, financeMonths, onStateChange]);

  const changeType = (id) => {
    setType(id);
    const info = PURCHASE_TYPES.find((t) => t.id === id);
    if (info) setBudget(info.defaultBudget);
  };

  const safeBudget = Math.max(budget, 0);
  const remaining = Math.max(safeBudget - current, 0);
  const safeMonths = Math.max(monthsLeft, 1);
  
  const requiredMonthly = remaining / safeMonths;
  const animatedRequired = useAnimatedNumber(requiredMonthly);
  
  const pct = safeBudget > 0 ? (current / safeBudget) * 100 : 0;
  const animatedPct = useAnimatedNumber(Math.min(pct, 100));
  const isGoalAchieved = current >= safeBudget && safeBudget > 0;

  const financedAmount = remaining * (financePct / 100);
  const cashNeeded = remaining - financedAmount;
  const cashMonthly = cashNeeded / safeMonths;

  const loanPayment = useMemo(() => {
    const monthlyRate = financeRate / 100 / 12;
    if (financeMonths <= 0) return 0;
    if (monthlyRate === 0) return financedAmount / financeMonths;
    return (financedAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -financeMonths));
  }, [financedAmount, financeRate, financeMonths]);

  const totalFinanceCost = loanPayment * financeMonths;
  const interestCost = Math.max(totalFinanceCost - financedAmount, 0);
  const combinedMonthly = cashMonthly + loanPayment;

  const pageTitle = "Cuánto ahorrar al mes para un coche, vivienda o compra grande | MetaBox";
  const pageDescription = "Calcula cuánto tienes que ahorrar cada mes para comprarte un coche, dar la entrada de una vivienda o cualquier compra grande, y compara ahorrar todo frente a financiar una parte. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/ahorro-compra-grande-coche-vivienda";

  const pieData = safeBudget <= 0 
    ? [{ name: "Empty", value: 1 }] 
    : [
        { name: "Ahorrado", value: Math.max(current, 0) },
        { name: "Restante", value: Math.max(remaining, 0) }
      ];

  const projectionData = useMemo(() => {
    if (safeBudget === 0) return [];
    const data = [];
    let accumulated = Math.min(current, safeBudget);
    
    data.push({ mes: 0, ahorrado: accumulated, meta: safeBudget });
    
    for (let i = 1; i <= monthsLeft; i++) {
      if (accumulated >= safeBudget) {
        data.push({ mes: i, ahorrado: safeBudget, meta: safeBudget });
      } else {
        accumulated += requiredMonthly;
        data.push({ mes: i, ahorrado: Math.min(accumulated, safeBudget), meta: safeBudget });
      }
    }
    return data;
  }, [safeBudget, current, monthsLeft, requiredMonthly]);

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Ahorro para una compra grande",
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

      <ToolHeader title="Ahorro para una compra grande" subtitle="Elige qué quieres comprar y cuándo, y calculamos el resto." onBack={onBack} />

      <div className="flex flex-wrap gap-2.5 justify-center">
        {PURCHASE_TYPES.map((t) => (
          <Chip key={t.id} label={t.label} active={type === t.id} onClick={() => changeType(t.id)} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GRÁFICO CIRCULAR PREMIUM */}
        <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
          <div style={{ height: "160px", position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="gradientRing" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={T.lavender} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={T.coral} stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="gradientLime" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={T.lime} stopOpacity={1} />
                    <stop offset="100%" stopColor="#a4c52c" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
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
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name === "Empty" ? T.surfaceAlt :
                        entry.name === "Ahorrado" ? "url(#gradientLime)" : 
                        "url(#gradientRing)"
                      } 
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.5rem", color: T.text, fontSize: "0.85rem", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                  formatter={(v, name) => [fmtEUR(v), name === "Restante" ? "Restante" : "Ahorrado"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              {safeBudget === 0 ? (
                <span style={{ fontSize: "2rem", color: T.textMuted }}>—</span>
              ) : isGoalAchieved ? (
                 <span style={{ fontSize: "2.5rem" }}>🏆</span>
              ) : (
                <>
                  <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.2rem", fontWeight: 700 }}>{animatedPct.toFixed(0)}%</div>
                  <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>cubierto</div>
                </>
              )}
            </div>
          </div>
          
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginTop: "0.6rem" }}>Necesitas ahorrar al mes</div>
          <div style={{ ...fontDisplay, color: isGoalAchieved ? T.lavender : T.lime, fontSize: "2.2rem", fontWeight: 700, margin: "0.2rem 0" }}>
            {safeBudget === 0 ? "—" : isGoalAchieved ? "¡Listo!" : fmtEUR(animatedRequired)}
          </div>
        </Card>

        {/* GRÁFICA DE PROYECCIÓN MENSUAL */}
        <Card style={{ paddingTop: "1.2rem", paddingBottom: "1.2rem", display: "flex", flexDirection: "column" }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
            Proyección de tu ahorro
          </div>
          <div style={{ width: "100%", height: "180px" }}>
            {safeBudget > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAhorro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.lime} stopOpacity={0.6}/>
                      <stop offset="95%" stopColor={T.lime} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="mes" hide />
                  <YAxis hide domain={[0, safeBudget]} />
                  <Tooltip 
                    formatter={(value, name) => [fmtEUR(value), name === "ahorrado" ? "Ahorro" : "Meta"]}
                    labelFormatter={(label) => label === 0 ? "Hoy" : `Mes ${label}`}
                    contentStyle={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "8px", fontSize: "12px", color: T.text }}
                  />
                  <Area type="monotone" dataKey="meta" stroke={T.lavender} strokeDasharray="4 4" fill="none" strokeWidth={2} />
                  <Area type="monotone" dataKey="ahorrado" stroke={T.lime} strokeWidth={3} fill="url(#colorAhorro)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
                Introduce un presupuesto para ver la proyección
              </div>
            )}
          </div>
        </Card>
      </div>

      <AdviceBlock
        text={
          safeBudget === 0
            ? "Introduce un presupuesto en la calculadora para saber cuánto necesitas ahorrar cada mes."
            : isGoalAchieved
            ? "¡Felicidades! Ya tienes todo el dinero ahorrado para esta compra. Es el momento perfecto para empezar a buscar ofertas y dar el paso final sin endeudarte."
            : type === "vivienda"
            ? "Recuerda: los bancos suelen exigir al menos un 20% de entrada sobre el precio de la vivienda, más gastos de compraventa."
            : requiredMonthly > 800
            ? "La cuota mensual es alta. Alargar el plazo aunque sea un año puede bajarla de forma importante — pruébalo con el slider."
            : pct >= 50
            ? "Ya llevas más de la mitad. Mantén el ritmo actual o compara qué pasa si adelantas unos meses la fecha objetivo."
            : "Este tipo de compra suele beneficiarse de plazos largos: cuanto más tiempo des, menos esfuerzo mensual necesitas."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          {/* SLIDERS CORREGIDOS Y BLINDADOS */}
          <DecimalSliderRow label="Presupuesto" value={budget} min={0} max={MAX_FINANCIAL_LIMIT || 10000000} step={500} unit="€" accent="lime" setValue={setBudget} useDynamicMax={true} />
          <DecimalSliderRow label="Ya ahorrado" value={current} min={0} max={MAX_FINANCIAL_LIMIT || 10000000} step={100} unit="€" accent="lavender" setValue={setCurrent} useDynamicMax={true} />
          <SliderControl label="Meses para conseguirlo" value={monthsLeft} min={1} max={120} step={1} unit="meses" onChange={setMonthsLeft} accent="lavender" />
        </div>
      </Card>

      {!isGoalAchieved && safeBudget > 0 && (
        !showFinancing ? (
          <Button variant="ghost" onClick={() => setShowFinancing(true)}>
            ¿Y si financio una parte? Comparar con ahorrar todo
          </Button>
        ) : (
          <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
            <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
              Ahorrar todo vs. financiar una parte
            </div>
            <div className="flex flex-col gap-6">
              <SliderControl label="Porcentaje a financiar" value={financePct} min={0} max={90} step={5} unit="%" onChange={setFinancePct} accent="lavender" />
              <SliderControl label="TAE estimada del préstamo" value={financeRate} min={0} max={20} step={0.1} unit="%" onChange={setFinanceRate} accent="lavender" />
              <SliderControl label="Plazo del préstamo" value={financeMonths} min={6} max={96} step={1} unit="meses" onChange={setFinanceMonths} accent="lavender" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginTop: "1.4rem" }}>
              <div style={{ background: T.surfaceAlt, borderRadius: "0.9rem", padding: "1rem", textAlign: "center", border: `1px solid ${T.border}` }}>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>Solo ahorrando</div>
                <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.5rem", fontWeight: 700, marginTop: "0.3rem" }}>
                  {safeMonths > 0 ? fmtEUR(requiredMonthly) : "—"}
                </div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", marginTop: "0.2rem" }}>al mes · sin intereses</div>
              </div>
              <div style={{ background: T.surfaceAlt, borderRadius: "0.9rem", padding: "1rem", textAlign: "center", border: `1px solid ${T.border}` }}>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>Financiando {financePct}%</div>
                <div style={{ ...fontDisplay, color: T.lavender, fontSize: "1.5rem", fontWeight: 700, marginTop: "0.3rem" }}>
                  {fmtEUR(combinedMonthly)}
                </div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", marginTop: "0.2rem" }}>
                  {fmtEUR(cashMonthly)} ahorro + {fmtEUR(loanPayment)} cuota
                </div>
              </div>
            </div>

            <div style={{ ...fontBody, color: T.coral, fontSize: "0.85rem", textAlign: "center", marginTop: "1rem", background: `${T.coral}15`, padding: "0.6rem", borderRadius: "0.5rem" }}>
              Financiar te cuesta <strong>{fmtEUR(interestCost)}</strong> extra en intereses a lo largo del préstamo
            </div>
          </Card>
        )
      )}

      <AdSlot minHeight="0px" />
      <RelatedTools ids={["savings", "loan"]} onNavigate={onNavigate} primaryId="savings" />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Ahorro para ${typeInfo.label}: presupuesto ${fmtEUR(budget)}, ya ahorrado ${fmtEUR(current)}, ${monthsLeft} meses → necesitas ${fmtEUR(requiredMonthly)}/mes.` +
            (showFinancing && !isGoalAchieved ? ` Financiando ${financePct}%: ${fmtEUR(combinedMonthly)}/mes (${fmtEUR(interestCost)} en intereses).` : "")
          }
        />
        <ExportCSVButton
          filename="ahorro-compra-grande"
          getRows={() => [
            { concepto: "Tipo de compra", valor: typeInfo.label },
            { concepto: "Presupuesto total", valor: budget.toFixed(2) },
            { concepto: "Ya ahorrado", valor: current.toFixed(2) },
            { concepto: "Restante", valor: remaining.toFixed(2) },
            { concepto: "Plazo objetivo (meses)", valor: monthsLeft },
            { concepto: "Ahorro mensual necesario", valor: requiredMonthly.toFixed(2) },
            ...(showFinancing && !isGoalAchieved ? [
              { concepto: "Porcentaje financiado", valor: `${financePct}%` },
              { concepto: "Cuota mensual del préstamo", valor: loanPayment.toFixed(2) },
              { concepto: "Intereses totales", valor: interestCost.toFixed(2) }
            ] : [])
          ]}
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Ya sea la entrada de un coche, la entrada de una vivienda o cualquier otra compra grande, planificar el ahorro con antelación evita tener que recurrir a financiación cara de última hora. Esta calculadora reparte el importe que te falta entre los meses que tienes por delante, y te permite comparar directamente el coste real de ahorrar todo frente a financiar una parte de la compra.
        </p>
      </div>
    </div>
  );
}

export default BigPurchaseTool;
