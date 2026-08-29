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

function SavingsPercentTool({ onBack, onNavigate }) {
  const [income, setIncome] = useSharedState("percent_income", 1800);
  const [savings, setSavings] = useSharedState("percent_savings", 250);
  const [period, setPeriod] = usePersistentState("percent_period", "mes");

  useEffect(() => {
    if (savings > income) setSavings(income);
  }, [income, savings]);

  const pct = income > 0 ? (savings / income) * 100 : 0;
  const animatedPct = useAnimatedNumber(pct);

  let band = { text: "Por debajo del 10%", color: T.coral };
  if (pct >= 20) band = { text: "Por encima del 20%", color: T.lime };
  else if (pct >= 10) band = { text: "Entre el 10% y el 20%", color: T.lavender };

  const gaugeData = [{ name: "ahorro", value: Math.min(pct, 100), fill: band.color }];
  const displayAmount = period === "mes" ? savings : savings * 12;

  return (
    <div className="px-5 pt-6 pb-16 max-w-md mx-auto flex flex-col gap-4 view-enter">
      <ToolHeader title="Porcentaje de ahorro" subtitle="Qué parte de tu ingreso estás ahorrando." onBack={onBack} />

      <Card style={{ textAlign: "center", paddingBottom: "0.4rem" }}>
        <div style={{ height: "140px", position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="72%"
              outerRadius="100%"
              data={gaugeData}
              startAngle={180}
              endAngle={0}
              barSize={16}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: T.surfaceAlt }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: "0.6rem" }}>
            <div style={{ ...fontDisplay, color: band.color, fontSize: "2.3rem", fontWeight: 700 }}>{animatedPct.toFixed(1)}%</div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem" }}>de tu ingreso</div>
          </div>
        </div>
        <div style={{ ...fontBody, color: band.color, fontSize: "0.85rem", marginTop: "0.3rem", fontWeight: 500 }}>
          {band.text}
        </div>
      </Card>

      <div className="flex gap-2 items-center justify-center">
        <Chip label="Al mes" active={period === "mes"} onClick={() => setPeriod("mes")} />
        <Chip label="Al año" active={period === "año"} onClick={() => setPeriod("año")} />
      </div>
      <div style={{ ...fontBody, color: T.text, textAlign: "center", fontSize: "0.95rem" }}>
        Eso son <span style={{ color: T.lime, fontWeight: 600 }}>{fmtEUR(displayAmount)}</span> {period === "mes" ? "cada mes" : "cada año"}
      </div>

      <AdviceBlock
        text={
          pct < 10
            ? "Un margen reducido no siempre es un problema: antes de subirlo, revisa en 'Presupuesto mensual' si hay gastos variables con recorte."
            : pct < 20
            ? "Estás en un rango saludable. Mueve el ahorro mensual unos euros y mira cuánto sube el porcentaje."
            : "Tienes un margen amplio. Podrías comprobar en 'Objetivo de ahorro' cuánto antes alcanzarías una meta concreta con este ritmo."
        }
      />

      <div className="flex flex-col gap-5">
        <SliderControl label="Ingreso mensual" value={income} min={0} max={6000} step={50} unit="€" onChange={setIncome} />
        <SliderControl label="Ahorro mensual" value={savings} min={0} max={income} step={10} unit="€" onChange={setSavings} accent="lavender" />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", textAlign: "center" }}>
        Referencia orientativa, no un dato verificado ni una recomendación personalizada.
      </div>
      <RelatedTools ids={["savings", "rule502030"]} onNavigate={onNavigate} />
      <div className="flex justify-center">
        <CopySummaryButton
          getText={() => `Porcentaje de ahorro: ${fmtEUR(savings)} de ${fmtEUR(income)} = ${pct.toFixed(1)}%.`}
        />
      </div>
    </div>
  );
}

export default SavingsPercentTool;
