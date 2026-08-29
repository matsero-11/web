"use client";
import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, ProgressBar } from "@/components/ui";

function GoalProjection({ goal, current, monthly, extra, extraLabel, monthsSavedLabel }) {
  const remaining = Math.max(goal - current, 0);
  const effectiveMonthly = monthly + extra;
  const months = effectiveMonthly > 0 ? Math.ceil(remaining / effectiveMonthly) : Infinity;
  const baseMonths = monthly > 0 ? Math.ceil(remaining / monthly) : Infinity;
  const monthsSaved = Number.isFinite(baseMonths) && Number.isFinite(months) ? baseMonths - months : 0;
  const pct = goal > 0 ? (current / goal) * 100 : 0;

  const animatedMonths = useAnimatedNumber(Number.isFinite(months) ? months : 0);
  const animatedPct = useAnimatedNumber(Math.min(pct, 100));

  const chartData = useMemo(() => {
    const points = [];
    const n = Number.isFinite(months) ? Math.min(months, 48) : 0;
    for (let i = 0; i <= n; i++) points.push({ mes: i, ahorro: Math.min(current + effectiveMonthly * i, goal) });
    return points;
  }, [current, effectiveMonthly, goal, months]);

  return (
    <>
      <Card glow result style={{ textAlign: "center" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>Lo conseguirás en</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.6rem", fontWeight: 700, margin: "0.2rem 0" }}>
          {Number.isFinite(months) ? Math.round(animatedMonths) : "—"}
          <span style={{ fontSize: "1.1rem", color: T.textMuted, fontWeight: 400 }}> meses</span>
        </div>
        <ProgressBar pct={animatedPct} gradientEnd={T.lavender} />
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", marginTop: "0.5rem" }}>
          {pct.toFixed(0)}% conseguido
        </div>
        {extra > 0 && monthsSaved > 0 && (
          <div style={{ ...fontBody, color: T.lavender, fontSize: "0.82rem", marginTop: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
            <TrendingUp size={14} /> {monthsSaved} {monthsSaved === 1 ? "mes" : "meses"} {monthsSavedLabel}
          </div>
        )}
      </Card>

      <Card style={{ height: "170px", padding: "0.8rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillGoal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.lime} stopOpacity={0.45} />
                <stop offset="100%" stopColor={T.lime} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, goal || 1]} />
            <Tooltip
              contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
              formatter={(v) => [fmtEUR(v), "Ahorrado"]}
              labelFormatter={(l) => `Mes ${l}`}
            />
            <Area type="monotone" dataKey="ahorro" stroke={T.lime} strokeWidth={2} fill="url(#fillGoal)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
}

export default GoalProjection;
