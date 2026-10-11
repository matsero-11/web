"use client";

import { useState } from "react";

export default function ReportExporter({ toolName = "Simulación Financiera" }) {
  const [showModal, setShowModal] = useState(false);

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <>
      {/* Botón flotante e integrado para desencadenar el informe */}
      <div className="my-6 flex justify-end no-print">
        <button
          onClick={() => setShowModal(true)}
          className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 hover:text-emerald-300 font-semibold text-xs tracking-wide transition-all shadow-lg hover:shadow-emerald-500/10 active:scale-95"
        >
          <span className="text-base leading-none">📄</span>
          <span>Generar Informe Prémium (PDF)</span>
          <span className="ml-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            100% Privado
          </span>
        </button>
      </div>

      {/* Modal / Vista Previa del Informe en Modo Oscuro */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md no-print animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-200 shadow-2xl p-6 sm:p-8">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
                  Vista Previa del Documento
                </span>
                <h3 className="text-lg font-bold text-zinc-100">
                  Informe de {toolName}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition"
              >
                ✕
              </button>
            </div>

            {/* CUERPO DEL INFORME (Contenido que se envía a la impresora / PDF) */}
            <div id="metabox-report-content" className="printable-report space-y-6 p-6 rounded-xl bg-zinc-900/90 border border-zinc-800">
              
              {/* Header de Marca */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-sm">
                    M
                  </div>
                  <span className="font-bold text-lg text-zinc-100 tracking-tight">
                    Meta<span className="text-emerald-400">Box</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold block mb-1">
                    Procesamiento Local • Privado
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Título de la Simulación */}
              <div>
                <h2 className="text-xl font-bold text-zinc-100">
                  {toolName}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Resumen de parámetros y proyecciones calculados de forma segura en MetaBox.
                </p>
              </div>

              {/* Mensaje Informativo o Datos Extraídos */}
              <div className="p-4 rounded-lg bg-zinc-950 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                  <span>✓</span>
                  <span>Simulación Oficial de MetaBox</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Este informe ha sido certificado numéricamente por la suite MetaBox utilizando procesamiento íntegramente local sin almacenamiento externo.
                </p>
              </div>

              {/* Pie de página oficial en el documento */}
              <div className="border-t border-zinc-800/80 pt-4 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Generado con MetaBox Suite</span>
                <span>Documento confidencial del usuario</span>
              </div>
            </div>

            {/* Botones de Acción dentro del Modal */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handlePrintPDF}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>🖨️</span>
                <span>Guardar como PDF / Imprimir</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Reglas CSS de Impresión para garantizar el MODO OSCURO y prevenir páginas en blanco */}
      <style jsx global>{`
        @media print {
          /* Ocultar todo el sitio web excepto el informe */
          body * {
            visibility: hidden !important;
          }
          
          .no-print,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
          }

          /* Hacer visible el informe en la pantalla de impresión */
          #metabox-report-content,
          #metabox-report-content * {
            visibility: visible !important;
          }

          #metabox-report-content {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 24px !important;
            background-color: #09090b !important;
            color: #f4f4f5 !important;
            border: 1px solid #27272a !important;
            border-radius: 12px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  );
}

