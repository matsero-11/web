"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, X } from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, Chip, AdviceBlock } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Cuánto debería ahorrar al mes para Navidad?",
    a: "Depende de tu lista de regalos y de cuántos meses te queden hasta diciembre. Esta calculadora suma todos tus regalos previstos y reparte el total entre los meses restantes.",
  },
  {
    q: "¿Cuándo es el mejor momento para empezar a ahorrar para Navidad?",
    a: "Cuanto antes, mejor: empezar en enero o febrero reparte el esfuerzo en muchos más meses, con cuotas mensuales bajas, en vez de tener que reunir todo el presupuesto en los últimos meses del año.",
  },
  {
    q: "¿Para qué sirve la lista de regalos en vez de un presupuesto global?",
    a: "Te permite ver exactamente en qué se va el presupuesto de Navidad —a quién y cuánto— y ajustar regalos concretos si necesitas recortar, en vez de mover una cifra abstracta.",
  },
];

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function MoneyInput({ value, onChange }) {
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

  return (
    <div className="flex items-center justify-end bg-[var(--surface-alt,rgba(255,255,255,0.03))] px-3 py-2 rounded-xl border border-[var(--border,rgba(255,255,255,0.08))]" style={{ width: "110px", flexShrink: 0 }}>
      <input
        type="text"
        inputMode="decimal"
        value={textVal}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="bg-transparent text-right font-semibold"
        style={{ ...fontBody, color: T.lime, fontSize: "1rem", width: "100%", outline: "none" }}
      />
      <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginLeft: "4px" }}>€</span>
    </div>
  );
}
function HolidaySavingsTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const realMonth = new Date().getMonth() + 1;
  const [currentMonth, setCurrentMonth] = useState(() => {
    const p = initialParams?.currentMonth;
    return p !== undefined && !isNaN(parseInt(p, 10)) ? parseInt(p, 10) : realMonth;
  });

  const [current, setCurrent] = useState(() => {
    const p = initialParams?.current;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 50;
  });

  const [gifts, setGifts] = useState(() => {
    const p = initialParams?.gifts;
    if (p) {
      try {
        const parsed = JSON.parse(p);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { id: "1", name: "Familia", amount: 200 },
      { id: "2", name: "Amigos", amount: 150 },
      { id: "3", name: "Comida y decoración", amount: 250 },
    ];
  });

  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        currentMonth,
        current,
        gifts: gifts.length > 0 ? JSON.stringify(gifts) : null,
      });
    }
  }, [currentMonth, current, gifts, onStateChange]);

  const budget = useMemo(() => gifts.reduce((sum, g) => sum + (g.amount || 0), 0), [gifts]);

  const monthsLeft = currentMonth <= 12 ? 12 - currentMonth + 1 : 12;
  const remaining = Math.max(budget - current, 0);
  const requiredMonthly = monthsLeft > 0 ? remaining / monthsLeft : remaining;
  const animatedRequired = useAnimatedNumber(requiredMonthly);

  const updateAmount = (id, amount) => {
    setGifts((prev) => prev.map((g) => (g.id === id ? { ...g, amount } : g)));
  };

  const updateName = (id, name) => {
    setGifts((prev) => prev.map((g) => (g.id === id ? { ...g, name } : g)));
  };

  const addGift = () => {
    const name = newName.trim();
    if (!name) return;
    setGifts((prev) => [...prev, { id: `${Date.now()}`, name, amount: 50 }]);
    setNewName("");
  };

  const removeGift = (id) => {
    setGifts((prev) => prev.filter((g) => g.id !== id));
  };

  const pageTitle = "Calculadora de ahorro para Navidad con lista de regalos | MetaBox";
  const pageDescription = "Haz tu lista de regalos y gastos de Navidad, suma el presupuesto total automáticamente y calcula cuánto ahorrar cada mes hasta diciembre. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/ahorro-para-navidad";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="ahorro para Navidad, cuánto ahorrar para Navidad, lista de regalos de Navidad, calculadora presupuesto Navidad" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Ahorro para Navidad",
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

      <ToolHeader title="Ahorro para Navidad" subtitle="Haz tu lista de regalos y calculamos cuánto ahorrar al mes." onBack={onBack} />

      <Card glow result style={{ textAlign: "center", paddingTop: "1.2rem", paddingBottom: "1.2rem" }}>
        <div style={{ height: "140px", position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, value: 1 }))}
                dataKey="value"
                innerRadius="68%"
                outerRadius="95%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={4}
                stroke="none"
                isAnimationActive={true}
                animationDuration={500}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <Cell key={i} fill={i + 1 >= currentMonth ? T.lime : T.surfaceAlt} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.2rem", fontWeight: 700 }}>{monthsLeft}</div>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>{monthsLeft === 1 ? "mes" : "meses"}</div>
          </div>
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginTop: "0.5rem" }}>Ahorra al mes</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.4rem", fontWeight: 700, margin: "0.3rem 0" }}>
          {fmtEUR(animatedRequired)}
        </div>
      </Card>

      <AdviceBlock
        text={
          monthsLeft <= 2
            ? "Quedan pocos meses. Si el importe mensual aprieta, revisa tu lista de regalos y recorta las partidas menos prioritarias."
            : "Empezar pronto reparte mejor el esfuerzo. Automatizar esta cantidad cada mes evita tener que reunirla toda en diciembre."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "1rem" }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem" }}>
            Tu lista de Navidad
          </div>
          <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.1rem", fontWeight: 700 }}>{fmtEUR(budget)}</div>
        </div>
        
        <div className="flex flex-col gap-3">
          {gifts.map((g) => (
            <div key={g.id} className="flex items-center gap-2" style={{ background: T.surface, padding: "0.5rem", borderRadius: "0.8rem", border: `1px solid ${T.border}` }}>
              <input
                value={g.name}
                onChange={(e) => updateName(g.id, e.target.value)}
                placeholder="Nombre"
                style={{
                  ...fontBody, flex: 1, minWidth: 0, background: "transparent", border: "none",
                  padding: "0.4rem 0.5rem", color: T.text, fontSize: "0.9rem", outline: "none", fontWeight: 500
                }}
              />
              <MoneyInput value={g.amount} onChange={(v) => updateAmount(g.id, v)} />
              <button
                onClick={() => removeGift(g.id)}
                aria-label={`Eliminar ${g.name}`}
                style={{ background: "transparent", border: "none", color: T.coral, cursor: "pointer", padding: "0.4rem", flexShrink: 0 }}
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2" style={{ marginTop: "1rem" }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGift()}
            placeholder="Añadir regalo o gasto (ej. Mamá)..."
            style={{
              ...fontBody, flex: 1, minWidth: 0, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.7rem",
              padding: "0.65rem 0.9rem", color: T.text, fontSize: "0.9rem", outline: "none",
            }}
          />
          <button onClick={addGift} aria-label="Añadir a la lista" style={{ background: T.lime, border: "none", borderRadius: "0.7rem", padding: "0.65rem 1rem", display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", flexShrink: 0, ...fontBody, fontWeight: 600, color: "#0a1214" }}>
            <Plus size={18} /> Añadir
          </button>
        </div>
      </Card>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <div>
            <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.8rem" }}>Mes actual</div>
            <div className="grid grid-cols-4 gap-2">
              {MONTHS.map((m, i) => (
                <Chip key={m} label={m} active={currentMonth === i + 1} onClick={() => setCurrentMonth(i + 1)} />
              ))}
            </div>
          </div>
          <div>
             <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.8rem" }}>Ya ahorrado</div>
             <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <MoneyInput value={current} onChange={setCurrent} />
             </div>
          </div>
        </div>
      </Card>

      <AdSlot minHeight="0px" />
      <RelatedTools ids={["savings", "challenge"]} onNavigate={onNavigate} primaryId="savings" />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            `Ahorro para Navidad: presupuesto ${fmtEUR(budget)} (${gifts.length} partidas), ya ahorrado ${fmtEUR(current)}, ${monthsLeft} meses restantes → ${fmtEUR(requiredMonthly)}/mes.`
          }
        />
        <ExportCSVButton
          filename="lista-navidad"
          getRows={() => gifts.map((g) => ({ concepto: g.name, importe: g.amount.toFixed(2) }))}
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          La Navidad llega cada año en la misma fecha, pero el gasto en regalos, comidas y viajes suele coger a muchas personas por sorpresa. En vez de un presupuesto global abstracto, haz tu lista real de regalos y gastos —a quién y cuánto—, y esta calculadora reparte automáticamente el total entre los meses que quedan hasta diciembre.
        </p>
      </div>
    </div>
  );
}

export default HolidaySavingsTool;
