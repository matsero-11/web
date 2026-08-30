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

function TripSavingsTool({ onBack, onNavigate }) {
  const [budget, setBudget] = useSharedState("trip_budget", 1200);
  const [current, setCurrent] = useSharedState("trip_current", 200);
  const [monthsLeft, setMonthsLeft] = useSharedState("trip_monthsLeft", 6);

  useEffect(() => {
    if (current > budget) setCurrent(budget);
  }, [budget, current]);

  const remaining = Math.max(budget - current, 0);
  const requiredMonthly = monthsLeft > 0 ? remaining / monthsLeft : remaining;
  const animatedRequired = useAnimatedNumber(requiredMonthly);
  const pct = budget > 0 ? (current / budget) * 100 : 0;
  const animatedPct = useAnimatedNumber(Math.min(pct, 100));

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <ToolHeader title="Ahorro para un viaje" subtitle="Fija cuándo te vas y calculamos cuánto ahorrar cada mes." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Necesitas ahorrar al mes</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {monthsLeft > 0 ? fmtEUR(animatedRequired) : "—"}
        </div>
        <ProgressBar pct={animatedPct} gradientEnd={T.lavender} />
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginTop: "0.6rem" }}>
          {pct.toFixed(0)}% del presupuesto ya cubierto
        </div>
      </Card>

      {monthsLeft > 0 && (
        <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginBottom: "0.9rem" }}>
            Cada punto es un mes de ahorro hasta el viaje
          </div>
          <div style={{ position: "relative", paddingTop: "0.3rem" }}>
            <div style={{ position: "absolute", top: "9px", left: "6px", right: "6px", height: "2px", background: T.surfaceAlt }} />
            <div
              style={{
                position: "absolute", top: "9px", left: "6px", height: "2px", background: T.lime,
                width: `calc((100% - 12px) * ${monthsLeft > 0 ? 1 / monthsLeft : 0})`,
                transition: "width 0.4s ease",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              {Array.from({ length: monthsLeft + 1 }, (_, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                  <div
                    style={{
                      width: i === 0 ? "12px" : "8px",
                      height: i === 0 ? "12px" : "8px",
                      borderRadius: "50%",
                      background: i === 0 ? T.lime : T.surfaceAlt,
                      border: i === 0 ? "none" : `2px solid ${T.border}`,
                    }}
                  />
                  {(i === 0 || i === monthsLeft) && (
                    <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.7rem" }}>
                      {i === 0 ? "Hoy" : <Plane size={12} color={T.lavender} />}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
      {monthsLeft === 0 && (
        <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
          <div style={{ ...fontBody, color: T.coral, fontSize: "0.9rem", textAlign: "center" }}>
            Con 0 meses no hay margen para ahorrar: necesitarías tener ya {fmtEUR(remaining)} disponibles.
          </div>
        </Card>
      )}

      <AdviceBlock
        text={
          monthsLeft === 0
            ? "Sin margen de tiempo, la única opción es tenerlo ya ahorrado o retrasar la fecha del viaje."
            : requiredMonthly > budget * 0.4
            ? "La cuota mensual es alta para el tiempo que queda. Si puedes mover la fecha unas semanas, el esfuerzo mensual baja bastante."
            : "El ritmo necesario es razonable. Prueba a alargar unos meses el plazo y compara cuánto baja la cuota mensual."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Presupuesto del viaje" value={budget} min={100} max={10000} step={50} unit="€" onChange={setBudget} />
          <SliderControl label="Ya ahorrado" value={current} min={0} max={budget} step={25} unit="€" onChange={setCurrent} />
          <SliderControl label="Meses hasta el viaje" value={monthsLeft} min={0} max={24} step={1} unit="meses" onChange={setMonthsLeft} accent="lavender" />
        </div>
      </Card>

      <RelatedTools ids={["tripdaily", "currency"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Ahorro para un viaje: presupuesto ${fmtEUR(budget)}, ya ahorrado ${fmtEUR(current)}, ${monthsLeft} meses hasta el viaje → necesitas ${fmtEUR(requiredMonthly)}/mes.`
          }
        />
      </div>
    </div>
  );
}

export default TripSavingsTool;
            
