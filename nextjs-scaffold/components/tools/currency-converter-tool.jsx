"use client";
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Repeat,
} from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, SliderControl, AdviceBlock } from "@/components/ui";
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
];

function CurrencyConverterTool({ onBack, onNavigate }) {
  const [amount, setAmount] = useSharedState("currency_amount", 100);
  const [rate, setRate] = useSharedState("currency_rate", 1.08);
  const [fromLabel, setFromLabel] = usePersistentState("currency_fromLabel", "EUR");
  const [toLabel, setToLabel] = usePersistentState("currency_toLabel", "USD");
  const [isRotated, setIsRotated] = useState(false);

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

  const pageTitle = "Conversor de moneda para viajes con tipo de cambio manual | MetaBox";
  const pageDescription =
    "Convierte entre divisas al instante introduciendo el tipo de cambio del día, ideal para calcular presupuestos de viaje antes de salir. Gratis y sin registro.";
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
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>{amount} {fromLabel} equivalen a</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
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

          <SliderControl label={`Importe en ${fromLabel || "origen"}`} value={amount} min={0} max={5000} step={5} unit="" onChange={setAmount} />
          <SliderControl label="Tipo de cambio" value={rate} min={0.01} max={5} step={0.01} unit="" onChange={setRate} accent="lavender" />
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", textAlign: "center" }}>
        El tipo de cambio no se actualiza automáticamente: introduce el del día antes de viajar.
      </div>

      <RelatedTools ids={["trip", "tripdaily"]} onNavigate={onNavigate} />

      <div className="flex justify-center pt-2">
        <CopySummaryButton
          getText={() => `${amount} ${fromLabel} = ${converted.toFixed(2)} ${toLabel} (tipo de cambio: ${rate}).`}
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Antes de viajar al extranjero conviene saber a cuánto equivale tu presupuesto en la moneda local. Este conversor te permite introducir el tipo de cambio del día que hayas consultado y ver al instante cuánto es tu dinero en la divisa de destino, además de invertir la conversión con un solo toque.
        </p>
      </div>
    </div>
  );
}

export default CurrencyConverterTool;
