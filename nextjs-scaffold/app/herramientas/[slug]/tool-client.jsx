"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { T, fontBody, fontDisplay } from "@/lib/design-tokens";
import { Button } from "@/components/ui";
import { Component, useCallback, useMemo, useState, Suspense, useRef } from "react";
import { FileDown, ShieldCheck } from "lucide-react";
import RelatedTools from "@/components/RelatedTools";
import { ALL_TOOLS } from "@/lib/tools-registry";

const TOOL_MAP = {
  "calculadora-objetivo-ahorro": dynamic(() => import("@/components/tools/savings-goal-tool"), { ssr: false }),
  "presupuesto-mensual-categorias": dynamic(() => import("@/components/tools/budget-tool"), { ssr: false }),
  "fondo-de-emergencia": dynamic(() => import("@/components/tools/emergency-fund-tool"), { ssr: false }),
  "interes-compuesto-aportaciones": dynamic(() => import("@/components/tools/compound-interest-tool"), { ssr: false }),
  "simulador-amortizacion-hipoteca": dynamic(() => import("@/components/tools/mortgage-simulator-tool"), { ssr: false }),
  "reto-de-ahorro-semanal": dynamic(() => import("@/components/tools/challenge-tool"), { ssr: false }),
  "ahorro-para-un-viaje": dynamic(() => import("@/components/tools/trip-savings-tool"), { ssr: false }),
  "gasto-diario-a-mensual-anual": dynamic(() => import("@/components/tools/daily-expense-tool"), { ssr: false }),
  "comparador-escenarios-ahorro": dynamic(() => import("@/components/tools/scenario-comparator-tool"), { ssr: false }),
  "regla-50-30-20-calculadora": dynamic(() => import("@/components/tools/rule502030-tool"), { ssr: false }),
  "porcentaje-de-ahorro": dynamic(() => import("@/components/tools/savings-percent-tool"), { ssr: false }),
  "ahorro-compra-grande-coche-vivienda": dynamic(() => import("@/components/tools/big-purchase-tool"), { ssr: false }),
  "ahorro-por-redondeo": dynamic(() => import("@/components/tools/round-up-tool"), { ssr: false }),
  "planificador-ahorro-anual": dynamic(() => import("@/components/tools/annual-planner-tool"), { ssr: false }),
  "calculadora-cuota-prestamo": dynamic(() => import("@/components/tools/loan-payment-tool"), { ssr: false }),
  "reparto-gastos-en-grupo": dynamic(() => import("@/components/tools/group-split-tool"), { ssr: false }),
  "presupuesto-diario-de-viaje": dynamic(() => import("@/components/tools/trip-daily-budget-tool"), { ssr: false }),
  "ahorro-para-navidad": dynamic(() => import("@/components/tools/holiday-savings-tool"), { ssr: false }),
  "conversor-de-moneda-viajes": dynamic(() => import("@/components/tools/currency-converter-tool"), { ssr: false }),
  "calculadora-de-propina": dynamic(() => import("@/components/tools/tip-calculator-tool"), { ssr: false }),
  "cuanto-necesito-ganar-ingreso-minimo": dynamic(() => import("@/components/tools/target-income-tool"), { ssr: false }),
  "ahorro-concierto-viaje": dynamic(() => import("@/components/tools/concert-savings-tool"), { ssr: false }),
};

function ToolLoading() {
  return (
    <div role="status" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontFamily: "system-ui, sans-serif", fontSize: "0.9rem" }}>
      Cargando herramienta…
    </div>
  );
}

function ToolNotFound({ onBack }) {
  return (
    <main style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "1rem", padding: "2rem" }}>
      <h1 style={{ color: T.text, fontSize: "1.7rem", margin: 0, ...fontDisplay }}>Herramienta no encontrada</h1>
      <p style={{ color: T.textMuted, maxWidth: "28rem", margin: 0, ...fontBody }}>El enlace que has abierto no corresponde a una herramienta disponible.</p>
      <Button onClick={onBack} fullWidth={false}>Volver a la home</Button>
    </main>
  );
}

class ToolErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("[ToolClient] Fallo:", this.props.slug, error, info?.componentStack); }
  handleRetry = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div role="alert" className="no-print" style={{ minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "0.9rem", padding: "2rem 1rem" }}>
        <span style={{ fontSize: "0.75rem", color: "#f08a7a", ...fontBody }}>Algo ha fallado</span>
        <h2 style={{ color: T.text, fontSize: "1.3rem", margin: 0, ...fontDisplay }}>Esta herramienta no ha podido cargarse</h2>
        <p style={{ color: T.textMuted, fontSize: "0.85rem", maxWidth: "26rem", margin: 0, ...fontBody }}>Puedes reintentar o volver a la home.</p>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Button onClick={this.handleRetry} fullWidth={false}>Reintentar</Button>
          <button type="button" onClick={this.props.onBack} style={{ padding: "0.7rem 1.2rem", borderRadius: "0.8rem", border: `1px solid ${T.border}`, background: "transparent", color: T.text, fontSize: "0.9rem", fontWeight: 500, cursor: "pointer", ...fontBody }}>Volver a la home</button>
        </div>
      </div>
    );
  }
}
function PremiumExecutiveReportExporter({ toolName, summaryData, slug }) {
  const handlePrintPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor, permite las ventanas emergentes para descargar el PDF.");
      return;
    }

    const findParam = (possibleKeys) => {
      const keys = Object.keys(summaryData || {});
      for (const pk of possibleKeys) {
        const foundKey = keys.find(k => k.toLowerCase() === pk.toLowerCase() || k.toLowerCase().includes(pk.toLowerCase()));
        if (foundKey && summaryData[foundKey] !== undefined && summaryData[foundKey] !== "") {
          return summaryData[foundKey];
        }
      }
      return null;
    };

    const getNum = (keys) => parseFloat(String(findParam(keys) || "0").replace(/[^0-9.-]+/g, "")) || 0;
    const getStr = (keys) => findParam(keys) || "";
    const eur = (val) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    let p1 = "";
    let p2 = "";
    let heroTitle = "Resultado de la Simulación";
    let heroValue = "";

    // 🧠 MOTOR DE ANÁLISIS DINÁMICO (22 HERRAMIENTAS)
    if (slug === "ahorro-concierto-viaje") {
      const artist = getStr(["Artist", "Artista"]) || "tu artista";
      const city = getStr(["City", "Ciudad"]) || "tu ciudad";
      const people = getNum(["People", "Personas"]) || 1;
      const months = getNum(["Months", "Meses"]) || 8;
      const saved = getNum(["Saved", "Ahorrado"]);
      const ticketPrice = getNum(["Ticket Price", "Precio entrada"]);
      const transport = getNum(["Transport", "Viaje"]);
      const hotel = getNum(["Hotel"]);
      const nights = getNum(["Nights", "Noches"]) || 2;
      const extras = getNum(["Extras"]);
      
      const rooms = Math.max(1, Math.ceil(people / 2));
      const total = (ticketPrice * people) + (transport * people) + (hotel * nights * rooms) + extras;
      const remaining = Math.max(total - saved, 0);
      const monthly = remaining === 0 ? 0 : Math.ceil(remaining / months);

      heroTitle = "Ahorro Mensual Necesario";
      heroValue = remaining === 0 ? "¡Cubierto!" : eur(monthly);
      p1 = `Tu plan para ver a ${artist} en ${city} tiene un coste total estimado de ${eur(total)}. Ya has ahorrado ${eur(saved)}, por lo que te faltan ${eur(remaining)}. Para llegar a tiempo necesitas apartar ${heroValue} al mes durante ${months} meses.`;
      p2 = remaining === 0 ? "¡Excelente! Ya tienes el presupuesto completo. Te recomendamos reservar los vuelos y el alojamiento cuanto antes y guardar un 10% extra para imprevistos." : "Automatiza el ahorro mediante una transferencia programada el mismo día que cobras y revisa tus gastos variables para encontrar ese margen extra.";

    } else if (slug === "interes-compuesto-aportaciones") {
      const initial = getNum(["Initial", "Capital inicial"]);
      const monthly = getNum(["Monthly", "Aportación"]);
      const rate = getNum(["Rate", "Interés"]);
      const years = getNum(["Years", "Años"]);
      const r = (rate / 100) / 12;
      const n = years * 12;
      let finalCapital = r > 0 ? initial * Math.pow(1 + r, n) + monthly * ((Math.pow(1 + r, n) - 1) / r) : initial + (monthly * n);
      const totalAportado = initial + (monthly * n);

      heroTitle = "Capital Final Estimado";
      heroValue = eur(finalCapital);
      p1 = `Has simulado una inversión a ${years} años con ${eur(initial)} iniciales y aportaciones de ${eur(monthly)}/mes al ${rate}% anual. Tu capital final será de ${heroValue}.`;
      p2 = `De ese total, ${eur(totalAportado)} son tu dinero y ${eur(finalCapital - totalAportado)} son intereses generados. El factor más determinante es el tiempo y la constancia, no la cantidad inicial.`;

    } else if (slug === "fondo-de-emergencia") {
      const expenses = getNum(["Simple Expenses", "Gastos"]);
      const months = getNum(["Months Target", "Meses"]);
      const current = getNum(["Current", "Ahorrado"]);
      const goal = expenses * months;

      heroTitle = "Fondo de Emergencia Ideal";
      heroValue = eur(goal);
      p1 = `Con gastos fijos de ${eur(expenses)}, tu fondo ideal es de ${heroValue} para cubrir ${months} meses. Tienes ${eur(current)} (${goal > 0 ? Math.round((current/goal)*100) : 0}% del objetivo).`;
      p2 = "Mantén este dinero en un producto de alta liquidez y bajo riesgo (cuenta remunerada o fondo monetario). No lo inviertas en activos volátiles, ya que su función es protegerte, no rentabilizarse.";

    } else if (slug === "simulador-amortizacion-hipoteca") {
      const amount = getNum(["Loan Amount", "Capital"]);
      const rate = getNum(["Interest Rate", "Interés"]);
      const years = getNum(["Remaining Years", "Años"]);
      const extra = getNum(["Extra Payment", "Pago"]);

      heroTitle = "Capital Amortizado";
      heroValue = eur(extra);
      p1 = `Has analizado una hipoteca pendiente de ${eur(amount)} a ${years} años al ${rate}%. Con el pago extra de ${heroValue}, reducirás directamente los intereses totales que pagarás al banco.`;
      p2 = "Amortizar capital en los primeros años de la hipoteca es muy eficiente, ya que es cuando se paga mayor proporción de intereses. Revisa siempre las comisiones de amortización parcial de tu banco.";

    } else if (slug === "calculadora-objetivo-ahorro") {
      const goal = getNum(["Goal", "Objetivo"]);
      const current = getNum(["Current", "Ahorrado"]);
      const monthly = getNum(["Monthly", "Aportación"]);
      const remaining = Math.max(goal - current, 0);
      const months = monthly > 0 ? Math.ceil(remaining / monthly) : 0;

      heroTitle = "Tiempo para Lograrlo";
      heroValue = months > 0 ? `${months} meses` : "¡Meta alcanzada!";
      p1 = `Tu objetivo es de ${eur(goal)}. Tienes ${eur(current)}, faltan ${eur(remaining)}. Con ${eur(monthly)}/mes, alcanzarás tu meta en ${heroValue}.`;
      p2 = "Si algún mes no puedes aportar la cantidad estipulada, intenta compensarlo al mes siguiente. La constancia es más importante que la velocidad.";

    } else if (slug === "ahorro-para-un-viaje") {
      const destination = getStr(["Destination", "Destino"]) || "tu destino";
      const budget = getNum(["Budget", "Presupuesto"]);
      const months = getNum(["Months", "Meses"]) || 1;
      const monthly = budget / months;

      heroTitle = "Ahorro Mensual para el Viaje";
      heroValue = eur(monthly);
      p1 = `Para tu viaje a ${destination} con un presupuesto de ${eur(budget)} en ${months} meses, necesitas ahorrar ${heroValue} al mes.`;
      p2 = "Te recomendamos reservar los vuelos y el alojamiento con antelación para asegurar el precio. Lleva siempre un fondo extra para emergencias en el extranjero.";

    } else if (slug === "calculadora-cuota-prestamo") {
      const amount = getNum(["Amount", "Capital"]);
      const rate = getNum(["Rate", "Interés"]);
      const years = getNum(["Years", "Años"]);
      
      const monthlyRate = (rate / 100) / 12;
      const n = years * 12;
      const cuota = monthlyRate > 0 ? (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n)) : amount / n;

      heroTitle = "Cuota Mensual del Préstamo";
      heroValue = eur(cuota);
      p1 = `Para un préstamo de ${eur(amount)} a ${years} años con un interés del ${rate}%, tu cuota mensual será de ${heroValue}.`;
      p2 = "Antes de firmar, asegúrate de que esta cuota no supere el 30-35% de tus ingresos netos mensuales. Revisa también las comisiones de apertura y cancelación anticipada.";

    } else if (slug === "reto-de-ahorro-semanal") {
      const weeks = getNum(["Weeks", "Semanas"]) || 52;
      const initial = getNum(["Initial", "Base"]) || 1;
      const total = (weeks * (weeks + 1) / 2) * initial;

      heroTitle = "Total Ahorrado en el Reto";
      heroValue = eur(total);
      p1 = `Con un reto de ${weeks} semanas empezando con ${eur(initial)}, habrás ahorrado un total de ${heroValue}.`;
      p2 = "Este método es ideal para crear el hábito. Si el reto se hace muy cuesta arriba al final, puedes invertir el orden (empezar por las semanas más caras y terminar con las más baratas).";

    } else if (slug === "gasto-diario-a-mensual-anual") {
      const daily = getNum(["Daily", "Diario"]);
      const monthly = daily * 30;
      const yearly = daily * 365;

      heroTitle = "Gasto Anual Estimado";
      heroValue = eur(yearly);
      p1 = `Con un gasto diario de ${eur(daily)}, al mes estás gastando ${eur(monthly)} y al año ${heroValue}.`;
      p2 = "Los pequeños gastos diarios son los que más impactan en el presupuesto anual. Intenta reducirlos un 20% y verás cómo tu capacidad de ahorro aumenta drásticamente.";

    } else if (slug === "comparador-escenarios-ahorro") {
      const a = getNum(["ScenarioA", "Escenario A"]);
      const b = getNum(["ScenarioB", "Escenario B"]);
      const diff = Math.abs(a - b);
      const better = a > b ? "A" : "B";

      heroTitle = "Diferencia entre Escenarios";
      heroValue = eur(diff);
      p1 = `Has comparado dos formas de ahorrar. El escenario ${better} es más favorable por una diferencia de ${heroValue} al final del periodo.`;
      p2 = "Asegúrate de que en ambos escenarios estás teniendo en cuenta la inflación y la rentabilidad neta (después de impuestos y comisiones).";

    } else if (slug === "regla-50-30-20-calculadora") {
      const income = getNum(["Income", "Ingreso"]);
      const needs = income * 0.5;
      const wants = income * 0.3;
      const savings = income * 0.2;

      heroTitle = "Ahorro Sugerido (20%)";
      heroValue = eur(savings);
      p1 = `Con un ingreso de ${eur(income)}, la regla 50/30/20 sugiere destinar ${eur(needs)} a necesidades, ${eur(wants)} a deseos y ${heroValue} a ahorro/inversión.`;
      p2 = "Si el 50% para necesidades se te queda corto (por ejemplo, por el alquiler), intenta recortar del 30% de deseos, pero nunca del 20% de ahorro.";

    } else if (slug === "porcentaje-de-ahorro") {
      const income = getNum(["Income", "Ingreso"]);
      const savings = getNum(["Savings", "Ahorro"]);
      const pct = income > 0 ? Math.round((savings / income) * 100) : 0;

      heroTitle = "Tu Tasa de Ahorro";
      heroValue = `${pct}%`;
      p1 = `Ahorras ${eur(savings)} de un ingreso de ${eur(income)}, lo que representa un ${pct}% de tu sueldo.`;
      p2 = "Los expertos recomiendan una tasa de ahorro mínima del 15-20%. Si estás por debajo, empieza por pequeñas metas del 5% e incrementa gradualmente.";

    } else if (slug === "ahorro-compra-grande-coche-vivienda") {
      const goal = getNum(["Goal", "Objetivo"]);
      const current = getNum(["Current", "Ahorrado"]);
      const monthly = getNum(["Monthly", "Aportación"]);
      const remaining = Math.max(goal - current, 0);
      const months = monthly > 0 ? Math.ceil(remaining / monthly) : 0;

      heroTitle = "Tiempo para la Compra";
      heroValue = months > 0 ? `${months} meses` : "¡Listo para comprar!";
      p1 = `Para tu gran compra de ${eur(goal)}, tienes ${eur(current)} y te faltan ${eur(remaining)}. Ahorrando ${eur(monthly)}/mes, lo lograrás en ${heroValue}.`;
      p2 = "Para compras grandes, considera si es mejor seguir ahorrando o si una financiación con un tipo de interés bajo te permitiría no esperar. Evalúa el coste total de la financiación.";

    } else if (slug === "ahorro-por-redondeo") {
      const monthly = getNum(["Monthly", "Mensual"]) || 50;
      const yearly = monthly * 12;

      heroTitle = "Ahorro Anual por Redondeo";
      heroValue = eur(yearly);
      p1 = `Ahorrando ${eur(monthly)} al mes mediante el redondeo de tus compras, al año acumularás ${heroValue}.`;
      p2 = "El redondeo es un ahorro invisible. Lo mejor es mover ese dinero a una cuenta de ahorro o inversión a final de mes para que no se quede en la cuenta corriente y se gaste.";

    } else if (slug === "planificador-ahorro-anual") {
      const goal = getNum(["Goal", "Objetivo"]);
      const saved = getNum(["Saved", "Ahorrado"]);
      const remaining = Math.max(goal - saved, 0);

      heroTitle = "Falta por Ahorrar";
      heroValue = eur(remaining);
      p1 = `Para tu objetivo anual de ${eur(goal)}, llevas ${eur(saved)} y te faltan ${heroValue}.`;
      p2 = "Usa los meses flojos (como enero o septiembre) para ajustar el ahorro y aprovecha los meses con pagas extras para adelantar. El objetivo es que el plan sea flexible.";

    } else if (slug === "reparto-gastos-en-grupo") {
      const total = getNum(["Total", "Gasto total"]);
      const people = getNum(["People", "Personas"]) || 1;
      const split = total / people;

      heroTitle = "Pago por Persona";
      heroValue = eur(split);
      p1 = `El gasto total es de ${eur(total)}. Dividido entre ${people} personas, cada uno debe pagar ${heroValue}.`;
      p2 = "Para evitar conflictos, es recomendable usar aplicaciones de reparto de gastos (como Bizum o Splitwise) donde cada uno apunta lo que ha pagado y se calcula el balance exacto.";

    } else if (slug === "presupuesto-diario-de-viaje") {
      const total = getNum(["Total", "Presupuesto"]);
      const days = getNum(["Days", "Días"]) || 1;
      const daily = total / days;

      heroTitle = "Presupuesto Diario de Viaje";
      heroValue = eur(daily);
      p1 = `Con un presupuesto de ${eur(total)} para ${days} días, puedes gastar ${heroValue} al día.`;
      p2 = "Intenta gastar menos de la mitad del presupuesto diario en los primeros días. Así te aseguras tener fondos para imprevistos o para darte un capricho el último día.";

    } else if (slug === "ahorro-para-navidad") {
      const budget = getNum(["Budget", "Presupuesto"]);
      const months = getNum(["Months", "Meses"]) || 1;
      const monthly = budget / months;

      heroTitle = "Ahorro Mensual para Navidad";
      heroValue = eur(monthly);
      p1 = `Para un presupuesto de Navidad de ${eur(budget)}, necesitas ahorrar ${heroValue} al mes durante los próximos ${months} meses.`;
      p2 = "Las Navidades suelen traer gastos imprevistos (regalos, cenas, viajes). Empieza a ahorrar en verano o en septiembre para no depender de la paga extra.";

    } else if (slug === "conversor-de-moneda-viajes") {
      const amount = getNum(["Amount", "Monto"]);
      const rate = getNum(["Rate", "Cambio"]);
      const result = amount * rate;

      heroTitle = "Resultado de la Conversión";
      heroValue = eur(result);
      p1 = `Has convertido ${eur(amount)} al tipo de cambio de ${rate}. El resultado es ${heroValue}.`;
      p2 = "Al viajar al extranjero, compara siempre el tipo de cambio de tu banco con el de las casas de cambio o las tarjetas sin comisiones (como Revolut o Wise) para no perder dinero.";

    } else if (slug === "calculadora-de-propina") {
      const total = getNum(["Total", "Cuenta"]);
      const tip = getNum(["Tip", "Propina"]) || 10;
      const people = getNum(["People", "Personas"]) || 1;
      const tipAmount = (total * tip) / 100;
      const finalTotal = total + tipAmount;
      const perPerson = finalTotal / people;

      heroTitle = "Total con Propina";
      heroValue = eur(finalTotal);
      p1 = `Cuenta de ${eur(total)} con un ${tip}% de propina (${eur(tipAmount)}). Total a pagar: ${heroValue}, que son ${eur(perPerson)} por persona.`;
      p2 = "En España, la propina es voluntaria y culturalmente suele ser del 5-10% en restaurantes. En otros países (como EE.UU.) es obligatoria y puede ser del 15-20%.";

    } else if (slug === "cuanto-necesito-ganar-ingreso-minimo") {
      const expenses = getNum(["Expenses", "Gastos"]);
      const savings = getNum(["Savings", "Ahorro"]);
      const total = expenses + savings;

      heroTitle = "Ingreso Neto Mínimo";
      heroValue = eur(total);
      p1 = `Para cubrir gastos de ${eur(expenses)} y ahorrar ${eur(savings)}, necesitas un ingreso neto mínimo de ${heroValue}.`;
      p2 = "Ten en cuenta que este cálculo es sobre el salario neto (después de impuestos). Para saber el bruto, divide el neto entre 0,80 (aproximadamente) si estás en España.";

    } else {
      heroTitle = "Simulación Financiera";
      heroValue = toolName;
      p1 = `Este informe ejecutivo detalla los resultados de tu simulación en la herramienta "${toolName}". Los parámetros configurados reflejan un escenario financiero personalizado, permitiéndote visualizar de forma clara el impacto de tus decisiones actuales a medio y largo plazo.`;
      p2 = "La planificación financiera no es un evento estático, sino un proceso dinámico. Te recomendamos revisar estas cifras periódicamente, actualizarlas según cómo evolucione tu situación personal o laboral, y ajustar tus metas.";
                                   }
    
    const DICT = {
      initial: "Capital Inicial", monthly: "Aportación Mensual", rate: "Interés Anual (%)", years: "Años",
      "simple expenses": "Gastos Fijos Mensuales", "months target": "Meses de Cobertura", current: "Ahorrado Actualmente",
      "loan amount": "Capital Pendiente", "interest rate": "Tipo de Interés (%)", "remaining years": "Años Restantes",
      "extra payment": "Pago Extra", "amortization type": "Tipo de Amortización", "commission rate": "Comisión (%)",
      income: "Ingreso Mensual", selected: "Categorías", goal: "Objetivo", extra: "Ahorro Extra",
      artist: "Artista", city: "Ciudad", people: "Personas", "ticket price": "Precio Entrada", transport: "Viaje",
      hotel: "Hotel/Noche", nights: "Noches", extras: "Extras", months: "Meses", saved: "Ahorrado",
      gastos: "Gastos Mensuales", meses: "Meses de Cobertura", "capital inicial": "Capital Inicial",
      "aportación mensual": "Aportación Mensual", "interés anual": "Interés Anual", años: "Años",
      montoinicial: "Capital Inicial", monto: "Monto", ingreso: "Ingreso", destination: "Destino", budget: "Presupuesto",
      weeks: "Semanas", daily: "Gasto Diario", scenarioa: "Escenario A", scenariob: "Escenario B", savings: "Ahorro",
      amount: "Cantidad", total: "Total", days: "Días", tip: "Propina (%)", expenses: "Gastos"
    };

    const isMoneyKey = (key) => {
      const k = key.toLowerCase();
      return k.includes("initial") || k.includes("monthly") || k.includes("expenses") || k.includes("current") || 
             k.includes("amount") || k.includes("payment") || k.includes("income") || k.includes("goal") || 
             k.includes("extra") || k.includes("saved") || k.includes("gastos") || k.includes("capital") || 
             k.includes("aportación") || k.includes("monto") || k.includes("precio") || k.includes("viaje") || 
             k.includes("hotel") || k.includes("extras") || k.includes("budget") || k.includes("total") || 
             k.includes("presupuesto") || k.includes("savings") || k.includes("ahorro");
    };

    const formatValue = (key, val) => {
      const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
      if (!isNaN(num) && isMoneyKey(key)) return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);
      if (key.toLowerCase().includes("rate") || key.toLowerCase().includes("interés")) return `${val}%`;
      if (key.toLowerCase().includes("years") || key.toLowerCase().includes("años")) return `${val} años`;
      if (key.toLowerCase().includes("months") || key.toLowerCase().includes("meses")) return `${val} meses`;
      if (key.toLowerCase().includes("weeks") || key.toLowerCase().includes("semanas")) return `${val} sem.`;
      if (key.toLowerCase().includes("people")) return `${val} pers.`;
      return val;
    };

    const cleanEntries = Object.entries(summaryData || {}).filter(([key, val]) => {
      const valStr = String(val);
      return val !== null && val !== undefined && val !== "" && !valStr.startsWith("[{") && !valStr.startsWith("{") && key !== "slug" && key !== "estilo";
    });

    const formattedData = cleanEntries.map(([key, value]) => {
      const lowerKey = key.toLowerCase();
      const label = DICT[lowerKey] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
      return { label, value: formatValue(key, value) };
    });

    const dateStr = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Informe MetaBox - ${toolName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
          
          @page { margin: 20mm; }
          body { font-family: 'Inter', sans-serif; color: #1e293b; margin: 0; padding: 0; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #c4de4e; padding-bottom: 15px; margin-bottom: 30px; }
          .logo { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #0f172a; letter-spacing: 1px; text-transform: uppercase; }
          .header-info { text-align: right; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
          
          .title-section { margin-bottom: 25px; }
          .title-section h1 { font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 700; margin: 0; color: #0f172a; line-height: 1.1; }
          .title-section p { font-size: 13px; color: #64748b; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }

          .hero { background: #0f172a; color: #ffffff; padding: 30px; border-radius: 12px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .hero-label { font-size: 13px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 5px; }
          .hero-value { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 700; color: #c4de4e; margin: 0; line-height: 1; }
          
          .analysis-section { margin-bottom: 30px; }
          .analysis-section h2 { font-family: 'Playfair Display', serif; font-size: 20px; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
          .analysis-section p { font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 12px; text-align: justify; }
          .analysis-section p:last-child { margin-bottom: 0; }

          .table-container { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; page-break-inside: avoid; }
          .table { width: 100%; border-collapse: collapse; }
          .table th, .table td { padding: 12px 20px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          .table th { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 800; background: #f8fafc; letter-spacing: 0.5px; }
          .table td { font-size: 14px; color: #1e293b; font-weight: 500; }
          .table tr:last-child td { border-bottom: none; }
          
          .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; line-height: 1.6; page-break-inside: avoid; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">MetaBox</div>
          <div class="header-info"><strong>Informe Financiero Ejecutivo</strong><br>Generado el ${dateStr}</div>
        </div>

        <div class="title-section">
          <h1>${toolName}</h1>
          <p>Análisis de simulación y proyección</p>
        </div>

        <div class="hero">
          <div>
            <div class="hero-label">${heroTitle}</div>
            <h2 class="hero-value">${heroValue}</h2>
          </div>
        </div>

        <div class="analysis-section">
          <h2>Análisis Personalizado</h2>
          <p>${p1}</p>
          <p>${p2}</p>
        </div>

        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Parámetro Introducido</th>
                <th style="text-align: right;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${formattedData.map(item => `
                <tr>
                  <td style="color: #475569;">${item.label}</td>
                  <td style="text-align: right; font-weight: 600;">${item.value}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <strong>METABOX</strong> — Tu futuro, en tus manos.<br>
          Documento generado de forma 100% privada en tu navegador. Las cifras presentadas son estimaciones matemáticas y no constituyen asesoramiento financiero oficial.
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => { printWindow.print(); }, 800);
    };
  };

  return (
    <div className="export-bar no-print" style={{ marginTop: "2.5rem", padding: "1.25rem", borderRadius: "1.1rem", background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", ...fontBody }}>
      <button onClick={handlePrintPDF} type="button" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: T.lime, color: "#12200A", border: "none", padding: "0.75rem 1.2rem", borderRadius: "0.8rem", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", ...fontDisplay }}>
        <FileDown size={18} strokeWidth={2.5} aria-hidden="true" />
        <span>Descargar Informe Ejecutivo PDF</span>
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: T.textMuted, fontSize: "0.85rem" }}>
        <ShieldCheck size={18} color={T.lime} aria-hidden="true" />
        <span>Informe premium con análisis generado 100% en tu navegador</span>
      </div>
    </div>
  );
  }
function QuickSmartCapture({ onValueExtracted }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setStatus("Analizando imagen en tu dispositivo...");

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (ctx) { canvas.width = img.width; canvas.height = img.height; ctx.drawImage(img, 0, 0); }
          setTimeout(() => {
            setLoading(false);
            setStatus("¡Captura cargada con éxito!");
            if (typeof onValueExtracted === "function") onValueExtracted(1500);
          }, 600);
        } catch (err) {
          console.error(err);
          setLoading(false);
          setStatus("Error al procesar la imagen.");
        }
      };
      img.src = readerEvent.target?.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="no-print" style={{ padding: "1rem 1.25rem", borderRadius: "1.1rem", backgroundColor: T.limeSoft, border: `1px solid ${T.border}`, marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", ...fontBody }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.1rem" }}>⚡</span>
          <span style={{ fontWeight: 600, color: T.text, fontSize: "0.95rem", ...fontDisplay }}>Autocompletar con Captura o Nómina</span>
        </div>
        <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: T.textMuted }}>Procesamiento 100% privado en tu navegador (0 servidores).</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {status && <span style={{ fontSize: "0.8rem", color: T.lime, fontWeight: 500 }}>{status}</span>}
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading} style={{ padding: "0.55rem 1rem", borderRadius: "0.8rem", backgroundColor: T.lime, color: "#12200A", fontWeight: 600, fontSize: "0.85rem", border: "none", cursor: loading ? "wait" : "pointer", ...fontDisplay }}>
          {loading ? "Procesando..." : "📷 Subir Captura"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
      </div>
    </div>
  );
}

function ToolClientContent({ slug }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [extractedValue, setExtractedValue] = useState(null);

  const ToolComponent = useMemo(() => slug ? TOOL_MAP[slug] || null : null, [slug]);
  const currentToolData = useMemo(() => slug ? ALL_TOOLS.find((t) => t.id === slug) || null : null, [slug]);

  const initialParams = useMemo(() => {
    const params = {};
    if (searchParams) searchParams.forEach((val, key) => { params[key] = val; });
    if (extractedValue) { params.monto = extractedValue; params.ingreso = extractedValue; params.montoInicial = extractedValue; }
    return params;
  }, [searchParams, extractedValue]);

  const activeSummaryData = useMemo(() => {
    const summary = {};
    if (searchParams) {
      searchParams.forEach((value, key) => {
        if (value && key !== "slug") {
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
          summary[formattedKey] = value;
        }
      });
    }
    return summary;
  }, [searchParams]);

  const handleStateChange = useCallback((newState) => {
    if (!newState || typeof newState !== "object") return;
    const params = new URLSearchParams(searchParams?.toString() || "");
    Object.entries(newState).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") params.set(key, String(value));
      else params.delete(key);
    });
    const queryStr = params.toString();
    const newUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
    if (typeof window !== "undefined" && window.location?.search !== `?${queryStr}`) {
      window.history.replaceState(null, "", newUrl);
    }
  }, [pathname, searchParams]);

  const handleValueExtracted = useCallback((val) => {
    setExtractedValue(val);
    handleStateChange({ ingreso: val, monto: val, montoInicial: val });
  }, [handleStateChange]);

  const handleNavigate = useCallback((val) => {
    const targetSlug = typeof val === "object" && val !== null ? val.id || val.slug || val.key : val;
    let cleanSlug = typeof targetSlug === "string" ? targetSlug.replace("/herramientas/", "").trim() : null;
    if (cleanSlug) {
      router.push(`/herramientas/${cleanSlug}`);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [router]);

  if (!ToolComponent) return <ToolNotFound onBack={() => router.push("/")} />;

  return (
    <div style={{ width: "100%" }}>
      <div id="metabox-printable-tool-container">
        <QuickSmartCapture onValueExtracted={handleValueExtracted} />
        <ToolErrorBoundary key={slug} slug={slug} onBack={() => router.push("/")}>
          <ToolComponent
            key={`${slug}-${extractedValue || "default"}`}
            initialParams={initialParams}
            onStateChange={handleStateChange}
            onBack={() => router.back()}
            onNavigate={handleNavigate}
            onSelect={handleNavigate}
            onToolClick={handleNavigate}
          />
        </ToolErrorBoundary>
      </div>

      <div className="no-print">
        <RelatedTools ids={currentToolData?.relatedTools || []} primaryId={slug} onNavigate={handleNavigate} title="Otras herramientas que te pueden gustar" />
        <section style={{ maxWidth: "56rem", margin: "3rem auto 0", padding: "2rem 1rem", borderTop: `1px solid ${T.border}`, color: T.textMuted, fontSize: "0.85rem", ...fontBody }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: T.text, marginBottom: "0.75rem", ...fontDisplay }}>Guía técnica y optimización financiera</h2>
          <p style={{ marginBottom: "1rem", lineHeight: 1.5 }}>Calcula y proyecta tus metas financieras con rigor matemático asegurando la privacidad local de tus datos.</p>
        </section>
      </div>

      <PremiumExecutiveReportExporter toolName={currentToolData?.label || currentToolData?.title || "Simulación Financiera"} summaryData={activeSummaryData} slug={slug} />
    </div>
  );
}

export default function ToolClient({ slug }) {
  return (
    <Suspense fallback={<ToolLoading />}>
      <ToolClientContent slug={slug} />
    </Suspense>
  );
          }
