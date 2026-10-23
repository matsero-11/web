"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, X, PiggyBank, Gift, Sparkles, PartyPopper } from "lucide-react";
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

const SUGGESTIONS = [
  { name: "Lotería", amount: 40 },
  { name: "Amigo invisible", amount: 20 },
  { name: "Cena de empresa", amount: 50 },
  { name: "Regalo pareja", amount: 100 },
];

function MoneyInput({ value, onChange, icon, width = "90px" }) {
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
    <div style={{ display: "flex", alignItems: "center", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.6rem", padding: "0.3rem 0.6rem", width: width, flexShrink: 0 }}>
      {icon && <div style={{ marginRight: "0.3rem", color: T.textMuted, display: "flex" }}>{icon}</div>}
      <input
        type="text"
        inputMode="decimal"
        value={textVal}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="bg-transparent text-right font-semibold"
        style={{ ...fontBody, color: T.lime, fontSize: "0.95rem", width: "100%", outline: "none" }}
      />
      <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", marginLeft: "2px" }}>€</span>
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
  
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, hover: false });

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

  const addGift = (name = newName, amount = 50) => {
    if (!name.trim()) return;
    setGifts((prev) => [...prev, { id: `${Date.now()}`, name: name.trim(), amount }]);
    setNewName("");
  };

  const removeGift = (id) => {
    setGifts((prev) => prev.filter((g) => g.id !== id));
  };

  const progressPct = budget > 0 ? Math.min((current / budget) * 100, 100) : 0;
  let levelText = "Novato Navideño";
  let levelIcon = <Gift size={14} />;
  if (progressPct >= 100) {
    levelText = "¡Santa Claus Profesional!";
    levelIcon = <PartyPopper size={14} color={T.lime} />;
  } else if (progressPct >= 50) {
    levelText = "Duende Ahorrador";
    levelIcon = <Sparkles size={14} color={T.lime} />;
  } else if (progressPct > 0) {
    levelText = "Aprendiz de Reno";
    levelIcon = <PiggyBank size={14} />;
  }

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x, y, hover: true });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, hover: false });
  };

  const pageTitle = "Calculadora de ahorro para Navidad con lista de regalos | MetaBox";
  const pageDescription = "Haz tu lista de regalos y gastos de Navidad, suma el presupuesto total automáticamente y calcula cuánto ahorrar cada mes hasta diciembre. Gratis y sin registro.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/ahorro-para-navidad";

  const tiltStyle = tilt.hover
    ? {
        transform: `perspective(1000px) rotateX(${-tilt.y * 15}deg) rotateY(${tilt.x * 15}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: "transform 0.1s ease-out",
      }
    : {
        transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
        transition: "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
      };

  const glareStyle = {
    position: "absolute",
    inset: 0,
    borderRadius: "1.2rem",
    pointerEvents: "none",
    background: tilt.hover
      ? `radial-gradient(circle at ${tilt.x * 100 + 50}% ${tilt.y * 100 + 50}%, rgba(255,255,255,0.15) 0%, transparent 60%)`
      : "none",
    transition: "background 0.1s ease-out",
    zIndex: 10,
  };

  const pieData = Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    value: 1,
    fill: i + 1 >= currentMonth ? T.lime : T.surfaceAlt,
  }));

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pt-4 pb-24 view-enter">
      <style>{`
        @keyframes float-christmas {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(10px, -15px) scale(1.1); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes snow-fall {
          0% { transform: translateY(-20px) translateX(0px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) translateX(20px) rotate(360deg); opacity: 0; }
        }
      `}</style>

      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
      </Helmet>

      <ToolHeader title="Ahorro para Navidad" subtitle="Haz tu lista de regalos y calculamos cuánto ahorrar al mes." onBack={onBack} />

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseLeave}
        style={{ ...tiltStyle, width: "100%", position: "relative", zIndex: 1 }}
      >
        <Card glow result style={{ textAlign: "center", paddingTop: "1.5rem", paddingBottom: "1.5rem", position: "relative", overflow: "hidden" }}>
          
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", opacity: 0.6, zIndex: 0 }}>
            <div style={{ position: "absolute", top: "10%", left: "20%", width: "60px", height: "60px", borderRadius: "50%", background: T.lime, filter: "blur(25px)", animation: "float-christmas 6s ease-in-out infinite" }} />
            <div style={{ position: "absolute", bottom: "20%", right: "15%", width: "80px", height: "80px", borderRadius: "50%", background: T.lavender, filter: "blur(30px)", animation: "float-christmas 8s ease-in-out infinite reverse" }} />
            <div style={{ position: "absolute", top: "40%", right: "30%", width: "40px", height: "40px", borderRadius: "50%", background: T.coral, filter: "blur(20px)", animation: "float-christmas 5s ease-in-out infinite 2s" }} />
          </div>

          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1, opacity: 0.5 }}>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: "4px",
                  height: "4px",
                  background: "#fff",
                  borderRadius: "50%",
                  top: "-10px",
                  left: `${(i * 10) + 5}%`,
                  animation: `snow-fall ${3 + (i % 3)}s linear infinite`,
                  animationDelay: `${i * 0.4}s`,
                }}
              />
            ))}
          </div>
          
          <div style={glareStyle} />

          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ height: "140px", position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius="68%"
                    outerRadius="95%"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={4}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
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
            <div style={{ ...fontDisplay, color: T.lime, fontSize: "2.6rem", fontWeight: 800, margin: "0.3rem 0", textShadow: "0 4px 12px rgba(196,222,78,0.3)" }}>
              {fmtEUR(animatedRequired)}
            </div>
          </div>
        </Card>
      </div>

      <div style={{ background: T.surfaceAlt, padding: "1rem", borderRadius: "1rem", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.9rem" }}>
          {levelIcon} {levelText}
        </div>
        <div style={{ flex: 1, minWidth: "150px", background: T.border, height: "8px", borderRadius: "4px", overflow: "hidden", position: "relative" }}>
          <div style={{ width: `${progressPct}%`, height: "100%", background: progressPct === 100 ? T.lime : `linear-gradient(90deg, ${T.lavender}, ${T.lime})`, transition: "width 0.3s ease" }} />
        </div>
        <div style={{ ...fontBody, color: progressPct === 100 ? T.lime : T.textMuted, fontWeight: 700, fontSize: "0.85rem" }}>
          {progressPct.toFixed(0)}%
        </div>
      </div>

      <AdviceBlock
        text={
          monthsLeft <= 2
            ? "Quedan pocos meses. Si el importe mensual aprieta, revisa tu lista de regalos y recorta las partidas menos prioritarias."
            : "Empezar pronto reparte mejor el esfuerzo. Automatizar esta cantidad cada mes evita tener que reunirla toda en diciembre."
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "1rem" }}>
            <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem" }}>Tu lista de Navidad</div>
            <div style={{ ...fontDisplay, color: T.lime, fontSize: "1.1rem", fontWeight: 700 }}>{fmtEUR(budget)}</div>
          </div>
          
          <div className="flex flex-col gap-2">
            {gifts.map((g) => (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: T.surfaceAlt, padding: "0.5rem", borderRadius: "0.8rem", border: `1px solid ${T.border}` }}>
                <input
                  value={g.name}
                  onChange={(e) => updateName(g.id, e.target.value)}
                  placeholder="Nombre"
                  style={{
                    ...fontBody, flex: 1, minWidth: 0, background: "transparent", border: "none",
                    padding: "0.2rem 0.4rem", color: T.text, fontSize: "0.9rem", outline: "none", fontWeight: 500
                  }}
                />
                <MoneyInput value={g.amount} onChange={(v) => updateAmount(g.id, v)} />
                <button
                  onClick={() => removeGift(g.id)}
                  aria-label={`Eliminar ${g.name}`}
                  style={{ 
                    background: "rgba(255, 100, 100, 0.1)", 
                    border: "none", 
                    color: T.coral, 
                    cursor: "pointer", 
                    width: "28px", 
                    height: "28px", 
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0 
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2" style={{ marginTop: "1rem" }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGift()}
              placeholder="Añadir (ej. Mamá)..."
              style={{
                ...fontBody, flex: 1, minWidth: 0, background: T.surface, border: `1px solid ${T.border}`, borderRadius: "0.7rem",
                padding: "0.65rem 0.9rem", color: T.text, fontSize: "0.9rem", outline: "none",
              }}
            />
            <button onClick={() => addGift()} aria-label="Añadir" style={{ background: T.lime, border: "none", borderRadius: "0.7rem", padding: "0.65rem 1rem", display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", flexShrink: 0, ...fontBody, fontWeight: 600, color: "#0a1214" }}>
              <Plus size={18} /> Añadir
            </button>
          </div>
          
          <div style={{ marginTop: "1rem" }}>
            <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem", marginBottom: "0.5rem" }}>Añadir rápido:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.name}
                  onClick={() => addGift(s.name, s.amount)}
                  style={{
                    ...fontBody, background: T.surface, border: `1px dashed ${T.border}`, borderRadius: "999px",
                    padding: "0.3rem 0.6rem", fontSize: "0.75rem", color: T.textMuted, cursor: "pointer",
                  }}
                >
                  + {s.name} ({s.amount}€)
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card style={{ paddingBottom: "1.2rem", paddingTop: "1.2rem" }}>
          <div className="flex flex-col gap-6">
            <div>
              <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.8rem" }}>Mes actual</div>
              {/* GRID DE MESES FORZADO */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                {MONTHS.map((m, i) => (
                  <Chip key={m} label={m} active={currentMonth === i + 1} onClick={() => setCurrentMonth(i + 1)} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
               <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.9rem" }}>Ya ahorrado</div>
               <MoneyInput value={current} onChange={setCurrent} icon={<PiggyBank size={16} />} width="100px" />
            </div>
          </div>
        </Card>
      </div>

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
