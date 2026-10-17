"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";

import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { fmtEUR, useAnimatedNumber } from "@/lib/hooks";
import { Card, AdviceBlock, ProgressBar } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";
import { MAX_FINANCIAL_LIMIT } from "@/lib/financial-constants";
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Planificador de ahorro anual",
            url: pageUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            inLanguage: "es",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
            },
            description: pageDescription,
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          })}
        </script>
      </Helmet>

      <ToolHeader
        title="Planificador de ahorro anual"
        subtitle="Marca los meses más difíciles: el resto se ajusta solo para llegar al objetivo."
        onBack={onBack}
      />

      <Card style={{ padding: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <div>
            <div style={{ ...fontDisplay, color: T.text, fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.35rem" }}>
              Diseña tu objetivo
            </div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.5 }}>
              Ajusta la meta y la reducción que quieres aplicar a los meses con más gastos.
            </div>
          </div>

          <DecimalSliderRow
            label="Objetivo anual"
            value={goal}
            setValue={setGoal}
            min={MIN_GOAL}
            max={FINANCIAL_MAX}
            step={50}
            unit="€"
            subtitle="Cantidad total que quieres ahorrar durante los 12 meses."
            id="annual-savings-goal"
          />

          <DecimalSliderRow
            label="Reducción en meses flojos"
            value={reductionPct}
            setValue={setReductionPct}
            min={MIN_REDUCTION}
            max={MAX_REDUCTION}
            step={1}
            unit="%"
            accent="lavender"
            subtitle="Porcentaje menos que un mes flojo respecto al reparto mensual inicial."
            id="annual-savings-reduction"
          />
        </div>
      </Card>

      <Card glow result style={{ padding: "1.2rem" }}>
        <div className="text-center">
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>
            Objetivo anual planificado
          </div>

          <div style={{ ...fontDisplay, color: T.lime, fontSize: "clamp(2rem, 8vw, 2.7rem)", fontWeight: 800, lineHeight: 1.15, margin: "0.35rem 0" }}>
            {fmtEUR(fromCents(totalCents))}
          </div>

          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>
            {lowCount === 0
              ? "Repartido entre los 12 meses"
              : `${lowCount} ${lowCount === 1 ? "mes flojo" : "meses flojos"} · ${normalCount} ${normalCount === 1 ? "mes normal" : "meses normales"}`}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <Stat
            label="Mes normal"
            value={fmtEUR(fromCents(normalCents))}
            detail="Ahorro aproximado por mes"
            accent={T.lime}
          />

          <Stat
            label="Mes flojo"
            value={fmtEUR(fromCents(lowTargetCents))}
            detail={`${reductionPct}% menos que la referencia inicial`}
            accent={T.lavender}
          />
        </div>

        {/* Gráfica SVG: no depende de Recharts ni de un contenedor responsive externo. */}
        <div
          className="mt-4"
          role="img"
          aria-label="Gráfica de barras del ahorro previsto para cada mes"
          style={{
            width: "100%",
            height: "220px",
            minWidth: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <svg
            viewBox="0 0 360 220"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            style={{ display: "block", overflow: "visible" }}
          >
            {Array.from({ length: 4 }, (_, index) => {
              const y = 18 + index * 48;
              return (
                <line
                  key={`grid-${index}`}
                  x1="8"
                  x2="354"
                  y1={y}
                  y2={y}
                  stroke={T.border}
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
              );
            })}

            {chartData.map((entry, index) => {
              const maxAmount = Math.max(
                ...chartData.map((item) => item.importe),
                1
              );
              const chartTop = 18;
              const chartHeight = 150;
              const barWidth = 17;
              const gap = 11.5;
              const x = 11 + index * (barWidth + gap);
              const barHeight = Math.max(
                3,
                (entry.importe / maxAmount) * chartHeight
              );
              const y = chartTop + chartHeight - barHeight;
              const barColor = entry.isLow ? T.lavender : T.lime;

              return (
                <g key={`bar-${entry.mes}`}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="3"
                    fill={barColor}
                    opacity={entry.isCurrent ? 1 : 0.85}
                  />
                  {entry.isCurrent && (
                    <rect
                      x={x - 2}
                      y={y - 3}
                      width={barWidth + 4}
                      height={barHeight + 6}
                      rx="4"
                      fill="none"
                      stroke={T.text}
                      strokeWidth="1"
                      opacity="0.7"
                    />
                  )}
                  <text
                    x={x + barWidth / 2}
                    y="188"
                    fill={T.textMuted}
                    fontSize="9"
                    textAnchor="middle"
                  >
                    {entry.mes}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex justify-center gap-x-5 gap-y-2 mt-2 flex-wrap">
          <div className="flex items-center gap-2" style={{ ...fontBody, fontSize: "0.8rem" }}>
            <span
              className="inline-block rounded-full w-2.5 h-2.5"
              style={{ backgroundColor: T.lime }}
            />
            <span style={{ color: T.text }}>Mes normal</span>
          </div>

          <div className="flex items-center gap-2" style={{ ...fontBody, fontSize: "0.8rem" }}>
            <span
              className="inline-block rounded-full w-2.5 h-2.5"
              style={{ backgroundColor: T.lavender }}
            />
            <span style={{ color: T.text }}>Mes flojo</span>
          </div>
        </div>
      </Card>

      <AdviceBlock
        text={
          lowCount === 0
            ? "Tu objetivo está repartido entre los 12 meses. Marca los meses en los que prevés más gastos para ajustar el plan a tu realidad."
            : `Has marcado ${lowCount} ${lowCount === 1 ? "mes flojo" : "meses flojos"}. Los meses normales se ajustan para mantener el objetivo anual de ${fmtEUR(fromCents(goalCents))}.`
        }
      />

      <Card style={{ padding: "1.2rem" }}>
        <div className="flex flex-col gap-2 mb-4">
          <div style={{ ...fontDisplay, color: T.text, fontWeight: 700, fontSize: "1.1rem" }}>
            Personaliza cada mes
          </div>

          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.5 }}>
            Selecciona los meses en los que necesitas ahorrar menos. Puedes marcar hasta 11 para que quede al menos un mes normal que absorba la diferencia.
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {MONTHS.map((month, index) => {
            const low = lowMonths.has(index);
            const isPast = realMonth !== null && index < realMonth;
            const isCurrent = index === realMonth;

            return (
              <button
                key={month}
                type="button"
                onClick={() => toggleMonth(index)}
                aria-pressed={low}
                aria-label={`${month}: ${low ? "mes flojo" : "mes normal"}. ${fmtEUR(fromCents(monthlyCents[index]))} previstos`}
                style={{
                  borderRadius: "0.9rem",
                  padding: "0.85rem 0.35rem",
                  border: `1px solid ${low ? T.lavender : isCurrent ? T.lime : T.border}`,
                  background: low ? T.lavenderSoft : T.surfaceAlt,
                  color: T.text,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "border-color 160ms ease, background 160ms ease, transform 160ms ease",
                  opacity: isPast ? 0.78 : 1,
                  position: "relative",
                  minHeight: "76px",
                }}
              >
                {isCurrent && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-7px",
                      right: "-4px",
                      background: T.lime,
                      color: "#111",
                      fontSize: "0.58rem",
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      padding: "2px 5px",
                      borderRadius: "5px",
                    }}
                  >
                    ACTUAL
                  </span>
                )}

                <div style={{ ...fontBody, color: low ? T.lavender : T.text, fontSize: "0.8rem", fontWeight: 700 }}>
                  {month}
                </div>

                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.72rem", marginTop: "0.35rem" }}>
                  {fmtEUR(fromCents(monthlyCents[index]))}
                </div>

                <div style={{ ...fontBody, color: low ? T.lavender : T.textMuted, fontSize: "0.63rem", marginTop: "0.2rem" }}>
                  {low ? "Flojo" : "Normal"}
                </div>
              </button>
            );
          })}
        </div>

        {lowCount === MAX_LOW_MONTHS && (
          <p role="status" style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", lineHeight: 1.5, marginTop: "0.8rem" }}>
            Has marcado el máximo de meses flojos. Desmarca uno para poder seleccionar otro.
          </p>
        )}
      </Card>

      <Card style={{ padding: "1.2rem" }}>
        <div style={{ ...fontDisplay, color: T.text, fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem" }}>
          Tu seguimiento anual
        </div>

        {isGoalAchieved && (
          <div
            role="status"
            style={{
              background: `linear-gradient(135deg, ${T.lime}15, ${T.lavender}15)`,
              border: `1px solid ${T.lime}`,
              borderRadius: "0.9rem",
              padding: "1rem",
              textAlign: "center",
              marginBottom: "1.1rem",
            }}
          >
            <div style={{ ...fontDisplay, color: T.lime, fontSize: "1rem", fontWeight: 800 }}>
              Objetivo anual cumplido
            </div>

            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", marginTop: "0.3rem", lineHeight: 1.5 }}>
              Has alcanzado tu meta de {fmtEUR(fromCents(goalCents))}. ¡Buen trabajo manteniendo tu plan!
            </div>
          </div>
        )}

        <DecimalSliderRow
          label="Ya ahorrado este año"
          value={currentSaved}
          setValue={setCurrentSaved}
          min={0}
          max={FINANCIAL_MAX}
          step={50}
          accent="lavender"
          subtitle="Introduce el total que has ahorrado desde el comienzo del año."
          id="annual-savings-current"
        />

        <div className="mt-5">
          <div className="flex justify-between items-baseline gap-3 mb-2">
            <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>
              Progreso hacia tu meta
            </span>

            <span style={{ ...fontBody, color: T.text, fontSize: "0.85rem", fontWeight: 700 }}>
              {yearPct.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%
            </span>
          </div>

          <ProgressBar pct={yearPct} gradientEnd={T.lavender} />

          <div className="flex justify-between gap-3 mt-2" style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem" }}>
            <span>Ahorrado: {fmtEUR(fromCents(savedCents))}</span>
            <span>Meta: {fmtEUR(fromCents(goalCents))}</span>
          </div>
        </div>

        <div
          aria-live="polite"
          className="rounded-xl p-4 mt-5"
          style={{
            background: T.surfaceAlt,
            border: `1px solid ${isOnTrack ? T.border : isAhead ? T.lime : T.coral}`,
          }}
        >
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", marginBottom: "0.35rem" }}>
            {today
              ? `Referencia a ${today.getDate()} de ${MONTHS[today.getMonth()]}`
              : "Calculando referencia del año"}
          </div>

          {expectedCents === null ? (
            <div style={{ ...fontBody, color: T.text, fontSize: "0.88rem" }}>
              Preparando el seguimiento del año…
            </div>
          ) : (
            <>
              <div style={{ ...fontBody, color: T.text, fontSize: "0.9rem", lineHeight: 1.5 }}>
                Según tu plan, a estas alturas deberías llevar{" "}
                <strong>{fmtEUR(fromCents(expectedCents))}</strong>.
              </div>

              <div style={{ ...fontDisplay, color: isOnTrack ? T.lime : isAhead ? T.lime : T.coral, fontSize: "1rem", fontWeight: 800, marginTop: "0.5rem" }}>
                {isOnTrack
                  ? "Vas según el plan"
                  : isAhead
                    ? `Vas ${fmtEUR(animatedDiff)} por delante`
                    : `Vas ${fmtEUR(animatedDiff)} por detrás`}
              </div>

              <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", lineHeight: 1.5, marginTop: "0.35rem" }}>
                La referencia se prorratea por los días transcurridos del mes actual; es una guía orientativa, no una obligación diaria.
              </div>
            </>
          )}
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools
        ids={["savings", "challenge"]}
        onNavigate={onNavigate}
        primaryId="savings"
      />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Plan de ahorro anual: objetivo ${fmtEUR(fromCents(goalCents))}; ${lowCount} meses flojos; ahorro acumulado ${fmtEUR(fromCents(savedCents))}; referencia del plan ${expectedCents === null ? "pendiente de calcular" : fmtEUR(fromCents(expectedCents))}.`
          }
        />

        <ExportCSVButton
          filename="planificador-ahorro-anual"
          getRows={() =>
            MONTHS.map((month, index) => ({
              mes: month,
              importe: fromCents(monthlyCents[index]).toFixed(2),
              tipo: lowMonths.has(index) ? "flojo" : "normal",
            }))
          }
        />
      </div>

      <div
        style={{
          ...fontBody,
          color: T.textMuted,
          fontSize: "0.82rem",
          lineHeight: 1.7,
          borderTop: `1px solid ${T.border}`,
          paddingTop: "1.2rem",
        }}
      >
        <p>
          Ahorrar la misma cantidad todos los meses no siempre es realista: hay meses con gastos extra, como vacaciones, Navidad o la vuelta al cole, que rompen cualquier plan fijo. Este planificador te permite marcar esos meses como flojos, ajustar cuánto se reduce cada uno y comparar tu ahorro acumulado con el que deberías llevar según tu plan. Las cifras son una planificación orientativa y no constituyen asesoramiento financiero.
        </p>
      </div>
    </div>
  );
}

export default AnnualPlannerTool;
