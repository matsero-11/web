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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = ALL_TOOLS.find((item) => item.slug === slug);
  const meta = SEO_METADATA[tool?.id];

  if (!meta || !tool) {
    return {};
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://metabox-web.vercel.app";

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords || [],
    alternates: {
      canonical: `${baseUrl}/herramientas/${slug}`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${baseUrl}/herramientas/${slug}`,
      type: "website",
    },
  };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const tool = ALL_TOOLS.find((item) => item.slug === slug);
  const meta = SEO_METADATA[tool?.id];

  if (!tool || !meta) {
    notFound();
  }

  // Schema JSON-LD programático avanzado con keywords y soporte de autoridad
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
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
  };

  // Resolver herramientas relacionadas para el Authority Hijacking (enlazado interno algorítmico)
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
