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
import RelatedTools from "@/components/RelatedTools";
import { CopySummaryButton } from "@/components/ExportActions";
import GoalProjection from "@/components/engines/GoalProjection";

function SavingsGoalTool({ onBack, onNavigate }) {
  const [goal, setGoal] = useState(5000);
  const [current, setCurrent] = useState(1200);
  const [monthly, setMonthly] = useState(180);
  const [extra, setExtra] = useState(0);

  useEffect(() => {
    if (current > goal) setCurrent(goal);
  }, [goal, current]);

  const pct = goal > 0 ? (current / goal) * 100 : 0;
  const remaining = Math.max(goal - current, 0);
  const months = monthly + extra > 0 ? Math.ceil(remaining / (monthly + extra)) : Infinity;

  let advice = `Con este ritmo alcanzarías tu objetivo en ${Number.isFinite(months) ? months : "muchos"} meses. Prueba a mover "Ahorro extra" y observa cuánto se adelanta la fecha.`;
  if (pct >= 80) advice = "Estás muy cerca de tu objetivo. Comprueba cuánto cambia la fecha si aumentas temporalmente la aportación estos últimos meses.";
  else if (Number.isFinite(months) && months <= 6) advice = "A este ritmo lo consigues en menos de medio año: tienes margen de sobra para este objetivo.";
  else if (Number.isFinite(months) && months > 36) advice = "Al ritmo actual tardarás más de 3 años. Subir la aportación mensual, aunque sea poco, acorta el plazo de forma notable.";

  return (
    <div className="px-5 pt-6 pb-16 max-w-md mx-auto flex flex-col gap-4 view-enter">
      <ToolHeader title="Objetivo de ahorro" subtitle="Ajusta los valores y verás el resultado al instante." onBack={onBack} />
      <GoalProjection goal={goal} current={current} monthly={monthly} extra={extra} monthsSavedLabel="antes que sin ahorro extra" />
      <AdviceBlock text={advice} />
      <div className="flex flex-col gap-5">
        <SliderControl label="Objetivo" value={goal} min={500} max={30000} step={100} unit="€" onChange={setGoal} />
        <SliderControl label="Ya ahorrado" value={current} min={0} max={goal} step={50} unit="€" onChange={setCurrent} />
        <SliderControl label="Ahorro mensual" value={monthly} min={10} max={2000} step={10} unit="€" onChange={setMonthly} />
      </div>
      <Card>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.92rem", marginBottom: "0.7rem" }}>
          ¿Y si ahorras un poco más al mes?
        </div>
        <SliderControl label="Ahorro extra" value={extra} min={0} max={500} step={10} unit="€" onChange={setExtra} accent="lavender" />
      </Card>
      <RelatedTools ids={["interest", "emergency", "percent"]} onNavigate={onNavigate} />
      <div className="flex justify-center">
        <CopySummaryButton
          getText={() =>
            `Objetivo de ahorro: ${fmtEUR(goal)} — ya ahorrado ${fmtEUR(current)} — ahorro mensual ${fmtEUR(monthly + extra)} — lo conseguirás en ${Number.isFinite(months) ? months + " meses" : "un plazo indeterminado"}.`
          }
        />
      </div>
    </div>
  );
}

export default SavingsGoalTool;
