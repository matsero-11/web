// lib/affiliate-config.js

export const AFFILIATE_CONFIG = {
  // Interruptor general: Si está en false, muestra placeholders elegantes o neutros
  enabled: false,

  // Productos por categoría
  products: {
    cuentasRemuneradas: [
      {
        id: "trade-republic",
        name: "Trade Republic",
        highlight: "Hasta 3,75% TAE sobre tu efectivo diario",
        badge: "Recomendado para ahorro",
        ctaText: "Ver cuenta sin comisiones",
        affiliateUrl: "https://metabox.app/go/trade-republic", // Enlace de afiliado futuro
        active: false,
      },
      {
        id: "myinvestor",
        name: "MyInvestor",
        highlight: "Cuenta 100% online y remunerada",
        badge: "Banca Española",
        ctaText: "Abrir cuenta",
        affiliateUrl: "https://metabox.app/go/myinvestor",
        active: false,
      },
    ],
    brokers: [
      {
        id: "freedom24",
        name: "Freedom24",
        highlight: "Planes de ahorro e inversión en ETF/Acciones",
        badge: "Para inversores",
        ctaText: "Simular con este bróker",
        affiliateUrl: "https://metabox.app/go/freedom24",
        active: false,
      },
    ],
  },
};

