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

function CurrencyConverterTool({ onBack, onNavigate }) {
  const [amount, setAmount] = useSharedState("currency_amount", 100);
  const [rate, setRate] = useSharedState("currency_rate", 1.08);
  const [fromLabel, setFromLabel] = usePersistentState("currency_fromLabel", "EUR");
  const [toLabel, setToLabel] = usePersistentState("currency_toLabel", "USD");

  const converted = amount * rate;
  const animatedConverted = useAnimatedNumber(converted);

  return (
    <div className="px-5 pt-6 pb-16 max-w-md mx-auto flex flex-col gap-4 view-enter">
      <ToolHeader title="Conversor de moneda para viajes" subtitle="Introduce el tipo de cambio del día y convierte al instante." onBack={onBack} />

      <Card glow result style={{ textAlign: "center" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>{amount} {fromLabel} equivalen a</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.2rem", fontWeight: 700, margin: "0.2rem 0" }}>
          {new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(animatedConverted)} {toLabel}
        </div>
      </Card>

      <AdviceBlock
        text={
          amount > 1000
            ? "Para importes grandes, compara el tipo de cambio de tu banco o tarjeta con el tipo de mercado: la diferencia se nota más cuanto mayor es la cantidad."
            : "Actualiza el tipo de cambio justo antes de viajar — puede variar de un día para otro."
        }
      />

      <div className="flex gap-2.5">
        <input
          value={fromLabel}
          onChange={(e) => setFromLabel(e.target.value.toUpperCase().slice(0, 4))}
          placeholder="EUR"
          aria-label="Moneda de origen"
          style={{ ...fontBody, flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: "0.7rem", padding: "0.6rem", color: T.text, textAlign: "center", outline: "none", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.lime; e.currentTarget.style.boxShadow = `0 0 0 3px ${T.limeSoft}`; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
        />
        <input
          value={toLabel}
          onChange={(e) => setToLabel(e.target.value.toUpperCase().slice(0, 4))}
          placeholder="USD"
          aria-label="Moneda de destino"
          style={{ ...fontBody, flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: "0.7rem", padding: "0.6rem", color: T.text, textAlign: "center", outline: "none", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.lime; e.currentTarget.style.boxShadow = `0 0 0 3px ${T.limeSoft}`; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
        />
      </div>

      <div className="flex flex-col gap-5">
        <SliderControl label={`Importe en ${fromLabel || "origen"}`} value={amount} min={0} max={5000} step={5} unit="" onChange={setAmount} />
        <SliderControl label="Tipo de cambio" value={rate} min={0.01} max={5} step={0.01} unit="" onChange={setRate} accent="lavender" />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", textAlign: "center" }}>
        El tipo de cambio no se actualiza automáticamente: introduce el del día antes de viajar.
      </div>
      <RelatedTools ids={["trip", "tripdaily"]} onNavigate={onNavigate} />
      <div className="flex justify-center">
        <CopySummaryButton
          getText={() => `${amount} ${fromLabel} = ${converted.toFixed(2)} ${toLabel} (tipo de cambio: ${rate}).`}
        />
      </div>
    </div>
  );
}

export default CurrencyConverterTool;
