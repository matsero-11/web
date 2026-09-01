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
import { useSharedState } from "@/lib/persistence";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Qué es el interés compuesto?",
    a: "Es el interés que se calcula no solo sobre tu capital inicial, sino también sobre los intereses ya generados en periodos anteriores, por lo que tu dinero crece de forma acelerada cuanto más tiempo lo dejas invertido.",
  },
  {
    q: "¿Cuánto influye la aportación mensual frente al capital inicial?",
    a: "A largo plazo, las aportaciones mensuales constantes suelen pesar más que el capital inicial en el resultado final, especialmente en plazos de 10 años o más. Compara ambos sliders para verlo.",
  },
  {
    q: "¿Este cálculo garantiza esa rentabilidad?",
    a: "No. Es una simulación orientativa con un interés anual estimado y constante; la rentabilidad real de cualquier producto financiero puede variar y no está garantizada.",
  },
];

function CompoundInterestTool({ onBack, onNavigate }) {
  const [initial, setInitial] = useSharedState("interest_initial", 1000);
  const [monthly, setMonthly] = useSharedState("interest_monthly", 100);
  const [rate, setRate] = useSharedState("interest_rate", 5);
  const [years, setYears] = useSharedState("interest_years", 10);

  const monthlyRate = rate / 100 / 12;
  const totalMonths = years * 12;

  const { finalAmount, totalContributed, chartData } = useMemo(() => {
    let balance = initial;
    let contributed = initial;
    const points = [{ mes: 0, saldo: initial, aportado: initial }];
    const step = totalMonths > 96 ? Math.ceil(totalMonths / 96) : 1;
    for (let m = 1; m <= totalMonths; m++) {
      balance = balance * (1 + monthlyRate) + monthly;
      contributed += monthly;
      if (m % step === 0 || m === totalMonths) {
        points.push({ mes: m, saldo: balance, aportado: contributed });
      }
    }
    return { finalAmount: balance, totalContributed: contributed, chartData: points };
  }, [initial, monthly, monthlyRate, totalMonths]);

  const interestEarned = finalAmount - totalContributed;
  const animatedFinal = useAnimatedNumber(finalAmount);
  const animatedInterest = useAnimatedNumber(Math.max(interestEarned, 0));

  const pageTitle = "Calculadora de interés compuesto: simula el crecimiento de tu dinero | MetaBox";
  const pageDescription =
    "Simula cuánto puede crecer tu capital con el interés compuesto según tu aportación inicial, aportación mensual, tipo de interés anual y plazo en años. Gráfica interactiva y gratis.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/interest";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="calculadora de interés compuesto, simulador interés compuesto, cómo funciona el interés compuesto, interés compuesto mensual"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/interest.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/interest.png" />

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

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div style={{ width: "100%", height: "190px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.lime} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={T.lime} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v, name) => [fmtEUR(v), name === "saldo" ? "Saldo total" : "Aportado"]}
                labelFormatter={(l) => `Mes ${l}`}
              />
              <Area type="monotone" dataKey="saldo" stroke={T.lime} strokeWidth={2} fill="url(#fillSaldo)" />
              <Line type="monotone" dataKey="aportado" stroke={T.lavender} strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center", marginTop: "0.6rem" }}>
          Lima: saldo total · Lavanda: solo lo aportado
        </div>
      </Card>

      <AdviceBlock
        text={
          interestEarned > totalContributed * 0.5
            ? "Los intereses ya pesan más de la mitad de lo aportado: cuanto más tiempo dejes crecer el capital, más se acelera esa diferencia."
            : years < 5
            ? "A pocos años, el interés compuesto pesa poco todavía. Prueba a alargar el plazo y verás cómo se separan las dos líneas."
            : "Sube un poco la aportación mensual y compara cuánto cambia el resultado final frente a alargar el plazo."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Capital inicial" value={initial} min={0} max={50000} step={100} unit="€" onChange={setInitial} />
          <SliderControl label="Aportación mensual" value={monthly} min={0} max={2000} step={10} unit="€" onChange={setMonthly} accent="lavender" />
          <SliderControl label="Interés anual estimado" value={rate} min={0} max={12} step={0.1} unit="%" onChange={setRate} />
          <SliderControl label="Años" value={years} min={1} max={40} step={1} unit="años" onChange={setYears} />
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
        Resultado orientativo. No constituye asesoramiento financiero ni garantiza rentabilidad futura.
      </div>

      <RelatedTools ids={["savings", "loan"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Interés compuesto: capital inicial ${fmtEUR(initial)}, aportación ${fmtEUR(monthly)}/mes al ${rate}% anual durante ${years} años → ${fmtEUR(finalAmount)} (${fmtEUR(interestEarned)} en intereses).`
          }
        />
        <ExportCSVButton
          filename="proyeccion-interes-compuesto"
          getRows={() =>
            chartData.map((row) => ({ mes: row.mes, saldo: row.saldo.toFixed(2), aportado: row.aportado.toFixed(2) }))
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          El interés compuesto es uno de los mecanismos más potentes para hacer crecer el ahorro a largo plazo, porque cada año generas intereses también sobre los intereses acumulados previamente, no solo sobre el capital inicial. Ajusta el capital de partida, la aportación mensual, el tipo de interés estimado y el número de años para ver cómo se transforma tu dinero con el tiempo.
        </p>
      </div>
    </div>
  );
}

export default CompoundInterestTool;
