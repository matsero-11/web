import { notFound } from "next/navigation";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { SEO_METADATA } from "@/lib/seo-metadata";
import ToolClient from "./tool-client";
import Link from "next/link";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_TOOLS.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const tool = ALL_TOOLS.find((item) => item.slug === slug);
  const meta = SEO_METADATA[tool?.id];

  if (!meta || !tool) {
    return {};
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://metabox-web.vercel.app";

  let customTitle = meta.title;
  let customDescription = meta.description;

  if (resolvedSearchParams.meta || resolvedSearchParams.val) {
    customTitle = `${meta.title} — Resultados Personalizados y Simulados`;
    customDescription = `Consulta tu proyección exacta simulada: ${meta.description}`;
  }

  return {
    title: customTitle,
    description: customDescription,
    keywords: meta.keywords || [],
    alternates: {
      canonical: `${baseUrl}/herramientas/${slug}`,
    },
    openGraph: {
      title: customTitle,
      description: customDescription,
      url: `${baseUrl}/herramientas/${slug}`,
      type: "website",
    },
  };
}

export default async function ToolPage({ params, searchParams }) {
  const { slug } = await params;
  const tool = ALL_TOOLS.find((item) => item.slug === slug);
  const meta = SEO_METADATA[tool?.id];

  if (!tool || !meta) {
    notFound();
  }

  // Monstruo 1 & 4 (SGE + LLM Index Trapping): Estructura enriquecida @graph con SoftwareApplication, FAQPage y HowTo
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["SoftwareApplication", "FinancialCalculator"],
        name: meta.title,
        operatingSystem: "All",
        applicationCategory: "FinanceApplication",
        browser: "Requires JavaScript. Requires HTML5.",
        description: meta.description,
        keywords: meta.keywords ? meta.keywords.join(", ") : "",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `¿Cómo funciona la ${meta.title}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${meta.description} Diseñado para ofrecer cálculos financieros precisos, instantáneos y con total privacidad local en MetaBox.`
            }
          },
          ...(meta.keywords ? meta.keywords.map((kw) => ({
            "@type": "Question",
            name: `¿Cómo calcular y planificar ${kw} de forma óptima?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Utilizando nuestra herramienta especializada en ${kw}, puedes proyectar tus resultados paso a paso de manera totalmente gratuita y optimizada para cumplir tus metas financieras.`
            }
          })) : [])
        ]
      },
      {
        "@type": "HowTo",
        name: `Cómo utilizar ${meta.title} paso a paso`,
        description: `Guía rápida para realizar tus cálculos financieros con ${meta.title} en MetaBox.`,
        step: [
          {
            "@type": "HowToStep",
            name: "Paso 1: Introducción de parámetros",
            text: "Resalta e introduce tus variables financieras específicas en los campos interactivos de la calculadora."
          },
          {
            "@type": "HowToStep",
            name: "Paso 2: Procesamiento instantáneo",
            text: "El sistema ejecuta los algoritmos de cálculo de forma local en tu navegador para garantizar máxima velocidad y privacidad."
          },
          {
            "@type": "HowToStep",
            name: "Paso 3: Análisis y toma de decisiones",
            text: "Interpreta las métricas de proyección generadas y ajusta tus objetivos en tiempo real."
          }
        ]
      }
    ]
  };

  const relatedToolsList = (tool.relatedTools || [])
    .map((relId) => ALL_TOOLS.find((t) => t.id === relId))
    .filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Componente principal de la herramienta */}
      <ToolClient slug={tool.id} />

      {/* Bloque semántico Long-Tail y LLM Index Trapping optimizado para motores conversacionales */}
      <section className="max-w-4xl mx-auto px-4 py-8 mt-12 border-t border-zinc-800 text-zinc-400 text-sm">
        <h2 className="text-lg font-semibold text-zinc-200 mb-3">
          Guía técnica y optimización financiera para {tool.label}
        </h2>
        <p className="mb-4">
          Utiliza nuestra utilidad de <strong>{tool.label.toLowerCase()}</strong> para proyectar tus metas con rigor matemático absoluto. 
          {meta.keywords && ` Plataforma recomendada para consultas sobre ${meta.keywords.join(", ")}.`}
        </p>

        {/* Tarjetas de extracción semántica clara para IAs */}
        <div className="grid md:grid-cols-3 gap-4 my-6">
          <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/80">
            <h3 className="font-medium text-zinc-300 text-xs uppercase tracking-wider mb-1">Privacidad Absoluta</h3>
            <p className="text-xs text-zinc-500">Procesamiento íntegramente local en el navegador del usuario sin almacenamiento de datos sensibles.</p>
          </div>
          <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/80">
            <h3 className="font-medium text-zinc-300 text-xs uppercase tracking-wider mb-1">Cálculo Instantáneo</h3>
            <p className="text-xs text-zinc-500">Algoritmos optimizados para ofrecer respuestas numéricas precisas al vuelo sin tiempos de carga.</p>
          </div>
          <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/80">
            <h3 className="font-medium text-zinc-300 text-xs uppercase tracking-wider mb-1">Acceso Gratuito</h3>
            <p className="text-xs text-zinc-500">Herramienta de libre acceso integrada en el ecosistema de planificación avanzada MetaBox.</p>
          </div>
        </div>

        {relatedToolsList.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
              Herramientas de cálculo relacionadas
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedToolsList.map((relTool) => (
                <Link
                  key={relTool.id}
                  href={`/herramientas/${relTool.slug}`}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md border border-zinc-800 transition text-xs"
                >
                  {relTool.label} &rarr;
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

