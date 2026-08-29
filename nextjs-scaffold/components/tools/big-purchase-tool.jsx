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

const PURCHASE_TYPES = [
  { id: "coche", label: "Coche", icon: Car, defaultBudget: 12000 },
  { id: "vivienda", label: "Vivienda (entrada)", icon: HomeIcon, defaultBudget: 30000 },
  { id: "otro", label: "Otra compra", icon: ShoppingBag, defaultBudget: 3000 },
];


function BigPurchaseTool({ onBack, onNavigate }) {
  const [type, setType] = usePersistentState("bigpurchase_type", "coche");
  const typeInfo = PURCHASE_TYPES.find((t) => t.id === type);
  const [budget, setBudget] = useSharedState("bigpurchase_budget", typeInfo.defaultBudget);
  const [current, setCurrent] = useSharedState("bigpurchase_current", 1000);
  const [monthsLeft, setMonthsLeft] = useSharedState("bigpurchase_monthsLeft", 18);

  // Al cambiar de categoría, proponemos el presupuesto típico de esa
  // categoría en vez de dejar el valor anterior (evita, p. ej., ver
  // "vivienda" con un presupuesto pensado para "coche").
  const changeType = (id) => {
    setType(id);
    const info = PURCHASE_TYPES.find((t) => t.id === id);
    setBudget(info.defaultBudget);
    setCurrent((c) => Math.min(c, info.defaultBudget));
  };

  useEffect(() => {
    if (current > budget) setCurrent(budget);
  }, [budget, current]);

  const remaining = Math.max(budget - current, 0);
  const requiredMonthly = monthsLeft > 0 ? remaining / monthsLeft : remaining;
  const animatedRequired = useAnimatedNumber(requiredMonthly);
  const pct = budget > 0 ? (current / budget) * 100 : 0;
  const animatedPct = useAnimatedNumber(Math.min(pct, 100));

  return (
    <div className="px-5 pt-6 pb-16 max-w-md mx-auto flex flex-col gap-4 view-enter">
      <ToolHeader title="Ahorro para una compra grande" subtitle="Elige qué quieres comprar y cuándo, y calculamos el resto." onBack={onBack} />

      <div className="flex gap-2">
        {PURCHASE_TYPES.map((t) => (
          <Chip key={t.id} label={t.label} active={type === t.id} onClick={() => changeType(t.id)} />
        ))}
      </div>

      <Card style={{ textAlign: "center" }}>
        <div style={{ height: "150px", position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Ahorrado", value: current },
                  { name: "Restante", value: remaining },
                ]}
                dataKey="value"
                innerRadius="65%"
                outerRadius="95%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                stroke="none"
              >
                <Cell fill={T.lime} />
                <Cell fill={T.surfaceAlt} />
              </Pie>
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v) => fmtEUR(v)}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.7rem", fontWeight: 700 }}>{pct.toFixed(0)}%</div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.7rem" }}>cubierto</div>
          </div>
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", marginTop: "0.3rem" }}>Necesitas ahorrar al mes</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2rem", fontWeight: 700, margin: "0.1rem 0" }}>
          {monthsLeft > 0 ? fmtEUR(animatedRequired) : "—"}
        </div>
      </Card>

      <AdviceBlock
        text={
          requiredMonthly > 800
            ? "La cuota mensual es alta. Alargar el plazo aunque sea un año puede bajarla de forma importante — pruébalo con el slider."
            : pct >= 50
            ? "Ya llevas más de la mitad. Mantén el ritmo actual o compara qué pasa si adelantas unos meses la fecha objetivo."
            : "Este tipo de compra suele beneficiarse de plazos largos: cuanto más tiempo des, menos esfuerzo mensual necesitas."
        }
      />

      <div className="flex flex-col gap-5">
        <SliderControl label="Presupuesto" value={budget} min={200} max={80000} step={100} unit="€" onChange={setBudget} />
        <SliderControl label="Ya ahorrado" value={current} min={0} max={budget} step={50} unit="€" onChange={setCurrent} />
        <SliderControl label="Meses para conseguirlo" value={monthsLeft} min={0} max={60} step={1} unit="meses" onChange={setMonthsLeft} accent="lavender" />
      </div>
      <RelatedTools ids={["savings", "loan"]} onNavigate={onNavigate} />
      <div className="flex justify-center">
        <CopySummaryButton
          getText={() =>
            `Ahorro para ${typeInfo.label}: presupuesto ${fmtEUR(budget)}, ya ahorrado ${fmtEUR(current)}, ${monthsLeft} meses → necesitas ${fmtEUR(requiredMonthly)}/mes.`
          }
        />
      </div>
    </div>
  );
}

export default BigPurchaseTool;
