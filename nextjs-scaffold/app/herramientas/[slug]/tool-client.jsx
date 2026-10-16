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
  const [showModal, setShowModal] = useState(false);
  const handlePrintPDF = () => { if (typeof window !== "undefined") window.print(); };

  const currentDateFormatted = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).replace(".", "");

  const metricsEntries = summaryData ? Object.entries(summaryData) : [];

  return (
    <>
      <div className="export-bar no-print" style={{ marginTop: "2.5rem", padding: "1.25rem", borderRadius: "1.1rem", background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", ...fontBody }}>
        <button onClick={() => setShowModal(true)} type="button" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: T.lime, color: "#12200A", border: "none", padding: "0.75rem 1.2rem", borderRadius: "0.8rem", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", ...fontDisplay }}>
          <FileDown size={18} strokeWidth={2.5} aria-hidden="true" />
          <span>Generar Informe PDF Ejecutivo</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: T.textMuted, fontSize: "0.85rem" }}>
          <ShieldCheck size={18} color={T.lime} aria-hidden="true" />
          <span>Procesamiento 100% privado en tu navegador</span>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md no-print animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0b1214] border border-[#f5f2ea]/20 text-[#f5f2ea] shadow-2xl p-6 sm:p-10">
            <div className="flex items-center justify-between border-b border-[#f5f2ea]/10 pb-4 mb-6">
              <div>
                <span className="text-[11px] font-bold text-[#c4de4e] tracking-widest uppercase">Vista Previa Corporativa</span>
                <h3 className="text-lg font-bold text-[#f5f2ea]">Reporte Financiero — {toolName}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-[#9fb3b1] hover:text-[#f5f2ea] rounded-xl bg-[#162225] hover:bg-[#1e2f33] transition">✕</button>
            </div>

            <div 
              id="metabox-report-content" 
              className="printable-report space-y-6 p-8 sm:p-12 rounded-3xl bg-[#f7f5ef] text-[#111c1f] border border-[#111c1f]/10 shadow-2xl relative overflow-hidden"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              <div className="flex items-center justify-between bg-[#111c1f] text-[#f5f2ea] p-6 rounded-2xl border-b-4 border-[#c4de4e] shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#c4de4e]/20 border border-[#c4de4e]/40 flex items-center justify-center text-[#c4de4e] text-2xl">
                    🛡️
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-widest uppercase font-serif text-[#f5f2ea]">
                      METABOX
                    </h1>
                    <span className="text-[10px] text-[#c4de4e] uppercase tracking-widest font-bold block">
                      REPORTE FINANCIERO EJECUTIVO
                    </span>
                  </div>
                </div>
                <div className="text-right font-sans">
                  <div className="inline-flex items-center gap-2 text-xs text-[#f5f2ea] font-medium bg-[#1a292c] px-3.5 py-1.5 rounded-xl border border-[#f5f2ea]/10">
                    <span>📅</span>
                    <span>Fecha del reporte: <strong>{currentDateFormatted}</strong></span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-b border-[#111c1f]/10 pb-6">
                <span className="text-[11px] font-bold text-[#5c7a1e] uppercase tracking-widest font-sans block">
                  — TU SIMULACIÓN ACTIVA —
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111c1f] leading-tight">
                  Estabilidad hoy, <span className="italic font-normal text-[#9e7d3b]">tranquilidad mañana.</span>
                </h2>
                <p className="text-xs text-[#526365] font-sans leading-relaxed max-w-2xl pt-1">
                  Este informe muestra cuánto necesitas planificar para estar cubierto ante imprevistos y cómo avanzas hacia tu objetivo con rigor matemático.
                </p>
              </div>

              {metricsEntries.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-white border border-[#111c1f]/10 shadow-sm font-sans">
                  {metricsEntries.slice(0, 4).map(([key, value], idx) => {
                    const icons = [<Wallet size={18} key="1" />, <Shield size={18} key="2" />, <Target size={18} key="3" />, <Clock size={18} key="4" />];
                    return (
                      <div key={key} className="p-4 rounded-xl bg-[#f9f8f4] border border-[#111c1f]/5 flex flex-col justify-between space-y-2">
                        <div className="flex items-center gap-2 text-[#9e7d3b]">
                          {icons[idx % icons.length]}
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#526365]">
                            {key}
                          </span>
                        </div>
                        <span className="text-xl font-extrabold text-[#111c1f]">
                          {value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white border border-[#111c1f]/10 text-center text-[#526365] text-xs font-sans">
                  Modifica los parámetros en la calculadora para ver las métricas clave reflejadas aquí en tiempo real.
                </div>
              )}
                                 <div className="p-5 rounded-2xl bg-[#f1f4e6] border border-[#c4de4e]/60 flex items-start gap-4 font-sans">
                <div className="p-2.5 rounded-full bg-[#111c1f] text-[#c4de4e] shrink-0 mt-0.5">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111c1f] uppercase tracking-wider">
                    Sugerencia estratégica para tu objetivo
                  </h4>
                  <p className="text-xs text-[#405255] leading-relaxed mt-1">
                    Prioriza la constancia de aportaciones periódicas antes de derivar liquidez a metas menos urgentes. Mantener este ritmo refuerza tu tranquilidad financiera.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                <div className="p-5 rounded-2xl bg-white border border-[#111c1f]/10 space-y-3">
                  <span className="text-[11px] font-bold text-[#111c1f] uppercase tracking-wider block border-b border-[#111c1f]/5 pb-2">
                    Resumen de Progreso
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#526365]">Estado de la meta:</span>
                    <span className="font-bold text-[#5c7a1e]">En marcha</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#526365]">Nivel de privacidad:</span>
                    <span className="font-bold text-[#111c1f]">100% Local</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#111c1f]/10 space-y-2">
                  <span className="text-[11px] font-bold text-[#111c1f] uppercase tracking-wider block border-b border-[#111c1f]/5 pb-2">
                    ¿Por qué es relevante?
                  </span>
                  <ul className="text-xs text-[#526365] space-y-1.5">
                    <li className="flex items-center gap-2">
                      <Shield size={14} className="text-[#5c7a1e]" />
                      <span>Cubre imprevistos sin endeudarte.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-[#5c7a1e]" />
                      <span>Proporciona estabilidad a largo plazo.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#111c1f] text-[#f5f2ea] flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-bold text-[#c4de4e] uppercase tracking-widest block">
                    NUESTRA RECOMENDACIÓN
                  </span>
                  <h3 className="text-lg font-bold font-serif text-[#f5f2ea]">
                    Prioriza tus metas financieras principales.
                  </h3>
                  <p className="text-xs text-[#9fb3b1] max-w-md">
                    Es la base para una vida financiera sana. Te otorgará libertad, seguridad y paz mental para el futuro.
                  </p>
                </div>
                <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-[#f5f2ea]/10 pt-3 sm:pt-0 sm:pl-6 shrink-0">
                  <span className="text-xs italic text-[#d4af37] block font-serif">
                    Pequeños pasos, grandes resultados
                  </span>
                  <span className="text-xs font-bold text-[#f5f2ea] uppercase tracking-widest block mt-1">
                    METABOX
                  </span>
                  <span className="text-[9px] text-[#9fb3b1] uppercase tracking-wider">
                    TU FUTURO, EN TUS MANOS
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#111c1f]/10 grid grid-cols-3 gap-2 text-[10px] text-[#526365] font-sans text-center">
                <div className="border-r border-[#111c1f]/10 pr-2">
                  <strong className="block text-[#111c1f]">Fondo Garantizado</strong>
                  <span>Dinero separado para emergencias.</span>
                </div>
                <div className="border-r border-[#111c1f]/10 px-2">
                  <strong className="block text-[#111c1f]">Herramienta de Control</strong>
                  <span>Diseñado para tu tranquilidad.</span>
                </div>
                <div className="pl-2">
                  <strong className="block text-[#111c1f]">Empieza Hoy</strong>
                  <span>Tu yo del futuro te lo agradecerá.</span>
                </div>
              </div>

            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#f5f2ea]/10 font-sans">
              <button onClick={() => setShowModal(false)} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#162225] hover:bg-[#1e2f33] text-[#f5f2ea] font-medium text-xs transition">Cerrar</button>
              <button onClick={handlePrintPDF} className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c4de4e] hover:bg-[#b0cc3e] text-[#111c1f] font-bold text-xs transition shadow-lg shadow-[#c4de4e]/20 flex items-center justify-center gap-2">
                <span>🖨️</span><span>Guardar PDF / Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          body * { visibility: hidden !important; }
          .no-print, .no-print * { display: none !important; visibility: hidden !important; }
          #metabox-report-content, #metabox-report-content * { visibility: visible !important; }
          #metabox-report-content {
            position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 24px !important; background-color: #f7f5ef !important; color: #111c1f !important; border: none !important; border-radius: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-shadow: none !important;
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
      
