import {
  Target,
  PiggyBank,
  Plane,
  Home as HomeIcon,
  TrendingUp,
  ShieldCheck,
  CalendarCheck,
  ShoppingBag,
  MoreHorizontal,
} from "lucide-react";

// 1. IMPORTA AQUÍ TUS COMPONENTES (ajusta las rutas según dónde los tengas guardados)
import SavingsTool from "@/components/tools/SavingsTool"; // O como se llame tu archivo para 'savings'
import BudgetTool from "@/components/tools/BudgetTool";
import EmergencyTool from "@/components/tools/EmergencyTool";
import InterestTool from "@/components/tools/InterestTool";
import ChallengeTool from "@/components/tools/ChallengeTool";
import TripTool from "@/components/tools/TripTool";
import DailyTool from "@/components/tools/DailyTool";
import ComparatorTool from "@/components/tools/ComparatorTool";
import Rule502030Tool from "@/components/tools/Rule502030Tool";
import PercentTool from "@/components/tools/PercentTool";
import BigPurchaseTool from "@/components/tools/BigPurchaseTool";
import RoundupTool from "@/components/tools/RoundupTool";
import AnnualTool from "@/components/tools/AnnualTool";
import LoanTool from "@/components/tools/LoanTool";
import GroupSplitTool from "@/components/tools/GroupSplitTool";
import TripDailyTool from "@/components/tools/TripDailyTool";
import HolidayTool from "@/components/tools/HolidayTool";
import CurrencyTool from "@/components/tools/CurrencyTool";
import TipTool from "@/components/tools/TipTool";
import TargetIncomeTool from "@/components/tools/TargetIncomeTool";

const ALL_TOOLS = [
  {
    id: "savings",
    label: "Objetivo de ahorro",
    desc: "Cuánto tardarás en llegar a tu meta",
    icon: Target,
    tone: "lime",
    tags: ["ahorro", "meta", "objetivo", "tiempo"],
    component: SavingsTool, // <--- ¡Añadido aquí!
  },
  {
    id: "budget",
    label: "Presupuesto mensual",
    desc: "Organiza tus gastos por categoría",
    icon: PiggyBank,
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
    icon: CalendarCheck,
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
    icon: MoreHorizontal,
    tone: "lime",
    tags: ["diario", "gastos", "mensual", "anual"],
    component: DailyTool,
  },
  {
    id: "comparator",
    label: "Comparador de escenarios",
    desc: "Compara dos formas de ahorrar",
    icon: HomeIcon,
    tone: "lavender",
    tags: ["comparar", "escenarios", "simulación", "decisiones"],
    component: ComparatorTool,
  },
  {
    id: "rule502030",
    label: "Regla 50/30/20",
    desc: "Reparte tu ingreso entre necesidades, deseos y ahorro",
    icon: PiggyBank,
    tone: "lime",
    tags: ["50/30/20", "regla", "presupuesto", "reparto"],
    component: Rule502030Tool,
  },
  {
    id: "percent",
    label: "Porcentaje de ahorro",
    desc: "Qué parte de tu ingreso ahorras",
    icon: TrendingUp,
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
    icon: PiggyBank,
    tone: "lavender",
    tags: ["redondeo", "compras", "microahorro", "automático"],
    component: RoundupTool,
  },
  {
    id: "annual",
    label: "Planificador de ahorro anual",
    desc: "12 meses, ajustando los meses difíciles",
    icon: CalendarCheck,
    tone: "lime",
    tags: ["anual", "12 meses", "planificación", "ajustes"],
    component: AnnualTool,
  },
  {
    id: "loan",
    label: "Cuota de un préstamo",
    desc: "Calcula la cuota mensual y los intereses",
    icon: TrendingUp,
    tone: "lavender",
    tags: ["préstamo", "cuota", "intereses", "crédito"],
    component: LoanTool,
  },
  {
    id: "groupsplit",
    label: "Reparto de gastos en grupo",
    desc: "Divide un gasto y ve quién debe qué",
    icon: PiggyBank,
    tone: "lime",
    tags: ["grupo", "reparto", "gastos", "deudas"],
    component: GroupSplitTool,
  },
  {
    id: "tripdaily",
    label: "Presupuesto diario de viaje",
    desc: "Cuánto puedes gastar al día según lo que llevas",
    icon: Plane,
    tone: "lavender",
    tags: ["viaje", "diario", "presupuesto", "gasto"],
    component: TripDailyTool,
  },
  {
    id: "holiday",
    label: "Ahorro para Navidad",
    desc: "Calcula los meses que faltan y cuánto ahorrar",
    icon: CalendarCheck,
    tone: "lime",
    tags: ["navidad", "fiestas", "ahorro", "meses"],
    component: HolidayTool,
  },
  {
    id: "currency",
    label: "Conversor de moneda",
    desc: "Convierte con el tipo de cambio del día",
    icon: Plane,
    tone: "lavender",
    tags: ["moneda", "conversor", "cambio", "divisas"],
    component: CurrencyTool,
  },
  {
    id: "tip",
    label: "Calculadora de propina",
    desc: "Añade propina y reparte la cuenta",
    icon: PiggyBank,
    tone: "lime",
    tags: ["propina", "cuenta", "reparto", "restaurante"],
    component: TipTool,
  },
  {
    id: "targetincome",
    label: "Cuánto necesito ganar",
    desc: "Ingreso mínimo según tus gastos y tu ahorro deseado",
    icon: TrendingUp,
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
    icon: PiggyBank,
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
    icon: CalendarCheck,
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
