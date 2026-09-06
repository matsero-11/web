"use client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Repeat } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, AdviceBlock, Chip } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { useSharedState, usePersistentState } from "@/lib/persistence";
import { CopySummaryButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Este conversor usa el tipo de cambio actualizado en tiempo real?",
    a: "No. El tipo de cambio lo introduces tú manualmente, por lo que conviene consultarlo justo antes de viajar (por ejemplo en tu banco o una app de cambio) para que el resultado sea preciso.",
  },
  {
    q: "¿Por qué el tipo de cambio de mi banco es distinto al que veo aquí?",
    a: "Los bancos y tarjetas suelen aplicar un margen sobre el tipo de cambio de mercado. Cuanto mayor sea el importe que cambies, más se nota esa diferencia — compara varias opciones antes de viajar.",
  },
  {
    q: "¿Para qué sirven los pares guardados?",
    a: "Cada vez que conviertes con una combinación de monedas nueva, se guarda automáticamente como acceso rápido, para que la próxima vez no tengas que volver a escribir el tipo de cambio desde cero.",
  },
];

function DecimalRateRow({ label, value, setValue, min = 0.0001, max = 10000, unit = "" }) {
  const [textVal, setTextVal] = useState(String(value ?? 0));

  useEffect(() => {
    if (value !== parseFloat(textVal.replace(",", "."))) {
      setTextVal(String(value ?? 0));
    }
  }, [value]);

  const handleInputChange = (e) => {
    const raw = e.target.value;
    setTextVal(raw);
    const parsed = parseFloat(raw.replace(",", "."));
    if (!isNaN(parsed)) {
      setValue(parsed);
    }
  };

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setValue(val);
    setTextVal(String(val));
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-baseline">
        <span style={{ ...fontBody, color: T.text, fontSize: "0.9rem", fontWeight: 500 }}>{label}</span>
        <div className="flex items-center gap-1 bg-[var(--surface-alt,rgba(255,255,255,0.03))] px-2.5 py-1 rounded-lg border border-[var(--border,rgba(255,255,255,0.08))]">
          <input
            type="text"
            inputMode="decimal"
            value={textVal}
            onChange={handleInputChange}
            onBlur={() => {
              const parsed = parseFloat(textVal.replace(",", "."));
              if (isNaN(parsed)) {
                setTextVal(String(value ?? 0));
              } else {
                setValue(parsed);
                setTextVal(String(parsed));
              }
            }}
            className="bg-transparent text-right font-semibold"
            style={{
              ...fontBody,
              color: T.lavender,
              fontSize: "0.9rem",
              width: "100px",
              outline: "none",
            }}
          />
          {unit && <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={Math.max(max, value || 0, 10)}
        step={value > 100 ? 1 : value > 10 ? 0.1 : 0.0001}
        value={isNaN(value) ? 0 : value}
        onChange={handleSliderChange}
        className="w-full cursor-pointer h-1.5 rounded-lg appearance-none bg-[var(--surface-alt,rgba(255,255,255,0.1))] accent-current"
        style={{ accentColor: T.lavender }}
      />
    </div>
  );
}

function CurrencyConverterTool({ onBack, onNavigate }) {
  const [amount, setAmount] = useSharedState("currency_amount", 100);
  const [rate, setRate] = useSharedState("currency_rate", 1.08);
  const [fromLabel, setFromLabel] = usePersistentState("currency_fromLabel", "EUR");
  const [toLabel, setToLabel] = usePersistentState("currency_toLabel", "USD");
  const [isRotated, setIsRotated] = useState(false);
  const [savedPairs, setSavedPairs] = usePersistentState("currency_savedPairs", []);

  const converted = amount * rate;
  const animatedConverted = useAnimatedNumber(converted);

  const handleSwap = () => {
    setFromLabel(toLabel);
    setToLabel(fromLabel);
    if (rate > 0) {
      setRate(Number((1 / rate).toFixed(4)));
    }
    setIsRotated((prev) => !prev);
  };

  const savePair = () => {
    const key = `${fromLabel}_${toLabel}`;
    const existing = savedPairs.find((p) => p.key === key);
    const newPair = { key, from: fromLabel, to: toLabel, rate };
    const next = existing
      ? savedPairs.map((p) => (p.key === key ? newPair : p))
      : [newPair, ...savedPairs].slice(0, 5);
    setSavedPairs(next);
  };

  const loadPair = (pair) => {
    setFromLabel(pair.from);
    setToLabel(pair.to);
    setRate(pair.rate);
  };

  const pageTitle = "Conversor de moneda para viajes con tipo de cambio manual | MetaBox";
  const pageDescription =
    "Convierte entre divisas al instante introduciendo el tipo de cambio del día y guarda tus pares de monedas favoritos para acceder rápido la próxima vez. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/currency";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="conversor de moneda para viajes, calculadora tipo de cambio, convertir euros a dólares, presupuesto de viaje en divisas"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/currency.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/currency.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Conversor de moneda para viajes",
            url: pageUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            inLanguage: "es",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            description: pageDescription,
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
      </Helmet>

      <ToolHeader title="Conversor de moneda para viajes" subtitle="Introduce el tipo de cambio del día y convierte al instante." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>
          {new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(amount)} {fromLabel} equivalen a
        </div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(animatedConverted)} {toLabel}
        </div>
      </Card>

      {savedPairs.length > 0 && (
        <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.7rem" }}>
            Tus pares guardados
          </div>
          <div className="flex flex-wrap gap-2">
            {savedPairs.map((p) => (
              <Chip key={p.key} label={`${p.from} → ${p.to} (${p.rate})`} active={fromLabel === p.from && toLabel === p.to} onClick={() => loadPair(p)} />
            ))}
          </div>
        </Card>
      )}

      <AdviceBlock
        text={
          amount > 1000
            ? "Para importes grandes, compara el tipo de cambio de tu banco o tarjeta con el tipo de mercado: la diferencia se nota más cuanto mayor es la cantidad."
            : "Actualiza el tipo de cambio justo antes de viajar — puede variar de un día para otro."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <input
              value={fromLabel}
              onChange={(e) => setFromLabel(e.target.value.toUpperCase().slice(0, 4))}
              placeholder="EUR"
              aria-label="Moneda de origen"
              style={{ ...fontBody, flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: "0.8rem", padding: "0.75rem", color: T.text, textAlign: "center", outline: "none", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = T.lime; e.currentTarget.style.boxShadow = `0 0 0 3px ${T.limeSoft}`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
            />

            <button
              onClick={handleSwap}
              title="Invertir monedas"
              style={{
                background: T.surfaceAlt,
                border: `1px solid ${T.border}`,
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: T.lime,
                transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease",
                transform: isRotated ? "rotate(180deg)" : "rotate(0deg)",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.limeSoft; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = T.surfaceAlt; }}
            >
              <Repeat size={18} />
            </button>

            <input
              value={toLabel}
              onChange={(e) => setToLabel(e.target.value.toUpperCase().slice(0, 4))}
              placeholder="USD"
              aria-label="Moneda de destino"
              style={{ ...fontBody, flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: "0.8rem", padding: "0.75rem", color: T.text, textAlign: "center", outline: "none", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = T.lime; e.currentTarget.style.boxShadow = `0 0 0 3px ${T.limeSoft}`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          <DecimalRateRow
            label={`Importe en ${fromLabel || "origen"}`}
            value={amount}
            setValue={setAmount}
            min={0}
            max={50000}
            unit={fromLabel}
          />

          <DecimalRateRow
            label="Tipo de cambio"
            value={rate}
            setValue={setRate}
            min={0.0001}
            max={5000}
            unit={`1 ${fromLabel} = X ${toLabel}`}
          />

          <button
            onClick={savePair}
            style={{
              ...fontBody, background: "transparent", border: `1px dashed ${T.border}`, borderRadius: "0.7rem",
              padding: "0.6rem", color: T.textMuted, fontSize: "0.82rem", cursor: "pointer", textAlign: "center",
            }}
          >
            Guardar {fromLabel} → {toLabel} como acceso rápido
          </button>
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
        El tipo de cambio no se actualiza automáticamente: introduce el del día antes de viajar.
      </div>

      <RelatedTools ids={["trip", "tripdaily"]} onNavigate={onNavigate} primaryId="trip" />

      <div className="flex justify-center pt-2">
        <CopySummaryButton
          getText={() => `${amount} ${fromLabel} = ${converted.toFixed(2)} ${toLabel} (tipo de cambio: ${rate}).`}
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Antes de viajar al extranjero conviene saber a cuánto equivale tu presupuesto en la moneda local. Este conversor te permite introducir el tipo de cambio del día que hayas consultado, ver al instante cuánto es tu dinero en la divisa de destino, y guardar tus combinaciones de monedas más usadas para no tener que volver a escribirlas cada vez.
        </p>
      </div>
    </div>
  );
}

export default CurrencyConverterTool;
                   
