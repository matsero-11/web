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

function TipCalculatorTool({ onBack, onNavigate }) {
  const [bill, setBill] = useSharedState("tip_bill", 45);
  const [tipPct, setTipPct] = useSharedState("tip_tipPct", 10);
  const [people, setPeople] = useSharedState("tip_people", 2);

  const tipAmount = bill * (tipPct / 100);
  const total = bill + tipAmount;
  const perPerson = people > 0 ? total / people : total;
  const animatedTotal = useAnimatedNumber(total);
  const animatedPerPerson = useAnimatedNumber(perPerson);

  return (
    <div className="px-5 pt-6 pb-16 max-w-md mx-auto flex flex-col gap-4 view-enter">
      <ToolHeader title="Calculadora de propina" subtitle="Añade la propina y reparte la cuenta sin hacer cuentas a mano." onBack={onBack} />

      <div className="grid grid-cols-2 gap-3">
        <Card result style={{ textAlign: "center" }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>Total con propina</div>
          <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.5rem", fontWeight: 700, marginTop: "0.2rem" }}>{fmtEUR(animatedTotal)}</div>
        </Card>
        <Card style={{ textAlign: "center" }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>Por persona</div>
          <div style={{ ...fontDisplay, color: T.lavender, fontSize: "1.5rem", fontWeight: 700, marginTop: "0.2rem" }}>{fmtEUR(animatedPerPerson)}</div>
        </Card>
      </div>

      <Card>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", marginBottom: "0.6rem" }}>Composición del total</div>
        <div style={{ display: "flex", height: "22px", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{ width: `${total > 0 ? (bill / total) * 100 : 50}%`, background: T.surfaceAlt, transition: "width 0.4s ease" }} />
          <div style={{ width: `${total > 0 ? (tipAmount / total) * 100 : 50}%`, background: T.lime, transition: "width 0.4s ease" }} />
        </div>
        <div className="flex justify-between mt-2">
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem" }}>Cuenta: {fmtEUR(bill)}</span>
          <span style={{ ...fontBody, color: T.lime, fontSize: "0.75rem" }}>Propina: {fmtEUR(tipAmount)}</span>
        </div>
      </Card>

      <AdviceBlock
        text={
          people > 1
            ? "El reparto es a partes iguales. Si alguien pidió mucho más caro, puede ser más justo dividir por lo consumido en vez de a partes iguales."
            : "Sube o baja el porcentaje según el servicio — no hay un porcentaje único correcto en todos los sitios."
        }
      />

      <div className="flex gap-2">
        {[5, 10, 15, 20].map((p) => (
          <Chip key={p} label={`${p}%`} active={tipPct === p} onClick={() => setTipPct(p)} />
        ))}
      </div>

      <div className="flex flex-col gap-5">
        <SliderControl label="Importe de la cuenta" value={bill} min={0} max={500} step={1} unit="€" onChange={setBill} />
        <SliderControl label="Propina" value={tipPct} min={0} max={30} step={1} unit="%" onChange={setTipPct} accent="lavender" />
        <SliderControl label="Personas" value={people} min={1} max={15} step={1} unit="personas" onChange={setPeople} />
      </div>
      <RelatedTools ids={["groupsplit"]} onNavigate={onNavigate} />
      <div className="flex justify-center">
        <CopySummaryButton
          getText={() =>
            `Cuenta ${fmtEUR(bill)} + propina ${tipPct}% = ${fmtEUR(total)} total, ${fmtEUR(perPerson)}/persona entre ${people}.`
          }
        />
      </div>
    </div>
  );
}

export default TipCalculatorTool;
