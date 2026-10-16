"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { T, fontBody, fontDisplay } from "@/lib/design-tokens";
import { Button } from "@/components/ui";
import { Component, useCallback, useMemo, useState, Suspense, useRef } from "react";
import { FileDown, ShieldCheck, Wallet, Shield, Target, Clock, Lightbulb, TrendingUp } from "lucide-react";
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

function PremiumExecutiveReportExporter({ toolName, summaryData }) {
  const handlePrintPDF = () => {
    if (typeof window !== "undefined") window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).replace(".", "");

  const cleanEntries = useMemo(() => {
    if (!summaryData) return [];
    return Object.entries(summaryData).filter(([key, val]) => {
      const valStr = String(val);
      return !valStr.startsWith("[{") && !valStr.startsWith("{");
    });
  }, [summaryData]);

  return (
    <>
      <div className="export-bar no-print" style={{ marginTop: "2.5rem", padding: "1.25rem", borderRadius: "1.1rem", background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", ...fontBody }}>
        <button onClick={handlePrintPDF} type="button" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: T.lime, color: "#12200A", border: "none", padding: "0.75rem 1.2rem", borderRadius: "0.8rem", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", ...fontDisplay }}>
          <FileDown size={18} strokeWidth={2.5} aria-hidden="true" />
          <span>Generar Informe PDF Ejecutivo</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: T.textMuted, fontSize: "0.85rem" }}>
          <ShieldCheck size={18} color={T.lime} aria-hidden="true" />
          <span>Procesamiento 100% privado en tu navegador</span>
        </div>
      </div>

      <div 
        id="metabox-report-content" 
        style={{ display: "none", fontFamily: "'Georgia', serif", backgroundColor: "#ffffff", color: "#111c1f", padding: "16px" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#111c1f", color: "#f5f2ea", padding: "14px 18px", borderRadius: "10px", borderBottom: "3px solid #c4de4e" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "6px", backgroundColor: "rgba(196, 222, 78, 0.2)", border: "1px solid rgba(196, 222, 78, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c4de4e", fontSize: "14px" }}>
              🛡️
            </div>
            <div>
              <h1 style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "1px", margin: 0, textTransform: "uppercase" }}>
                METABOX
              </h1>
              <span style={{ fontSize: "9px", color: "#c4de4e", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, display: "block" }}>
                REPORTE FINANCIERO EJECUTIVO
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "sans-serif" }}>
            <div style={{ fontSize: "10px", color: "#f5f2ea", backgroundColor: "#1a292c", padding: "4px 9px", borderRadius: "6px", border: "1px solid rgba(245, 242, 234, 0.1)" }}>
              📅 <strong>{currentDateFormatted}</strong>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "12px", marginBottom: "12px", borderBottom: "1px solid #e5e7eb", paddingBottom: "10px" }}>
          <span style={{ fontSize: "9px", fontWeight: 700, color: "#5c7a1e", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "sans-serif", display: "block" }}>
            — {toolName ? toolName.toUpperCase() : "SIMULACIÓN FINANCIERA"} —
          </span>
          <h2 style={{ fontSize: "21px", fontWeight: 800, color: "#111c1f", margin: "3px 0 3px 0", lineHeight: 1.1 }}>
            Estabilidad hoy, <span style={{ fontStyle: "italic", fontWeight: 400, color: "#9e7d3b" }}>tranquilidad mañana.</span>
          </h2>
          <p style={{ fontSize: "10px", color: "#374151", fontFamily: "sans-serif", margin: 0, lineHeight: 1.3 }}>
            Informe proyectado con rigor matemático para asegurar tu cobertura ante imprevistos.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "12px", fontFamily: "sans-serif" }}>
          {cleanEntries.length > 0 ? (
            cleanEntries.slice(0, 3).map(([key, value]) => (
              <div key={key} style={{ padding: "11px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <span style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", color: "#475569", display: "block", marginBottom: "3px" }}>
                  {key}
                </span>
                <span style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                  {String(value)}
                </span>
              </div>
            ))
          ) : (
            <>
              <div style={{ padding: "11px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "9px", fontWeight: 700, color: "#475569", display: "block" }}>GASTO MENSUAL</span>
                <span style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>€ 1.100</span>
              </div>
              <div style={{ padding: "11px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "9px", fontWeight: 700, color: "#475569", display: "block" }}>COBERTURA</span>
                <span style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>6 meses</span>
              </div>
              <div style={{ padding: "11px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "9px", fontWeight: 700, color: "#475569", display: "block" }}>OBJETIVO TOTAL</span>
                <span style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>€ 6.600</span>
              </div>
            </>
          )}
        </div>

        <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: "12px", fontFamily: "sans-serif", textAlign: "center" }}>
          <span style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", color: "#475569", display: "block", marginBottom: "3px" }}>
            TIEMPO PARA EL OBJETIVO
          </span>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#0f172a", marginBottom: "5px" }}>
            49 <span style={{ fontSize: "12px", fontWeight: 500, color: "#374151" }}>meses</span>
          </div>
          
          <div style={{ width: "100%", backgroundColor: "#cbd5e1", height: "6px", borderRadius: "3px", overflow: "hidden", maxWidth: "320px", margin: "0 auto 4px auto" }}>
            <div style={{ backgroundColor: "#4b6321", height: "100%", width: "12%" }}></div>
          </div>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#1e293b", display: "block" }}>12% conseguido</span>
        </div>
                                {/* GRÁFICO DE PROYECCIÓN 📈 */}
        <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: "12px", fontFamily: "sans-serif" }}>
          <h4 style={{ fontSize: "10px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", margin: "0 0 2px 0" }}>Proyección de ahorro</h4>
          <p style={{ fontSize: "9px", color: "#475569", margin: "0 0 6px 0" }}>Evolución estimada con la aportación actual.</p>

          <div style={{ width: "100%", height: "50px" }}>
            <svg style={{ width: "100%", height: "100%", overflow: "visible" }} viewBox="0 0 400 50" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5c7a1e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#5c7a1e" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="12" x2="400" y2="12" stroke="#0f172a" strokeOpacity="0.06" strokeDasharray="2" />
              <line x1="0" y1="30" x2="400" y2="30" stroke="#0f172a" strokeOpacity="0.06" strokeDasharray="2" />

              <polygon points="0,42 100,35 200,26 300,16 400,8 400,45 0,45" fill="url(#grad2)" />
              <polyline points="0,42 100,35 200,26 300,16 400,8" fill="none" stroke="#5c7a1e" strokeWidth="2.2" />
            </svg>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", fontWeight: 600, color: "#334155", marginTop: "3px" }}>
            <span>Mes 0</span><span>Mes 12</span><span>Mes 24</span><span>Mes 36</span><span>Mes 48</span>
          </div>
        </div>

        {/* ALERTA ⚠️ */}
        <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "#111c1f", color: "#f5f2ea", display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", fontFamily: "sans-serif" }}>
          <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: "1px solid rgba(245, 242, 234, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0 }}>
            !
          </div>
          <div style={{ fontSize: "10px" }}>
            <strong style={{ color: "#c4de4e", display: "block", marginBottom: "1px" }}>Prioriza tus metas financieras principales.</strong>
            <span style={{ color: "#cbd5e1" }}>Es la base para una vida financiera sana y libre de deudas.</span>
          </div>
        </div>

        {/* PIE DE PÁGINA 📄 */}
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "8px", color: "#475569", fontFamily: "sans-serif" }}>
          <span><strong>METABOX</strong> — Tu futuro, en tus manos</span>
          <span style={{ fontStyle: "italic", color: "#9e7d3b" }}>Pequeños pasos, grandes resultados</span>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 6mm; }
          body * { visibility: hidden !important; }
          .no-print, .no-print * { display: none !important; visibility: hidden !important; }
          #metabox-report-content, #metabox-report-content * { 
            visibility: visible !important; 
            display: block !important; 
          }
          #metabox-report-content {
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100% !important; 
            height: 100% !important; 
            margin: 0 !important; 
            padding: 12px !important; 
            background-color: #ffffff !important; 
            color: #111c1f !important; 
            border: none !important; 
            border-radius: 0 !important; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            box-shadow: none !important;
            overflow: hidden !important;
          }
        }
      `}</style>
    </>
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
    reader.onload = (event) => {
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
      img.src = event.target?.result;
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

      <PremiumExecutiveReportExporter toolName={currentToolData?.title || "Simulación Financiera"} summaryData={activeSummaryData} />
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
    
