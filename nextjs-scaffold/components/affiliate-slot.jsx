import React from 'react';

export default function AffiliateSlot({ offer }) {
  // Si no hay oferta configurada o está desactivada, no ocupa espacio ni rompe la UX
  if (!offer || !offer.active) return null;

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-4 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-emerald-950/30 border border-emerald-500/30 text-zinc-200 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Recomendado
          </span>
          <h4 className="text-sm font-semibold text-zinc-100">{offer.title}</h4>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {offer.description}
        </p>
      </div>

      <a
        href={offer.link}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="shrink-0 w-full md:w-auto px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-all text-center shadow-md hover:shadow-emerald-500/20"
      >
        {offer.buttonText || "Consultar opción →"}
      </a>
    </div>
  );
}

