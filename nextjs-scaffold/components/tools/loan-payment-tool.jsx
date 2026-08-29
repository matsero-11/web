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
import RelatedTools from "@/components/RelatedTools";
import { ExportCSVButton } from "@/components/ExportActions";

function LoanPaymentTool({ onBack, onNavigate }) {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(6);
  const [months, setMonths] = useState(48);
  const [chartMode, setChartMode] = useState("saldo");

  const monthlyRate = rate / 100 / 12;
  const payment = useMemo(() => {
    if (months <= 0) return 0;
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }, [principal, monthlyRate, months]);

  const totalPaid = payment * months;
  const totalInterest = Math.max(totalPaid - principal, 0);
  const animatedPayment = useAnimatedNumber(payment);
  const animatedInterest = useAnimatedNumber(totalInterest);

  const chartData = useMemo(() => {
    let balance = principal;
    let interestPaid = 0;
    const points = [{ mes: 0, saldo: principal, intereses: 0 }];
    const step = months > 96 ? Math.ceil(months / 96) : 1;
    for (let m = 1; m <= months; m++) {
      const interest = balance * monthlyRate;
      interestPaid += interest;
      balance = Math.max(balance + interest - payment, 0);
      if (m % step === 0 || m === months) points.push({ mes: m, saldo: balance, intereses: interestPaid });
    }
    return points;
  }, [principal, monthlyRate, payment, months]);

  return (
    <div className="px-5 pt-6 pb-16 max-w-md mx-auto flex flex-col gap-4 view-enter">
      <ToolHeader title="Cuota de un préstamo" subtitle="Calcula la cuota mensual y cuánto pagarás en intereses." onBack={onBack} />

      <Card result style={{ textAlign: "center" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>Cuota mensual</div>
        <div style={{ ...fontDisplay, color: T.text, fontSize: "2.3rem", fontWeight: 700, margin: "0.2rem 0" }}>
          {fmtEUR(animatedPayment)}
        </div>
        <div style={{ ...fontBody, color: T.coral, fontSize: "0.85rem" }}>{fmtEUR(animatedInterest)} en intereses totales</div>
      </Card>

      <div className="flex gap-2 justify-center">
        <Chip label="Saldo pendiente" active={chartMode === "saldo"} onClick={() => setChartMode("saldo")} />
        <Chip label="Intereses acumulados" active={chartMode === "intereses"} onClick={() => setChartMode("intereses")} />
      </div>

      <Card style={{ height: "170px", padding: "0.8rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="mes" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
              formatter={(v) => [fmtEUR(v), chartMode === "saldo" ? "Pendiente" : "Intereses pagados"]}
              labelFormatter={(l) => `Mes ${l}`}
            />
            <Line
              type="monotone"
              dataKey={chartMode}
              stroke={chartMode === "saldo" ? T.coral : T.lavender}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <AdviceBlock
        text={
          totalInterest > principal * 0.5
            ? "Los intereses superan la mitad del importe prestado. Alargar el plazo baja la cuota, pero sube todavía más los intereses totales — mira el gráfico en modo 'Intereses' para verlo."
            : months > 84
            ? "Un plazo largo baja la cuota mensual, pero alarga el tiempo pagando intereses. Compara con un plazo más corto si tu presupuesto lo permite."
            : "Cuota e intereses razonables para este importe y plazo. Prueba a subir el plazo un poco y observa cuánto baja la cuota."
        }
      />

      <div className="flex flex-col gap-5">
        <SliderControl label="Importe del préstamo" value={principal} min={500} max={100000} step={100} unit="€" onChange={setPrincipal} />
        <SliderControl label="TAE estimada" value={rate} min={0} max={20} step={0.1} unit="%" onChange={setRate} accent="lavender" />
        <SliderControl label="Plazo" value={months} min={1} max={360} step={1} unit="meses" onChange={setMonths} />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", textAlign: "center" }}>
        Cálculo orientativo con cuota fija. No incluye comisiones y no constituye una oferta ni asesoramiento financiero.
      </div>
      <RelatedTools ids={["targetincome", "budget"]} onNavigate={onNavigate} />
      <div className="flex justify-center">
        <ExportCSVButton
          filename="tabla-amortizacion-prestamo"
          getRows={() =>
            chartData.map((row) => ({
              mes: row.mes,
              saldo_pendiente: row.saldo.toFixed(2),
              intereses_acumulados: row.intereses.toFixed(2),
            }))
          }
        />
      </div>
    </div>
  );
}

export default LoanPaymentTool;
