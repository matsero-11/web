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

  // Al cambiar 'weeks' o 'baseAmount', las semanas marcadas más allá
  // del nuevo total dejan de contar (evita progreso fantasma).
  useEffect(() => {
    setDone((prev) => new Set([...prev].filter((w) => w <= weeks)));
  }, [weeks]);

  const weekAmount = (w) => baseAmount * w; // reto progresivo: semana 1 = base, semana 2 = base*2...
  const totalGoal = useMemo(() => {
    let sum = 0;
    for (let w = 1; w <= weeks; w++) sum += weekAmount(w);
    return sum;
    // eslint-disable-next-line
  }, [weeks, baseAmount]);

  const savedSoFar = useMemo(() => {
    let sum = 0;
    done.forEach((w) => (sum += weekAmount(w)));
    return sum;
    // eslint-disable-next-line
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

  return (
    <div className="px-5 pt-6 pb-16 max-w-md mx-auto flex flex-col gap-4 view-enter">
      <ToolHeader title="Reto de ahorro" subtitle="Cada semana ahorras un poco más. Marca las semanas completadas." onBack={onBack} />

      <Card glow result style={{ textAlign: "center" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>Llevas ahorrado</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.3rem", fontWeight: 700, margin: "0.2rem 0" }}>
          {fmtEUR(animatedSaved)}
        </div>
        <ProgressBar pct={animatedPct} gradientEnd={T.lavender} />
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", marginTop: "0.5rem" }}>
          Objetivo del reto: {fmtEUR(totalGoal)} en {weeks} semanas
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

      <div className="flex gap-2">
        <Chip label="26 semanas" active={weeks === 26} onClick={() => setWeeks(26)} />
        <Chip label="52 semanas" active={weeks === 52} onClick={() => setWeeks(52)} />
      </div>
      <SliderControl label="Incremento semanal base" value={baseAmount} min={1} max={20} step={1} unit="€" onChange={setBaseAmount} accent="lavender" />

      <Card>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.92rem", marginBottom: "0.9rem" }}>
          Tus semanas
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.4rem" }}>
          {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => {
            const active = done.has(w);
            return (
              <button
                key={w}
                onClick={() => toggleWeek(w)}
                title={`Semana ${w}: ${fmtEUR(weekAmount(w))}`}
                style={{
                  aspectRatio: "1",
                  borderRadius: "0.5rem",
                  border: `1px solid ${active ? T.lime : T.border}`,
                  background: active ? T.limeSoft : T.surfaceAlt,
                  color: active ? T.lime : T.textMuted,
                  ...fontBody,
                  fontSize: "0.68rem",
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
      <div className="flex justify-center gap-2.5">
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
