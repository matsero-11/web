"use client";
import React, { useState, useEffect } from "react";
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
import { useSharedState, usePersistentState } from "@/lib/persistence";
import { CopySummaryButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";

const EXPENSE_CATEGORIES = [
  { id: "vivienda", label: "Vivienda", icon: HomeIcon, default: 650 },
  { id: "comida", label: "Comida", icon: Utensils, default: 300 },
  { id: "transporte", label: "Transporte", icon: Car, default: 120 },
  { id: "suscripciones", label: "Suscripciones", icon: Tv, default: 35 },
  { id: "ocio", label: "Ocio", icon: Popcorn, default: 100 },
  { id: "compras", label: "Compras", icon: ShoppingBag, default: 80 },
  { id: "otros", label: "Otros", icon: MoreHorizontal, default: 60 },
];

function BudgetTool({ onBack, onNavigate }) {
  const [selected, setSelected] = usePersistentState("budget_selected", ["vivienda", "comida", "transporte"]);
  const [amounts, setAmounts] = usePersistentState("budget_amounts", Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.id, c.default])));
  const [income, setIncome] = useSharedState("budget_income", 1800);

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const activeCats = EXPENSE_CATEGORIES.filter((c) => selected.includes(c.id));
  const total = activeCats.reduce((sum, c) => sum + amounts[c.id], 0);
  const available = income - total;
  const animatedAvailable = useAnimatedNumber(available);
  const spentPct = income > 0 ? Math.min((total / income) * 100, 100) : 0;

  // Datos ordenados para la gráfica interactiva de Recharts
  const chartData = activeCats
    .map((c) => ({
      name: c.label,
      importe: amounts[c.id],
    }))
    .sort((a, b) => b.importe - a.importe);

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <ToolHeader title="Presupuesto mensual" subtitle="Elige en qué gastas y ajusta cada cantidad." onBack={onBack} />

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>¿En qué gastas normalmente?</div>
      <div className="flex flex-wrap gap-2.5">
        {EXPENSE_CATEGORIES.map((c) => (
          <Chip key={c.id} label={c.label} icon={c.icon} active={selected.includes(c.id)} onClick={() => toggle(c.id)} />
        ))}
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
            {activeCats.map((c) => (
              <SliderControl
                key={c.id}
                label={c.label}
                value={amounts[c.id]}
                min={0}
                max={2000}
                step={10}
                unit="€"
                onChange={(v) => setAmounts((a) => ({ ...a, [c.id]: v }))}
              />
            ))}
          </div>
        </Card>
      )}

      <RelatedTools ids={["savings", "rule502030"]} onNavigate={onNavigate} />

      <div className="flex justify-center pt-2">
        <CopySummaryButton
          getText={() =>
            `Presupuesto mensual: ingresos ${fmtEUR(income)}, gastos ${fmtEUR(total)}, disponible ${fmtEUR(available)}.`
          }
        />
      </div>
    </div>
  );
}

export default BudgetTool;
