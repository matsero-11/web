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

  // Monstruo 3: Parametric Long-Tail Metadata (adaptación dinámica según la intención de búsqueda o parámetros)
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

  // Monstruo 1: SGE Optimization avanzada mediante bloques @graph (SoftwareApplication + FAQPage)
  // Esto inyecta preguntas y respuestas estructuradas que la IA de Google extrae directamente para las AI Overviews.
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
            name: `¿Cómo calcular y planificar ${kw}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Utilizando nuestra herramienta especializada en ${kw}, puedes proyectar tus resultados paso a paso de manera totalmente gratuita y optimizada para cumplir tus metas.`
            }
          })) : [])
        ]
      }
    ]
  };

  // Resolver herramientas relacionadas para el Authority Hijacking
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

      {/* Bloque semántico Long-Tail y Authority Hijacking optimizado para crawlers de Google */}
      <section className="max-w-4xl mx-auto px-4 py-8 mt-12 border-t border-zinc-800 text-zinc-400 text-sm">
        <h2 className="text-lg font-semibold text-zinc-200 mb-3">
          Preguntas frecuentes y optimización financiera
        </h2>
        <p className="mb-4">
          Utiliza nuestra herramienta de <strong>{tool.label.toLowerCase()}</strong> para proyectar tus metas con precisión matemática. 
          {meta.keywords && ` Optimizado para búsquedas de ${meta.keywords.join(", ")}.`}
        </p>

        {/* Sección FAQ visible en texto para reforzar la indexación semántica SGE */}
        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/80">
            <h3 className="font-medium text-zinc-300 text-xs uppercase tracking-wider mb-1">Precisión y Privacidad</h3>
            <p className="text-xs text-zinc-500">Todos los cálculos se procesan directamente en tu navegador garantizando confidencialidad absoluta.</p>
          </div>
          <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/80">
            <h3 className="font-medium text-zinc-300 text-xs uppercase tracking-wider mb-1">Optimización de Metas</h3>
            <p className="text-xs text-zinc-500">Diseñado bajo estándares de rendimiento financiero de alta categoría para resultados instantáneos.</p>
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
