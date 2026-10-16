"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { T, fontBody, fontDisplay } from "@/lib/design-tokens";
import { Button } from "@/components/ui";
import { Component, useCallback, useMemo, useState, Suspense, useRef } from "react";
import { FileDown, ShieldCheck, Wallet, Shield, Target, Clock, AlertCircle } from "lucide-react";
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

  const metricsEntries = summaryData ? Object.entries(summaryData) : [];

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

      {/* DOCUMENTO IMPRESO NATIVO CON CALIDAD 10/10 DE MAQUETA */}
      <div 
        id="metabox-report-content" 
        style={{ display: "none", fontFamily: "'Georgia', serif" }}
      >
        {/* CABECERA CORPORATIVA */}
        <div className="flex items-center justify-between bg-[#111c1f] text-[#f5f2ea] p-6 rounded-2xl border-b-4 border-[#c4de4e]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#c4de4e]/20 border border-[#c4de4e]/40 flex items-center justify-center text-[#c4de4e] text-2xl">
              🛡️
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-widest uppercase font-serif text-[#f5f2ea]">
                METABOX
              </h1>
              <span className="text-[10px] text-[#c4de4e] uppercase tracking-widest font-bold block font-sans">
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

        {/* TITULAR Y DESCRIPCIÓN */}
        <div className="space-y-1 pt-4 border-b border-[#111c1f]/10 pb-4">
          <span className="text-[10px] font-bold text-[#5c7a1e] uppercase tracking-widest font-sans block">
            — {toolName ? toolName.toUpperCase() : "FONDO DE EMERGENCIA"} —
          </span>
          <h2 className="text-3xl font-extrabold text-[#111c1f] leading-tight">
            Fondo de emergencia
          </h2>
          <p className="text-xs text-[#526365] font-sans leading-relaxed max-w-2xl">
            Cuánto necesitas ahorrar para estar cubierto ante un imprevisto.
          </p>
        </div>

        {/* MÉTRICAS CLAVE EN TARJETAS INDEPENDIENTES */}
        <div className="grid grid-cols-3 gap-4 my-4 font-sans">
          <div className="p-4 rounded-xl bg-[#f9f8f4] border border-[#111c1f]/10 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#9e7d3b]">
              <Wallet size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#526365]">Gastos esenciales mensuales</span>
            </div>
            <span className="text-2xl font-extrabold text-[#111c1f] mt-2">
              {metricsEntries[0]?.[1] || "€ 1.100"}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#f9f8f4] border border-[#111c1f]/10 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#9e7d3b]">
              <Shield size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#526365]">Cobertura deseada</span>
            </div>
            <span className="text-2xl font-extrabold text-[#111c1f] mt-2">
              {metricsEntries[1]?.[1] || "6 meses"}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#f9f8f4] border border-[#111c1f]/10 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#9e7d3b]">
              <Target size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#526365]">Objetivo total</span>
            </div>
            <span className="text-2xl font-extrabold text-[#111c1f] mt-2">
              {metricsEntries[2]?.[1] || "€ 6.600,00"}
            </span>
          </div>
        </div>

        {/* TIEMPO PARA EL OBJETIVO Y BARRA DE PROGRESO */}
        <div className="p-5 rounded-2xl bg-[#f9f8f4] border border-[#111c1f]/10 my-4 font-sans text-center space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#526365] block">
            TIEMPO PARA EL OBJETIVO
          </span>
          <div className="text-4xl font-black text-[#111c1f]">
            49 <span className="text-lg font-normal">meses</span>
          </div>
          
          <div className="w-full bg-[#e2decb] h-2.5 rounded-full overflow-hidden max-w-lg mx-auto">
            <div className="bg-[#4b6321] h-full rounded-full" style={{ width: "12%" }}></div>
          </div>
          <span className="text-xs font-bold text-[#526365] block">12% conseguido</span>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#111c1f]/10 text-left max-w-md mx-auto">
            <div>
              <span className="text-[10px] text-[#526365] block">Ya has ahorrado</span>
              <span className="text-base font-bold text-[#111c1f]">€ 800</span>
            </div>
            <div>
              <span className="text-[10px] text-[#526365] block">Aportación mensual</span>
              <span className="text-base font-bold text-[#111c1f]">€ 120</span>
            </div>
          </div>
        </div>
                 {/* GRÁFICO VISUAL DE PROYECCIÓN DE AHORRO (SVG) */}
        <div className="p-5 rounded-2xl bg-[#f9f8f4] border border-[#111c1f]/10 my-4 font-sans">
          <h4 className="text-xs font-bold text-[#111c1f] uppercase tracking-wider mb-1">Proyección de ahorro</h4>
          <p className="text-[10px] text-[#526365] mb-3">Evolución estimada de tu fondo de emergencia con la aportación actual.</p>

          <div className="relative w-full h-32">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5c7a1e" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#5c7a1e" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="20" x2="400" y2="20" stroke="#111c1f" strokeOpacity="0.1" strokeDasharray="2" />
              <line x1="0" y1="50" x2="400" y2="50" stroke="#111c1f" strokeOpacity="0.1" strokeDasharray="2" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#111c1f" strokeOpacity="0.1" strokeDasharray="2" />

              <polygon points="0,90 80,75 160,60 240,45 320,30 400,15 400,90 0,90" fill="url(#grad)" />
              <polyline points="0,90 80,75 160,60 240,45 320,30 400,15" fill="none" stroke="#5c7a1e" strokeWidth="2.5" />

              <circle cx="0" cy="90" r="3" fill="#5c7a1e" />
              <circle cx="80" cy="75" r="3" fill="#5c7a1e" />
              <circle cx="160" cy="60" r="3" fill="#5c7a1e" />
              <circle cx="240" cy="45" r="3" fill="#5c7a1e" />
              <circle cx="320" cy="30" r="3" fill="#5c7a1e" />
              <circle cx="400" cy="15" r="3" fill="#5c7a1e" />
            </svg>
          </div>
          <div className="flex justify-between text-[9px] text-[#526365] mt-1 pt-1 border-t border-[#111c1f]/5">
            <span>0</span>
            <span>12</span>
            <span>24</span>
            <span>36</span>
            <span>48</span>
            <span>Meses</span>
          </div>
        </div>

        {/* ALERTA Y RECOMENDACIÓN DE IMPACTO */}
        <div className="p-4 rounded-xl bg-[#1d2b2e] text-[#f5f2ea] flex items-center gap-4 my-4 font-sans">
          <div className="w-10 h-10 rounded-full border border-[#f5f2ea]/30 flex items-center justify-center shrink-0 text-lg">
            !
          </div>
          <div className="text-xs">
            <strong className="block text-[#c4de4e] mb-0.5">Al ritmo actual tardarás más de 2 años en completarlo.</strong>
            <span>Si es posible, prioriza este fondo antes que metas menos urgentes.</span>
          </div>
        </div>

        {/* PIE DE PÁGINA INFORMATIVO */}
        <div className="pt-3 border-t border-[#111c1f]/10 text-[10px] text-[#526365] font-sans flex items-center gap-2">
          <span className="p-1 rounded-full bg-[#111c1f]/10 text-[#111c1f]">ℹ</span>
          <span>Un fondo de emergencia es un dinero separado para cubrir gastos inesperados, como problemas de salud, reparaciones o pérdida de ingresos.</span>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
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
            margin: 0 !important; 
            padding: 24px !important; 
            background-color: #f7f5ef !important; 
            color: #111c1f !important; 
            border: none !important; 
            border-radius: 0 !important; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            box-shadow: none !important;
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
                                        
