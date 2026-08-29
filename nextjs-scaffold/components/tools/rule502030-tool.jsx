"use client";
import React, { useState, useEffect, useRef } from "react";
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

function Rule502030Tool({ onBack, onNavigate }) {
  const [income, setIncome] = useSharedState("rule502030_income", 1800);
  const recNeeds = income * 0.5;
  const recWants = income * 0.3;
  const recSavings = income * 0.2;

  const [needs, setNeeds] = useState(recNeeds);
  const [wants, setWants] = useState(recWants);
  const [savings, setSavings] = useState(recSavings);
  const [donutView, setDonutView] = useState("actual");

  // Si cambia el ingreso, reescalamos proporcionalmente las 3 partidas
  // en vez de dejarlas fijas con un ingreso distinto (evita que el
  // total quede descuadrado tras mover el primer slider).
  const prevIncome = useRef(income);
  useEffect(() => {
    const ratio = prevIncome.current > 0 ? income / prevIncome.current : 1;
    setNeeds((n) => n * ratio);
    setWants((w) => w * ratio);
    setSavings((s) => s * ratio);
    prevIncome.current = income;
    // eslint-disable-next-line
  }, [income]);

  const total = needs + wants + savings;
  const diff = income - total;
  const animatedDiff = useAnimatedNumber(diff);

  const donutData =
    donutView === "actual"
      ? [
          { name: "Necesidades", value: Math.max(needs, 0), color: T.lime },
          { name: "Deseos", value: Math.max(wants, 0), color: T.lavender },
          { name: "Ahorro", value: Math.max(savings, 0), color: "#7FA8C9" },
        ]
      : [
          { name: "Necesidades", value: recNeeds, color: T.lime },
          { name: "Deseos", value: recWants, color: T.lavender },
          { name: "Ahorro", value: recSavings, color: "#7FA8C9" },
        ];

  const Row = ({ label, value, setValue, rec, accent }) => (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span style={{ ...fontBody, color: T.text, fontSize: "0.88rem", fontWeight: 500 }}>{label}</span>
        <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem" }}>recomendado: {fmtEUR(rec)}</span>
      </div>
      <SliderControl label="" value={Math.round(value)} min={0} max={income} step={10} unit="€" onChange={setValue} accent={accent} />
    </div>
  );

  return (
    <div className="px-5 pt-6 pb-16 max-w-md mx-auto flex flex-col gap-4 view-enter">
      <ToolHeader title="Regla 50/30/20" subtitle="Reparte tu ingreso entre necesidades, deseos y ahorro." onBack={onBack} />

      <SliderControl label="Ingreso mensual" value={income} min={0} max={6000} step={50} unit="€" onChange={setIncome} />

      <Card style={{ textAlign: "center" }}>
        <div style={{ height: "160px", position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={donutData} dataKey="value" innerRadius="60%" outerRadius="95%" paddingAngle={3} stroke="none" isAnimationActive>
                {donutData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v, n) => [fmtEUR(v), n]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...fontDisplay, color: diff >= 0 ? T.lime : T.coral, fontSize: "1.5rem", fontWeight: 700 }}>
              {fmtEUR(Math.abs(animatedDiff))}
            </div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.7rem" }}>{diff >= 0 ? "sin asignar" : "de más"}</div>
          </div>
        </div>
        <div className="flex gap-2 justify-center mt-2">
          <Chip label="Tu reparto" active={donutView === "actual"} onClick={() => setDonutView("actual")} />
          <Chip label="Recomendado" active={donutView === "recomendado"} onClick={() => setDonutView("recomendado")} />
        </div>
      </Card>

      <AdviceBlock
        text={
          diff < 0
            ? "Te pasas del ingreso disponible. Revisa primero 'Deseos': suele ser la partida más fácil de ajustar sin tocar lo esencial."
            : savings < recSavings * 0.5
            ? "Estás ahorrando bastante menos del 20% recomendado. No hace falta llegar de golpe: sube el slider poco a poco y compáralo con el donut."
            : "Tu reparto está cerca de la referencia 50/30/20. Prueba a mover los sliders y compara tu reparto con el recomendado."
        }
      />

      <Card style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
        <Row label="Necesidades (50%)" value={needs} setValue={setNeeds} rec={recNeeds} accent="lime" />
        <Row label="Deseos (30%)" value={wants} setValue={setWants} rec={recWants} accent="lavender" />
        <Row label="Ahorro (20%)" value={savings} setValue={setSavings} rec={recSavings} accent="lime" />
      </Card>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", textAlign: "center" }}>
        50/30/20 es una guía orientativa, no una recomendación financiera personalizada.
      </div>
      <RelatedTools ids={["budget", "percent"]} onNavigate={onNavigate} />
      <div className="flex justify-center gap-2.5">
        <CopySummaryButton
          getText={() =>
            `Regla 50/30/20 con ingreso ${fmtEUR(income)}: necesidades ${fmtEUR(needs)}, deseos ${fmtEUR(wants)}, ahorro ${fmtEUR(savings)}.`
          }
        />
        <ExportCSVButton
          filename="regla-50-30-20"
          getRows={() => [
            { categoria: "Necesidades", recomendado: recNeeds.toFixed(2), actual: needs.toFixed(2) },
            { categoria: "Deseos", recomendado: recWants.toFixed(2), actual: wants.toFixed(2) },
            { categoria: "Ahorro", recomendado: recSavings.toFixed(2), actual: savings.toFixed(2) },
          ]}
        />
      </div>
    </div>
  );
}

export default Rule502030Tool;
