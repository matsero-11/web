import HomeScreen from "@/components/HomeScreen";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://metabox-web.vercel.app";

export const metadata = {
  title: {
    absolute: "MetaBox — Herramientas de Ahorro y Planificación Financiera",
  },
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

      {/* Contenedor principal con espaciado optimizado */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", width: "100%", maxWidth: "56rem", margin: "0 auto" }}>
        <header style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "0 1rem" }}>
          <h1
            style={{
              color: "var(--text)",
              fontSize: "clamp(1.4rem, 3.5vw, 1.85rem)",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              lineHeight: 1.25,
            }}
          >
            Herramientas de Ahorro y Planificación Financiera
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
              lineHeight: 1.5,
            }}
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

