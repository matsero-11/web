import { notFound } from "next/navigation";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { SEO_METADATA } from "@/lib/seo-metadata";
import ToolClient from "./tool-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_TOOLS.map((tool) => ({
    slug: tool.id,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const meta = SEO_METADATA[slug];

  if (!meta) {
    return {};
  }

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/herramientas/${slug}`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/herramientas/${slug}`,
    },
  };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const tool = ALL_TOOLS.find((item) => item.id === slug);

  if (!tool) {
    notFound();
  }

  return <ToolClient slug={slug} />;
}
