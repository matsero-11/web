"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { T, fontBody, fontDisplay } from "@/lib/design-tokens";
import { Button } from "@/components/ui";

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
        El enlace que has abierto no corresponde a una herramienta disponible
        en MetaBox.
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

export default function ToolClient({ slug }) {
  const router = useRouter();
  const Tool = TOOL_COMPONENTS[slug];

  const handleGlobalClick = (e) => {
    // Busca si se hizo clic en un enlace o tarjeta con identificador de herramienta
    const el = e.target.closest("a, [data-tool-id], [data-slug], [data-id]");
    if (!el) return;

    let targetId = el.getAttribute("href") || el.getAttribute("data-tool-id") || el.getAttribute("data-slug") || el.getAttribute("data-id");
    if (!targetId) return;

    if (targetId.includes("/herramientas/")) {
      targetId = targetId.split("/herramientas/")[1]?.split("/")[0];
    }

    const cleanId = targetId?.replace(/^\//, "").trim();
    if (cleanId && TOOL_COMPONENTS[cleanId]) {
      e.preventDefault();
      e.stopPropagation();
      router.push(`/herramientas/${cleanId}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavigate = (val) => {
    const targetId = typeof val === "object" && val !== null ? (val.id || val.slug || val.key) : val;
    const cleanId = typeof targetId === "string" ? targetId.replace("/herramientas/", "").trim() : null;
    if (cleanId && TOOL_COMPONENTS[cleanId]) {
      router.push(`/herramientas/${cleanId}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!Tool) {
    return <ToolNotFound onBack={() => router.push("/")} />;
  }

  return (
    <div onClickCapture={handleGlobalClick}>
      <Tool
        key={slug}
        onBack={() => router.back()}
        onNavigate={handleNavigate}
        onSelect={handleNavigate}
        onToolClick={handleNavigate}
      />
    </div>
  );
  }

