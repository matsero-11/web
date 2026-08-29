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

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];


function AnnualPlannerTool({ onBack, onNavigate }) {
  const [goal, setGoal] = useSharedState("annual_goal", 3600);
  const [lowMonths, setLowMonths] = useState(() => new Set());

  const evenShare = goal / 12;
  const lowShare = evenShare * 0.5;
  const lowCount = lowMonths.size;
  const normalCount = 12 - lowCount;
  const totalLow = lowShare * lowCount;
  const normalShare = normalCount > 0 ? (goal - totalLow) / normalCount : 0;

  const toggleMonth = (i) => {
    setLowMonths((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else if (next.size < 11) next.add(i); // deja siempre al menos 1 mes "normal"
      return next;
    });
  };

  const total = lowCount * lowShare + normalCount * normalShare;

  return (
    <div className="px-5 pt-6 pb-16 max-w-md mx-auto flex flex-col gap-4 view-enter">
      <ToolHeader title="Planificador de ahorro anual" subtitle="Marca los meses más difíciles: el resto se ajusta solo para llegar al objetivo." onBack={onBack} />

      <SliderControl label="Objetivo anual" value={goal} min={200} max={20000} step={100} unit="€" onChange={setGoal} />

      <Card glow result style={{ textAlign: "center" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>Total del plan</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2rem", fontWeight: 700, margin: "0.2rem 0" }}>
          {fmtEUR(total)}
        </div>
      </Card>

      <AdviceBlock
        text={
          lowCount === 0
            ? "Prueba a marcar diciembre u otro mes caro como 'flojo': el resto de meses absorbe la diferencia automáticamente."
            : `Con ${lowCount} ${lowCount === 1 ? "mes flojo" : "meses flojos"}, el resto sube a ${fmtEUR(normalShare)} para seguir llegando al objetivo.`
        }
      />

      <Card>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.92rem", marginBottom: "0.9rem" }}>
          Toca un mes para marcarlo como "flojo"
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
          {MONTHS.map((m, i) => {
            const low = lowMonths.has(i);
            const amount = low ? lowShare : normalShare;
            return (
              <button
                key={m}
                onClick={() => toggleMonth(i)}
                style={{
                  borderRadius: "0.6rem",
                  padding: "0.55rem 0.3rem",
                  border: `1px solid ${low ? T.lavender : T.border}`,
                  background: low ? T.lavenderSoft : T.surfaceAlt,
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <div style={{ ...fontBody, color: low ? T.lavender : T.text, fontSize: "0.72rem", fontWeight: 600 }}>{m}</div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.65rem", marginTop: "0.15rem" }}>{fmtEUR(amount)}</div>
              </button>
            );
          })}
        </div>
      </Card>
      <RelatedTools ids={["savings", "challenge"]} onNavigate={onNavigate} />
      <div className="flex justify-center gap-2.5">
        <CopySummaryButton
          getText={() => `Plan de ahorro anual: objetivo ${fmtEUR(goal)}, con ${lowMonths.size} meses flojos marcados.`}
        />
        <ExportCSVButton
          filename="planificador-ahorro-anual"
          getRows={() =>
            MONTHS.map((m, i) => ({
              mes: m,
              importe: (lowMonths.has(i) ? lowShare : normalShare).toFixed(2),
              tipo: lowMonths.has(i) ? "flojo" : "normal",
            }))
          }
        />
      </div>
    </div>
  );
}

export default AnnualPlannerTool;
