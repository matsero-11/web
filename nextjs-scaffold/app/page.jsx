import HomeScreen from "@/components/HomeScreen";

export const metadata = {
  title: "Herramientas de Ahorro y Planificación Financiera",
  description:
    "Calculadoras y herramientas interactivas gratuitas para optimizar tu presupuesto, ahorro y finanzas personales de forma sencilla.",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1
          className="text-2xl font-bold tracking-tight md:text-3xl"
          style={{ color: "var(--text)" }}
        >
          Herramientas de Ahorro y Planificación Financiera
        </h1>
        <p
          className="text-sm md:text-base"
          style={{ color: "var(--textMuted)" }}
        >
          Calculadoras interactivas gratuitas diseñadas para tomar el control
          absoluto de tus finanzas personales, presupuestos y metas de ahorro.
        </p>
      </header>

      <HomeScreen />
    </div>
  );
}
