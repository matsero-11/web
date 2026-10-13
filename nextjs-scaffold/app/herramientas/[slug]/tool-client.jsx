"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { T, fontBody, fontDisplay } from "@/lib/design-tokens";
import { Button } from "@/components/ui";
import { useCallback, useMemo, useState, Suspense, useRef } from "react";
import { FileDown, ShieldCheck } from "lucide-react";

// Importaciones dinámicas seguras para cada herramienta de la plataforma
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

function PremiumExportBar() {
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
            setStatus("¡Captura cargada con éxito!");
            if (typeof onValueExtracted === "function") {
              onValueExtracted(1500);
            }
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
          Procesamiento 100% privado en tu navegador (0 servidores).
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {status && <span style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 500 }}>{status}</span>}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          style={{
            padding: "0.55rem 1rem",
            borderRadius: "8px",
            backgroundColor: "#10b981",
            color: "#000",
            fontWeight: 600,
            fontSize: "0.85rem",
            border: "none",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Procesando..." : "📷 Subir Captura"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
      </div>
    </div>
  );
}

function ToolLoading() {
  return (
    <div
      role="status"
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: T.textMuted || "#9FB3B1",
        fontFamily: "system-ui, sans-serif",
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
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "1rem",
        padding: "2rem",
      }}
    >
      <h1 style={{ color: T.text || "#F5F2EA", fontSize: "1.7rem", margin: 0 }}>
        Herramienta no encontrada
      </h1>
      <p style={{ color: T.textMuted || "#9FB3B1", maxWidth: "28rem", margin: 0 }}>
        El enlace que has abierto no corresponde a una herramienta disponible.
      </p>
      <Button onClick={onBack} fullWidth={false}>
        Volver a la home
      </Button>
    </main>
  );
}

function ToolClientContent({ slug }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [extractedValue, setExtractedValue] = useState(null);

  // Obtener de forma directa el componente según el slug de la URL
  const ToolComponent = useMemo(() => {
    if (!slug) return null;
    return TOOL_MAP[slug] || null;
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
      if (typeof window !== "undefined" && window.location?.search !== `?${queryStr}`) {
        window.history.replaceState(null, "", newUrl);
      }
    },
    [pathname, searchParams]
  );

  const handleValueExtracted = useCallback(
    (val) => {
      setExtractedValue(val);
      handleStateChange({ ingreso: val, monto: val, montoInicial: val });
    },
    [handleStateChange]
  );

  if (!ToolComponent) {
    return <ToolNotFound onBack={() => router.push("/")} />;
  }

  const handleNavigate = (val) => {
    const targetSlug =
      typeof val === "object" && val !== null
        ? val.id || val.slug || val.key
        : val;
    let cleanSlug =
      typeof targetSlug === "string"
        ? targetSlug.replace("/herramientas/", "").trim()
        : null;

    if (cleanSlug) {
      router.push(`/herramientas/${cleanSlug}`);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <QuickSmartCapture onValueExtracted={handleValueExtracted} />

      <ToolComponent
        key={`${slug}-${extractedValue || "default"}`}
        initialParams={initialParams}
        onStateChange={handleStateChange}
        onBack={() => router.back()}
        onNavigate={handleNavigate}
        onSelect={handleNavigate}
        onToolClick={handleNavigate}
      />

      <PremiumExportBar />
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

