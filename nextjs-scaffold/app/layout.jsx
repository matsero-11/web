"use client";
import "./globals.css";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import { HelmetProvider } from "react-helmet-async";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <HelmetProvider>
          <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full px-5 md:px-8 py-8 md:py-12 space-y-8 md:space-y-10">
            {children}
          </div>
          <RegisterServiceWorker />
        </HelmetProvider>
      </body>
    </html>
  );
}
