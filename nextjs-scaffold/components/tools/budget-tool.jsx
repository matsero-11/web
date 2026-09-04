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
import { Card, SliderControl, ProgressBar, Chip, IconTile, AdviceBlock, Button } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { useSharedState, usePersistentState } from "@/lib/persistence";
import { CopySummaryButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const EXPENSE_CATEGORIES = [
  { id: "vivienda", label: "Vivienda", icon: HomeIcon, default: 650, maxPct: 35 },
  { id: "comida", label: "Comida", icon: Utensils, default: 300, maxPct: 15 },
  { id: "transporte", label: "Transporte", icon: Car, default: 120, maxPct: 15 },
  { id: "suscripciones", label: "Suscripciones", icon: Tv, default: 35, maxPct: 5 },
  { id: "ocio", label: "Ocio", icon: Popcorn, default: 100, maxPct: 10 },
  { id: "compras", label: "Compras", icon: ShoppingBag, default: 80, maxPct: 10 },
  { id: "otros", label: "Otros", icon: MoreHorizontal, default: 60, maxPct: 10 },
];

const FAQS = [
  {
    q: "¿Qué porcentaje de mis ingresos debería destinar a cada categoría?",
    a: "No hay una regla única, pero muchas personas usan como referencia el 50% en necesidades, el 30% en deseos y el 20% en ahorro. Ajusta cada categoría según tu situación real con los sliders.",
  },
  {
    q: "¿Qué hago si mis gastos superan mis ingresos?",
    a: "Revisa el desglose por categoría y prioriza recortar primero en las partidas más flexibles, como ocio o suscripciones, antes de tocar gastos fijos como vivienda o transporte.",
  },
  {
    q: "¿Para qué sirve guardar el mes en el histórico?",
    a: "Al guardar una foto de tu presupuesto cada mes, puedes ver cómo evoluciona tu disponible real a lo largo del tiempo, en vez de mirar solo el mes actual de forma aislada.",
  },
];

function BudgetTool({ onBack, onNavigate }) {
  const [selected, setSelected] = usePersistentState("budget_selected", ["vivienda", "comida", "transporte"]);
  const [amounts, setAmounts] = usePersistentState("budget_amounts", Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.id, c.default])));
  const [income, setIncome] = useSharedState("budget_income", 1800);
  const [customCategories, setCustomCategories] = usePersistentState("budget_customCategories", []);
  const [newCatName, setNewCatName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [history, setHistory] = usePersistentState("budget_history", []);

  const allCategories = [...EXPENSE_CATEGORIES, ...customCategories];

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const addCustomCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    const id = `custom_${Date.now()}`;
    const newCat = { id, label: name, icon: MoreHorizontal, default: 50, maxPct: null, custom: true };
    setCustomCategories((prev) => [...prev, newCat]);
    setAmounts((a) => ({ ...a, [id]: 50 }));
    setSelected((s) => [...s, id]);
    setNewCatName("");
    setShowAddCat(false);
  };

  const removeCustomCategory = (id) => {
    setCustomCategories((prev) => prev.filter((c) => c.id !== id));
    setSelected((s) => s.filter((x) => x !== id));
  };

  const activeCats = allCategories.filter((c) => selected.includes(c.id));
  const total = activeCats.reduce((sum, c) => sum + (amounts[c.id] || 0), 0);
  const available = income - total;
  const animatedAvailable = useAnimatedNumber(available);
  const spentPct = income > 0 ? Math.min((total / income) * 100, 100) : 0;

  const chartData = activeCats
    .map((c) => ({
      name: c.label,
      importe: amounts[c.id] || 0,
    }))
    .sort((a, b) => b.importe - a.importe);

  const saveSnapshot = () => {
    const snapshot = {
      date: new Date().toISOString(),
      label: new Date().toLocaleDateString("es-ES", { month: "short", year: "2-digit" }),
      income,
      total,
      available,
    };
    setHistory((prev) => [...prev.slice(-11), snapshot]); // guarda hasta 12 meses
  };

  const pageTitle = "Presupuesto mensual por categorías: organiza tus gastos | MetaBox";
  const pageDescription =
    "Organiza tu presupuesto mensual por categorías, compáralas con referencias razonables de gasto, añade categorías propias y guarda tu histórico mes a mes. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/budget";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="presupuesto mensual, cómo hacer un presupuesto mensual, calculadora de gastos por categoría, organizar gastos mensuales, histórico de presupuesto"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/budget.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/budget.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Presupuesto mensual",
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

      <ToolHeader title="Presupuesto mensual" subtitle="Elige en qué gastas y ajusta cada cantidad." onBack={onBack} />

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>¿En qué gastas normalmente?</div>
      <div className="flex flex-wrap gap-2.5">
        {allCategories.map((c) => (
          <div key={c.id} style={{ position: "relative" }}>
            <Chip label={c.label} icon={c.icon} active={selected.includes(c.id)} onClick={() => toggle(c.id)} />
            {c.custom && (
              <button
                onClick={(e) => { e.stopPropagation(); removeCustomCategory(c.id); }}
                aria-label={`Eliminar categoría ${c.label}`}
                style={{
                  position: "absolute", top: "-6px", right: "-6px",
                  background: T.coral, borderRadius: "50%", width: "16px", height: "16px",
                  display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer",
                }}
              >
                <X size={10} color="#fff" />
              </button>
            )}
          </div>
        ))}
        {!showAddCat ? (
          <button
            onClick={() => setShowAddCat(true)}
            style={{
              ...fontBody, display: "flex", alignItems: "center", gap: "0.35rem",
              padding: "0.55rem 0.9rem", borderRadius: "999px", fontSize: "0.85rem", fontWeight: 500,
              border: `1px dashed ${T.border}`, background: "transparent", color: T.textMuted, cursor: "pointer",
            }}
          >
            <Plus size={14} /> Añadir categoría
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomCategory()}
              placeholder="Nombre..."
              autoFocus
              style={{
                ...fontBody, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "999px",
                padding: "0.5rem 0.9rem", color: T.text, fontSize: "0.85rem", outline: "none", width: "9rem",
              }}
            />
            <button onClick={addCustomCategory} aria-label="Confirmar categoría" style={{ background: T.lime, border: "none", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Plus size={16} color="#12200A" />
            </button>
          </div>
        )}
      </div>

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Te queda disponible</div>
        <div style={{ ...fontDisplay, color: available >= 0 ? T.lime : T.coral, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {fmtEUR(animatedAvailable)}
        </div>
        <ProgressBar pct={spentPct} gradientEnd={T.lavender} />
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", marginTop: "0.6rem" }}>
          {spentPct.toFixed(0)}% de tus ingresos ya asignado
        </div>
      </Card>

      <AdviceBlock
        text={
          available < 0
            ? "Tu presupuesto supera los ingresos. Mira el desglose de abajo y empieza recortando la categoría más alta, suele notarse más rápido."
            : available < income * 0.1
            ? "Te queda muy poco margen libre. Si puedes, deja algo de colchón antes de comprometer todo el ingreso."
            : "Te queda un margen saludable. Podrías destinar parte de ese disponible a 'Objetivo de ahorro' o al 'Fondo de emergencia'."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <SliderControl label="Ingresos mensuales" value={income} min={0} max={6000} step={50} unit="€" onChange={setIncome} accent="lavender" />
      </Card>

      {activeCats.length > 0 && (
        <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.8rem" }}>
            Desglose por categoría
          </div>
          <div style={{ width: "100%", height: "180px", marginTop: "0.4rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke={T.textMuted} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value) => [`${value} €`, "Gasto"]}
                  contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "8px", fontSize: "12px", color: T.text }}
                />
                <Bar dataKey="importe" fill={T.lime} radius={[4, 4, 0, 0]} animationDuration={300} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {activeCats.length > 0 && (
        <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
          <div className="flex flex-col gap-6">
            {activeCats.map((c) => {
              const catPct = income > 0 ? ((amounts[c.id] || 0) / income) * 100 : 0;
              const overBenchmark = c.maxPct && catPct > c.maxPct;
              return (
                <div key={c.id}>
                  <SliderControl
                    label={c.label}
                    value={amounts[c.id] || 0}
                    min={0}
                    max={2000}
                    step={10}
                    unit="€"
                    onChange={(v) => setAmounts((a) => ({ ...a, [c.id]: v }))}
                  />
                  {c.maxPct && (
                    <div style={{ ...fontBody, fontSize: "0.72rem", color: overBenchmark ? T.coral : T.textMuted, marginTop: "0.3rem" }}>
                      {catPct.toFixed(0)}% de tus ingresos {overBenchmark ? `— por encima del ${c.maxPct}% recomendado` : `(referencia: hasta ${c.maxPct}%)`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: history.length > 0 ? "1rem" : 0 }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem" }}>
            Histórico mensual
          </div>
          <Button variant="ghost" onClick={saveSnapshot} style={{ width: "auto", padding: "0.5rem 0.9rem", fontSize: "0.8rem" }}>
            Guardar este mes
          </Button>
        </div>
        {history.length > 0 && (
          <div style={{ width: "100%", height: "150px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" stroke={T.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                  formatter={(v) => [fmtEUR(v), "Disponible"]}
                />
                <Line type="monotone" dataKey="available" stroke={T.lime} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {history.length === 0 && (
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem" }}>
            Guarda tu primer mes para empezar a ver la evolución de tu presupuesto en el tiempo.
          </div>
        )}
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["savings", "rule502030"]} onNavigate={onNavigate} />

      <div className="flex justify-center pt-2">
        <CopySummaryButton
          getText={() =>
            `Presupuesto mensual: ingresos ${fmtEUR(income)}, gastos ${fmtEUR(total)}, disponible ${fmtEUR(available)}.`
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Hacer un presupuesto mensual por categorías te ayuda a ver de un vistazo en qué se va realmente tu dinero, en lugar de descubrirlo a final de mes. Ajusta vivienda, comida, transporte y el resto de partidas con los sliders, añade tus propias categorías si lo necesitas, y guarda cada mes para ver cómo evoluciona tu presupuesto real con el tiempo.
        </p>
      </div>
    </div>
  );
}

export default BudgetTool;
