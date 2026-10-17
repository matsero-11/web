"use client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { T, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, SliderControl, AdviceBlock } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import GoalProjection from "@/components/engines/GoalProjection";
import AdSlot from "@/components/AdSlot";
import { MAX_FINANCIAL_LIMIT } from "@/lib/financial-constants";

const FAQS = [
  {
    q: "¿Cómo puedo calcular el tiempo necesario para alcanzar mi meta?",
    a: "Introduciendo el importe total de tu objetivo, el dinero que ya tienes ahorrado y lo que puedes aportar cada mes. La herramienta calcula automáticamente los meses o años necesarios.",
  },
  {
    q: "¿Qué pasa si añado una aportación extra mensual?",
    a: "El simulador recalcula de forma instantánea el tiempo de consecución para mostrarte cuánto antes alcanzarás tu meta financiera.",
  },
];

export default function SavingsGoalTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [goal, setGoal] = useState(() => {
    const p = initialParams?.goal;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 10000;
  });

  const [current, setCurrent] = useState(() => {
    const p = initialParams?.current;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 1500;
  });

  const [monthly, setMonthly] = useState(() => {
    const p = initialParams?.monthly;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 300;
  });

  const [extra, setExtra] = useState(() => {
    const p = initialParams?.extra;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 0;
  });

  useEffect(() => {
    if (current > goal) setCurrent(goal);
  }, [goal, current]);

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({ goal, current, monthly, extra });
    }
  }, [goal, current, monthly, extra, onStateChange]);

  const maxCurrentSlider = Math.max(goal, current, MAX_FINANCIAL_LIMIT);

  const pageTitle = "Calculadora de objetivo de ahorro: cuánto tardarás en llegar a tu meta | MetaBox";
  const pageDescription =
    "Calcula cuánto tardarás en alcanzar tu objetivo de ahorro introduciendo tu meta, lo que ya tienes y tu aportación mensual o extra. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/savings";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="objetivo de ahorro, calculadora meta de ahorro, cuánto tardaré en ahorrar, planificador de ahorro"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://metabox-web.vercel.app/og/savings.png" />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://metabox-web.vercel.app/og/savings.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Objetivo de ahorro",
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

      <ToolHeader title="Objetivo de ahorro" subtitle="Gestiona una o varias metas y verás el resultado al instante." onBack={onBack} />

      <GoalProjection goal={goal} current={current} monthly={monthly} extra={extra} monthsSavedLabel="meses menos" />

      <AdviceBlock
        text={
          current >= goal
            ? "¡Ya has alcanzado o superado tu objetivo! Puedes marcar una nueva meta más ambiciosa."
            : monthly + extra === 0
            ? "Introduce una aportación mensual o extra superior a 0 € para poder calcular el tiempo estimado."
            : "Al ritmo actual mantienes una constancia sólida. Subir la aportación mensual, aunque sea poco, acorta el plazo de forma notable."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Objetivo" value={goal} min={500} max={MAX_FINANCIAL_LIMIT} step={500} unit="€" onChange={setGoal} />
          <SliderControl label="Ya ahorrado" value={current} min={0} max={maxCurrentSlider} step={100} unit="€" onChange={setCurrent} />
          <SliderControl label="Ahorro mensual" value={monthly} min={0} max={MAX_FINANCIAL_LIMIT} step={50} unit="€" onChange={setMonthly} accent="lavender" />
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.8rem" }}>
          ¿Y si ahorras un poco más al mes?
        </div>
        <SliderControl label="Ahorro extra" value={extra} min={0} max={MAX_FINANCIAL_LIMIT} step={25} unit="€" onChange={setExtra} accent="lavender" />
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["budget", "percent", "emergency"]} onNavigate={onNavigate} primaryId="budget" />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Objetivo de ahorro: Meta de ${fmtEUR(goal)}, ya ahorrado ${fmtEUR(current)}, aportando ${fmtEUR(monthly + extra)}/mes.`
          }
        />
        <ExportCSVButton
          filename="objetivo-de-ahorro"
          getRows={() => [
            { metrica: "Objetivo", valor: goal.toFixed(2) },
            { metrica: "Ya ahorrado", valor: current.toFixed(2) },
            { metrica: "Ahorro mensual", valor: monthly.toFixed(2) },
            { metrica: "Ahorro extra", valor: extra.toFixed(2) },
          ]}
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Ya sea para un objetivo concreto o un ahorro general, saber cuándo lo vas a conseguir ayuda a mantener la motivación. Esta calculadora te permite gestionar tus objetivos a la vez —cada uno con su nombre, su progreso y su propia proyección— y ver el efecto de sumar un ahorro extra a la fecha de consecución de cada uno.
        </p>
      </div>
    </div>
  );
        }

