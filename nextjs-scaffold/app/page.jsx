import HomeScreen from "@/components/HomeScreen";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://metabox-web.vercel.app";

export const metadata = {
  title: "MetaBox — Herramientas de Ahorro y Planificación Financiera",
  description: "Calculadoras y herramientas interactivas gratuitas para optimizar tu presupuesto, ahorro y finanzas personales de forma sencilla y 100% privada.",
  keywords: [
    "calculadoras financieras",
    "herramientas de ahorro",
    "presupuesto mensual",
    "interes compuesto",
    "finanzas personales",
    "simulador de ahorro"
  ],
  alternates: {
    canonical: `${BASE_URL}/`,
  },
  openGraph: {
    title: "MetaBox — Herramientas de Ahorro y Planificación Financiera",
    description: "Calculadoras y herramientas interactivas gratuitas para optimizar tu presupuesto, ahorro y finanzas personales de forma sencilla.",
    url: `${BASE_URL}/`,
    type: "website",
    siteName: "MetaBox",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function Page() {
  // Esquema enriquecido WebSite + Organization para posicionamiento de marca
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "MetaBox",
        url: BASE_URL,
        description: "Calculadoras y herramientas interactivas gratuitas para optimizar tu presupuesto, ahorro y finanzas personales.",
        potentialAction: {
          "@type": "SearchAction",
          target: `${BASE_URL}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        name: "MetaBox",
        url: BASE_URL,
        logo: `${BASE_URL}/web-app-manifest-512x512.png`,
        sameAs: [],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
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
    </>
  );
}

