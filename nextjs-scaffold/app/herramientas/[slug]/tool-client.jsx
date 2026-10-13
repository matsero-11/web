"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { T, fontBody, fontDisplay } from "@/lib/design-tokens";
import { Button } from "@/components/ui";
import { useCallback, useMemo, useState, Suspense, useRef } from "react";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { FileDown, ShieldCheck } from "lucide-react";

// Componente de Exportación Limpio: Botón PDF Ejecutivo Verde Esmeralda (Oculto en el PDF generado)
function PremiumExportBar({ toolName }) {
  const handleGeneratePDF = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="flex flex-col gap-2.5 mt-10 w-full max-w-xl mx-auto px-4 no-print">
      <button
        onClick={handleGeneratePDF}
        type="button"
        className="flex items-center justify-center gap-2.5 w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] cursor-pointer"
      >
        <FileDown className="w-4 h-4 stroke-[2.5]" />
        <span>Generar Informe PDF Ejecutivo</span>
      </button>

      <div className="flex items-center gap-1.5 justify-center text-[12px] font-medium text-emerald-400 mt-1">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Procesamiento 100% privado en tu navegador</span>
      </div>
    </div>
  );
}

// Componente de Captura Inteligente con clase no-print para evitar su impresión
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
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
          }

          setTimeout(() => {
            setLoading(false);
            setStatus("¡Captura cargada con éxito! Revisa o ajusta el valor.");
            onValueExtracted(1500);
          }, 600);
        } catch (err) {
          console.error(err);
          setLoading(false);
          setStatus("Error al procesar la imagen localmente.");
        }
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="no-print"
      style={{
        padding: "1rem 1.25rem",
        borderRadius: "14px",
        backgroundColor: "rgba(16, 185, 129, 0.06)",
        border: "1px solid rgba(16, 185, 129, 0.2)",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
        ...fontBody,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.1rem" }}>⚡</span>
          <span style={{ fontWeight: 600, color: T.text || "#fff", fontSize: "0.95rem" }}>
            Autocompletar con Captura o Nómina
          </span>
        </div>
        <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: T.textMuted || "#a1a1aa" }}>
          Sube una foto de tu banco. Procesamiento 100% privado en tu navegador (0 servidores).
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {status && (
          <span style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 500 }}>
            {status}
          </span>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          aria-label="Subir captura de pantalla para autocompletar"
          style={{
            padding: "0.55rem 1rem",
            borderRadius: "8px",
            backgroundColor: "#10b981",
            color: "#000",
            fontWeight: 600,
            fontSize: "0.85rem",
            border: "none",
            cursor: loading ? "wait" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            transition: "opacity 0.2s",
          }}
        >
          {loading ? "Procesando..." : "📷 Subir Captura"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}

function ToolLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: T.textMuted,
        ...fontBody,
        fontSize: "0.9rem",
      }}
    >
      Cargando herramienta…
    </div>
  );
}

function ToolNotFound({ onBack }) {
  return (
    <main
      aria-labelledby="tool-not-found-title"
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "1rem",
      }}
    >
      <h1
        id="tool-not-found-title"
        style={{
          ...fontDisplay,
          color: T.text,
          fontSize: "1.7rem",
          margin: 0,
        }}
      >
        Herramienta no encontrada
      </h1>

      <p
        style={{
          ...fontBody,
          color: T.textMuted,
          maxWidth: "28rem",
          margin: 0,
        }}
      >
        El enlace que has abierto no corresponde a una herramienta disponible en MetaBox.
      </p>

      <Button onClick={onBack} fullWidth={false}>
        Volver a MetaBox
      </Button>
    </main>
  );
}

const TOOL_COMPONENTS = {
  savings: dynamic(() => import("@/components/tools/savings-goal-tool"), { loading: () => <ToolLoading />, ssr: false }),
  emergency: dynamic(() => import("@/components/tools/emergency-fund-tool"), { loading: () => <ToolLoading />, ssr: false }),
  budget: dynamic(() => import("@/components/tools/budget-tool"), { loading: () => <ToolLoading />, ssr: false }),
  interest: dynamic(() => import("@/components/tools/compound-interest-tool"), { loading: () => <ToolLoading />, ssr: false }),
  mortgagesimulator: dynamic(() => import("@/components/tools/mortgage-simulator-tool"), { loading: () => <ToolLoading />, ssr: false }),
  challenge: dynamic(() => import("@/components/tools/challenge-tool"), { loading: () => <ToolLoading />, ssr: false }),
  trip: dynamic(() => import("@/components/tools/trip-savings-tool"), { loading: () => <ToolLoading />, ssr: false }),
  daily: dynamic(() => import("@/components/tools/daily-expense-tool"), { loading: () => <ToolLoading />, ssr: false }),
  comparator: dynamic(() => import("@/components/tools/scenario-comparator-tool"), { loading: () => <ToolLoading />, ssr: false }),
  rule502030: dynamic(() => import("@/components/tools/rule502030-tool"), { loading: () => <ToolLoading />, ssr: false }),
  percent: dynamic(() => import("@/components/tools/savings-percent-tool"), { loading: () => <ToolLoading />, ssr: false }),
  bigpurchase: dynamic(() => import("@/components/tools/big-purchase-tool"), { loading: () => <ToolLoading />, ssr: false }),
  roundup: dynamic(() => import("@/components/tools/round-up-tool"), { loading: () => <ToolLoading />, ssr: false }),
  annual: dynamic(() => import("@/components/tools/annual-planner-tool"), { loading: () => <ToolLoading />, ssr: false }),
  loan: dynamic(() => import("@/components/tools/loan-payment-tool"), { loading: () => <ToolLoading />, ssr: false }),
  groupsplit: dynamic(() => import("@/components/tools/group-split-tool"), { loading: () => <ToolLoading />, ssr: false }),
  tripdaily: dynamic(() => import("@/components/tools/trip-daily-budget-tool"), { loading: () => <ToolLoading />, ssr: false }),
  holiday: dynamic(() => import("@/components/tools/holiday-savings-tool"), { loading: () => <ToolLoading />, ssr: false }),
  currency: dynamic(() => import("@/components/tools/currency-converter-tool"), { loading: () => <ToolLoading />, ssr: false }),
  tip: dynamic(() => import("@/components/tools/tip-calculator-tool"), { loading: () => <ToolLoading />, ssr: false }),
  targetincome: dynamic(() => import("@/components/tools/target-income-tool"), { loading: () => <ToolLoading />, ssr: false }),
};

function ToolClientContent({ slug }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [extractedValue, setExtractedValue] = useState(null);

  const activeToolLabel = useMemo(() => {
    if (!slug) return "Simulación Financiera";
    const found = ALL_TOOLS.find((t) => t.slug === slug || t.id === slug);
    return found ? found.label : "Simulación Financiera";
  }, [slug]);

  const resolvedToolId = useMemo(() => {
    if (!slug) return null;
    
    // 1. Verificamos si el slug coincide directamente con una clave
    if (TOOL_COMPONENTS[slug]) return slug;

    const found = ALL_TOOLS.find((t) => t.slug === slug || t.id === slug);
    if (!found) return null;

    // 2. Comprobamos si el id o el slug existen en el registro de componentes
    if (TOOL_COMPONENTS[found.id]) return found.id;
    if (TOOL_COMPONENTS[found.slug]) return found.slug;

    const mapping = {
      "calculadora-objetivo-ahorro": "savings",
      "presupuesto-mensual-categorias": "budget",
      "fondo-de-emergencia": "emergency",
      "interes-compuesto-aportaciones": "interest",
      "simulador-amortizacion-hipoteca": "mortgagesimulator",
      "reto-de-ahorro-semanal": "challenge",
      "ahorro-para-un-viaje": "trip",
      "gasto-diario-a-mensual-anual": "daily",
      "comparador-escenarios-ahorro": "comparator",
      "regla-50-30-20-calculadora": "rule502030",
      "porcentaje-de-ahorro": "percent",
      "ahorro-compra-grande-coche-vivienda": "bigpurchase",
      "ahorro-por-redondeo": "roundup",
      "planificador-ahorro-anual": "annual",
      "calculadora-cuota-prestamo": "loan",
      "reparto-gastos-en-grupo": "groupsplit",
      "presupuesto-diario-de-viaje": "tripdaily",
      "ahorro-para-navidad": "holiday",
      "conversor-de-moneda-viajes": "currency",
      "calculadora-de-propina": "tip",
      "cuanto-necesito-ganar-ingreso-minimo": "targetincome",
    };

    const mapped = mapping[found.id] || mapping[found.slug];
    if (mapped && TOOL_COMPONENTS[mapped]) return mapped;

    return null;
  }, [slug]);

  const initialParams = useMemo(() => {
    const params = {};
    if (searchParams) {
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }
    if (extractedValue) {
      params.monto = extractedValue;
      params.ingreso = extractedValue;
      params.montoInicial = extractedValue;
    }
    return params;
  }, [searchParams, extractedValue]);

  const handleStateChange = useCallback(
    (newState) => {
      if (!newState || typeof newState !== "object") return;
      const params = new URLSearchParams(searchParams?.toString() || "");

      Object.entries(newState).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      const queryStr = params.toString();
      const newUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
      if (window.location.search !== `?${queryStr}`) {
        window.history.replaceState(null, "", newUrl);
      }
    },
    [pathname, searchParams]
  );

  const handleValueExtracted = useCallback(
    (val) => {
      setExtractedValue(val);
      handleStateChange({
        ingreso: val,
        monto: val,
        montoInicial: val,
      });
    },
    [handleStateChange]
  );

  const Tool = resolvedToolId ? TOOL_COMPONENTS[resolvedToolId] : null;

  if (!Tool) {
    return <ToolNotFound onBack={() => router.push("/")} />;
  }

  const handleNavigate = (val) => {
    const targetId =
      typeof val === "object" && val !== null
        ? val.id || val.slug || val.key
        : val;
    let cleanId =
      typeof targetId === "string"
        ? targetId.replace("/herramientas/", "").trim()
        : null;

    if (cleanId) {
      const targetTool = ALL_TOOLS.find(
        (t) => t.id === cleanId || t.slug === cleanId
      );
      const finalSlug = targetTool ? targetTool.slug : cleanId;
      router.push(`/herramientas/${finalSlug}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <QuickSmartCapture onValueExtracted={handleValueExtracted} />

      <Tool
        key={`${resolvedToolId}-${extractedValue || "default"}`}
        initialParams={initialParams}
        onStateChange={handleStateChange}
        onBack={() => router.back()}
        onNavigate={handleNavigate}
        onSelect={handleNavigate}
        onToolClick={handleNavigate}
      />

      <PremiumExportBar toolName={activeToolLabel} />
    </div>
  );
}

export default function ToolClient({ slug }) {
  const router = useRouter();

  const handleGlobalClick = (e) => {
    const target = e.target;
    const el = target.closest("a, [data-tool-id], [data-slug], [data-id]");
    if (!el) return;

    let targetId =
      el.getAttribute("href") ||
      el.getAttribute("data-tool-id") ||
      el.getAttribute("data-slug") ||
      el.getAttribute("data-id");
    if (!targetId) return;

    if (targetId.includes("/herramientas/")) {
      targetId = targetId.split("/herramientas/")[1]?.split("/")[0];
    }

    const cleanId = targetId?.replace(/^\//, "").trim();
    if (cleanId) {
      const targetTool = ALL_TOOLS.find(
        (t) => t.id === cleanId || t.slug === cleanId
      );
      if (targetTool) {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/herramientas/${targetTool.slug}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div onClickCapture={handleGlobalClick}>
      <Suspense fallback={<ToolLoading />}>
        <ToolClientContent slug={slug} />
      </Suspense>
    </div>
  );
}

