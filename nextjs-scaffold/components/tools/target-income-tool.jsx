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

function TargetIncomeTool({ onBack, onNavigate }) {
  const [expenses, setExpenses] = useSharedState("targetincome_expenses", 1200);
  const [desiredSavings, setDesiredSavings] = useSharedState("targetincome_desiredSavings", 300);

  const requiredIncome = expenses + desiredSavings;
  const animatedIncome = useAnimatedNumber(requiredIncome);

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <ToolHeader title="Cuánto necesito ganar" subtitle="A partir de tus gastos y lo que quieres ahorrar, el ingreso mínimo que necesitas." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Necesitas ingresar al mes</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {fmtEUR(animatedIncome)}
        </div>
      </Card>

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.8rem" }}>
          De qué se compone
        </div>
        <div style={{ width: "100%", height: "110px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ nombre: "Ingreso", gastos: expenses, ahorro: desiredSavings }]} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <XAxis type="number" hide domain={[0, "auto"]} />
              <YAxis type="category" dataKey="nombre" hide />
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v, n) => [fmtEUR(v), n === "gastos" ? "Gastos" : "Ahorro"]}
              />
              <Bar dataKey="gastos" stackId="a" fill={T.textMuted} radius={[6, 0, 0, 6]} barSize={34} isAnimationActive={true} animationDuration={400} />
              <Bar dataKey="ahorro" stackId="a" fill={T.lime} radius={[0, 6, 6, 0]} barSize={34} isAnimationActive={true} animationDuration={400} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>Gastos: {fmtEUR(expenses)}</span>
          <span style={{ ...fontBody, color: T.lime, fontSize: "0.78rem" }}>Ahorro: {fmtEUR(desiredSavings)}</span>
        </div>
      </Card>

      <AdviceBlock
        text={
          requiredIncome > 0 && desiredSavings / requiredIncome > 0.25
            ? "Estás pidiendo un ahorro ambicioso sobre el total. Si el ingreso real es más bajo, prueba primero con un objetivo de ahorro menor y súbelo con el tiempo."
            : "Este ingreso te cubre gastos y ahorro. Compáralo con lo que ganas hoy en 'Porcentaje de ahorro' para ver la diferencia real."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Gastos fijos mensuales" value={expenses} min={0} max={5000} step={25} unit="€" onChange={setExpenses} />
          <SliderControl label="Cuánto quieres ahorrar" value={desiredSavings} min={0} max={3000} step={10} unit="€" onChange={setDesiredSavings} accent="lavender" />
        </div>
      </Card>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
        No incluye impuestos ni retenciones: es el ingreso neto mínimo necesario según lo que indiques.
      </div>

      <RelatedTools ids={["percent", "budget"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Gastos ${fmtEUR(expenses)} + ahorro deseado ${fmtEUR(desiredSavings)} = necesitas ganar ${fmtEUR(requiredIncome)}/mes.`
          }
        />
      </div>
    </div>
  );
}

export default TargetIncomeTool;
                          
