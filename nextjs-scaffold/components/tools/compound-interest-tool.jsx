"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, AdviceBlock, Button, SliderControl } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";
import { MAX_FINANCIAL_LIMIT } from "@/lib/financial-constants";

const FAQS = [
  { q: "¿Qué es el interés compuesto?", a: "Es el interés que se calcula no solo sobre tu capital inicial, sino también sobre los intereses ya generados en periodos anteriores, por lo que tu dinero crece de forma acelerada cuanto más tiempo lo dejas invertido." },
  { q: "¿Cuánto influye la aportación mensual frente al capital inicial?", a: "A largo plazo, las aportaciones mensuales constantes suelen pesar más que el capital inicial en el resultado final, especialmente en plazos de 10 años o más. Compara ambos sliders para verlo." },
  { q: "¿Este cálculo garantiza esa rentabilidad?", a: "No. Es una simulación orientativa con un interés anual estimado y constante; la rentabilidad real de cualquier producto financiero puede variar y no está garantizada." },
  { q: "¿Por qué el valor ajustado a inflación es más bajo que el saldo total?", a: "Porque la inflación reduce el poder adquisitivo del dinero con el tiempo. El saldo total son los euros nominales que tendrás; el valor ajustado es lo que esos euros podrán comprar realmente al ritmo de inflación que indiques." },
];

function CompoundInterestTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [initial, setInitial] = useState(() => {
    const p = initialParams?.initial;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 1000;
  });

  const [monthly, setMonthly] = useState(() => {
    const p = initialParams?.monthly;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 100;
  });

  const [rate, setRate] = useState(() => {
    const p = initialParams?.rate;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 5;
  });

  const [years, setYears] = useState(() => {
    const p = initialParams?.years;
    return p !== undefined && !isNaN(parseInt(p, 10)) ? parseInt(p, 10) : 10;
  });

  const [showInflation, setShowInflation] = useState(() => {
    return initialParams?.showInflation === "true" || initialParams?.inflationRate !== undefined;
  });

  const [inflationRate, setInflationRate] = useState(() => {
    const p = initialParams?.inflationRate;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 2.5;
  });

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        initial,
        monthly,
        rate,
        years,
        showInflation: showInflation ? "true" : null,
        inflationRate: showInflation ? inflationRate : null,
      });
    }
  }, [initial, monthly, rate, years, showInflation, inflationRate, onStateChange]);

  const monthlyRate = rate / 100 / 12;
  const monthlyInflation = inflationRate / 100 / 12;
  const totalMonths = years * 12;

  const { finalAmount, totalContributed, totalInterest, finalReal, chartData } = useMemo(() => {
    let balance = initial;
    let contributed = initial;
    const points = [{ mes: 0, saldo: initial, aportado: initial, intereses: 0, real: initial }];
    const step = totalMonths > 96 ? Math.ceil(totalMonths / 96) : 1;
    
    for (let m = 1; m <= totalMonths; m++) {
      balance = balance * (1 + monthlyRate) + monthly;
      contributed += monthly;
      const realValue = balance / Math.pow(1 + monthlyInflation, m);
      if (m % step === 0 || m === totalMonths) {
        points.push({ 
          mes: m, 
          saldo: balance, 
          aportado: contributed, 
          intereses: Math.max(balance - contributed, 0),
          real: realValue 
        });
      }
    }
    const realFinal = balance / Math.pow(1 + monthlyInflation, totalMonths);
    return { 
      finalAmount: balance, 
      totalContributed: contributed, 
      totalInterest: Math.max(balance - contributed, 0),
      finalReal: realFinal, 
      chartData: points 
    };
  }, [initial, monthly, monthlyRate, monthlyInflation, totalMonths]);

  const purchasingPowerLost = finalAmount - finalReal;
  const animatedFinal = useAnimatedNumber(finalAmount);
  const animatedInterest = useAnimatedNumber(totalInterest);
  const animatedReal = useAnimatedNumber(finalReal);
  const isInterestMilestoneReached = totalInterest >= totalContributed && totalContributed > 0;

  const pageTitle = "Calculadora de interés compuesto: simula el crecimiento de tu dinero | MetaBox";
  const pageDescription = "Simula cuánto puede crecer tu capital con el interés compuesto, incluyendo el valor real ajustado a inflación, según tu aportación, tipo de interés y plazo. Gráfica interactiva y gratis.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/interes-compuesto-aportaciones";

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
            name: "Interés compuesto",
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

      <ToolHeader title="Interés compuesto" subtitle="Descubre cuánto puede crecer tu dinero con el tiempo." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Al cabo de {years} años tendrías</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {fmtEUR(animatedFinal)}
        </div>
        <div style={{ ...fontBody, color: T.lavender, fontSize: "0.88rem" }}>
          {fmtEUR(animatedInterest)} son intereses generados
        </div>
      </Card>

      {isInterestMilestoneReached && (
        <div style={{ background: `linear-gradient(135deg, ${T.lime}15, ${T.lavender}15)`, border: `1px solid ${T.lime}`, borderRadius: "0.8rem", padding: "1rem", textAlign: "center" }}>
          <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.05rem", fontWeight: 700 }}>
            🚀 ¡Efecto bola de nieve desatado!
          </div>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", marginTop: "0.25rem" }}>
            Los intereses generados ya superan el total de tu capital aportado. El dinero trabaja por ti a plena potencia.
          </div>
        </div>
      )}

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div style={{ width: "100%", height: "200px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.lime} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={T.lime} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={20} />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                formatter={(v, name) => {
                  const labels = { saldo: "Saldo total", aportado: "Aportado", intereses: "Intereses", real: "Valor real" };
                  return [fmtEUR(Number(v) || 0), labels[name] || name];
                }}
                labelFormatter={(l) => `Mes ${l}`}
              />
              <Area type="monotone" dataKey="saldo" stroke={T.lime} strokeWidth={2} fill="url(#fillSaldo)" />
              <Line type="monotone" dataKey="aportado" stroke={T.lavender} strokeWidth={2} strokeDasharray="4 3" dot={false} />
              <Line type="monotone" dataKey="intereses" stroke={T.coral} strokeWidth={2} dot={false} />
              {showInflation && (
                <Line type="monotone" dataKey="real" stroke="#00F0FF" strokeWidth={1.5} strokeDasharray="2 2" dot={false} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center", marginTop: "0.6rem" }}>
          Lima: saldo total · Lavanda: aportado · Coral: intereses {showInflation ? " · Cian: valor real" : ""}
        </div>
      </Card>

      {!showInflation ? (
        <Button variant="ghost" onClick={() => setShowInflation(true)}>
          Ver el valor real ajustado a inflación
        </Button>
      ) : (
        <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
            Poder adquisitivo real
          </div>
          <SliderControl 
            label="Inflación media anual estimada" 
            value={inflationRate} 
            min={0} 
            max={10} 
            step={0.1} 
            unit="%" 
            onChange={setInflationRate} 
            accent="lavender" 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginTop: "1.2rem" }}>
            <div style={{ background: T.surfaceAlt, borderRadius: "0.9rem", padding: "1rem", textAlign: "center", border: `1px solid ${T.border}` }}>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>Euros nominales</div>
              <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.4rem", fontWeight: 700, marginTop: "0.3rem" }}>{fmtEUR(finalAmount)}</div>
            </div>
            <div style={{ background: T.surfaceAlt, borderRadius: "0.9rem", padding: "1rem", textAlign: "center", border: `1px solid ${T.border}` }}>
              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>Poder adquisitivo real hoy</div>
              <div style={{ ...fontDisplay, color: "#00F0FF", fontSize: "1.4rem", fontWeight: 700, marginTop: "0.3rem" }}>{fmtEUR(animatedReal)}</div>
            </div>
          </div>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", textAlign: "center", marginTop: "0.9rem" }}>
            La inflación se "come" {fmtEUR(purchasingPowerLost)} de poder adquisitivo en estos {years} años
          </div>
        </Card>
      )}

      <AdviceBlock
        text={
          totalInterest > totalContributed * 0.5
            ? "Los intereses ya pesan más de la mitad de lo aportado: cuanto más tiempo dejes crecer el capital, más se acelera esa diferencia."
            : years < 5
            ? "A pocos años, el interés compuesto pesa poco todavía. Prueba a alargar el plazo y verás cómo se separan las dos líneas."
            : "Sube un poco la aportación mensual y compara cuánto cambia el resultado final frente a alargar el plazo."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          {/* NATIVOS Y FLUIDOS */}
          <SliderControl label="Capital inicial" value={initial} min={0} max={MAX_FINANCIAL_LIMIT} step={100} unit="€" onChange={setInitial} accent="lime" />
          <SliderControl label="Aportación mensual" value={monthly} min={0} max={MAX_FINANCIAL_LIMIT} step={100} unit="€" onChange={setMonthly} accent="lavender" />
          <SliderControl label="Interés anual estimado" value={rate} min={0} max={12} step={0.1} unit="%" onChange={setRate} accent="lime" />
          <SliderControl label="Años" value={years} min={1} max={70} step={1} unit="años" onChange={setYears} accent="lavender" />
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
        Resultado orientativo. No constituye asesoramiento financiero ni garantiza rentabilidad futura.
      </div>

      <RelatedTools ids={["savings", "loan"]} onNavigate={onNavigate} primaryId="savings" />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Interés compuesto: capital inicial ${fmtEUR(initial)}, aportación ${fmtEUR(monthly)}/mes al ${rate}% anual durante ${years} años → ${fmtEUR(finalAmount)} (${fmtEUR(totalInterest)} en intereses).` +
            (showInflation ? ` Valor real ajustado a inflación: ${fmtEUR(finalReal)}.` : "")
          }
        />
        <ExportCSVButton
          filename="proyeccion-interes-compuesto"
          getRows={() =>
            chartData.map((row) => ({ mes: row.mes, saldo: row.saldo.toFixed(2), aportado: row.aportado.toFixed(2), intereses: row.intereses.toFixed(2), valor_real: row.real.toFixed(2) }))
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          El interés compuesto es uno de los mecanismos más potentes para hacer crecer el ahorro a largo plazo, porque cada año generas intereses también sobre los intereses acumulados previamente. Ajusta el capital, la aportación mensual, el interés estimado y los años, y activa la vista de inflación para ver no solo cuántos euros tendrás, sino cuánto podrán comprar realmente en el futuro.
        </p>
      </div>
    </div>
  );
}

export default CompoundInterestTool;
