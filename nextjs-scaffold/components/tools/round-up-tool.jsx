"use client";
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Target, PiggyBank, Plane, Home as HomeIcon,
  ArrowLeft, TrendingUp, ShieldCheck, Utensils, Car, Tv, Popcorn, ShoppingBag,
  MoreHorizontal, CalendarCheck, Plus,
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
import { useSharedState, usePersistentState } from "@/lib/persistence";
import { CopySummaryButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Qué es el ahorro por redondeo?",
    a: "Es una técnica de ahorro pasivo: cada compra se redondea al alza (por ejemplo a 1€, 2€ o 5€) y la diferencia entre el precio real y el redondeo se destina automáticamente a ahorro.",
  },
  {
    q: "¿A qué cantidad conviene redondear las compras?",
    a: "Depende de cuánto quieras ahorrar sin notarlo demasiado: redondear a 1€ genera menos ahorro pero pasa más desapercibido; redondear a 5€ acumula más, aunque se nota algo más en cada compra.",
  },
  {
    q: "¿Para qué sirve la hucha real de esta herramienta?",
    a: "Además de la estimación con una media, puedes registrar compras reales una a una: cada vez que añades una, se calcula su redondeo exacto y se suma a tu hucha acumulada real.",
  },
];

function RoundUpTool({ onBack, onNavigate }) {
  const [purchasesPerWeek, setPurchasesPerWeek] = useSharedState("roundup_purchasesPerWeek", 8);
  const [avgAmount, setAvgAmount] = useSharedState("roundup_avgAmount", 6.5);
  const [roundTo, setRoundTo] = useSharedState("roundup_roundTo", 1);
  const [piggyBank, setPiggyBank] = usePersistentState("roundup_piggyBank", 0);
  const [newPurchase, setNewPurchase] = useState("");

  const rem = avgAmount % roundTo;
  const roundUpPerPurchase = rem === 0 ? 0 : roundTo - rem;
  const weekly = purchasesPerWeek * roundUpPerPurchase;
  const monthly = weekly * 4.33;
  const annual = weekly * 52;

  const animatedMonthly = useAnimatedNumber(monthly);
  const animatedAnnual = useAnimatedNumber(annual);
  const animatedPiggy = useAnimatedNumber(piggyBank);

  const barData = [
    { periodo: "Semana", valor: weekly },
    { periodo: "Mes", valor: monthly },
    { periodo: "Año", valor: annual },
  ];

  const addRealPurchase = () => {
    const amount = Number(String(newPurchase).replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) return;
    const purchaseRem = amount % roundTo;
    const roundUp = purchaseRem === 0 ? 0 : roundTo - purchaseRem;
    setPiggyBank((p) => Number((p + roundUp).toFixed(2)));
    setNewPurchase("");
  };

  const resetPiggyBank = () => setPiggyBank(0);

  const pageTitle = "Calculadora de ahorro por redondeo de compras | MetaBox";
  const pageDescription =
    "Estima cuánto ahorrarías redondeando tus compras y lleva una hucha real registrando el redondeo de cada compra que hagas. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/roundup";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="ahorro por redondeo, cómo funciona el redondeo de compras, ahorrar redondeando compras, hucha de redondeo"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/roundup.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/roundup.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Ahorro por redondeo",
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

      <ToolHeader title="Ahorro por redondeo" subtitle="Cada compra se redondea hacia arriba y la diferencia se ahorra." onBack={onBack} />

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div className="flex gap-2 justify-center">
          {[1, 2, 5].map((v) => (
            <Chip key={v} label={`Redondear a ${v} €`} active={roundTo === v} onClick={() => setRoundTo(v)} />
          ))}
        </div>
      </Card>

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Tu hucha real acumulada</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {fmtEUR(animatedPiggy)}
        </div>
        <div className="flex items-center gap-1.5" style={{ marginTop: "0.8rem" }}>
          <input
            value={newPurchase}
            onChange={(e) => setNewPurchase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRealPurchase()}
            placeholder="Importe de la compra..."
            inputMode="decimal"
            style={{
              ...fontBody, flex: 1, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.7rem",
              padding: "0.6rem 0.9rem", color: T.text, fontSize: "0.85rem", outline: "none", textAlign: "center",
            }}
          />
          <button onClick={addRealPurchase} aria-label="Añadir redondeo" style={{ background: T.lime, border: "none", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Plus size={18} color="#12200A" />
          </button>
        </div>
        {piggyBank > 0 && (
          <button
            onClick={resetPiggyBank}
            style={{ ...fontBody, background: "transparent", border: "none", color: T.textMuted, fontSize: "0.75rem", cursor: "pointer", marginTop: "0.6rem", textDecoration: "underline" }}
          >
            Vaciar hucha (ya la he retirado)
          </button>
        )}
      </Card>

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.6rem" }}>
          Estimación media (si mantienes el ritmo)
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>{fmtEUR(monthly)} al mes · {fmtEUR(annual)} al año</div>
        <div style={{ width: "100%", height: "160px", marginTop: "0.6rem" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <XAxis type="number" hide domain={[0, "auto"]} />
              <YAxis type="category" dataKey="periodo" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v) => [fmtEUR(v), "Ahorro"]}
              />
              <Bar dataKey="valor" radius={[0, 8, 8, 0]} maxBarSize={26} animationDuration={400}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={[T.textMuted, T.lime, T.lavender][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <AdviceBlock
        text={
          roundUpPerPurchase < 0.3
            ? "Con este importe medio, el redondeo a 1€ apenas suma. Prueba a redondear a 2€ o 5€ para notar más diferencia."
            : "Registra tus compras reales arriba para ver tu hucha crecer de verdad, no solo la estimación teórica."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Compras por semana" value={purchasesPerWeek} min={0} max={30} step={1} unit="compras" onChange={setPurchasesPerWeek} />
          <SliderControl label="Importe medio por compra" value={avgAmount} min={0.5} max={50} step={0.5} unit="€" onChange={setAvgAmount} accent="lavender" />
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
        La estimación es simplificada a partir de un importe medio; la hucha real refleja las compras que registres tú.
      </div>

      <RelatedTools ids={["daily", "challenge"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() => `Ahorro por redondeo: hucha real ${fmtEUR(piggyBank)}. Estimación redondeando a ${roundTo}€ con ${purchasesPerWeek} compras/semana → ${fmtEUR(monthly)}/mes.`}
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          El ahorro por redondeo es una de las formas más populares de ahorrar sin esfuerzo: cada vez que pagas, la diferencia hasta la cifra redonda más cercana se destina a tu ahorro. Además de la estimación con una media, puedes registrar tus compras reales una a una y ver tu hucha crecer con datos verdaderos, no solo una proyección teórica.
        </p>
      </div>
    </div>
  );
}

export default RoundUpTool;
