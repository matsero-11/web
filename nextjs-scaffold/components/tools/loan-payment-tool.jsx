"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  Target, PiggyBank, Plane, Home as HomeIcon,
  ArrowLeft, TrendingUp, ShieldCheck, Utensils, Car, Tv, Popcorn, ShoppingBag,
  MoreHorizontal, CalendarCheck,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadialBarChart, RadialBar, ComposedChart, PolarAngleAxis,
} from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, SliderControl, ProgressBar, Chip, IconTile, AdviceBlock } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import RelatedTools from "@/components/RelatedTools";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Cómo se calcula la cuota mensual de un préstamo?",
    a: "Se calcula con el sistema de cuota fija (francés), el más habitual en préstamos personales e hipotecas, a partir del importe prestado, el tipo de interés (TAE) y el plazo en meses.",
  },
  {
    q: "¿Por qué al principio pago más intereses y menos capital?",
    a: "En el sistema de cuota fija, los primeros pagos amortizan más intereses y menos capital porque el interés se calcula sobre el saldo pendiente, que al inicio es más alto. Con el tiempo, esa proporción se invierte.",
  },
  {
    q: "¿Alargar el plazo del préstamo es mejor o peor?",
    a: "Alargar el plazo reduce la cuota mensual, pero aumenta el total de intereses pagados durante toda la vida del préstamo. Compara ambos modos de la gráfica para decidir con datos.",
  },
];

function LoanPaymentTool({ onBack, onNavigate }) {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(6);
  const [months, setMonths] = useState(48);
  const [chartMode, setChartMode] = useState("saldo");

  const monthlyRate = rate / 100 / 12;
  const payment = useMemo(() => {
    if (months <= 0) return 0;
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }, [principal, monthlyRate, months]);

  const totalPaid = payment * months;
  const totalInterest = Math.max(totalPaid - principal, 0);
  const animatedPayment = useAnimatedNumber(payment);
  const animatedInterest = useAnimatedNumber(totalInterest);

  const chartData = useMemo(() => {
    let balance = principal;
    let interestPaid = 0;
    const points = [{ mes: 0, saldo: principal, intereses: 0 }];
    const step = months > 96 ? Math.ceil(months / 96) : 1;
    for (let m = 1; m <= months; m++) {
      const interest = balance * monthlyRate;
      interestPaid += interest;
      balance = Math.max(balance + interest - payment, 0);
      if (m % step === 0 || m === months) points.push({ mes: m, saldo: balance, intereses: interestPaid });
    }
    return points;
  }, [principal, monthlyRate, payment, months]);

  const pageTitle = "Calculadora de cuota de préstamo e intereses totales | MetaBox";
  const pageDescription =
    "Calcula la cuota mensual de un préstamo personal o hipoteca según el importe, la TAE y el plazo, y visualiza cuánto pagarás en intereses con una gráfica de amortización. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/loan";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="calculadora cuota préstamo, cuánto pagaré de intereses préstamo, calculadora amortización préstamo, cuota mensual préstamo personal"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/loan.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/loan.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Cuota de un préstamo",
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

      <ToolHeader title="Cuota de un préstamo" subtitle="Calcula la cuota mensual y cuánto pagarás en intereses." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Cuota mensual</div>
        <div style={{ ...fontDisplay, color: T.text, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {fmtEUR(animatedPayment)}
        </div>
        <div style={{ ...fontBody, color: T.coral, fontSize: "0.88rem" }}>{fmtEUR(animatedInterest)} en intereses totales</div>
      </Card>

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div className="flex gap-2 justify-center" style={{ marginBottom: "0.8rem" }}>
          <Chip label="Saldo pendiente" active={chartMode === "saldo"} onClick={() => setChartMode("saldo")} />
          <Chip label="Intereses acumulados" active={chartMode === "intereses"} onClick={() => setChartMode("intereses")} />
        </div>
        <div style={{ width: "100%", height: "190px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="mes" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v) => [fmtEUR(v), chartMode === "saldo" ? "Pendiente" : "Intereses pagados"]}
                labelFormatter={(l) => `Mes ${l}`}
              />
              <Line
                type="monotone"
                dataKey={chartMode}
                stroke={chartMode === "saldo" ? T.coral : T.lavender}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={true}
                animationDuration={400}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <AdviceBlock
        text={
          totalInterest > principal * 0.5
            ? "Los intereses superan la mitad del importe prestado. Alargar el plazo baja la cuota, pero sube todavía más los intereses totales — mira el gráfico en modo 'Intereses' para verlo."
            : months > 84
            ? "Un plazo largo baja la cuota mensual, pero alarga el tiempo pagando intereses. Compara con un plazo más corto si tu presupuesto lo permite."
            : "Cuota e intereses razonables para este importe y plazo. Prueba a subir el plazo un poco y observa cuánto baja la cuota."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Importe del préstamo" value={principal} min={500} max={100000} step={100} unit="€" onChange={setPrincipal} />
          <SliderControl label="TAE estimada" value={rate} min={0} max={20} step={0.1} unit="%" onChange={setRate} accent="lavender" />
          <SliderControl label="Plazo" value={months} min={1} max={360} step={1} unit="meses" onChange={setMonths} />
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
        Cálculo orientativo con cuota fija. No incluye comisiones y no constituye una oferta ni asesoramiento financiero.
      </div>

      <RelatedTools ids={["targetincome", "budget"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Préstamo: ${fmtEUR(principal)} al ${rate}% TAE a ${months} meses → cuota mensual ${fmtEUR(payment)}, intereses totales ${fmtEUR(totalInterest)}.`
          }
        />
        <ExportCSVButton
          filename="tabla-amortizacion-prestamo"
          getRows={() =>
            chartData.map((row) => ({
              mes: row.mes,
              saldo_pendiente: row.saldo.toFixed(2),
              intereses_acumulados: row.intereses.toFixed(2),
            }))
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Antes de firmar un préstamo, conviene saber exactamente cuánto vas a pagar cada mes y cuánto acabará costándote en intereses a lo largo de toda su duración. Esta calculadora usa el sistema de cuota fija, el más habitual en préstamos personales e hipotecas, y te muestra visualmente cómo evoluciona el saldo pendiente frente a los intereses acumulados.
        </p>
      </div>
    </div>
  );
}

export default LoanPaymentTool;
