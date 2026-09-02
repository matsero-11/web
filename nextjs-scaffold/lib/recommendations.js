export const EDITORIAL_RECOMMENDATIONS = {
  budget: [
    {
      id: "budget-basics",
      title: "Cómo crear un presupuesto que puedas mantener",
      description:
        "Guía práctica para distinguir gastos esenciales, variables y prescindibles.",
      href: null,
      status: "coming-soon",
      active: false,
    },
  ],
  emergency: [
    {
      id: "emergency-guide",
      title: "Cómo construir un fondo de emergencia",
      description:
        "Aprende a calcular gastos esenciales y elegir una cobertura orientativa.",
      href: null,
      status: "coming-soon",
      active: false,
    },
  ],
  savings: [
    {
      id: "savings-goal-guide",
      title: "Cómo convertir una meta en un plan de ahorro",
      description:
        "Define una fecha, una aportación y pasos realistas para avanzar.",
      href: null,
      status: "coming-soon",
      active: false,
    },
  ],
  loan: [
    {
      id: "loan-comparison-guide",
      title: "Cómo comparar préstamos sin fijarte solo en la cuota",
      description:
        "Qué revisar además de la cuota mensual: plazo, interés, comisiones y coste total.",
      href: null,
      status: "coming-soon",
      active: false,
    },
  ],
  interest: [
    {
      id: "compound-interest-guide",
      title: "Cómo interpretar una simulación de interés compuesto",
      description:
        "Entiende rentabilidad hipotética, plazo, inflación y aportaciones.",
      href: null,
      status: "coming-soon",
      active: false,
    },
  ],
  travel: [
    {
      id: "travel-budget-guide",
      title: "Checklist para planificar el presupuesto de un viaje",
      description:
        "Transporte, alojamiento, comida, seguro, actividades e imprevistos.",
      href: null,
      status: "coming-soon",
      active: false,
    },
  ],
};

export const PARTNER_RECOMMENDATIONS = {
  budget: [],
  emergency: [],
  savings: [],
  loan: [],
  interest: [],
  travel: [],
};

export function getEditorialRecommendations(toolId) {
  return EDITORIAL_RECOMMENDATIONS[toolId] || [];
}

export function getPartnerRecommendations(toolId) {
  return PARTNER_RECOMMENDATIONS[toolId] || [];
        }
