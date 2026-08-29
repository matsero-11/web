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


function BarRow({ label, icon: Icon, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          <Icon size={14} color={T.textMuted} />
          <span style={{ ...fontBody, color: T.text, fontSize: "0.85rem" }}>{label}</span>
        </div>
        <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem" }}>{fmtEUR(value)}</span>
      </div>
      <div style={{ height: "7px", borderRadius: "999px", background: T.surfaceAlt, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "999px", transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)" }} />
      </div>
    </div>
  );
}


function BudgetTool({ onBack, onNavigate }) {
  const [selected, setSelected] = usePersistentState("budget_selected", ["vivienda", "comida", "transporte"]);
  const [amounts, setAmounts] = usePersistentState("budget_amounts", Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.id, c.default])));
  const [income, setIncome] = useSharedState("budget_income", 1800);

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const activeCats = EXPENSE_CATEGORIES.filter((c) => selected.includes(c.id));
  const total = activeCats.reduce((sum, c) => sum + amounts[c.id], 0);
  const available = income - total;
  const maxAmount = Math.max(...activeCats.map((c) => amounts[c.id]), 1);
  const animatedAvailable = useAnimatedNumber(available);
  const spentPct = income > 0 ? Math.min((total / income) * 100, 100) : 0;

  return (
    <div className="px-5 pt-6 pb-16 max-w-md mx-auto flex flex-col gap-4 view-enter">
      <ToolHeader title="Presupuesto mensual" subtitle="Elige en qué gastas y ajusta cada cantidad." onBack={onBack} />

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>¿En qué gastas normalmente?</div>
      <div className="flex flex-wrap gap-2">
        {EXPENSE_CATEGORIES.map((c) => (
          <Chip key={c.id} label={c.label} icon={c.icon} active={selected.includes(c.id)} onClick={() => toggle(c.id)} />
        ))}
      </div>

      <Card glow result style={{ textAlign: "center" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>Te queda disponible</div>
        <div style={{ ...fontDisplay, color: available >= 0 ? T.lime : T.coral, fontSize: "2.3rem", fontWeight: 700, margin: "0.2rem 0" }}>
          {fmtEUR(animatedAvailable)}
        </div>
        <ProgressBar pct={spentPct} gradientEnd={T.lavender} />
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", marginTop: "0.5rem" }}>
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

      <SliderControl label="Ingresos mensuales" value={income} min={0} max={6000} step={50} unit="€" onChange={setIncome} accent="lavender" />

      {activeCats.length > 0 && (
        <Card>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.92rem", marginBottom: "1rem" }}>
            Desglose por categoría
          </div>
          <div className="flex flex-col gap-3.5">
            {activeCats
              .sort((a, b) => amounts[b.id] - amounts[a.id])
              .map((c) => (
                <BarRow key={c.id} label={c.label} icon={c.icon} value={amounts[c.id]} max={maxAmount} color={T.lime} />
              ))}
          </div>
        </Card>
      )}

      {activeCats.length > 0 && (
        <div className="flex flex-col gap-5">
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
      )}
      <RelatedTools ids={["savings", "rule502030"]} onNavigate={onNavigate} />
      <div className="flex justify-center">
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
