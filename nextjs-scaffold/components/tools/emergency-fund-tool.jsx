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
import GoalProjection from "@/components/engines/GoalProjection";

function EmergencyFundTool({ onBack, onNavigate }) {
  const [expenses, setExpenses] = useSharedState("emergency_expenses", 1100);
  const [monthsTarget, setMonthsTarget] = useSharedState("emergency_monthsTarget", 6);
  const [current, setCurrent] = useSharedState("emergency_current", 800);
  const [monthly, setMonthly] = useSharedState("emergency_monthly", 120);

  const goal = expenses * monthsTarget;

  useEffect(() => {
    if (current > goal) setCurrent(goal);
  }, [goal, current]);

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <ToolHeader title="Fondo de emergencia" subtitle="Cuánto necesitas ahorrar para estar cubierto ante un imprevisto." onBack={onBack} />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Gasto esencial mensual" value={expenses} min={300} max={4000} step={50} unit="€" onChange={setExpenses} />
          <div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginBottom: "0.5rem" }}>Meses de cobertura</div>
            <div className="flex gap-2">
              {[3, 6, 12].map((m) => (
                <Chip key={m} label={`${m} meses`} active={monthsTarget === m} onClick={() => setMonthsTarget(m)} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", textAlign: "center", marginTop: "-0.5rem" }}>
        Objetivo calculado: <span style={{ color: T.lime, fontWeight: 600 }}>{fmtEUR(goal)}</span>
      </div>

      <GoalProjection goal={goal} current={current} monthly={monthly} extra={0} monthsSavedLabel="" />

      <AdviceBlock
        text={
          current >= goal
            ? "Ya tienes cubierto tu fondo de emergencia con este objetivo. Podrías redirigir la aportación mensual hacia otra meta."
            : monthly > 0 && Math.ceil((goal - current) / monthly) > 24
            ? "Al ritmo actual tardarás más de 2 años en completarlo. Si es posible, prioriza este fondo antes que metas menos urgentes."
            : "Vas por buen camino. Un fondo de emergencia sólido te da margen para no tocar tus otros ahorros ante un imprevisto."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Ya ahorrado" value={current} min={0} max={goal} step={50} unit="€" onChange={setCurrent} />
          <SliderControl label="Aportación mensual" value={monthly} min={10} max={1000} step={10} unit="€" onChange={setMonthly} accent="lavender" />
        </div>
      </Card>

      <RelatedTools ids={["savings", "budget", "percent"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Fondo de emergencia: gasto esencial ${fmtEUR(expenses)}/mes × ${monthsTarget} meses = objetivo ${fmtEUR(expenses * monthsTarget)}. Ya ahorrado ${fmtEUR(current)}, aportando ${fmtEUR(monthly)}/mes.`
          }
        />
      </div>
    </div>
  );
}

export default EmergencyFundTool;
          
