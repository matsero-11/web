import { notFound } from "next/navigation";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { SEO_METADATA } from "@/lib/seo-metadata";
import ToolClient from "./tool-client";

// Genera las 20 rutas estáticas en build time (SSG) — esto es lo que
// permite tener un sitemap real y páginas indexables, imposible dentro
// del artefacto React de una sola página.
export function generateStaticParams() {
  return ALL_TOOLS.map((t) => ({ slug: t.id }));
}

export function generateMetadata({ params }) {
  const meta = SEO_METADATA[params.slug];
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/herramientas/${params.slug}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/herramientas/${params.slug}`,
    },
  };
}

export default function ToolPage({ params }) {
  const tool = ALL_TOOLS.find((t) => t.id === params.slug);
  if (!tool) notFound();
  return <ToolClient slug={params.slug} />;
}
