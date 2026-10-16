"use client";

import { useState } from "react";

export default function ReportExporter({ toolName = "Simulación Financiera", summaryData = null, analysisText = "" }) {
  const [showModal, setShowModal] = useState(false);

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <>
      {/* Botón flotante e integrado */}
      <div className="my-6 flex justify-end no-print">
        <button
          onClick={() => setShowModal(true)}
          className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 hover:text-emerald-300 font-semibold text-xs tracking-wide transition-all shadow-lg hover:shadow-emerald-500/10 active:scale-95"
        >
          <span className="text-base leading-none">📄</span>
          <span>Generar Informe Corporativo (PDF)</span>
          <span className="ml-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            100% Privado
          </span>
        </button>
      </div>

      {/* Modal / Vista Previa del Informe */}
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
                  Informe Ejecutivo — {toolName}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition"
              >
                ✕
              </button>
            </div>

            {/* CUERPO DEL INFORME (Formato corporativo limpio para PDF) */}
            <div id="metabox-report-content" className="printable-report space-y-6 p-6 sm:p-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100">
              
              {/* Header Corporativo de Marca */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-base">
                    M
                  </div>
                  <div>
                    <span className="font-bold text-lg text-zinc-100 tracking-tight block">
                      Meta<span className="text-emerald-400">Box</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                      Inteligencia Financiera Privada
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold inline-block mb-1">
                    Certificado Local
                  </span>
                  <div className="text-xs text-zinc-400">
                    {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>
              </div>

              {/* Título de la Herramienta */}
              <div>
                <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
                  {toolName}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Reporte financiero generado de forma local. Los datos no han abandonado su dispositivo.
                </p>
              </div>

              {/* Bloque de Métricas / Resumen Opcional */}
              {summaryData && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  {Object.entries(summaryData).map(([key, value]) => (
                    <div key={key} className="space-y-0.5">
                      <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium block">{key}</span>
                      <span className="text-sm font-bold text-emerald-400 block">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Informe / Análisis Dinámico según el resultado */}
              <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📊</span> Análisis y Conclusión del Resultado
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {analysisText || "El presupuesto se encuentra dentro de los márgenes óptimos de distribución. Mantener un control rigurosos de los gastos fijos garantiza una mayor capacidad de ahorro a mediano plazo."}
                </p>
              </div>

              {/* Pie de página corporativo oficial */}
              <div className="border-t border-zinc-800 pt-4 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                <span>MetaBox Suite © {new Date().getFullYear()}</span>
                <span>Documento Confidencial</span>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition"
              >
                Cerrar
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

      {/* Reglas de impresión estrictas para aislar únicamente el informe corporativo */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          
          .no-print,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
          }

          #metabox-report-content,
          #metabox-report-content * {
            visibility: visible !important;
          }

          #metabox-report-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background-color: #09090b !important;
            color: #f4f4f5 !important;
            border: none !important;
            border-radius: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  );
              }

