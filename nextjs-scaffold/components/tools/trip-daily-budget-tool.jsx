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
import { CopySummaryButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";

function TripDailyBudgetTool({ onBack, onNavigate }) {
  const [totalBudget, setTotalBudget] = useSharedState("tripdaily_totalBudget", 900);
  const [totalDays, setTotalDays] = useSharedState("tripdaily_totalDays", 6);
  const [spent, setSpent] = useSharedState("tripdaily_spent", 300);
  const [daysElapsed, setDaysElapsed] = useSharedState("tripdaily_daysElapsed", 2);

  useEffect(() => {
    if (spent > totalBudget) setSpent(totalBudget);
  }, [totalBudget, spent]);
  useEffect(() => {
    if (daysElapsed > totalDays) setDaysElapsed(totalDays);
  }, [totalDays, daysElapsed]);

  const remainingBudget = Math.max(totalBudget - spent, 0);
  const remainingDays = Math.max(totalDays - daysElapsed, 0);
  const dailyAllowanceLeft = remainingDays > 0 ? remainingBudget / remainingDays : remainingBudget;
  const originalDailyPlan = totalDays > 0 ? totalBudget / totalDays : 0;

  const animatedAllowance = useAnimatedNumber(dailyAllowanceLeft);
  const onTrack = dailyAllowanceLeft >= originalDailyPlan * 0.9;

  return (
    <div className="px-5 pt-6 pb-16 max-w-md mx-auto flex flex-col gap-4 view-enter">
      <ToolHeader title="Presupuesto diario de viaje" subtitle="Ajusta lo que llevas gastado y verás cuánto te queda por día." onBack={onBack} />

      <Card glow={onTrack} result style={{ textAlign: "center" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>Puedes gastar al día</div>
        <div style={{ ...fontDisplay, color: onTrack ? T.lime : T.coral, fontSize: "2.3rem", fontWeight: 700, margin: "0.2rem 0" }}>
          {remainingDays > 0 ? fmtEUR(animatedAllowance) : "—"}
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>
          Plan original: {fmtEUR(originalDailyPlan)} al día · {remainingDays} {remainingDays === 1 ? "día restante" : "días restantes"}
        </div>
      </Card>

      <AdviceBlock
        text={
          !onTrack
            ? "Vas por encima del ritmo previsto. Si quieres llegar sin sobresaltos, reduce un poco el gasto de los próximos días."
            : remainingDays === 0
            ? "El viaje ha terminado según estos datos. Compara el gasto real con el plan original para el próximo viaje."
            : "Vas dentro del plan. Aun así, deja algo de margen para imprevistos de última hora."
        }
      />

      <div className="flex flex-col gap-5">
        <SliderControl label="Presupuesto total del viaje" value={totalBudget} min={50} max={10000} step={50} unit="€" onChange={setTotalBudget} />
        <SliderControl label="Días totales de viaje" value={totalDays} min={1} max={60} step={1} unit="días" onChange={setTotalDays} />
        <SliderControl label="Gastado hasta ahora" value={spent} min={0} max={totalBudget} step={10} unit="€" onChange={setSpent} accent="lavender" />
        <SliderControl label="Días ya pasados" value={daysElapsed} min={0} max={totalDays} step={1} unit="días" onChange={setDaysElapsed} accent="lavender" />
      </div>
      <RelatedTools ids={["trip", "currency"]} onNavigate={onNavigate} />
      <div className="flex justify-center">
        <CopySummaryButton
          getText={() =>
            `Presupuesto de viaje: ${fmtEUR(totalBudget)} para ${totalDays} días, gastado ${fmtEUR(spent)} en ${daysElapsed} días → ${fmtEUR(dailyAllowanceLeft)}/día restante.`
          }
        />
      </div>
    </div>
  );
}

export default TripDailyBudgetTool;
      
