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
import { useSharedState } from "@/lib/persistence";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";

function DailyExpenseTool({ onBack, onNavigate }) {
  const [daily, setDaily] = useSharedState("daily_daily", 6);
  const [reduction, setReduction] = useSharedState("daily_reduction", 0);

  useEffect(() => {
    if (reduction > daily) setReduction(daily);
  }, [daily, reduction]);

  const effectiveDaily = Math.max(daily - reduction, 0);
  const weekly = effectiveDaily * 7;
  const monthly = effectiveDaily * 30;
  const annual = effectiveDaily * 365;
  const annualSavingsFromReduction = reduction * 365;

  const animatedReductionSavings = useAnimatedNumber(annualSavingsFromReduction);

  const barData = [
    { periodo: "Semana", valor: weekly },
    { periodo: "Mes", valor: monthly },
    { periodo: "Año", valor: annual },
  ];

  return (
    <div className="px-5 pt-6 pb-16 max-w-md mx-auto flex flex-col gap-4 view-enter">
      <ToolHeader title="Gastos diarios" subtitle="Un gasto pequeño cada día también se acumula. Míralo en conjunto." onBack={onBack} />

      <SliderControl label="Gasto diario" value={daily} min={0} max={60} step={0.5} unit="€" onChange={setDaily} />

      <Card style={{ height: "180px", padding: "0.9rem 0.6rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <XAxis type="number" hide domain={[0, "auto"]} />
            <YAxis type="category" dataKey="periodo" tick={{ fill: T.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} width={55} />
            <Tooltip
              contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
              formatter={(v) => [fmtEUR(v), "Total"]}
            />
            <Bar dataKey="valor" radius={[0, 8, 8, 0]} maxBarSize={26}>
              {barData.map((_, i) => (
                <Cell key={i} fill={[T.textMuted, T.lime, T.lavender][i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <AdviceBlock
        text={
          annual > 3000
            ? "Este gasto diario supera los 3.000€ al año. Un pequeño recorte aquí se nota mucho más que en gastos ocasionales."
            : reduction === 0
            ? "Mueve el control de abajo aunque sea 1€: en un gasto diario, hasta un ajuste pequeño se multiplica por 365 al año."
            : "Buen ajuste. Compara ese ahorro anual con lo que necesitarías en 'Fondo de emergencia' o en un objetivo concreto."
        }
      />

      <Card>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.92rem", marginBottom: "0.7rem" }}>
          ¿Y si lo reduces un poco?
        </div>
        <SliderControl label="Reducir gasto diario en" value={reduction} min={0} max={daily} step={0.5} unit="€" onChange={setReduction} accent="lavender" />
        {reduction > 0 && (
          <div style={{ ...fontBody, color: T.lavender, fontSize: "0.85rem", marginTop: "0.7rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <TrendingUp size={14} /> Ahorrarías {fmtEUR(animatedReductionSavings)} al año
          </div>
        )}
      </Card>
      <RelatedTools ids={["roundup", "budget"]} onNavigate={onNavigate} />
      <div className="flex justify-center gap-2.5">
        <CopySummaryButton
          getText={() => `Gasto diario: ${fmtEUR(daily)}/día → ${fmtEUR(monthly)}/mes, ${fmtEUR(annual)}/año.`}
        />
        <ExportCSVButton filename="gastos-diarios" getRows={() => barData.map((r) => ({ periodo: r.periodo, importe: r.valor.toFixed(2) }))} />
      </div>
    </div>
  );
}

export default DailyExpenseTool;
