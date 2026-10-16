"use client";

import { useState } from "react";

export default function ReportExporter({ 
  toolName = "Simulación Financiera Ejecutiva", 
  summaryData = null, 
  analysisText = "" 
}) {
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
          className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#0e1b1d] hover:bg-[#121e21] border border-[#c4de4e]/40 hover:border-[#c4de4e] text-[#c4de4e] font-bold text-xs tracking-wider uppercase transition-all shadow-xl hover:shadow-[#c4de4e]/20 active:scale-95"
        >
          <span className="text-base leading-none">📊</span>
          <span>Generar Informe Ejecutivo (PDF)</span>
          <span className="ml-1.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#c4de4e]/15 text-[#c4de4e]">
            100% Pro
          </span>
        </button>
      </div>

      {/* Modal / Vista Previa del Informe */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md no-print animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#080f11] border border-[#f5f2ea]/15 text-[#f5f2ea] shadow-2xl p-6 sm:p-10">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-[#f5f2ea]/10 pb-4 mb-6">
              <div>
                <span className="text-[11px] font-bold text-[#c4de4e] tracking-widest uppercase">
                  Vista Previa Corporativa
                </span>
                <h3 className="text-lg font-bold text-[#f5f2ea]">
                  Reporte Financiero — {toolName}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-[#9fb3b1] hover:text-[#f5f2ea] rounded-xl bg-[#121e21] hover:bg-[#1c2c30] transition"
              >
                ✕
              </button>
            </div>

            {/* CUERPO DEL INFORME (DISEÑO 10/10 IDÉNTICO A METABOX) */}
            <div 
              id="metabox-report-content" 
              className="printable-report space-y-6 p-6 sm:p-8 rounded-2xl bg-[#080f11] border border-[#f5f2ea]/15 text-[#f5f2ea]"
            >
              
              {/* 1. CABECERA DE MARCA OFICIAL */}
              <div className="flex items-center justify-between border-b border-[#f5f2ea]/15 pb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#c4de4e]/15 border border-[#c4de4e]/40 flex items-center justify-center font-bold text-[#c4de4e] text-xl shadow-inner">
                    🛡️
                  </div>
                  <div>
                    <span className="font-extrabold text-xl text-[#f5f2ea] tracking-tight block font-serif">
                      METABOX
                    </span>
                    <span className="text-[10px] text-[#9fb3b1] uppercase tracking-widest font-semibold block">
                      REPORTE FINANCIERO EJECUTIVO
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end text-xs text-[#9fb3b1] font-medium bg-[#121e21] px-3 py-1 rounded-lg border border-[#f5f2ea]/10">
                    <span>📅</span>
                    <span>{new Date().toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              </div>

              {/* 2. SLOGAN Y DESCRIPCIÓN */}
              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold text-[#f5f2ea] tracking-tight font-serif">
                  {toolName}
                </h2>
                <p className="text-xs text-[#9fb3b1] leading-relaxed">
                  Este informe muestra los resultados analíticos generados de forma local, seguros y privados para tu estrategia financiera.
                </p>
              </div>

              {/* 3. BLOQUE DE MÉTRICAS / CUADRÍCULA DE RESULTADOS */}
              {summaryData && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#121e21] border border-[#f5f2ea]/10">
                  {Object.entries(summaryData).map(([key, value], idx) => (
                    <div key={key} className="p-3 rounded-xl bg-[#080f11]/60 border border-[#f5f2ea]/5 space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-[#9fb3b1] font-bold block">
                        {key}
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-[#c4de4e] block">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. ANÁLISIS ESTRATÉGICO */}
              <div className="p-5 rounded-2xl bg-[#121e21] border border-[#f5f2ea]/10 space-y-2">
                <h4 className="text-xs font-bold text-[#c4de4e] uppercase tracking-wider flex items-center gap-2">
                  <span>💡</span> Análisis y Recomendación de Impacto
                </h4>
                <p className="text-xs text-[#f5f2ea]/90 leading-relaxed font-normal">
                  {analysisText || "La planificación actual se encuentra alineada con los estándares óptimos de estabilidad. Mantener la constancia reforzará tu solidez a mediano plazo."}
                </p>
              </div>

              {/* 5. SECCIÓN DE VALORES / RECORDATORIO DE MARCA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#121e21]/60 border border-[#f5f2ea]/5 flex items-start gap-3">
                  <span className="text-base text-[#c4de4e]">🔒</span>
                  <div>
                    <h5 className="text-xs font-bold text-[#f5f2ea]">Privacidad Garantizada</h5>
                    <p className="text-[11px] text-[#9fb3b1]">Tus datos nunca abandonan tu dispositivo.</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#121e21]/60 border border-[#f5f2ea]/5 flex items-start gap-3">
                  <span className="text-base text-[#c4de4e]">📈</span>
                  <div>
                    <h5 className="text-xs font-bold text-[#f5f2ea]">Proyección Constante</h5>
                    <p className="text-[11px] text-[#9fb3b1]">Diseñado para optimizar tus decisiones.</p>
                  </div>
                </div>
              </div>

              {/* 6. PIE DE PÁGINA OFICIAL METABOX */}
              <div className="border-t border-[#f5f2ea]/10 pt-4 flex items-center justify-between text-[11px] text-[#9fb3b1] font-medium">
                <span className="font-bold text-[#f5f2ea]">METABOX — <span className="text-[#c4de4e]">Tu futuro, en tus manos</span></span>
                <span>Pequeños pasos, grandes resultados</span>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#f5f2ea]/10">
              <button
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#121e21] hover:bg-[#1c2c30] text-[#f5f2ea] font-medium text-xs transition"
              >
                Cerrar
              </button>
              <button
                onClick={handlePrintPDF}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c4de4e] hover:bg-[#a9c936] text-[#080f11] font-bold text-xs transition shadow-lg shadow-[#c4de4e]/20 flex items-center justify-center gap-2"
              >
                <span>🖨️</span>
                <span>Guardar PDF / Imprimir</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REGLAS DE IMPRESIÓN ESTRICTAS (FORZANDO ESTÉTICA OSCURA PREMIUM O BLANCO EJECUTIVO) */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

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
            max-height: 275mm !important;
            margin: 0 !important;
            padding: 16px !important;
            background-color: #080f11 !important;
            color: #f5f2ea !important;
            border: 1px solid rgba(245, 242, 234, 0.15) !important;
            border-radius: 1rem !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-shadow: none !important;
          }

          #metabox-report-content div {
            background-color: #121e21 !important;
            border-color: rgba(245, 242, 234, 0.1) !important;
          }

          #metabox-report-content .text-[#c4de4e] {
            color: #c4de4e !important;
          }
        }
      `}</style>
    </>
  );
            }
              
