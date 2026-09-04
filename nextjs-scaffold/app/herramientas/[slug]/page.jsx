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
  const meta = SEO_METADATA[slug];

  if (!tool || !meta) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name || meta.title,
    operatingSystem: "All",
    applicationCategory: "FinanceApplication",
    browser: "Requires JavaScript. Requires HTML5.",
    description: meta.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolClient slug={slug} />
    </>
  );
}

