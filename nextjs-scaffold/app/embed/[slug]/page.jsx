import { notFound } from "next/navigation";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { SEO_METADATA } from "@/lib/seo-metadata";
import ToolClient from "@/app/herramientas/[slug]/tool-client";
import { ExternalLink } from "lucide-react";

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

  if (!tool || !meta) return {};

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://metabox-web.vercel.app";

  return {
    title: `${meta.title} — Widget Embebido`,
    description: meta.description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/herramientas/${slug}`,
    },
  };
}

export default async function EmbedToolPage({ params }) {
  const { slug } = await params;
  const tool = ALL_TOOLS.find((item) => item.slug === slug);
  const meta = SEO_METADATA[tool?.id];

  if (!tool || !meta) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://metabox-web.vercel.app";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-lime-500 selection:text-black antialiased">
      {/* Cabecera minimalista optimizada para iframe */}
      <header className="px-4 py-2.5 bg-zinc-900/70 border-b border-zinc-900 flex items-center justify-between text-xs text-zinc-400 backdrop-blur-md">
        <div className="font-semibold text-zinc-200 truncate flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse shadow-[0_0_8px_rgba(163,230,53,0.6)]"></span>
          <span className="truncate">{meta.title}</span>
        </div>
        <a
          href={`${baseUrl}/herramientas/${tool.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lime-400 hover:text-lime-300 flex items-center gap-1 transition font-medium shrink-0 ml-2"
        >
          <span>Pantalla completa</span> <ExternalLink className="w-3 h-3" />
        </a>
      </header>

      {/* Contenedor central de la herramienta */}
      <main className="flex-1 p-3 sm:p-6 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        <div className="w-full bg-zinc-900/20 border border-zinc-900/80 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
          <ToolClient slug={tool.id} />
        </div>
      </main>

      {/* Pie de página discreto que asegura tu backlink y marca */}
      <footer className="px-4 py-3 bg-zinc-900/40 border-t border-zinc-900 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Calculadora interactiva de libre uso</span>
        <a
          href={baseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-lime-400 transition font-medium flex items-center gap-1"
        >
          Desarrollado con <span className="text-lime-400 font-bold">MetaBox</span> ⚡
        </a>
      </footer>
    </div>
  );
      }

