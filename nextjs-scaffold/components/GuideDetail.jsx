import React from "react";
import { GUIDES } from "@/lib/guides-data";

export default function GuideDetail({ guideId }) {
  const guide = GUIDES.find((g) => g.id === guideId) || GUIDES[0];

  return (
    <article className="max-w-3xl mx-auto px-4 py-8 text-zinc-100">
      {/* Cabecera */}
      <div className="mb-8">
        <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 rounded-full">
          {guide.badge}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 leading-tight">
          {guide.title}
        </h1>
        <p className="text-lg text-zinc-400 mb-4 leading-relaxed">
          {guide.subtitle}
        </p>
        <div className="text-xs text-zinc-500 font-medium">
          {guide.meta}
        </div>
      </div>

      {/* Caja de Resumen Rápido */}
      {guide.summaryBox && (
        <div className="p-5 mb-8 bg-zinc-900/90 border-l-4 border-emerald-500 rounded-r-xl shadow-lg">
          <span className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            {guide.summaryBox.label}
          </span>
          <p className="text-zinc-200 text-sm sm:text-base leading-relaxed">
            {guide.summaryBox.text}
          </p>
        </div>
      )}

      {/* Índice Interactivos */}
      {guide.tableOfContents && (
        <nav aria-label="Índice de contenidos" className="p-5 mb-10 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mb-3">
            En esta guía
          </h2>
          <ul className="space-y-2 text-sm">
            {guide.tableOfContents.map((item) => (
              <li key={item.id}>
                <a 
                  href={`#${item.id}`} 
                  className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2"
                >
                  <span className="text-zinc-600">→</span> {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Secciones de contenido */}
      <div className="space-y-12">
        {guide.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-4">
              {section.title}
            </h2>

            {section.content && (
              <p className="text-zinc-300 leading-relaxed mb-4 text-base sm:text-lg">
                {section.content}
              </p>
            )}

            {/* Ejemplo práctico */}
            {section.example && (
              <div className="my-6 p-5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide mb-2">
                  💡 {section.example.title}
                </h3>
                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                  {section.example.text}
                </p>
              </div>
            )}

            {/* Tabla de datos */}
            {section.table && (
              <div className="overflow-x-auto my-6 border border-zinc-800 rounded-xl">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-900 text-zinc-200 uppercase text-xs tracking-wider border-b border-zinc-800">
                    <tr>
                      {section.table.headers.map((th, i) => (
                        <th key={i} className="px-4 py-3 font-semibold">{th}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {section.table.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-zinc-900/40 transition-colors">
                        {row.cell || row.map ? (
                          row.map((cell, j) => (
                            <td key={j} className="px-4 py-3">{cell}</td>
                          ))
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pasos numerados */}
            {section.steps && (
              <div className="grid gap-4 my-6">
                {section.steps.map((step, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <span className="text-emerald-400 font-mono font-bold text-lg">{step.num}</span>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                      <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Errores frecuentes */}
            {section.errors && (
              <div className="grid gap-4 my-6">
                {section.errors.map((error, i) => (
                  <div key={i} className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl">
                    <h4 className="font-semibold text-red-400 mb-1 flex items-center gap-2">
                      <span>⚠️</span> {error.title}
                    </h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">{error.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Preguntas frecuentes */}
            {section.faqs && (
              <div className="space-y-4 my-6">
                {section.faqs.map((faq, i) => (
                  <div key={i} className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                    <h4 className="font-semibold text-white mb-2">{faq.q}</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </article>
  );
            }

