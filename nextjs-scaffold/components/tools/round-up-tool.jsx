"use client";
import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, X, PiggyBank, Sparkles } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, SliderControl, Chip, AdviceBlock } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { usePersistentState } from "@/lib/persistence";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Qué es el ahorro por redondeo?",
    a: "Es una técnica de ahorro pasivo: cada compra se redondea al alza (por ejemplo a 1€, 2€ o 5€) y la diferencia entre el precio real y el redondeo se destina automáticamente a ahorro.",
  },
  {
    q: "¿A qué cantidad conviene redondear las compras?",
    a: "Depende de cuánto quieras ahorrar sin notarlo demasiado: redondear a 1€ genera menos ahorro pero pasa más desapercibido; redondear a 5€ acumula más, aunque se nota algo más en cada compra.",
  },
  {
    q: "¿Para qué sirve el historial de la hucha en esta herramienta?",
    a: "Puedes registrar compras reales una a una: cada vez que añades una, se calcula su redondeo exacto, se suma a tu hucha y puedes consultar o eliminar movimientos individuales si te equivocas.",
  },
];

function MoneyInput({ value, onChange, placeholder = "0,00" }) {
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
    <div style={{ display: "flex", alignItems: "center", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.8rem", padding: "0.6rem 1rem", width: "100%" }}>
      <input
        type="text"
        inputMode="decimal"
        value={textVal}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="bg-transparent text-right font-semibold"
        style={{ ...fontBody, color: T.lime, fontSize: "1rem", width: "100%", outline: "none" }}
      />
      <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginLeft: "4px" }}>€</span>
    </div>
  );
}
function RoundUpTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [purchasesPerWeek, setPurchasesPerWeek] = useState(() => {
    const p = initialParams?.purchasesPerWeek;
    return p !== undefined && !isNaN(parseInt(p, 10)) ? parseInt(p, 10) : 8;
  });

  const [avgAmount, setAvgAmount] = useState(() => {
    const p = initialParams?.avgAmount;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 6.5;
  });

  const [roundTo, setRoundTo] = useState(() => {
    const p = initialParams?.roundTo;
    return p !== undefined && !isNaN(parseInt(p, 10)) ? parseInt(p, 10) : 1;
  });

  const [history, setHistory] = usePersistentState("roundup_history", []);
  const [newPurchase, setNewPurchase] = useState("");

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({ purchasesPerWeek, avgAmount, roundTo });
    }
  }, [purchasesPerWeek, avgAmount, roundTo, onStateChange]);

  const rem = avgAmount % roundTo;
  const roundUpPerPurchase = rem === 0 ? 0 : roundTo - rem;
  const weekly = purchasesPerWeek * roundUpPerPurchase;
  const monthly = weekly * 4.33;
  const annual = weekly * 52;

  const piggyBank = history.reduce((acc, cur) => acc + cur.roundUp, 0);
  const animatedMonthly = useAnimatedNumber(monthly);
  const animatedAnnual = useAnimatedNumber(annual);
  const animatedPiggy = useAnimatedNumber(piggyBank);

  const barData = [
    { periodo: "Semana", valor: weekly },
    { periodo: "Mes", valor: monthly },
    { periodo: "Año", valor: annual },
  ];

  const addRealPurchase = () => {
    const amount = Number(String(newPurchase).replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) return;
    const purchaseRem = amount % roundTo;
    const roundUp = purchaseRem === 0 ? 0 : roundTo - purchaseRem;
    const newItem = { id: Date.now(), amount, roundUp };
    setHistory((prev) => [newItem, ...prev]);
    setNewPurchase("");
  };

  const removePurchase = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const resetPiggyBank = () => setHistory([]);

  const pageTitle = "Calculadora de ahorro por redondeo de compras | MetaBox";
  const pageDescription = "Estima cuánto ahorrarías redondeando tus compras y lleva una hucha real con historial de movimientos y opción de eliminar entradas. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/ahorro-por-redondeo";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="ahorro por redondeo, cómo funciona el redondeo de compras, ahorrar redondeando compras, hucha de redondeo" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Ahorro por redondeo",
            url: pageUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            inLanguage: "es",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            description: pageDescription,
          })}
        </script>
      </Helmet>

      <ToolHeader title="Ahorro por redondeo" subtitle="Cada compra se redondea hacia arriba y la diferencia se ahorra." onBack={onBack} />

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div className="flex gap-2 justify-center">
          {[1, 2, 5].map((v) => (
            <Chip key={v} label={`Redondear a ${v} €`} active={roundTo === v} onClick={() => setRoundTo(v)} />
          ))}
        </div>
      </Card>

      {/* TARJETA PREMIUM DE LA HUCHA */}
      <div style={{
        background: `linear-gradient(145deg, rgba(196,222,78,0.1) 0%, rgba(10,18,20,1) 100%)`,
        borderRadius: "1.5rem",
        padding: "2rem 1.5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        border: `1px solid rgba(196,222,78,0.3)`,
        boxShadow: `0 20px 40px -10px rgba(0,0,0,0.8)`
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
          <div style={{ background: "rgba(196,222,78,0.2)", padding: "0.8rem", borderRadius: "50%", display: "inline-flex" }}>
            <PiggyBank size={32} color={T.lime} />
          </div>
        </div>
        
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginTop: "0.5rem" }}>Tu hucha real acumulada</div>
        <div style={{ ...fontDisplay, color: T.lime, fontSize: "3rem", fontWeight: 800, margin: "0.3rem 0", textShadow: "0 0 20px rgba(196,222,78,0.4)" }}>
          {fmtEUR(animatedPiggy)}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem", maxWidth: "400px", margin: "1.5rem auto 0" }}>
          <div style={{ flex: 1 }}>
            <MoneyInput value={newPurchase} onChange={setNewPurchase} placeholder="Ej. 4,50" />
          </div>
          <button onClick={addRealPurchase} aria-label="Añadir redondeo" style={{ background: T.lime, border: "none", borderRadius: "0.8rem", padding: "0 1.2rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Plus size={22} color="#12200A" />
          </button>
        </div>

        {history.length > 0 && (
          <div className="flex flex-col gap-2 mt-6 text-left" style={{ maxHeight: "180px", overflowY: "auto", paddingRight: "4px" }}>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Últimos movimientos
            </div>
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.05)` }}
              >
                <div style={{ ...fontBody, fontSize: "0.85rem", color: T.text }}>
                  Compra de <span style={{ fontWeight: 600 }}>{fmtEUR(item.amount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ ...fontBody, fontSize: "0.85rem", color: T.lime, fontWeight: 600 }}>
                    +{fmtEUR(item.roundUp)}
                  </span>
                  <button
                    onClick={() => removePurchase(item.id)}
                    aria-label="Eliminar movimiento"
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center", opacity: 0.6 }}
                  >
                    <X size={16} color={T.text} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {piggyBank > 0 && (
          <button
            onClick={resetPiggyBank}
            style={{ ...fontBody, background: "transparent", border: "none", color: T.textMuted, fontSize: "0.75rem", cursor: "pointer", marginTop: "1rem", textDecoration: "underline" }}
          >
            Vaciar hucha completa
          </button>
        )}
      </div>

      <Card style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Sparkles size={16} color={T.lime} /> Estimación media (si mantienes el ritmo)
        </div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>{fmtEUR(monthly)} al mes · {fmtEUR(annual)} al año</div>
        <div style={{ width: "100%", height: "160px", marginTop: "0.6rem" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <XAxis type="number" hide domain={[0, "auto"]} />
              <YAxis type="category" dataKey="periodo" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.8rem" }} formatter={(v) => [fmtEUR(v), "Ahorro"]} />
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
          roundUpPerPurchase < 0.3
            ? "Con este importe medio, el redondeo a 1€ apenas suma. Prueba a redondear a 2€ o 5€ para notar más diferencia."
            : "Registra tus compras reales arriba para ver tu hucha crecer de verdad, con opción de revisar o eliminar cualquier entrada."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <SliderControl label="Compras por semana" value={purchasesPerWeek} min={0} max={30} step={1} unit="compras" onChange={setPurchasesPerWeek} />
          
          <div>
            <div style={{ ...fontBody, color: T.text, fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>Importe medio por compra</div>
            <div style={{ maxWidth: "200px" }}>
              <MoneyInput value={avgAmount} onChange={setAvgAmount} />
            </div>
          </div>
        </div>
      </Card>

      <AdSlot minHeight="0px" />
      <RelatedTools ids={["daily", "challenge"]} onNavigate={onNavigate} primaryId="daily" />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton getText={() => `Ahorro por redondeo: hucha real ${fmtEUR(piggyBank)}. Estimación redondeando a ${roundTo}€ con ${purchasesPerWeek} compras/semana → ${fmtEUR(monthly)}/mes.`} />
        <ExportCSVButton filename="ahorro-redondeo" getRows={() => [
          { concepto: "Hucha real acumulada", importe: piggyBank.toFixed(2) },
          { concepto: "Ahorro estimado semanal", importe: weekly.toFixed(2) },
          { concepto: "Ahorro estimado mensual", importe: monthly.toFixed(2) },
          { concepto: "Ahorro estimado anual", importe: annual.toFixed(2) },
        ]} />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          El ahorro por redondeo es una de las populares formas de ahorrar sin esfuerzo: cada vez que pagas, la diferencia hasta la cifra redonda más cercana se destina a tu ahorro. Además de la estimación con una media, puedes registrar tus compras reales una a una en tu historial, comprobar cada aportación y eliminar entradas individuales si te equivocas al introducirlas.
        </p>
      </div>
    </div>
  );
}

export default RoundUpTool;
