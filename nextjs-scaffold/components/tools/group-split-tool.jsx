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

function GroupSplitTool({ onBack, onNavigate }) {
  const [total, setTotal] = useSharedState("groupsplit_total", 120);
  const [people, setPeople] = useSharedState("groupsplit_people", 4);
  const [paidByMe, setPaidByMe] = useSharedState("groupsplit_paidByMe", 120);

  useEffect(() => {
    if (paidByMe > total) setPaidByMe(total);
  }, [total, paidByMe]);

  const share = people > 0 ? total / people : 0;
  const owedToMe = paidByMe - share;
  const perOtherPerson = people > 1 && owedToMe > 0 ? owedToMe / (people - 1) : 0;

  const animatedShare = useAnimatedNumber(share);
  const animatedOwed = useAnimatedNumber(Math.abs(owedToMe));

  return (
    <div className="px-5 pt-6 pb-16 max-w-md mx-auto flex flex-col gap-4 view-enter">
      <ToolHeader title="Reparto de gastos en grupo" subtitle="Divide un gasto entre varias personas y ve quién debe qué." onBack={onBack} />

      <Card result style={{ textAlign: "center" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>Cada persona paga</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.3rem", fontWeight: 700, margin: "0.2rem 0" }}>
          {fmtEUR(animatedShare)}
        </div>
        {owedToMe > 0.5 && (
          <div style={{ ...fontBody, color: T.lavender, fontSize: "0.85rem" }}>
            Te deben {fmtEUR(animatedOwed)} en total{people > 2 ? ` (${fmtEUR(perOtherPerson)} cada uno)` : ""}
          </div>
        )}
        {owedToMe < -0.5 && (
          <div style={{ ...fontBody, color: T.coral, fontSize: "0.85rem" }}>
            Tú debes {fmtEUR(animatedOwed)} al grupo
          </div>
        )}
      </Card>

      {people > 1 ? (
        <Card style={{ height: "150px", padding: "0.9rem 0.6rem" }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.4rem" }}>
            Tú frente al resto del grupo
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart
              layout="vertical"
              data={[
                { persona: "Tú", balance: owedToMe },
                { persona: people > 2 ? "Cada otra persona" : "La otra persona", balance: -share },
              ]}
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
            >
              <XAxis type="number" hide domain={["auto", "auto"]} />
              <YAxis type="category" dataKey="persona" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={95} />
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v) => [fmtEUR(v), v >= 0 ? "Le deben" : "Debe"]}
              />
              <Bar dataKey="balance" radius={[0, 6, 6, 0]} maxBarSize={24} animationDuration={400}>
                <Cell fill={owedToMe >= 0 ? T.lime : T.coral} />
                <Cell fill={T.coral} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      ) : (
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", textAlign: "center" }}>
          Con 1 sola persona, todo el gasto es tuyo — sube el número de personas para repartirlo.
        </div>
      )}

      <AdviceBlock
        text={
          owedToMe > 0.5
            ? "Para evitar líos, pide el importe exacto por persona en vez de una cifra redonda: así nadie paga de más ni de menos."
            : owedToMe < -0.5
            ? "Tú eres quien debe dinero al grupo esta vez. Sáldalo cuanto antes para que el reparto no se acumule en la siguiente ronda."
            : "El reparto está equilibrado: nadie debe nada a nadie con estos números."
        }
      />

      <div className="flex flex-col gap-5">
        <SliderControl label="Gasto total" value={total} min={0} max={2000} step={5} unit="€" onChange={setTotal} />
        <SliderControl label="Número de personas" value={people} min={1} max={20} step={1} unit="personas" onChange={setPeople} accent="lavender" />
        <SliderControl label="Lo que pagaste tú" value={paidByMe} min={0} max={total} step={5} unit="€" onChange={setPaidByMe} />
      </div>
      <RelatedTools ids={["tip"]} onNavigate={onNavigate} />
      <div className="flex justify-center">
        <CopySummaryButton
          getText={() =>
            `Reparto de gastos: ${fmtEUR(total)} entre ${people} personas = ${fmtEUR(share)} cada una. Pagaste ${fmtEUR(paidByMe)}.`
          }
        />
      </div>
    </div>
  );
}

export default GroupSplitTool;
            
