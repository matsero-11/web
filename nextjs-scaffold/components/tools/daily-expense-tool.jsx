"use client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Target, PiggyBank, Plane, Home as HomeIcon,
  ArrowLeft, TrendingUp, ShieldCheck, Utensils, Car, Tv, Popcorn, ShoppingBag,
  MoreHorizontal, CalendarCheck, Plus, X,
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
    q: "¿Cuánto suma un gasto pequeño diario al año?",
    a: "Un gasto de 6€ al día equivale a 2.190€ al año — mucho más de lo que suele parecer a simple vista, precisamente porque se paga en cantidades pequeñas y repetidas.",
  },
  {
    q: "¿Merece la pena recortar 1 o 2 euros al día?",
    a: "Sí: al multiplicarse por 365 días, incluso un pequeño recorte diario puede generar un ahorro anual significativo sin que el cambio en el día a día se note apenas.",
  },
  {
    q: "¿Por qué desglosar varios gastos en vez de uno solo?",
    a: "La mayoría de personas no tienen un único gasto diario, sino varios pequeños (café, transporte, tabaco...). Verlos por separado ayuda a identificar cuál merece más la pena recortar primero.",
  },
];

const DEFAULT_ITEMS = [{ id: "1", name: "Café", amount: 1.5 }];

function DailyExpenseTool({ onBack, onNavigate }) {
  const [items, setItems] = usePersistentState("daily_items", DEFAULT_ITEMS);
  const [newName, setNewName] = useState("");

  const daily = items.reduce((sum, it) => sum + (it.amount || 0), 0);
  const weekly = daily * 7;
  const monthly = daily * 30;
  const annual = daily * 365;

  const barData = [
    { periodo: "Semana", valor: weekly },
    { periodo: "Mes", valor: monthly },
    { periodo: "Año", valor: annual },
  ];

  const updateAmount = (id, amount) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, amount } : it)));
  };

  const addItem = () => {
    const name = newName.trim();
    if (!name) return;
    setItems((prev) => [...prev, { id: `${Date.now()}`, name, amount: 1 }]);
    setNewName("");
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const biggestItem = [...items].sort((a, b) => b.amount - a.amount)[0];

  const pageTitle = "De gasto diario a gasto anual: calculadora de pequeños gastos | MetaBox";
  const pageDescription =
    "Desglosa tus gastos diarios pequeños (café, transporte, tabaco...) y descubre cuánto suman realmente al mes y al año. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/daily";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="cuánto gasto al día, calculadora gasto diario a anual, cuánto gasto en café al año, pequeños gastos que suman"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/daily.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/daily.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Gastos diarios",
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

      <ToolHeader title="Gastos diarios" subtitle="Desglosa tus pequeños gastos y mira cuánto suman en conjunto." onBack={onBack} />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          Tus gastos diarios
        </div>
        <div className="flex flex-col gap-6">
          {items.map((it) => (
            <div key={it.id} style={{ position: "relative" }}>
              <SliderControl
                label={it.name}
                value={it.amount}
                min={0}
                max={30}
                step={0.5}
                unit="€"
                onChange={(v) => updateAmount(it.id, v)}
              />
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(it.id)}
                  aria-label={`Eliminar ${it.name}`}
                  style={{
                    position: "absolute", top: "-4px", right: "-4px",
                    background: T.coral, borderRadius: "50%", width: "18px", height: "18px",
                    display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer",
                  }}
                >
                  <X size={11} color="#fff" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5" style={{ marginTop: "1.2rem" }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Añadir otro gasto (ej. tabaco)..."
            style={{
              ...fontBody, flex: 1, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.7rem",
              padding: "0.6rem 0.9rem", color: T.text, fontSize: "0.85rem", outline: "none",
            }}
          />
          <button onClick={addItem} aria-label="Añadir gasto" style={{ background: T.lime, border: "none", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Plus size={18} color="#12200A" />
          </button>
        </div>
      </Card>

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div style={{ width: "100%", height: "190px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <XAxis type="number" hide domain={[0, "auto"]} />
              <YAxis type="category" dataKey="periodo" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v) => [fmtEUR(v), "Total"]}
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
          annual > 3000
            ? "Este total diario supera los 3.000€ al año. Un pequeño recorte aquí se nota mucho más que en gastos ocasionales."
            : biggestItem
            ? `"${biggestItem.name}" es tu gasto más alto (${fmtEUR(biggestItem.amount)}/día). Empezar por ahí suele notarse más rápido.`
            : "Añade tus gastos diarios habituales para ver cuánto suman en conjunto."
        }
      />

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["roundup", "budget"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() => `Gastos diarios (${items.map((i) => i.name).join(", ")}): ${fmtEUR(daily)}/día → ${fmtEUR(monthly)}/mes, ${fmtEUR(annual)}/año.`}
        />
        <ExportCSVButton filename="gastos-diarios" getRows={() => items.map((it) => ({ gasto: it.name, importe_diario: it.amount.toFixed(2), importe_anual: (it.amount * 365).toFixed(2) }))} />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Los gastos pequeños y repetidos —un café, el transporte, el tabaco— son fáciles de ignorar por separado porque cada uno parece insignificante. Esta calculadora te deja desglosar todos tus gastos diarios habituales y ver el total combinado en su equivalente semanal, mensual y anual, para decidir con datos cuál merece la pena recortar primero.
        </p>
      </div>
    </div>
  );
}

export default DailyExpenseTool;
