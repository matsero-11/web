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
    <div className="px-5 pt-6 pb-16 max-w-md mx-auto flex flex-col gap-4 view-enter">
      <ToolHeader title="Planificador de ahorro anual" subtitle="Marca los meses más difíciles: el resto se ajusta solo para llegar al objetivo." onBack={onBack} />

      <SliderControl label="Objetivo anual" value={goal} min={200} max={20000} step={100} unit="€" onChange={setGoal} />

      <Card glow result style={{ paddingBottom: "0.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "0.2rem" }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>Total del plan</div>
          <div style={{ ...fontDisplay, color: T.lime, fontSize: "2rem", fontWeight: 700, margin: "0.1rem 0" }}>
            {fmtEUR(total)}
          </div>
        </div>

        <div style={{ width: "100%", height: "130px", marginTop: "0.5rem" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="mes" stroke={T.textMuted} fontSize={10} tickLine={false} axisLine={false} />
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
                  transition: "all 0.2s ease",
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
