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
  savings: dynamic(
    () => import("@/components/tools/savings-goal-tool"),
    { loading: () => <ToolLoading /> }
  ),
  emergency: dynamic(
    () => import("@/components/tools/emergency-fund-tool"),
    { loading: () => <ToolLoading /> }
  ),
  budget: dynamic(
    () => import("@/components/tools/budget-tool"),
    { loading: () => <ToolLoading /> }
  ),
  interest: dynamic(
    () => import("@/components/tools/compound-interest-tool"),
    { loading: () => <ToolLoading /> }
  ),
  challenge: dynamic(
    () => import("@/components/tools/challenge-tool"),
    { loading: () => <ToolLoading /> }
  ),
  trip: dynamic(
    () => import("@/components/tools/trip-savings-tool"),
    { loading: () => <ToolLoading /> }
  ),
  daily: dynamic(
    () => import("@/components/tools/daily-expense-tool"),
    { loading: () => <ToolLoading /> }
  ),
  comparator: dynamic(
    () => import("@/components/tools/scenario-comparator-tool"),
    { loading: () => <ToolLoading /> }
  ),
  rule502030: dynamic(
    () => import("@/components/tools/rule502030-tool"),
    { loading: () => <ToolLoading /> }
  ),
  percent: dynamic(
    () => import("@/components/tools/savings-percent-tool"),
    { loading: () => <ToolLoading /> }
  ),
  bigpurchase: dynamic(
    () => import("@/components/tools/big-purchase-tool"),
    { loading: () => <ToolLoading /> }
  ),
  roundup: dynamic(
    () => import("@/components/tools/round-up-tool"),
    { loading: () => <ToolLoading /> }
  ),
  annual: dynamic(
    () => import("@/components/tools/annual-planner-tool"),
    { loading: () => <ToolLoading /> }
  ),
  loan: dynamic(
    () => import("@/components/tools/loan-payment-tool"),
    { loading: () => <ToolLoading /> }
  ),
  groupsplit: dynamic(
    () => import("@/components/tools/group-split-tool"),
    { loading: () => <ToolLoading /> }
  ),
  tripdaily: dynamic(
    () => import("@/components/tools/trip-daily-budget-tool"),
    { loading: () => <ToolLoading /> }
  ),
  holiday: dynamic(
    () => import("@/components/tools/holiday-savings-tool"),
    { loading: () => <ToolLoading /> }
  ),
  currency: dynamic(
    () => import("@/components/tools/currency-converter-tool"),
    { loading: () => <ToolLoading /> }
  ),
  tip: dynamic(
    () => import("@/components/tools/tip-calculator-tool"),
    { loading: () => <ToolLoading /> }
  ),
  targetincome: dynamic(
    () => import("@/components/tools/target-income-tool"),
    { loading: () => <ToolLoading /> }
  ),
};

export default function ToolClient({ slug }) {
  const router = useRouter();
  const Tool = TOOL_COMPONENTS[slug];

  if (!Tool) {
    return <ToolNotFound onBack={() => router.push("/")} />;
  }

  return (
    <Tool
      onBack={() => router.back()}
      onNavigate={(id) => router.push(`/herramientas/${id}`)}
    />
  );
      }
