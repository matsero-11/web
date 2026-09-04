"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  Target, PiggyBank, Plane, Home as HomeIcon,
  ArrowLeft, TrendingUp, ShieldCheck, Utensils, Car, Tv, Popcorn, ShoppingBag,
  MoreHorizontal, CalendarCheck, Plus, X, Gift,
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
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Cuánto debería ahorrar al mes para Navidad?",
    a: "Depende de tu lista de regalos y de cuántos meses te queden hasta diciembre. Esta calculadora suma todos tus regalos previstos y reparte el total entre los meses restantes.",
  },
  {
    q: "¿Cuándo es el mejor momento para empezar a ahorrar para Navidad?",
    a: "Cuanto antes, mejor: empezar en enero o febrero reparte el esfuerzo en muchos más meses, con cuotas mensuales bajas, en vez de tener que reunir todo el presupuesto en los últimos meses del año.",
  },
  {
    q: "¿Para qué sirve la lista de regalos en vez de un presupuesto global?",
    a: "Te permite ver exactamente en qué se va el presupuesto de Navidad —a quién y cuánto— y ajustar regalos concretos si necesitas recortar, en vez de mover una cifra abstracta.",
  },
];

function HolidaySavingsTool({ onBack, onNavigate }) {
  const realMonth = new Date().getMonth() + 1;
  const [currentMonth, setCurrentMonth] = useSharedState("holiday_currentMonth", realMonth);
  const [current, setCurrent] = useSharedState("holiday_current", 50);
  const [gifts, setGifts] = usePersistentState("holiday_gifts", [
    { id: "1", name: "Familia", amount: 200 },
    { id: "2", name: "Amigos", amount: 150 },
    { id: "3", name: "Comida y decoración", amount: 250 },
  ]);
  const [newName, setNewName] = useState("");

  const budget = useMemo(() => gifts.reduce((sum, g) => sum + (g.amount || 0), 0), [gifts]);

  useEffect(() => {
    if (current > budget) setCurrent(budget);
  }, [budget, current]);

  const monthsLeft = currentMonth <= 12 ? 12 - currentMonth + 1 : 12;
  const remaining = Math.max(budget - current, 0);
  const requiredMonthly = monthsLeft > 0 ? remaining / monthsLeft : remaining;
  const animatedRequired = useAnimatedNumber(requiredMonthly);

  const updateAmount = (id, amount) => {
    setGifts((prev) => prev.map((g) => (g.id === id ? { ...g, amount } : g)));
  };

  const addGift = () => {
    const name = newName.trim();
    if (!name) return;
    setGifts((prev) => [...prev, { id: `${Date.now()}`, name, amount: 50 }]);
    setNewName("");
  };

  const removeGift = (id) => {
    setGifts((prev) => prev.filter((g) => g.id !== id));
  };

  const pageTitle = "Calculadora de ahorro para Navidad con lista de regalos | MetaBox";
  const pageDescription =
    "Haz tu lista de regalos y gastos de Navidad, suma el presupuesto total automáticamente y calcula cuánto ahorrar cada mes hasta diciembre. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/holiday";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="ahorro para Navidad, cuánto ahorrar para Navidad, lista de regalos de Navidad, calculadora presupuesto Navidad"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/holiday.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/holiday.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Ahorro para Navidad",
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

      <ToolHeader title="Ahorro para Navidad" subtitle="Haz tu lista de regalos y calculamos cuánto ahorrar al mes." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ height: "140px", position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, value: 1 }))}
                dataKey="value"
                innerRadius="68%"
                outerRadius="95%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={4}
                stroke="none"
                isAnimationActive={true}
                animationDuration={500}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <Cell key={i} fill={i + 1 >= currentMonth ? T.lime : T.surfaceAlt} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.8rem", fontWeight: 700 }}>{monthsLeft}</div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem" }}>{monthsLeft === 1 ? "mes" : "meses"}</div>
          </div>
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginTop: "0.5rem" }}>Ahorra al mes</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {fmtEUR(animatedRequired)}
        </div>
      </Card>

      <AdviceBlock
        text={
          monthsLeft <= 2
            ? "Quedan pocos meses. Si el importe mensual aprieta, revisa tu lista de regalos y recorta las partidas menos prioritarias."
            : "Empezar pronto reparte mejor el esfuerzo. Automatizar esta cantidad cada mes evita tener que reunirla toda en diciembre."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "1rem" }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem" }}>
            Tu lista de Navidad
          </div>
          <div style={{ ...fontBody, color: T.lime, fontSize: "0.9rem", fontWeight: 700 }}>{fmtEUR(budget)}</div>
        </div>
        <div className="flex flex-col gap-4">
          {gifts.map((g) => (
            <div key={g.id} style={{ position: "relative" }}>
              <SliderControl label={g.name} value={g.amount} min={0} max={1000} step={5} unit="€" onChange={(v) => updateAmount(g.id, v)} />
              <button
                onClick={() => removeGift(g.id)}
                aria-label={`Eliminar ${g.name}`}
                style={{
                  position: "absolute", top: "-4px", right: "-4px",
                  background: T.coral, borderRadius: "50%", width: "18px", height: "18px",
                  display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer",
                }}
              >
                <X size={11} color="#fff" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5" style={{ marginTop: "1.2rem" }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGift()}
            placeholder="Añadir regalo o gasto (ej. Mamá)..."
            style={{
              ...fontBody, flex: 1, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.7rem",
              padding: "0.6rem 0.9rem", color: T.text, fontSize: "0.85rem", outline: "none",
            }}
          />
          <button onClick={addGift} aria-label="Añadir a la lista" style={{ background: T.lime, border: "none", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Plus size={18} color="#12200A" />
          </button>
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Mes actual" value={currentMonth} min={1} max={12} step={1} unit="" onChange={setCurrentMonth} />
          <SliderControl label="Ya ahorrado" value={current} min={0} max={budget} step={10} unit="€" onChange={setCurrent} accent="lavender" />
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["savings", "challenge"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Ahorro para Navidad: presupuesto ${fmtEUR(budget)} (${gifts.length} partidas), ya ahorrado ${fmtEUR(current)}, ${monthsLeft} meses restantes → ${fmtEUR(requiredMonthly)}/mes.`
          }
        />
        <ExportCSVButton
          filename="lista-navidad"
          getRows={() => gifts.map((g) => ({ concepto: g.name, importe: g.amount.toFixed(2) }))}
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          La Navidad llega cada año en la misma fecha, pero el gasto en regalos, comidas y viajes suele coger a muchas personas por sorpresa. En vez de un presupuesto global abstracto, haz tu lista real de regalos y gastos —a quién y cuánto—, y esta calculadora reparte automáticamente el total entre los meses que quedan hasta diciembre.
        </p>
      </div>
    </div>
  );
}

export default HolidaySavingsTool;
