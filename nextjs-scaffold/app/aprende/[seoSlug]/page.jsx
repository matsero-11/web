import { notFound } from "next/navigation";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { SEO_METADATA } from "@/lib/seo-metadata";
import { MATRIX_CONFIG, generateMatrixPaths } from "@/lib/seo-matrix";
import ToolClient from "@/app/herramientas/[slug]/tool-client";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, ChevronRight } from "lucide-react";

export const dynamicParams = false;

export function generateStaticParams() {
  return generateMatrixPaths(ALL_TOOLS);
}

export async function generateMetadata({ params }) {
  const { seoSlug } = await params;
  const paths = generateMatrixPaths(ALL_TOOLS);
  const currentPath = paths.find((p) => p.seoSlug === seoSlug);

  if (!currentPath) return {};

  const tool = ALL_TOOLS.find((t) => t.slug === currentPath.toolSlug);
  const meta = SEO_METADATA[tool?.id];
  const perfil = MATRIX_CONFIG.perfiles.find((p) => p.slug === currentPath.profileSlug);
  const plazo = MATRIX_CONFIG.plazos.find((p) => p.slug === currentPath.timeSlug);

  if (!tool || !meta) return {};

  const title = `${meta.title} ${perfil.nombre} (${plazo.nombre}) — MetaBox`;
  const description = `${meta.description} Estrategia optimizada ${perfil.desc} con horizonte temporal de ${plazo.anos} años. Calculadora 100% gratuita y privada.`;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://metabox-web.vercel.app";

  return {
    title,
    description,
    keywords: [...(meta.keywords || []), perfil.slug, plazo.slug],
    alternates: {
      canonical: `${baseUrl}/aprende/${seoSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/aprende/${seoSlug}`,
      type: "article",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
  };
}

export default async function MatrixPage({ params }) {
  const { seoSlug } = await params;
  const paths = generateMatrixPaths(ALL_TOOLS);
  const currentPath = paths.find((p) => p.seoSlug === seoSlug);

  if (!currentPath) {
    notFound();
  }

  const tool = ALL_TOOLS.find((t) => t.slug === currentPath.toolSlug);
  const meta = SEO_METADATA[tool?.id];
  const perfil = MATRIX_CONFIG.perfiles.find((p) => p.slug === currentPath.profileSlug);
  const plazo = MATRIX_CONFIG.plazos.find((p) => p.slug === currentPath.timeSlug);

  if (!tool || !meta) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://metabox-web.vercel.app";

  // Esquema JSON-LD enriquecido para potenciar el SEO programático (BreadcrumbList + TechArticle)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: tool.label,
            item: `${baseUrl}/herramientas/${tool.slug}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${tool.label} ${perfil.nombre} (${plazo.nombre})`,
            item: `${baseUrl}/aprende/${seoSlug}`,
          },
        ],
      },
      {
        "@type": "TechArticle",
        headline: `${meta.title} ${perfil.nombre} (${plazo.nombre})`,
        description: meta.description,
        inLanguage: "es",
        mainEntityOfPage: `${baseUrl}/aprende/${seoSlug}`,
        publisher: {
          "@type": "Organization",
          name: "MetaBox",
          url: baseUrl,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black antialiased">
        <header className="border-b border-zinc-900 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> <span>Volver a MetaBox</span>
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Guía Especializada ⚡
          </span>
        </header>

        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          {/* Breadcrumb visual */}
          <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6 flex-wrap">
            <Link href="/" className="hover:text-zinc-300 transition">
              Inicio
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <Link href={`/herramientas/${tool.slug}`} className="hover:text-zinc-300 transition">
              {tool.label}
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-zinc-400 font-medium">{perfil.nombre}</span>
          </nav>

          <div className="space-y-4 mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {meta.title} <span className="text-emerald-400">{perfil.nombre}</span> ({plazo.nombre})
            </h1>
            <p className="text-zinc-400 max-w-2xl mx-auto text-base">
              Realiza tus cálculos de forma precisa. Simulador optimizado {perfil.desc} para proyectar tus resultados a un horizonte de {plazo.anos} años.
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-sm mb-12">
            {/* CORREGIDO: Se pasa tool.slug para garantizar que el cliente monte el componente correspondiente */}
            <ToolClient slug={tool.slug} />
          </div>

          <section className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-6 space-y-4 text-sm text-zinc-300">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Claves para este escenario
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>Proyección a largo plazo calculada de forma exacta para un horizonte de {plazo.anos} años.</li>
              <li>Interfaz y métricas configuradas para perfiles de tipo {perfil.nombre.toLowerCase()}.</li>
              <li>Procesamiento 100% privado en tu navegador, sin enviar datos a servidores externos.</li>
            </ul>

            <div className="pt-4 border-t border-zinc-800/60 mt-4">
              <Link
                href={`/herramientas/${tool.slug}`}
                className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 transition"
              >
                Ver la herramienta principal {tool.label} &rarr;
              </Link>
            </div>
          </section>
        </main>

        <footer className="border-t border-zinc-900 bg-zinc-900/30 py-6 text-center text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} MetaBox. Herramientas financieras automatizadas.</p>
        </footer>
      </div>
    </>
  );
}

