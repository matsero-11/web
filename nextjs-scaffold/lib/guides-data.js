export const GUIDES = [
  {
    id: "fondo-emergencia",
    badge: "Guía de Seguridad Financiera",
    title: "Cómo crear un fondo de emergencia: cuánto necesitas y dónde guardarlo",
    subtitle: "Una red de protección indispensable para afrontar imprevistos graves sin arruinar tus finanzas ni endeudarte.",
    meta: "⏱ 8 min de lectura · Actualizado septiembre 2026",
    summaryBox: {
      label: "En resumen",
      text: "Para crear un fondo de emergencia sólido necesitas acumular entre 3 y 6 meses de tus gastos esenciales. Guárdalo siempre en una cuenta separada, remunerada y sin comisiones, totalmente independiente de tu cuenta del día a día."
    },
    tableOfContents: [
      { id: "que-es", label: "1. ¿Qué es y por qué es vital?" },
      { id: "cuanto-necesitas", label: "2. Calcula tu objetivo exacto" },
      { id: "donde-guardarlo", label: "3. Dónde guardar el dinero" },
      { id: "paso-a-paso", label: "4. Plan paso a paso para construirlo" },
      { id: "errores", label: "5. Errores frecuentes que debes evitar" },
      { id: "faqs", label: "6. Preguntas frecuentes" }
    ],
    sections: [
      {
        id: "que-es",
        title: "1. ¿Qué es y por qué es vital?",
        content: "Un fondo de emergencia no es una inversión para ganar rentabilidad, sino un seguro contra los imprevistos de la vida: una avería grave del coche, una reforma urgente en casa o una pérdida temporal de ingresos. Contar con este colchón evita que tengas que recurrir a tarjetas de crédito con intereses abusivos o préstamos personales en el peor momento."
      },
      {
        id: "cuanto-necesitas",
        title: "2. Calcula tu objetivo exacto",
        content: "La regla general recomienda acumular entre 3 y 6 meses de tus gastos fijos esenciales. No se trata de cubrir tu nivel de vida completo, sino lo indispensable para sobrevivir si tus ingresos se detienen.",
        example: {
          title: "Ejemplo práctico de cálculo",
          text: "Si tus gastos fijos (alquiler, suministros, cesta básica, seguros) suman 1.000 € al mes, tu fondo mínimo de seguridad debe ser de 3.000 € (3 meses), siendo altamente recomendable alcanzar los 6.000 € (6 meses) si eres autónomo o tienes ingresos variables."
        }
      },
      {
        id: "donde-guardarlo",
        title: "3. Dónde guardar el dinero",
        content: "El dinero de las emergencias debe cumplir dos normas estrictas: disponibilidad inmediata y seguridad absoluta. No debe invertirse en bolsa ni en activos de riesgo volátiles.",
        table: {
          headers: ["Opción", "Disponibilidad", "Riesgo", "Ideal para..."],
          rows: [
            ["Cuenta remunerada online", "Inmediata (24-48h)", "Nulo (Fondo de garantía)", "La mejor opción general"],
            ["Cuenta corriente habitual", "Inmediata", "Nulo", "Evitar (mezclas gastos y tentaciones)"],
            ["Depósito a plazo fijo", "Penalización por rescate", "Nulo", "Solo una parte si supera los 6 meses"]
          ]
        }
      },
      {
        id: "paso-a-paso",
        title: "4. Plan paso a paso para construirlo",
        steps: [
          { num: "01", title: "Audita tus gastos esenciales", desc: "Separa de forma implacable tus caprichos de tus obligaciones reales." },
          { num: "02", title: "Abre una cuenta nodriza independiente", desc: "Elige una entidad diferente a tu banco principal para eliminar tentaciones visuales." },
          { num: "03", title: "Automatiza una transferencia mensual", desc: "Programa el ingreso automático justo el día después de cobrar." },
          { num: "04", title: "Destina ingresos extraordinarios", desc: "Inyecta devoluciones de impuestos, pagas extras o bonus directamente al fondo hasta completarlo." }
        ]
      },
      {
        id: "errores",
        title: "5. Errores frecuentes que debes evitar",
        errors: [
          { title: "Invertir el fondo en bolsa", desc: "Si el mercado cae un 20% justo cuando necesitas el dinero para una urgencia real, asumirás pérdidas obligadas." },
          { title: "Confundir un capricho con una emergencia", desc: "Irse de vacaciones o comprar un teléfono nuevo no constituye una emergencia bajo ningún concepto." },
          { title: "Dejarlo en la cuenta corriente corriente", desc: "El dinero visible siempre tiende a gastarse en el día a día." }
        ]
      },
      {
        id: "faqs",
        title: "6. Preguntas frecuentes",
        faqs: [
          { q: "¿Qué hago si tengo deudas pendientes?", a: "Es aconsejable mantener un mini fondo inicial de 1.000 € y destinar el resto del excedente a liquidar deudas con intereses altos antes de completar los 6 meses." },
          { q: "¿Debo tocar el fondo si sube la inflación?", a: "Busca siempre cuentas remuneradas que ofrezcan un interés aceptable para mitigar la pérdida de poder adquisitivo sin asumir riesgos." }
        ]
      }
    ]
  },
  {
    id: "cuanto-ahorrar",
    badge: "Guía de Planificación de Ingresos",
    title: "Cómo ahorrar 5.000 € en 12 meses: plan paso a paso y realista",
    subtitle: "Un método práctico para calcular tus márgenes, recortar sin sufrir y comprobar exactamente si vas por buen camino cada semana.",
    meta: "⏱ 9 min de lectura · Actualizado septiembre 2026",
    summaryBox: {
      label: "En resumen",
      text: "Para acumular 5.000 € en un año necesitas apartar exactamente 416,66 € al mes partiendo desde cero. La clave reside en automatizar el ahorro nada más cobrar y aplicar una estructura de control estricta."
    },
    tableOfContents: [
      { id: "matematicas", label: "1. La descomposición matemática de la meta" },
      { id: "regla-presupuesto", label: "2. Adapta tu presupuesto con la regla 50/30/20" },
      { id: "recorte-inteligente", label: "3. Cómo recortar gastos sin renunciar a vivir" },
      { id: "metodo-mes", label: "4. El plan de acción mensual" },
      { id: "errores-ahorro", label: "5. Errores que arruinan el proceso" },
      { id: "faqs-ahorro", label: "6. Preguntas frecuentes" }
    ],
    sections: [
      {
        id: "matematicas",
        title: "1. La descomposición matemática de la meta",
        content: "Fijar un objetivo global de 5.000 € puede abrumar. Al dividirlo en fragmentos temporales más pequeños, el cerebro procesa la meta como un reto perfectamente asumible.",
        table: {
          headers: ["Frecuencia temporal", "Cantidad a apartar", "Esfuerzo acumulado"],
          rows: [
            ["Diaria", "~ 13,70 € / día", "Impresceptible"],
            ["Semanal", "~ 96,15 € / semana", "Fácil de monitorizar"],
            ["Mensual", "~ 416,66 € / mes", "El estándar ideal"]
          ]
        }
      },
      {
        id: "regla-presupuesto",
        title: "2. Adapta tu presupuesto con la regla 50/30/20",
        content: "Para conseguir este ritmo de ahorro sin asfixiarte, tus ingresos netos deben sostenerse sobre una estructura equilibrada. Si ganas 1.800 €, tus necesidades básicas no deberían superar los 900 €, dejando espacio de maniobra."
      },
      {
        id: "recorte-inteligente",
        title: "3. Cómo recortar gastos sin renunciar a vivir",
        steps: [
          { num: "01", title: "Auditoría de suscripciones fantasma", desc: "Cancela plataformas de streaming, aplicaciones o cuotas de gimnasio que no utilices activamente." },
          { num: "02", title: "Optimización de la cesta de la compra", desc: "Planifica los menús semanales y reduce el consumo de comida a domicilio o ultraprocesados." },
          { num: "03", title: "Renegociación de tarifas recurrentes", desc: "Llama a tus suministradores de luz, internet y telefonía para buscar ofertas de mercado actuales." }
        ]
      },
      {
        id: "metodo-mes",
        title: "4. El plan de acción mensual",
        content: "El día exacto en que recibas tu nómina, transfiere de forma automática los 417 € a una cuenta de ahorro independiente. Vive estrictamente con lo que queda en la cuenta principal.",
        example: {
          title: "Escenario de éxito",
          text: "Mes 1 a 3: Creas el hábito. Mes 4 a 8: Ajustas pequeños excesos. Mes 9 a 12: El saldo acumulado genera un impulso psicológico motivador brutal que te empuja a terminar la meta."
        }
      },
      {
        id: "errores-ahorro",
        title: "5. Errores que arruinan el proceso",
        errors: [
          { title: "Ahorrar solo lo que sobra a fin de mes", desc: "Si dejas el ahorro para el final, el dinero tiende a evaporarse en gastos hormiga invisibles." },
          { title: "Ser demasiado radical el primer mes", desc: "Cortar el 100% de tu ocio social genera un efecto rebote que te llevará a abandonar en la semana tres." }
        ]
      },
      {
        id: "faqs-ahorro",
        title: "6. Preguntas frecuentes",
        faqs: [
          { q: "¿Qué hago si un mes tengo un gasto imprevisto y no puedo ahorrar?", a: "No pasa nada. No abandones el año entero; simplemente compensa la mitad el mes siguiente o retoma el hábito sin culpas." },
          { q: "¿Es mejor domiciliar el ahorro o hacerlo manual?", a: "La domiciliación automática elimina por completo la necesidad de depender de tu fuerza de voluntad." }
        ]
      }
    ]
  },
  {
    id: "interes-compuesto",
    badge: "Guía de Inversión y Crecimiento",
    title: "Cómo funciona el interés compuesto paso a paso y cómo exprimirlo",
    subtitle: "El fenómeno matemático considerado por Albert Einstein como la octava maravilla del mundo para multiplicar tu patrimonio a largo plazo.",
    meta: "⏱ 10 min de lectura · Actualizado septiembre 2026",
    summaryBox: {
      label: "En resumen",
      text: "El interés compuesto se produce cuando los beneficios generados por tus ahorros se reinvierten para generar, a su vez, nuevos rendimientos. El factor determinante no es el dinero inicial, sino empezar cuanto antes gracias al factor tiempo."
    },
    tableOfContents: [
      { id: "efecto-bola", label: "1. El efecto bola de nieve explicado con números" },
      { id: "tiempo-cantidad", label: "2. ¿Qué importa más: el tiempo o la cantidad?" },
      { id: "ejemplo-real", label: "3. Simulación de crecimiento a 20 años" },
      { id: "pasos-practicos", label: "4. Pasos para ponerlo a trabajar a tu favor" },
      { id: "trampas-inversion", label: "5. Errores comunes de perspectiva" },
      { id: "faqs-interes", label: "6. Preguntas frecuentes" }
    ],
    sections: [
      {
        id: "efecto-bola",
        title: "1. El efecto bola de nieve explicado con números",
        content: "A diferencia del interés simple (donde solo generas ganancias sobre el dinero inicial depositado), el interés compuesto calcula rentabilidades sobre el capital acumulado total (capital inicial más intereses previos)."
      },
      {
        id: "tiempo-cantidad",
        title: "2. ¿Qué importa más: el tiempo o la cantidad?",
        content: "La matemática demuestra de forma implacable que empezar a invertir 100 € al mes a los 20 años genera un patrimonio final muy superior a empezar a aportar 300 € al mes a los 40 años.",
        table: {
          headers: ["Perfil inversor", "Aportación mensual", "Edad de inicio", "Capital final aproximado (a los 65)"],
          rows: [
            ["Inversor madrugador", "150 €", "25 años (40 años de plazo)", "Muy superior por el factor exponencial"],
            ["Inversor tardío", "300 €", "45 años (20 años de plazo)", "Inferior pese a aportar el doble de dinero mensual"]
          ]
        }
      },
      {
        id: "ejemplo-real",
        title: "3. Simulación de crecimiento a largo plazo",
        steps: [
          { num: "01", title: "Fase de despegue silencioso (Años 1-5)", desc: "Los resultados parecen pequeños y el crecimiento depende casi exclusivamente de tu esfuerzo de ahorro personal." },
          { num: "02", title: "Fase de aceleración (Años 6-15)", desc: "Los intereses generados empiezan a igualar o superar tus aportaciones periódicas mensuales." },
          { num: "03", title: "Fase exponencial (Años 16+)", desc: "La curva se dispara verticalmente; los rendimientos superan con creces cualquier esfuerzo de ahorro inicial." }
        ]
      },
      {
        id: "pasos-practicos",
        title: "4. Pasos para ponerlo a trabajar a tu favor",
        content: "Para beneficiarte de este sistema necesitas vehículos financieros de bajo coste, diversificados globalmente y con capacidad de reinversión automática de dividendos."
      },
      {
        id: "trampas-inversion",
        title: "5. Errores comunes de perspectiva",
        errors: [
          { title: "Retirar los beneficios prematuramente", desc: "Interrumpir el ciclo fiscal o de inversión corta de raíz la curva exponencial de crecimiento." },
          { title: "Buscar rentabilidades milagrosas a corto plazo", desc: "El verdadero interés compuesto requiere paciencia, constancia y horizontes temporales de varios años." }
        ]
      },
      {
        id: "faqs-interes",
        title: "6. Preguntas frecuentes",
        faqs: [
          { q: "¿Qué rentabilidad media histórica se suele asumir?", a: "Los índices globales diversificados a largo plazo han historiado medias aproximadas del 6% al 8% anual ajustado a la inflación." },
          { q: "¿Es necesario tener grandes conocimientos técnicos?", a: "En absoluto. Hoy en día existen herramientas automatizadas y fondos indexados diseñados para simplificar todo el proceso." }
        ]
      }
    ]
  }
];
    
