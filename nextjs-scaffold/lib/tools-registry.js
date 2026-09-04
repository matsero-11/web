import {
  Target,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Plane,
  Receipt,
  GitCompare,
  PieChart,
  Percent,
  ShoppingBag,
  Coins,
  CalendarRange,
  CreditCard,
  Users,
  Compass,
  Gift,
  Globe,
  Utensils,
  Briefcase,
} from "lucide-react";

import SavingsTool from "@/components/tools/savings-goal-tool";
import BudgetTool from "@/components/tools/budget-tool";
import EmergencyTool from "@/components/tools/emergency-fund-tool";
import InterestTool from "@/components/tools/compound-interest-tool";
import ChallengeTool from "@/components/tools/challenge-tool";
import TripTool from "@/components/tools/trip-savings-tool";
import DailyTool from "@/components/tools/daily-expense-tool";
import ComparatorTool from "@/components/tools/scenario-comparator-tool";
import Rule502030Tool from "@/components/tools/rule502030-tool";
import PercentTool from "@/components/tools/savings-percent-tool";
import BigPurchaseTool from "@/components/tools/big-purchase-tool";
import RoundupTool from "@/components/tools/round-up-tool";
import AnnualTool from "@/components/tools/annual-planner-tool";
import LoanTool from "@/components/tools/loan-payment-tool";
import GroupSplitTool from "@/components/tools/group-split-tool";
import TripDailyTool from "@/components/tools/trip-daily-budget-tool";
import HolidayTool from "@/components/tools/holiday-savings-tool";
import CurrencyTool from "@/components/tools/currency-converter-tool";
import TipTool from "@/components/tools/tip-calculator-tool";
import TargetIncomeTool from "@/components/tools/target-income-tool";

const ALL_TOOLS = [
  {
    id: "savings",
    label: "Objetivo de ahorro",
    desc: "Cuánto tardarás en llegar a tu meta",
    icon: Target,
    tone: "lime",
    tags: ["ahorro", "meta", "objetivo", "tiempo"],
    component: SavingsTool,
  },
  {
    id: "budget",
    label: "Presupuesto mensual",
    desc: "Organiza tus gastos por categoría",
    icon: Wallet,
    tone: "lavender",
    tags: ["presupuesto", "gastos", "mensual", "categorías"],
    component: BudgetTool,
  },
  {
    id: "emergency",
    label: "Fondo de emergencia",
    desc: "Cuánto necesitas ahorrado por seguridad",
    icon: ShieldCheck,
    tone: "lime",
    tags: ["emergencia", "seguridad", "ahorro", "imprevistos"],
    component: EmergencyTool,
  },
  {
    id: "interest",
    label: "Interés compuesto",
    desc: "Simula el crecimiento de tu dinero",
    icon: TrendingUp,
    tone: "lavender",
    tags: ["interés", "crecimiento", "inversión", "largo plazo"],
    component: InterestTool,
  },
  {
    id: "challenge",
    label: "Reto de ahorro",
    desc: "Reto semanal progresivo de 26 o 52 semanas",
    icon: Trophy,
    tone: "lime",
    tags: ["reto", "semanal", "progresivo", "disciplina"],
    component: ChallengeTool,
  },
  {
    id: "trip",
    label: "Ahorro para un viaje",
    desc: "Cuánto ahorrar al mes antes de una fecha",
    icon: Plane,
    tone: "lavender",
    tags: ["viaje", "vacaciones", "ahorro", "fecha"],
    component: TripTool,
  },
  {
    id: "daily",
    label: "Gastos diarios",
    desc: "De gasto diario a mensual y anual",
    icon: Receipt,
    tone: "lime",
    tags: ["diario", "gastos", "mensual", "anual"],
    component: DailyTool,
  },
  {
    id: "comparator",
    label: "Comparador de escenarios",
    desc: "Compara dos formas de ahorrar",
    icon: GitCompare,
    tone: "lavender",
    tags: ["comparar", "escenarios", "simulación", "decisiones"],
    component: ComparatorTool,
  },
  {
    id: "rule502030",
    label: "Regla 50/30/20",
    desc: "Reparte tu ingreso entre necesidades, deseos y ahorro",
    icon: PieChart,
    tone: "lime",
    tags: ["50/30/20", "regla", "presupuesto", "reparto"],
    component: Rule502030Tool,
  },
  {
    id: "percent",
    label: "Porcentaje de ahorro",
    desc: "Qué parte de tu ingreso ahorras",
    icon: Percent,
    tone: "lavender",
    tags: ["porcentaje", "ahorro", "ingreso", "proporción"],
    component: PercentTool,
  },
  {
    id: "bigpurchase",
    label: "Ahorro para una compra grande",
    desc: "Coche, vivienda u otra meta grande",
    icon: ShoppingBag,
    tone: "lime",
    tags: ["compra", "grande", "coche", "vivienda", "meta"],
    component: BigPurchaseTool,
  },
  {
    id: "roundup",
    label: "Ahorro por redondeo",
    desc: "La diferencia de cada compra, ahorrada",
    icon: Coins,
    tone: "lavender",
    tags: ["redondeo", "compras", "microahorro", "automático"],
    component: RoundupTool,
  },
  {
    id: "annual",
    label: "Planificador de ahorro anual",
    desc: "12 meses, ajustando los meses difíciles",
    icon: CalendarRange,
    tone: "lime",
    tags: ["anual", "12 meses", "planificación", "ajustes"],
    component: AnnualTool,
  },
  {
    id: "loan",
    label: "Cuota de un préstamo",
    desc: "Calcula la cuota mensual y los intereses",
    icon: CreditCard,
    tone: "lavender",
    tags: ["préstamo", "cuota", "intereses", "crédito"],
    component: LoanTool,
  },
  {
    id: "groupsplit",
    label: "Reparto de gastos en grupo",
    desc: "Divide un gasto y ve quién debe qué",
    icon: Users,
    tone: "lime",
    tags: ["grupo", "reparto", "gastos", "deudas"],
    component: GroupSplitTool,
  },
  {
    id: "tripdaily",
    label: "Presupuesto diario de viaje",
    desc: "Cuánto puedes gastar al día según lo que llevas",
    icon: Compass,
    tone: "lavender",
    tags: ["viaje", "diario", "presupuesto", "gasto"],
    component: TripDailyTool,
  },
  {
    id: "holiday",
    label: "Ahorro para Navidad",
    desc: "Calcula los meses que faltan y cuánto ahorrar",
    icon: Gift,
    tone: "lime",
    tags: ["navidad", "fiestas", "ahorro", "meses"],
    component: HolidayTool,
  },
  {
    id: "currency",
    label: "Conversor de moneda",
    desc: "Convierte con el tipo de cambio del día",
    icon: Globe,
    tone: "lavender",
    tags: ["moneda", "conversor", "cambio", "divisas"],
    component: CurrencyTool,
  },
  {
    id: "tip",
    label: "Calculadora de propina",
    desc: "Añade propina y reparte la cuenta",
    icon: Utensils,
    tone: "lime",
    tags: ["propina", "cuenta", "reparto", "restaurante"],
    component: TipTool,
  },
  {
    id: "targetincome",
    label: "Cuánto necesito ganar",
    desc: "Ingreso mínimo según tus gastos y tu ahorro deseado",
    icon: Briefcase,
    tone: "lavender",
    tags: ["ingreso", "salario", "gastos", "ahorro", "mínimo"],
    component: TargetIncomeTool,
  },
];

const CATEGORIES = [
  {
    icon: Target,
    label: "Ahorrar para algo",
    desc: "Define un objetivo y un plazo",
    view: "savings",
    tone: "lime",
  },
  {
    icon: Wallet,
    label: "Organizar mi dinero",
    desc: "Presupuesto y gastos por categoría",
    view: "budget",
    tone: "lavender",
  },
  {
    icon: ShieldCheck,
    label: "Fondo de emergencia",
    desc: "Cuánto necesitas y cuándo lo tendrás",
    view: "emergency",
    tone: "lime",
  },
  {
    icon: TrendingUp,
    label: "Hacer crecer mis ahorros",
    desc: "Simula el interés compuesto",
    view: "interest",
    tone: "lavender",
  },
  {
    icon: Trophy,
    label: "Hacer un reto de ahorro",
    desc: "Reto semanal progresivo",
    view: "challenge",
    tone: "lime",
  },
  {
    icon: Plane,
    label: "Preparar un viaje",
    desc: "Calcula tu ahorro mensual antes de irte",
    view: "trip",
    tone: "lavender",
  },
];

export { ALL_TOOLS, CATEGORIES };

