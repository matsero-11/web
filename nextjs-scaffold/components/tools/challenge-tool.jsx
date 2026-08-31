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

function ChallengeTool({ onBack, onNavigate }) {
  const [weeks, setWeeks] = useSharedState("challenge_weeks", 26);
  const [baseAmount, setBaseAmount] = useSharedState("challenge_baseAmount", 5);
  const [done, setDone] = useState(() => new Set());

  useEffect(() => {
    setDone((prev) => new Set([...prev].filter((w) => w <= weeks)));
  }, [weeks]);

  const weekAmount = (w) => baseAmount * w;
  const totalGoal = useMemo(() => {
    let sum = 0;
    for (let w = 1; w <= weeks; w++) sum += weekAmount(w);
    return sum;
  }, [weeks, baseAmount]);

  const savedSoFar = useMemo(() => {
    let sum = 0;
    done.forEach((w) => (sum += weekAmount(w)));
    return sum;
  }, [done, baseAmount]);

  const pct = totalGoal > 0 ? (savedSoFar / totalGoal) * 100 : 0;
  const animatedSaved = useAnimatedNumber(savedSoFar);
  const animatedPct = useAnimatedNumber(Math.min(pct, 100));

  const toggleWeek = (w) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(w)) next.delete(w);
      else next.add(w);
      return next;
    });
  };

  const chartData = useMemo(() => {
    return Array.from({ length: weeks }, (_, i) => {
      const w = i + 1;
      return {
        semana: `S${w}`,
        importe: weekAmount(w),
      };
    });
  }, [weeks, baseAmount]);

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <ToolHeader title="Reto de ahorro" subtitle="Cada semana ahorras un poco más. Marca las semanas completadas." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Llevas ahorrado</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {fmtEUR(animatedSaved)}
        </div>
        <ProgressBar pct={animatedPct} gradientEnd={T.lavender} />
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", marginTop: "0.6rem" }}>
          Objetivo del reto: {fmtEUR(totalGoal)} en {weeks} semanas
        </div>
      </Card>

      {/* GRÁFICA DE ÁREA DINÁMICA DE PROGRESIÓN SEMANAL */}
      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.8rem" }}>
          Evolución del ahorro semanal
        </div>
        <div style={{ width: "100%", height: "180px", marginTop: "0.4rem" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorImporte" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.lime} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={T.lime} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="semana" stroke={T.textMuted} fontSize={11} tickLine={false} axisLine={false} interval={weeks > 26 ? 6 : 3} />
              <Tooltip 
                formatter={(value) => [`${value} €`, "Ahorro semanal"]}
                contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "8px", fontSize: "12px", color: T.text }}
              />
              <Area type="monotone" dataKey="importe" stroke={T.lime} strokeWidth={2} fillOpacity={1} fill="url(#colorImporte)" animationDuration={400} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <AdviceBlock
        text={
          done.size === 0
            ? "Empieza marcando la semana 1: al ser progresivo, las primeras semanas son las más fáciles para coger ritmo."
            : pct >= 90
            ? "Estás a punto de completar el reto. Las últimas semanas son las más caras: puedes repartirlas en pagos parciales si te aprieta."
            : "Vas avanzando bien. Si te saltas una semana, no pasa nada: puedes recuperarla más adelante sin perder el objetivo total."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <div className="flex gap-2.5">
            <Chip label="26 semanas" active={weeks === 26} onClick={() => setWeeks(26)} />
            <Chip label="52 semanas" active={weeks === 52} onClick={() => setWeeks(52)} />
          </div>
          <SliderControl label="Incremento semanal base" value={baseAmount} min={1} max={20} step={1} unit="€" onChange={setBaseAmount} accent="lavender" />
        </div>
      </Card>

      <Card>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          Tus semanas
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
          {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => {
            const active = done.has(w);
            return (
              <button
                key={w}
                onClick={() => toggleWeek(w)}
                title={`Semana ${w}: ${fmtEUR(weekAmount(w))}`}
                style={{
                  aspectRatio: "1",
                  borderRadius: "0.6rem",
                  border: `1px solid ${active ? T.lime : T.border}`,
                  background: active ? T.limeSoft : T.surfaceAlt,
                  color: active ? T.lime : T.textMuted,
                  ...fontBody,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {w}
              </button>
            );
          })}
        </div>
      </Card>

      <RelatedTools ids={["savings", "roundup"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Reto de ahorro: ${weeks} semanas, incremento base ${fmtEUR(baseAmount)} — objetivo total ${fmtEUR(totalGoal)}, llevas ahorrado ${fmtEUR(savedSoFar)}.`
          }
        />
        <ExportCSVButton
          filename="reto-de-ahorro"
          getRows={() =>
            Array.from({ length: weeks }, (_, i) => i + 1).map((w) => ({
              semana: w,
              importe: weekAmount(w).toFixed(2),
              completada: done.has(w) ? "sí" : "no",
            }))
          }
        />
      </div>
    </div>
  );
}

export default ChallengeTool;
