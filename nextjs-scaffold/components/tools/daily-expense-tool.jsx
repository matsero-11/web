"use client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, X } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, AdviceBlock } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Cuánto suma un gasto pequeño diario al año?",
    a: "Un gasto de 6€ al día equivale a 2.190€ al año — mucho más de lo que suele parecer a simple vista, precisamente porque se paga en cantidades pequeñas y repetidas.",
  },
  {
    q: "¿Merece la pena recortar 1 o 2 euros al día?",
    a: "Sí: al multiplicarse por 365 días, incluso un pequeño recorte diario puede generar un ahorro anual significativo sin que el cambio en el día a día se note apenas.",
  },
  {
    q: "¿Por qué desglosar varios gastos en vez de uno solo?",
    a: "La mayoría de personas no tienen un único gasto diario, sino varios pequeños (café, transporte, tabaco...). Verlos por separado ayuda a identificar cuál merece más la pena recortar primero.",
  },
];

const DEFAULT_ITEMS = [{ id: "1", name: "Café", amount: 1.5 }];

// SLIDER BLINDADO CON MÁXIMO ESTÁTICO DE 1000€
function DailySlider({ label, value, onChange }) {
  const [textVal, setTextVal] = useState(String(value ?? 0));
  const MAX_DAILY_SLIDER = 1000;

  useEffect(() => {
    if (value !== parseFloat(textVal.replace(",", "."))) {
      setTextVal(String(value ?? 0));
    }
  }, [value]);

  const handleInputChange = (e) => {
    const raw = e.target.value;
    setTextVal(raw);
    const parsed = parseFloat(raw.replace(",", "."));
    if (!isNaN(parsed)) onChange(parsed);
  };

  const handleBlur = () => {
    const parsed = parseFloat(textVal.replace(",", "."));
    if (isNaN(parsed)) {
      onChange(0);
      setTextVal("0");
    } else {
      onChange(parsed);
      setTextVal(String(parsed));
    }
  };

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    onChange(val);
    setTextVal(String(val));
  };

  const safeValue = isNaN(value) ? 0 : value;
  const sliderPos = Math.min(safeValue, MAX_DAILY_SLIDER);

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
            onBlur={handleBlur}
            className="bg-transparent text-right font-semibold"
            style={{ ...fontBody, color: T.lime, fontSize: "0.95rem", width: "85px", outline: "none" }}
          />
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>€</span>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={MAX_DAILY_SLIDER}
        step={0.1}
        value={sliderPos}
        onChange={handleSliderChange}
        className="w-full cursor-pointer h-1.5 rounded-lg appearance-none bg-[var(--surface-alt,rgba(255,255,255,0.1))] accent-current"
        style={{ accentColor: T.lime }}
      />
    </div>
  );
}

function DailyExpenseTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [items, setItems] = useState(() => {
    const p = initialParams?.items;
    if (p) {
      try {
        const parsed = JSON.parse(p);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_ITEMS;
  });
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        items: items.length > 0 ? JSON.stringify(items) : null,
      });
    }
  }, [items, onStateChange]);

  const daily = items.reduce((sum, it) => sum + (it.amount || 0), 0);
  const weekly = daily * 7;
  const monthly = daily * 30;
  const annual = daily * 365;

  const animatedAnnual = useAnimatedNumber(annual);

  const barData = [
    { periodo: "Semana", valor: weekly },
    { periodo: "Mes", valor: monthly },
    { periodo: "Año", valor: annual },
  ];

  const updateAmount = (id, amount) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, amount } : it)));
  };

  const addItem = () => {
    const name = newName.trim();
    if (!name) return;
    setItems((prev) => [...prev, { id: `${Date.now()}`, name, amount: 1 }]);
    setNewName("");
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const biggestItem = [...items].sort((a, b) => b.amount - a.amount)[0];

  const pageTitle = "De gasto diario a gasto anual: calculadora de pequeños gastos | MetaBox";
  const pageDescription = "Desglosa tus gastos diarios pequeños (café, transporte, tabaco...) y descubre cuánto suman realmente al mes y al año. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/gasto-diario-a-mensual-anual";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Gastos diarios",
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

      <ToolHeader title="Gastos diarios" subtitle="Desglosa tus pequeños gastos y mira cuánto suman en conjunto." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>
          Tus microgastos suman un total anual de
        </div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {fmtEUR(animatedAnnual)}
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>
          Equivalente a {fmtEUR(daily)} al día ({fmtEUR(monthly)} al mes)
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
          Tus gastos diarios
        </div>
        <div className="flex flex-col gap-6">
          {items.map((it) => (
            <div key={it.id} style={{ position: "relative" }}>
              <DailySlider
                label={it.name}
                value={it.amount}
                onChange={(v) => updateAmount(it.id, v)}
              />
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(it.id)}
                  aria-label={`Eliminar ${it.name}`}
                  style={{
                    position: "absolute", top: "-4px", right: "-4px",
                    background: T.coral, borderRadius: "50%", width: "18px", height: "18px",
                    display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer",
                  }}
                >
                  <X size={11} color="#fff" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5" style={{ marginTop: "1.2rem" }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Añadir otro gasto (ej. tabaco)..."
            style={{
              ...fontBody, flex: 1, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.7rem",
              padding: "0.6rem 0.9rem", color: T.text, fontSize: "0.85rem", outline: "none",
            }}
          />
          <button onClick={addItem} aria-label="Añadir gasto" style={{ background: T.lime, border: "none", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Plus size={18} color="#12200A" />
          </button>
        </div>
      </Card>

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div style={{ width: "100%", height: "190px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 10, right: 16, left: 8, bottom: 10 }}>
              <XAxis type="number" hide domain={[0, "auto"]} />
              <YAxis type="category" dataKey="periodo" tick={{ fill: T.textMuted, fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }}
                formatter={(v) => [fmtEUR(v), "Total"]}
              />
              <Bar dataKey="valor" radius={[0, 8, 8, 0]} maxBarSize={26} animationDuration={400}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={[T.textMuted, T.lime, T.lavender][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <AdviceBlock
        text={
          annual > 3000
            ? "Este total diario supera los 3.000€ al año. Un pequeño recorte aquí se nota mucho más que en gastos ocasionales."
            : biggestItem
            ? `"${biggestItem.name}" es tu gasto más alto (${fmtEUR(biggestItem.amount)}/día). Empezar por ahí suele notarse más rápido.`
            : "Añade tus gastos diarios habituales para ver cuánto suman en conjunto."
        }
      />

      <AdSlot minHeight="0px" />
      <RelatedTools ids={["roundup", "budget"]} onNavigate={onNavigate} primaryId="roundup" />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() => `Gastos diarios (${items.map((i) => i.name).join(", ")}): ${fmtEUR(daily)}/día → ${fmtEUR(monthly)}/mes, ${fmtEUR(annual)}/año.`}
        />
        <ExportCSVButton filename="gastos-diarios" getRows={() => items.map((it) => ({ gasto: it.name, importe_diario: it.amount.toFixed(2), importe_anual: (it.amount * 365).toFixed(2) }))} />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Los gastos pequeños y repetidos —un café, el transporte, el tabaco— son fáciles de ignorar por separado porque cada uno parece insignificante. Esta calculadora te deja desglosar todos tus gastos diarios habituales y ver el total combinado en su equivalente semanal, mensual y anual, para decidir con datos cuál merece la pena recortar primero.
        </p>
      </div>
    </div>
  );
}

export default DailyExpenseTool;
