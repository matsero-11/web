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
import RelatedTools from "@/components/RelatedTools";
import { CopySummaryButton } from "@/components/ExportActions";
import GoalProjection from "@/components/engines/GoalProjection";
import { usePersistentState } from "@/lib/persistence";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Cómo calculo cuánto tardaré en llegar a mi objetivo de ahorro?",
    a: "Se divide lo que te falta por ahorrar (objetivo menos lo ya ahorrado) entre tu aportación mensual, incluyendo cualquier ahorro extra que añadas. Esta calculadora lo hace automáticamente y actualiza el resultado al instante.",
  },
  {
    q: "¿Merece la pena añadir un ahorro extra al mes?",
    a: "Sí: incluso una aportación extra pequeña puede adelantar significativamente la fecha en la que alcanzas tu objetivo, especialmente en metas a medio o largo plazo.",
  },
  {
    q: "¿Puedo tener varios objetivos de ahorro a la vez?",
    a: "Sí: puedes crear varios objetivos con nombre propio (viaje, coche, fondo de estudios...) y cambiar entre ellos, cada uno con su propio progreso guardado.",
  },
];

const DEFAULT_GOAL = { id: "1", name: "Mi objetivo", goal: 5000, current: 1200, monthly: 180, extra: 0 };

function SavingsGoalTool({ onBack, onNavigate }) {
  const [goals, setGoals] = usePersistentState("savings_goalsList", [DEFAULT_GOAL]);
  const [activeId, setActiveId] = usePersistentState("savings_activeGoalId", "1");
  const [newGoalName, setNewGoalName] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const active = goals.find((g) => g.id === activeId) || goals[0];

  const updateActive = (patch) => {
    setGoals((prev) => prev.map((g) => (g.id === active.id ? { ...g, ...patch } : g)));
  };

  useEffect(() => {
    if (active && active.current > active.goal) updateActive({ current: active.goal });
  }, [active?.goal]);

  const addGoal = () => {
    const name = newGoalName.trim();
    if (!name) return;
    const id = `${Date.now()}`;
    setGoals((prev) => [...prev, { id, name, goal: 3000, current: 0, monthly: 100, extra: 0 }]);
    setActiveId(id);
    setNewGoalName("");
    setShowAdd(false);
  };

  const removeGoal = (id) => {
    if (goals.length <= 1) return;
    const next = goals.filter((g) => g.id !== id);
    setGoals(next);
    if (activeId === id) setActiveId(next[0].id);
  };

  if (!active) return null;

  const { goal, current, monthly, extra } = active;
  const pct = goal > 0 ? (current / goal) * 100 : 0;
  const remaining = Math.max(goal - current, 0);
  const months = monthly + extra > 0 ? Math.ceil(remaining / (monthly + extra)) : Infinity;

  let advice = `Con este ritmo alcanzarías "${active.name}" en ${Number.isFinite(months) ? months : "muchos"} meses. Prueba a mover "Ahorro extra" y observa cuánto se adelanta la fecha.`;
  if (pct >= 80) advice = "Estás muy cerca de este objetivo. Comprueba cuánto cambia la fecha si aumentas temporalmente la aportación estos últimos meses.";
  else if (Number.isFinite(months) && months <= 6) advice = "A este ritmo lo consigues en menos de medio año: tienes margen de sobra para este objetivo.";
  else if (Number.isFinite(months) && months > 36) advice = "Al ritmo actual tardarás más de 3 años. Subir la aportación mensual, aunque sea poco, acorta el plazo de forma notable.";

  const pageTitle = "Calculadora de objetivo de ahorro: cuándo lo conseguirás | MetaBox";
  const pageDescription =
    "Calcula cuánto tardarás en alcanzar tus objetivos de ahorro, gestiona varias metas a la vez con nombre propio, y ve tu proyección en una gráfica interactiva. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/savings";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="calculadora objetivo de ahorro, cuánto tardaré en ahorrar, planificador de metas de ahorro, varios objetivos de ahorro"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/savings.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/savings.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Objetivo de ahorro",
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

      <ToolHeader title="Objetivo de ahorro" subtitle="Gestiona una o varias metas y verás el resultado al instante." onBack={onBack} />

      <div className="flex flex-wrap gap-2">
        {goals.map((g) => (
          <div key={g.id} style={{ position: "relative" }}>
            <Chip label={g.name} active={activeId === g.id} onClick={() => setActiveId(g.id)} />
            {goals.length > 1 && activeId === g.id && (
              <button
                onClick={() => removeGoal(g.id)}
                aria-label={`Eliminar ${g.name}`}
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
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            style={{
              ...fontBody, display: "flex", alignItems: "center", gap: "0.35rem",
              padding: "0.55rem 0.9rem", borderRadius: "999px", fontSize: "0.85rem", fontWeight: 500,
              border: `1px dashed ${T.border}`, background: "transparent", color: T.textMuted, cursor: "pointer",
            }}
          >
            <Plus size={14} /> Nuevo objetivo
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal()}
              placeholder="Nombre (ej. Viaje a Japón)..."
              autoFocus
              style={{
                ...fontBody, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "999px",
                padding: "0.5rem 0.9rem", color: T.text, fontSize: "0.85rem", outline: "none", width: "11rem",
              }}
            />
            <button onClick={addGoal} aria-label="Confirmar" style={{ background: T.lime, border: "none", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Plus size={16} color="#12200A" />
            </button>
          </div>
        )}
      </div>

      <GoalProjection goal={goal} current={current} monthly={monthly} extra={extra} monthsSavedLabel="antes que sin ahorro extra" />

      <AdviceBlock text={advice} />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Objetivo" value={goal} min={500} max={30000} step={100} unit="€" onChange={(v) => updateActive({ goal: v })} />
          <SliderControl label="Ya ahorrado" value={current} min={0} max={goal} step={50} unit="€" onChange={(v) => updateActive({ current: v })} />
          <SliderControl label="Ahorro mensual" value={monthly} min={10} max={2000} step={10} unit="€" onChange={(v) => updateActive({ monthly: v })} />
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          ¿Y si ahorras un poco más al mes?
        </div>
        <div className="flex flex-col gap-6">
          <SliderControl label="Ahorro extra" value={extra} min={0} max={500} step={10} unit="€" onChange={(v) => updateActive({ extra: v })} accent="lavender" />
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["interest", "emergency", "percent"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `${active.name}: ${fmtEUR(goal)} — ya ahorrado ${fmtEUR(current)} — ahorro mensual ${fmtEUR(monthly + extra)} — lo conseguirás en ${Number.isFinite(months) ? months + " meses" : "un plazo indeterminado"}.`
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Ya sea para un objetivo concreto o un ahorro general, saber cuándo lo vas a conseguir ayuda a mantener la motivación. Esta calculadora te permite gestionar varios objetivos a la vez —cada uno con su nombre, su progreso y su propia proyección— y ver el efecto de sumar un ahorro extra a la fecha de consecución de cada uno.
        </p>
      </div>
    </div>
  );
}

export default SavingsGoalTool;
