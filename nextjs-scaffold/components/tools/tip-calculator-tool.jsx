"use client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { X, Plus, Users, Receipt } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { useAnimatedNumber, fmtEUR } from "@/lib/hooks";
import { Card, Chip, AdviceBlock, SliderControl } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

const FAQS = [
  {
    q: "¿Cuánto es habitual dejar de propina en un restaurante?",
    a: "En España no existe una norma fija, pero suele rondar entre el 5% y el 10% de la cuenta por un buen servicio; en otros países como Estados Unidos la propina esperada es mucho más alta.",
  },
  {
    q: "¿Cómo se reparte la cuenta con propina entre varias personas?",
    a: "Por defecto se divide a partes iguales, pero también puedes repartirla según lo que consumió cada persona, para que quien pidió más caro pague proporcionalmente más.",
  },
];

// Slider de dinero con input
function MoneySlider({ label, value, setValue, min = 0, max = 10000, step = 1, accent = "lime" }) {
  const [textVal, setTextVal] = useState(String(value ?? 0));
  const accentColor = accent === "lavender" ? T.lavender : T.lime;

  useEffect(() => {
    if (value !== parseFloat(textVal.replace(",", "."))) {
      setTextVal(String(value ?? 0));
    }
  }, [value]);

  const handleInputChange = (e) => {
    const raw = e.target.value;
    setTextVal(raw);
    const parsed = parseFloat(raw.replace(",", "."));
    if (!isNaN(parsed)) setValue(parsed);
  };

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setValue(val);
    setTextVal(String(val));
  };

  const safeValue = isNaN(value) ? 0 : Math.max(min, Math.min(value, max));

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
              if (isNaN(parsed)) setTextVal(String(value ?? 0));
              else { setValue(parsed); setTextVal(String(parsed)); }
            }}
            className="bg-transparent text-right font-semibold"
            style={{ ...fontBody, color: accentColor, fontSize: "0.95rem", width: "85px", outline: "none" }}
          />
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>€</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeValue}
        onChange={handleSliderChange}
        className="w-full cursor-pointer h-1.5 rounded-lg appearance-none bg-[var(--surface-alt,rgba(255,255,255,0.1))]"
        style={{ accentColor }}
      />
    </div>
  );
}

// Input simple para los consumos
function SimpleMoneyInput({ value, onChange }) {
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
    <div style={{ display: "flex", alignItems: "center", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.8rem", padding: "0.5rem 0.8rem", flex: 1 }}>
      <input
        type="text"
        inputMode="decimal"
        value={textVal}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="bg-transparent text-right font-semibold"
        style={{ ...fontBody, color: T.text, fontSize: "0.9rem", width: "100%", outline: "none" }}
      />
      <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", marginLeft: "4px" }}>€</span>
    </div>
  );
}
function TipCalculatorTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const [bill, setBill] = useState(() => {
    const p = initialParams?.bill;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 45;
  });

  const [tipPct, setTipPct] = useState(() => {
    const p = initialParams?.tipPct;
    return p !== undefined && !isNaN(parseFloat(p)) ? parseFloat(p) : 10;
  });

  const [people, setPeople] = useState(() => {
    const p = initialParams?.people;
    return p !== undefined && !isNaN(parseInt(p, 10)) ? parseInt(p, 10) : 2;
  });

  const [byConsumption, setByConsumption] = useState(() => {
    return initialParams?.byConsumption === "true";
  });

  const [consumers, setConsumers] = useState(() => {
    const p = initialParams?.consumers;
    if (p) {
      try {
        const parsed = JSON.parse(p);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { id: "1", name: "Persona 1", amount: 22.5 },
      { id: "2", name: "Persona 2", amount: 22.5 },
    ];
  });

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        bill,
        tipPct,
        people,
        byConsumption: byConsumption ? "true" : null,
        consumers: byConsumption && consumers.length > 0 ? JSON.stringify(consumers) : null,
      });
    }
  }, [bill, tipPct, people, byConsumption, consumers, onStateChange]);

  const safeBill = Number.isFinite(bill) ? bill : 0;
  const safeTipPct = Number.isFinite(tipPct) ? tipPct : 0;
  const safePeople = Number.isFinite(people) && people > 0 ? people : 1;

  const tipAmount = safeBill * (safeTipPct / 100);
  const total = safeBill + tipAmount;
  const perPerson = total / safePeople;
  const animatedTotal = useAnimatedNumber(total);
  const animatedPerPerson = useAnimatedNumber(perPerson);

  const consumersTotal = consumers.reduce((sum, c) => sum + (c.amount || 0), 0);

  const updateConsumer = (id, amount) => {
    setConsumers((prev) => prev.map((c) => (c.id === id ? { ...c, amount } : c)));
  };
  const updateConsumerName = (id, name) => {
    setConsumers((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  };
  const addConsumer = () => {
    setConsumers((prev) => [...prev, { id: `${Date.now()}`, name: `Persona ${prev.length + 1}`, amount: 0 }]);
  };
  const removeConsumer = (id) => {
    if (consumers.length <= 2) return;
    setConsumers((prev) => prev.filter((c) => c.id !== id));
  };

  const consumerShare = (amount) => {
    if (consumersTotal === 0) return 0;
    const proportion = amount / consumersTotal;
    return safeBill * proportion + tipAmount * proportion;
  };

  const pageTitle = "Calculadora de propina y reparto de cuenta entre amigos | MetaBox";
  const pageDescription = "Calcula la propina de un restaurante y reparte el total entre varias personas a partes iguales o según lo que consumió cada una. Gratis y sin registro.";
  
  // CORRECCIÓN CRÍTICA DE SEO
  const pageUrl = "https://metabox-web.vercel.app/herramientas/calculadora-de-propina";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="calculadora de propina, cuánto dejar de propina, dividir cuenta con propina entre amigos, reparto propina por consumo" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Calculadora de propina",
            url: pageUrl,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            inLanguage: "es",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            description: pageDescription,
          })}
        </script>
      </Helmet>

      <ToolHeader title="Calculadora de propina" subtitle="Añade la propina y reparte la cuenta sin hacer cuentas a mano." onBack={onBack} />

      {/* HERO CARD DIVIDIDO */}
      <div style={{
        background: `linear-gradient(145deg, rgba(196,222,78,0.05) 0%, rgba(10,18,20,1) 100%)`,
        borderRadius: "1.5rem",
        padding: "2rem 1.5rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${T.lime}30`,
        boxShadow: `0 20px 40px -10px rgba(0,0,0,0.8)`
      }}>
        <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "100%", background: T.lime, filter: "blur(100px)", opacity: 0.1, zIndex: 0 }} />
        
        <div style={{ position: "relative", zIndex: 1, borderRight: `1px solid ${T.border}` }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total con propina</div>
          <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.2rem", fontWeight: 800, marginTop: "0.3rem", textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
            {fmtEUR(animatedTotal)}
          </div>
        </div>
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{byConsumption ? "Personas" : "Por persona"}</div>
          <div style={{ ...fontDisplay, color: T.lavender, fontSize: "2.2rem", fontWeight: 800, marginTop: "0.3rem", textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
            {byConsumption ? consumers.length : fmtEUR(animatedPerPerson)}
          </div>
        </div>
      </div>

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Receipt size={16} color={T.lime} /> Composición del total
        </div>
        <div style={{ display: "flex", height: "24px", borderRadius: "999px", overflow: "hidden", background: T.surfaceAlt }}>
          <div style={{ width: `${total > 0 ? (safeBill / total) * 100 : 50}%`, background: T.textMuted, transition: "width 0.4s ease" }} />
          <div style={{ width: `${total > 0 ? (tipAmount / total) * 100 : 50}%`, background: T.lime, transition: "width 0.4s ease" }} />
        </div>
        <div className="flex justify-between mt-3 px-1">
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>Cuenta: <strong style={{ color: T.text }}>{fmtEUR(safeBill)}</strong></span>
          <span style={{ ...fontBody, color: T.lime, fontSize: "0.85rem" }}>Propina: <strong>{fmtEUR(tipAmount)}</strong></span>
        </div>
      </Card>

      <div className="flex gap-2 justify-center">
        <Chip label="Partes iguales" active={!byConsumption} onClick={() => setByConsumption(false)} />
        <Chip label="Según lo que pidió cada uno" active={byConsumption} onClick={() => setByConsumption(true)} />
      </div>

      {byConsumption && (
        <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={16} color={T.lavender} /> Lo que pidió cada uno
          </div>
          <div className="flex flex-col gap-3">
            {consumers.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <input
                  value={c.name}
                  onChange={(e) => updateConsumerName(c.id, e.target.value)}
                  style={{
                    ...fontBody, width: "6rem", background: T.surfaceAlt, border: `1px solid ${T.border}`,
                    borderRadius: "0.8rem", padding: "0.5rem 0.7rem", color: T.text, fontSize: "0.85rem", outline: "none", flexShrink: 0,
                  }}
                />
                <SimpleMoneyInput value={c.amount} onChange={(v) => updateConsumer(c.id, v)} />
                <div style={{ ...fontBody, color: T.lime, fontSize: "0.85rem", fontWeight: 700, width: "4.5rem", textAlign: "right", flexShrink: 0 }}>
                  {fmtEUR(consumerShare(c.amount))}
                </div>
                {consumers.length > 2 && (
                  <button onClick={() => removeConsumer(c.id)} aria-label={`Eliminar ${c.name}`} style={{ background: "transparent", border: "none", color: T.coral, cursor: "pointer", flexShrink: 0 }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addConsumer}
            style={{ ...fontBody, display: "flex", alignItems: "center", gap: "0.35rem", background: "transparent", border: `1px dashed ${T.border}`, borderRadius: "0.8rem", padding: "0.6rem", color: T.textMuted, fontSize: "0.85rem", cursor: "pointer", marginTop: "1rem", justifyContent: "center", width: "100%" }}
          >
            <Plus size={16} /> Añadir persona
          </button>
          
          {Math.abs(consumersTotal - safeBill) > 0.5 && (
            <div style={{ ...fontBody, color: T.coral, fontSize: "0.8rem", marginTop: "0.8rem", textAlign: "center", background: `${T.coral}15`, padding: "0.5rem", borderRadius: "0.5rem" }}>
              Lo pedido suma {fmtEUR(consumersTotal)}, pero la cuenta es {fmtEUR(safeBill)} — ajusta para que cuadre.
            </div>
          )}
        </Card>
      )}

      <AdviceBlock
        text={
          byConsumption
            ? "Este reparto es proporcional a lo que cada persona pidió, así que quien consumió más paga más — sin cálculos manuales."
            : safePeople > 1
            ? "El reparto es a partes iguales. Si alguien pidió mucho más caro, cambia a 'Según lo que pidió cada uno' arriba."
            : "Sube o baja el porcentaje según el servicio — no hay un porcentaje único correcto en todos los sitios."
        }
      />

      <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
        <div className="flex flex-col gap-6">
          <div className="flex gap-2 justify-center flex-wrap">
            {[5, 10, 15, 20].map((p) => (
              <Chip key={p} label={`${p}%`} active={safeTipPct === p} onClick={() => setTipPct(p)} />
            ))}
          </div>
          <MoneySlider label="Importe de la cuenta" value={bill} min={0} max={10000} step={1} accent="lime" setValue={setBill} />
          
          <div>
            <div style={{ ...fontBody, color: T.text, fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>Propina (%)</div>
            <SliderControl label="" value={tipPct} min={0} max={30} step={1} unit="%" onChange={setTipPct} accent="lavender" />
          </div>
          
          {!byConsumption && (
            <div>
              <div style={{ ...fontBody, color: T.text, fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>Personas</div>
              <SliderControl label="" value={people} min={1} max={15} step={1} unit="personas" onChange={setPeople} />
            </div>
          )}
        </div>
      </Card>

      <AdSlot minHeight="0px" />
      <RelatedTools ids={["groupsplit"]} onNavigate={onNavigate} />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopySummaryButton
          getText={() =>
            byConsumption
              ? `Cuenta ${fmtEUR(safeBill)} + propina ${safeTipPct}% = ${fmtEUR(total)}. Reparto por consumo: ` + consumers.map((c) => `${c.name} ${fmtEUR(consumerShare(c.amount))}`).join(", ")
              : `Cuenta ${fmtEUR(safeBill)} + propina ${safeTipPct}% = ${fmtEUR(total)} total, ${fmtEUR(perPerson)}/persona entre ${safePeople}.`
          }
        />
        <ExportCSVButton
          filename="calculadora-de-propina"
          getRows={() =>
            byConsumption
              ? consumers.map((c) => ({ persona: c.name, consumo: c.amount, total_con_propina: consumerShare(c.amount).toFixed(2) }))
              : [{ cuenta: safeBill, propina_pct: safeTipPct, propina_eur: tipAmount.toFixed(2), total: total.toFixed(2), personas: safePeople, por_persona: perPerson.toFixed(2) }]
          }
        />
      </div>

      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: "1.2rem" }}>
        <p>
          Calcular la propina y repartir la cuenta a mano al final de una cena en grupo suele acabar en discusiones. Esta calculadora reparte a partes iguales o, si lo prefieres, de forma proporcional a lo que pidió cada persona, para que nadie pague de más ni de menos.
        </p>
      </div>
    </div>
  );
}

export default TipCalculatorTool;
