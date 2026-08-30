"use client";
import React, { useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, Tooltip
} from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { fmtEUR } from "@/lib/hooks";
import { Card, SliderControl, AdviceBlock } from "@/components/ui";
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
      else if (next.size < 11) next.add(i);
      return next;
    });
  };

  const total = lowCount * lowShare + normalCount * normalShare;

  const chartData = MONTHS.map((m, i) => ({
    mes: m,
    importe: Math.round(lowMonths.has(i) ? lowShare : normalShare),
  }));

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <ToolHeader title="Planificador de ahorro anual" subtitle="Marca los meses más difíciles: el resto se ajusta solo para llegar al objetivo." onBack={onBack} />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <SliderControl label="Objetivo anual" value={goal} min={200} max={20000} step={100} unit="€" onChange={setGoal} />
      </Card>

      <Card glow result style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "0.4rem" }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Total del plan</div>
          <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.2rem", fontWeight: 700, margin: "0.2rem 0" }}>
            {fmtEUR(total)}
          </div>
        </div>

        <div style={{ width: "100%", height: "170px", marginTop: "0.8rem" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="mes" stroke={T.textMuted} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                formatter={(value) => [`${value} €`, "Ahorro"]}
                contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "8px", fontSize: "12px", color: T.text }}
              />
              <Bar dataKey="importe" fill={T.lime} radius={[4, 4, 0, 0]} animationDuration={300} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <AdviceBlock
        text={
          lowCount === 0
            ? "Prueba a marcar diciembre u otro mes caro como 'flojo': el resto de meses absorbe la diferencia automáticamente."
            : `Con ${lowCount} ${lowCount === 1 ? "mes flojo" : "meses flojos"}, el resto sube a ${fmtEUR(normalShare)} para seguir llegando al objetivo.`
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          Toca un mes para marcarlo como "flojo"
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {MONTHS.map((m, i) => {
            const low = lowMonths.has(i);
            const amount = low ? lowShare : normalShare;
            return (
              <button
                key={m}
                onClick={() => toggleMonth(i)}
                style={{
                  borderRadius: "0.8rem",
                  padding: "0.75rem 0.4rem",
                  border: `1px solid ${low ? T.lavender : T.border}`,
                  background: low ? T.lavenderSoft : T.surfaceAlt,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ ...fontBody, color: low ? T.lavender : T.text, fontSize: "0.78rem", fontWeight: 600 }}>{m}</div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.7rem", marginTop: "0.25rem" }}>{fmtEUR(amount)}</div>
              </button>
            );
          })}
        </div>
      </Card>
      
      <RelatedTools ids={["savings", "challenge"]} onNavigate={onNavigate} />
      
      <div className="flex flex-wrap justify-center gap-3 pt-2">
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

