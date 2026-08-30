"use client";
import React, { useState, useEffect, useMemo } from "react";
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

function CompoundInterestTool({ onBack, onNavigate }) {
  const [initial, setInitial] = useSharedState("interest_initial", 1000);
  const [monthly, setMonthly] = useSharedState("interest_monthly", 100);
  const [rate, setRate] = useSharedState("interest_rate", 5);
  const [years, setYears] = useSharedState("interest_years", 10);

  // Cálculo mes a mes para que la aportación mensual y el interés
  // compuesto se reflejen con precisión (evita fórmulas cerradas
  // que asumen aportaciones a final de año únicamente).
  const monthlyRate = rate / 100 / 12;
  const totalMonths = years * 12;

  const { finalAmount, totalContributed, chartData } = useMemo(() => {
    let balance = initial;
    let contributed = initial;
    const points = [{ mes: 0, saldo: initial, aportado: initial }];
    const step = totalMonths > 96 ? Math.ceil(totalMonths / 96) : 1;
    for (let m = 1; m <= totalMonths; m++) {
      balance = balance * (1 + monthlyRate) + monthly;
      contributed += monthly;
      if (m % step === 0 || m === totalMonths) {
        points.push({ mes: m, saldo: balance, aportado: contributed });
      }
    }
    return { finalAmount: balance, totalContributed: contributed, chartData: points };
  }, [initial, monthly, monthlyRate, totalMonths]);

  const interestEarned = finalAmount - totalContributed;
  const animatedFinal = useAnimatedNumber(finalAmount);
  const animatedInterest = useAnimatedNumber(Math.max(interestEarned, 0));

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <ToolHeader title="Interés compuesto" subtitle="Descubre cuánto puede crecer tu dinero con el tiempo." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Al cabo de {years} años tendrías</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {fmtEUR(animatedFinal)}
        </div>
        <div style={{ ...fontBody, color: T.lavender, fontSize: "0.88rem" }}>
          {fmtEUR(animatedInterest)} son intereses generados
        </div>
      </Card>

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div style={{ width: "100%", height: "190px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.lime} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={T.lime} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v, name) => [fmtEUR(v), name === "saldo" ? "Saldo total" : "Aportado"]}
                labelFormatter={(l) => `Mes ${l}`}
              />
              <Area type="monotone" dataKey="saldo" stroke={T.lime} strokeWidth={2} fill="url(#fillSaldo)" />
              <Line type="monotone" dataKey="aportado" stroke={T.lavender} strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center", marginTop: "-0.5rem" }}>
        Lima: saldo total · Lavanda: solo lo aportado
      </div>

      <AdviceBlock
        text={
          interestEarned > totalContributed * 0.5
            ? "Los intereses ya pesan más de la mitad de lo aportado: cuanto más tiempo dejes crecer el capital, más se acelera esa diferencia."
            : years < 5
            ? "A pocos años, el interés compuesto pesa poco todavía. Prueba a alargar el plazo y verás cómo se separan las dos líneas."
            : "Sube un poco la aportación mensual y compara cuánto cambia el resultado final frente a alargar el plazo."
        }
      />

      <div className="flex flex-col gap-6">
        <SliderControl label="Capital inicial" value={initial} min={0} max={50000} step={100} unit="€" onChange={setInitial} />
        <SliderControl label="Aportación mensual" value={monthly} min={0} max={2000} step={10} unit="€" onChange={setMonthly} accent="lavender" />
        <SliderControl label="Interés anual estimado" value={rate} min={0} max={12} step={0.1} unit="%" onChange={setRate} />
        <SliderControl label="Años" value={years} min={1} max={40} step={1} unit="años" onChange={setYears} />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
        Resultado orientativo. No constituye asesoramiento financiero ni garantiza rentabilidad futura.
      </div>

      <RelatedTools ids={["savings", "loan"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Interés compuesto: capital inicial ${fmtEUR(initial)}, aportación ${fmtEUR(monthly)}/mes al ${rate}% anual durante ${years} años → ${fmtEUR(finalAmount)} (${fmtEUR(interestEarned)} en intereses).`
          }
        />
        <ExportCSVButton
          filename="proyeccion-interes-compuesto"
          getRows={() =>
            chartData.map((row) => ({ mes: row.mes, saldo: row.saldo.toFixed(2), aportado: row.aportado.toFixed(2) }))
          }
        />
      </div>
    </div>
  );
}

export default CompoundInterestTool;
                  
