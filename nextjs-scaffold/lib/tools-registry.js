import {
  Target, PiggyBank, Plane, Home as HomeIcon,
  TrendingUp, ShieldCheck, CalendarCheck, ShoppingBag, MoreHorizontal,
} from "lucide-react";

const ALL_TOOLS = [
  { id: "savings", label: "Objetivo de ahorro", desc: "Cuánto tardarás en llegar a tu meta", icon: Target, tone: "lime" },
  { id: "budget", label: "Presupuesto mensual", desc: "Organiza tus gastos por categoría", icon: PiggyBank, tone: "lavender" },
  { id: "emergency", label: "Fondo de emergencia", desc: "Cuánto necesitas ahorrado por seguridad", icon: ShieldCheck, tone: "lime" },
  { id: "interest", label: "Interés compuesto", desc: "Simula el crecimiento de tu dinero", icon: TrendingUp, tone: "lavender" },
  { id: "challenge", label: "Reto de ahorro", desc: "Reto semanal progresivo de 26 o 52 semanas", icon: CalendarCheck, tone: "lime" },
  { id: "trip", label: "Ahorro para un viaje", desc: "Cuánto ahorrar al mes antes de una fecha", icon: Plane, tone: "lavender" },
  { id: "daily", label: "Gastos diarios", desc: "De gasto diario a mensual y anual", icon: MoreHorizontal, tone: "lime" },
  { id: "comparator", label: "Comparador de escenarios", desc: "Compara dos formas de ahorrar", icon: HomeIcon, tone: "lavender" },
  { id: "rule502030", label: "Regla 50/30/20", desc: "Reparte tu ingreso entre necesidades, deseos y ahorro", icon: PiggyBank, tone: "lime" },
  { id: "percent", label: "Porcentaje de ahorro", desc: "Qué parte de tu ingreso ahorras", icon: TrendingUp, tone: "lavender" },
  { id: "bigpurchase", label: "Ahorro para una compra grande", desc: "Coche, vivienda u otra meta grande", icon: ShoppingBag, tone: "lime" },
  { id: "roundup", label: "Ahorro por redondeo", desc: "La diferencia de cada compra, ahorrada", icon: PiggyBank, tone: "lavender" },
  { id: "annual", label: "Planificador de ahorro anual", desc: "12 meses, ajustando los meses difíciles", icon: CalendarCheck, tone: "lime" },
  { id: "loan", label: "Cuota de un préstamo", desc: "Calcula la cuota mensual y los intereses", icon: TrendingUp, tone: "lavender" },
  { id: "groupsplit", label: "Reparto de gastos en grupo", desc: "Divide un gasto y ve quién debe qué", icon: PiggyBank, tone: "lime" },
  { id: "tripdaily", label: "Presupuesto diario de viaje", desc: "Cuánto puedes gastar al día según lo que llevas", icon: Plane, tone: "lavender" },
  { id: "holiday", label: "Ahorro para Navidad", desc: "Calcula los meses que faltan y cuánto ahorrar", icon: CalendarCheck, tone: "lime" },
  { id: "currency", label: "Conversor de moneda", desc: "Convierte con el tipo de cambio del día", icon: Plane, tone: "lavender" },
  { id: "tip", label: "Calculadora de propina", desc: "Añade propina y reparte la cuenta", icon: PiggyBank, tone: "lime" },
  { id: "targetincome", label: "Cuánto necesito ganar", desc: "Ingreso mínimo según tus gastos y tu ahorro deseado", icon: TrendingUp, tone: "lavender" },
];

/* ============================================================
   APP
   ============================================================ */

const CATEGORIES = [
  { icon: Target, label: "Ahorrar para algo", desc: "Define un objetivo y un plazo", view: "savings", tone: "lime" },
  { icon: PiggyBank, label: "Organizar mi dinero", desc: "Presupuesto y gastos por categoría", view: "budget", tone: "lavender" },
  { icon: ShieldCheck, label: "Fondo de emergencia", desc: "Cuánto necesitas y cuándo lo tendrás", view: "emergency", tone: "lime" },
  { icon: TrendingUp, label: "Hacer crecer mis ahorros", desc: "Simula el interés compuesto", view: "interest", tone: "lavender" },
  { icon: CalendarCheck, label: "Hacer un reto de ahorro", desc: "Reto semanal progresivo", view: "challenge", tone: "lime" },
  { icon: Plane, label: "Preparar un viaje", desc: "Calcula tu ahorro mensual antes de irte", view: "trip", tone: "lavender" },
];


export { ALL_TOOLS, CATEGORIES };
