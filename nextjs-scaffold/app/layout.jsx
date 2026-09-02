"use client";

import "./globals.css";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import { HelmetProvider } from "react-helmet-async";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <HelmetProvider>
          {/* Skip link para accesibilidad */}
          <a
            href="#contenido-principal"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#080F11] focus:text-[#C4DE4E] focus:rounded-lg focus:font-semibold"
          >
            Saltar al contenido principal
          </a>

          <div
            id="contenido-principal"
            className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full px-5 md:px-8 py-8 md:py-12 space-y-8 md:space-y-10"
          >
            {children}
          </div>

          <RegisterServiceWorker />
        </HelmetProvider>
      </body>
    </html>
  );
}
