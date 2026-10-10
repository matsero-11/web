// lib/affiliate-config.js

export const AFFILIATE_CONFIG = {
  enabled: true, // Ponlo en true cuando quieras habilitarlo de forma global

  // Productos por categoría mapeados exactamente a las props de AffiliateSlot
  products: {
    cuentasRemuneradas: [
      {
        id: "trade-republic",
        active: false, // Cambiar a true cuando esté listo
        title: "Trade Republic",
        description: "Hasta 3,75% TAE sobre tu efectivo diario sin comisiones.",
        buttonText: "Ver cuenta sin comisiones",
        link: "https://metabox.app/go/trade-republic",
        badge: "Recomendado para ahorro",
      },
      {
        id: "myinvestor",
        active: false,
        title: "MyInvestor",
        description: "Cuenta 100% online y remunerada en la banca española.",
        buttonText: "Abrir cuenta",
        link: "https://metabox.app/go/myinvestor",
        badge: "Banca Española",
      },
    ],
    brokers: [
      {
        id: "freedom24",
        active: false,
        title: "Freedom24",
        description: "Planes de ahorro e inversión en ETF y Acciones.",
        buttonText: "Simular con este bróker",
        link: "https://metabox.app/go/freedom24",
        badge: "Para inversores",
      },
    ],
  },
};

// Helper opcional para obtener una oferta lista para el componente AffiliateSlot
export function getActiveOffer(category, index = 0) {
  const categoryList = AFFILIATE_CONFIG.products[category];
  if (!categoryList || !categoryList[index]) return null;
  
  const product = categoryList[index];
  
  // Si el switch global o el producto están inactivos, devolvemos active: false
  return {
    ...product,
    active: AFFILIATE_CONFIG.enabled && product.active,
  };
}
