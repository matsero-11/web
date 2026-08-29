"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Cada herramienta se carga bajo demanda (code-splitting real): visitar
// /herramientas/savings ya no descarga el código de las otras 19, ni la
// copia de recharts que usa cada una. Antes, tool-client importaba las 20
// de golpe y el bundler las incluía todas en el mismo chunk.
function ToolLoading() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#9FB3B1", fontFamily: "system-ui, sans-serif", fontSize: "0.9rem" }}>
        Cargando herramienta…
      </div>
    </div>
  );
}

const TOOL_COMPONENTS = {
  savings: dynamic(() => import("@/components/tools/savings-goal-tool"), { loading: () => <ToolLoading /> }),
  emergency: dynamic(() => import("@/components/tools/emergency-fund-tool"), { loading: () => <ToolLoading /> }),
  budget: dynamic(() => import("@/components/tools/budget-tool"), { loading: () => <ToolLoading /> }),
  interest: dynamic(() => import("@/components/tools/compound-interest-tool"), { loading: () => <ToolLoading /> }),
  challenge: dynamic(() => import("@/components/tools/challenge-tool"), { loading: () => <ToolLoading /> }),
  trip: dynamic(() => import("@/components/tools/trip-savings-tool"), { loading: () => <ToolLoading /> }),
  daily: dynamic(() => import("@/components/tools/daily-expense-tool"), { loading: () => <ToolLoading /> }),
  comparator: dynamic(() => import("@/components/tools/scenario-comparator-tool"), { loading: () => <ToolLoading /> }),
  rule502030: dynamic(() => import("@/components/tools/rule502030-tool"), { loading: () => <ToolLoading /> }),
  percent: dynamic(() => import("@/components/tools/savings-percent-tool"), { loading: () => <ToolLoading /> }),
  bigpurchase: dynamic(() => import("@/components/tools/big-purchase-tool"), { loading: () => <ToolLoading /> }),
  roundup: dynamic(() => import("@/components/tools/round-up-tool"), { loading: () => <ToolLoading /> }),
  annual: dynamic(() => import("@/components/tools/annual-planner-tool"), { loading: () => <ToolLoading /> }),
  loan: dynamic(() => import("@/components/tools/loan-payment-tool"), { loading: () => <ToolLoading /> }),
  groupsplit: dynamic(() => import("@/components/tools/group-split-tool"), { loading: () => <ToolLoading /> }),
  tripdaily: dynamic(() => import("@/components/tools/trip-daily-budget-tool"), { loading: () => <ToolLoading /> }),
  holiday: dynamic(() => import("@/components/tools/holiday-savings-tool"), { loading: () => <ToolLoading /> }),
  currency: dynamic(() => import("@/components/tools/currency-converter-tool"), { loading: () => <ToolLoading /> }),
  tip: dynamic(() => import("@/components/tools/tip-calculator-tool"), { loading: () => <ToolLoading /> }),
  targetincome: dynamic(() => import("@/components/tools/target-income-tool"), { loading: () => <ToolLoading /> }),
};

export default function ToolClient({ slug }) {
  const router = useRouter();
  const Tool = TOOL_COMPONENTS[slug];
  if (!Tool) return null;
  return (
    <Tool
      onBack={() => router.push("/")}
      onNavigate={(id) => router.push(`/herramientas/${id}`)}
    />
  );
}
