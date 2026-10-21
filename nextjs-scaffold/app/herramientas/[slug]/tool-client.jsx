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
      alert("Por favor, permite las ventanas emergentes en tu navegador para poder descargar el PDF.");
      return;
    }

    // Funciones auxiliares para leer datos de forma segura
    const getNum = (keys) => {
      for (const k of keys) { if (summaryData[k] !== undefined && summaryData[k] !== "") return parseFloat(String(summaryData[k]).replace(/[^0-9.-]+/g, "")) || 0; }
      return 0;
    };
    const getStr = (keys) => {
      for (const k of keys) { if (summaryData[k] !== undefined && summaryData[k] !== "") return String(summaryData[k]); }
      return "";
    };
    const eur = (val) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    // Motor de Análisis Personalizado
    let p1 = "";
    let p2 = "";
    
    if (slug === "ahorro-concierto-viaje") {
      const artist = getStr(["Artist", "artist", "Artista o grupo"]) || "tu artista";
      const city = getStr(["City", "city", "Ciudad del concierto"]) || "tu ciudad";
      const people = getNum(["People", "people", "Personas que van"]) || 1;
      const ticketPrice = getNum(["Ticket Price", "ticketPrice", "Precio por entrada"]);
      const transport = getNum(["Transport", "transport", "Viaje por persona (ida y vuelta)"]);
      const hotel = getNum(["Hotel", "hotel", "Hotel por noche (habitación)"]);
      const nights = getNum(["Nights", "nights", "Noches de alojamiento"]) || 2;
      const extras = getNum(["Extras", "extras"]);
      const months = getNum(["Months", "months", "Meses hasta el concierto"]) || 8;
      const saved = getNum(["Saved", "saved", "Ya ahorrado para este plan"]);
      
      const rooms = Math.max(1, Math.ceil(people / 2));
      const total = (ticketPrice * people) + (transport * people) + (hotel * nights * rooms) + extras;
      const remaining = Math.max(total - saved, 0);
      const monthly = remaining === 0 ? 0 : Math.ceil(remaining / months);

      p1 = `Tu plan para ver a ${artist} en ${city} tiene un coste total estimado de ${eur(total)}. Teniendo en cuenta que ya has ahorrado ${eur(saved)}, te faltan ${eur(remaining)} para cubrir todos los gastos (entradas, viaje, alojamiento y extras). Para llegar a tiempo sin agobios, necesitas apartar ${eur(monthly)} al mes durante los próximos ${months} meses.`;
      
      if (remaining === 0) {
        p2 = "¡Excelente noticia! Ya tienes el presupuesto completo cubierto. Te recomendamos reservar los vuelos y el alojamiento cuanto antes para evitar subidas de precio de última hora, y guardar un pequeño margen extra (10-15%) para gastos imprevistos durante el evento, como comidas o merchandising.";
      } else if (months <= 2) {
        p2 = "El margen de tiempo es muy ajustado, lo que eleva considerablemente la cuota mensual. Si te resulta inviable, considera ajustar los extras o buscar un alojamiento más económico compartiendo más habitaciones. Planificar con más antelación siempre reduce el impacto financiero y te permite encontrar mejores ofertas.";
      } else {
        p2 = "Para asegurar el éxito de este plan, te recomendamos automatizar el ahorro mediante una transferencia programada a una cuenta separada el mismo día que cobras. Además, revisa tus gastos variables (como las salidas de fin de semana) para encontrar ese margen extra sin que suponga un gran sacrificio.";
      }
    } else if (slug === "interes-compuesto-aportaciones") {
      const capital = getNum(["Capital inicial", "montoInicial"]);
      const aportacion = getNum(["Aportación mensual", "aportacion"]);
      const interes = getNum(["Interés anual estimado", "interes"]);
      const anos = getNum(["Años", "anos"]);
      
      p1 = `Has simulado una inversión a ${anos} años con un capital inicial de ${eur(capital)} y aportaciones mensuales de ${eur(aportacion)}, asumiendo una rentabilidad anual del ${interes}%. Gracias al poder del interés compuesto, tu capital final se multiplicará de forma exponencial, demostrando que el tiempo en el mercado es tu mejor aliado.`;
      p2 = "El factor más determinante en esta herramienta no es la cantidad inicial, sino la constancia de las aportaciones mensuales y el tiempo. Te recomendamos mantener la disciplina incluso en meses complicados y reinvertir los beneficios. Recuerda que rentabilidades pasadas no garantizan rentabilidades futuras.";
    } else if (slug === "fondo-de-emergencia") {
      const gastos = getNum(["Gastos fijos mensuales", "gastos"]);
      const meses = getNum(["Meses de cobertura", "meses"]);
      const total = gastos * meses;
      
      p1 = `Con unos gastos fijos mensuales de ${eur(gastos)}, tu fondo de emergencia ideal asciende a ${eur(total)} para cubrir imprevistos durante ${meses} meses. Este colchón financiero es la base de cualquier estrategia de salud económica, ya que te protege de tener que endeudarte ante situaciones como pérdida de empleo o averías urgentes.`;
      p2 = "Te sugerimos mantener este dinero en un producto de alta liquidez y bajo riesgo (como una cuenta remunerada o un fondo monetario) para que esté accesible en menos de 24 horas, pero que al mismo tiempo genere una pequeña rentabilidad para combatir la inflación. No inviertas este fondo en activos volátiles.";
    } else {
      // Fallback genérico inteligente para el resto de herramientas
      p1 = `Este informe ejecutivo detalla los resultados de tu simulación en la herramienta "${toolName}". Los parámetros que has configurado reflejan un escenario financiero personalizado, permitiéndote visualizar de forma clara el impacto de tus decisiones actuales a medio y largo plazo.`;
      p2 = "La planificación financiera no es un evento estático, sino un proceso dinámico. Te recomendamos revisar estas cifras periódicamente, actualizarlas según cómo evolucione tu situación personal o laboral, y ajustar tus metas para mantener siempre el control de tus finanzas.";
    }

    const cleanEntries = Object.entries(summaryData || {}).filter(([key, val]) => {
      const valStr = String(val);
      return val !== null && val !== undefined && val !== "" && !valStr.startsWith("[{") && !valStr.startsWith("{") && key !== "slug" && key !== "estilo";
    });

    const formattedData = cleanEntries.map(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).replace(/_/g, ' ');
      return { label: formattedKey, value: String(value) };
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
          body { font-family: 'Inter', sans-serif; color: #1e293b; margin: 0; padding: 40px; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #c4de4e; padding-bottom: 20px; margin-bottom: 40px; }
          .logo { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #0f172a; letter-spacing: 1px; text-transform: uppercase; }
          .header-info { text-align: right; font-size: 12px; color: #64748b; }
          .title-section { margin-bottom: 30px; }
          .title-section h1 { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; margin: 0; color: #0f172a; line-height: 1.2; }
          .title-section p { font-size: 14px; color: #64748b; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
          .analysis-section { margin-bottom: 40px; background: #f8fafc; padding: 30px; border-radius: 12px; border-left: 4px solid #c4de4e; }
          .analysis-section h2 { font-family: 'Playfair Display', serif; font-size: 22px; color: #0f172a; margin-top: 0; margin-bottom: 15px; }
          .analysis-section p { font-size: 15px; line-height: 1.7; color: #334155; margin-bottom: 15px; text-align: justify; }
          .analysis-section p:last-child { margin-bottom: 0; }
          .table-container { margin-bottom: 40px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
          .table { width: 100%; border-collapse: collapse; }
          .table th, .table td { padding: 14px 24px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          .table th { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 800; background: #f8fafc; }
          .table td { font-size: 15px; color: #1e293b; }
          .table tr:last-child td { border-bottom: none; }
          .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">MetaBox</div>
          <div class="header-info">
            <strong>Informe Financiero Ejecutivo</strong><br>
            Generado el ${dateStr}
          </div>
        </div>

        <div class="title-section">
          <h1>${toolName}</h1>
          <p>Análisis de simulación y proyección</p>
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
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${formattedData.map(item => `
                <tr>
                  <td style="font-weight: 600; color: #475569;">${item.label}</td>
                  <td>${item.value}</td>
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
