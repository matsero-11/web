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

function ScenarioComparatorTool({ onBack, onNavigate }) {
  const [current, setCurrent] = useSharedState("comparator_current", 150);
  const [alternative, setAlternative] = useSharedState("comparator_alternative", 220);

  const monthlyDiff = alternative - current;
  const annualDiff = monthlyDiff * 12;
  const animatedAnnualDiff = useAnimatedNumber(Math.abs(annualDiff));
  const positive = monthlyDiff >= 0;

  const barData = [1, 5, 10].map((years) => ({
    years: `${years} año${years > 1 ? "s" : ""}`,
    actual: current * 12 * years,
    nuevo: alternative * 12 * years,
  }));

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <ToolHeader title="Comparador de escenarios" subtitle="Compara dos formas de ahorrar y ve la diferencia real." onBack={onBack} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", marginBottom: "0.8rem" }}>Situación actual</div>
          <SliderControl label="Ahorro mensual" value={current} min={0} max={2000} step={10} unit="€" onChange={setCurrent} />
        </Card>
        <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
          <div style={{ ...fontBody, color: T.lavender, fontSize: "0.82rem", marginBottom: "0.8rem" }}>Nuevo escenario</div>
          <SliderControl label="Ahorro mensual" value={alternative} min={0} max={2000} step={10} unit="€" onChange={setAlternative} accent="lavender" />
        </Card>
      </div>

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>
          {positive ? "Ahorrarías de más al año" : "Ahorrarías de menos al año"}
        </div>
        <div style={{ ...fontDisplay, color: positive ? T.lime : T.coral, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {positive ? "+" : "−"}{fmtEUR(animatedAnnualDiff)}
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>
          {positive ? "+" : "−"}{fmtEUR(Math.abs(monthlyDiff))} al mes de diferencia
        </div>
      </Card>

      <AdviceBlock
        text={
          !positive
            ? "El nuevo escenario ahorra menos que el actual. Puede tener sentido si libera gasto en otra parte, pero no lo pierdas de vista."
            : Math.abs(monthlyDiff) < 20
            ? "La diferencia mensual es pequeña, pero fíjate en el acumulado a 10 años del gráfico: ahí se nota de verdad."
            : monthlyDiff >= current * 0.3
            ? "El salto entre escenarios es grande. Antes de fijarlo, comprueba en 'Presupuesto mensual' si tus gastos dejan ese margen real."
            : "Buena diferencia acumulada. Prueba a subir un poco más el nuevo escenario y compara el efecto en 10 años."
        }
      />

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.8rem" }}>
          Acumulado a lo largo del tiempo
        </div>
        <div style={{ width: "100%", height: "200px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barGap={6} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <XAxis dataKey="years" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v, n) => [fmtEUR(v), n === "actual" ? "Actual" : "Nuevo"]}
              />
              <Bar dataKey="actual" fill={T.textMuted} radius={[6, 6, 0, 0]} maxBarSize={24} isAnimationActive={true} animationDuration={400} />
              <Bar dataKey="nuevo" fill={T.lavender} radius={[6, 6, 0, 0]} maxBarSize={24} isAnimationActive={true} animationDuration={400} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <RelatedTools ids={["savings", "interest"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Comparador: actual ${fmtEUR(current)}/mes vs. nuevo ${fmtEUR(alternative)}/mes → ${fmtEUR(Math.abs(monthlyDiff))}/mes de diferencia.`
          }
        />
        <ExportCSVButton
          filename="comparador-de-escenarios"
          getRows={() => barData.map((r) => ({ periodo: r.years, actual: r.actual.toFixed(2), nuevo: r.nuevo.toFixed(2) }))}
        />
      </div>
    </div>
  );
}

export default ScenarioComparatorTool;
          
