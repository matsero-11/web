// app/aprende/[seoSlug]/page.jsx
import { notFound } from "next/navigation";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { SEO_METADATA } from "@/lib/seo-metadata";
import { MATRIX_CONFIG, generateMatrixPaths } from "@/lib/seo-matrix";
import ToolClient from "@/app/herramientas/[slug]/tool-client";
import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";

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

  const title = `${meta.title} ${perfil.nombre} ${plazo.nombre} — MetaBox`;
  const description = `${meta.description} Diseñado específicamente ${perfil.desc} para un horizonte temporal de ${plazo.anos} años.`;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://metabox-web.vercel.app";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/aprende/${seoSlug}`,
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-lime-500 selection:text-black antialiased">
      <header className="border-b border-zinc-900 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> <span>Volver a MetaBox</span>
        </Link>
        <span className="text-xs px-2.5 py-1 rounded-full bg-lime-500/10 text-lime-400 border border-lime-500/20 font-medium">
          Guía Programática ⚡
        </span>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="space-y-4 mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {meta.title} <span className="text-lime-400">{perfil.nombre}</span> ({plazo.nombre})
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-base">
            Realiza tus cálculos de forma precisa y adaptada. Este simulador está optimizado {perfil.desc} para proyectar tus resultados a un plazo de {plazo.anos} años.
          </p>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-sm mb-12">
          <ToolClient slug={tool.id} />
        </div>

        <section className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-6 space-y-4 text-sm text-zinc-300">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-lime-400" /> Claves para este escenario
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>Proyección a largo plazo calculada de forma exacta para {plazo.anos} años.</li>
            <li>Interfaz adaptada para perfiles de tipo {perfil.nombre.toLowerCase()}.</li>
            <li>Resultados dinámicos actualizados al instante sin recargar la página.</li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-zinc-900 bg-zinc-900/30 py-6 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} MetaBox. Herramientas financieras automatizadas.</p>
      </footer>
    </div>
  );
            }

