import "./globals.css";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import ClientProviders from "@/components/ClientProviders";

const BASE_URL = "https://metabox-web.vercel.app";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "MetaBox — Herramientas de ahorro y planificación",
    template: "%s | MetaBox",
  },
  description:
    "Herramientas interactivas gratuitas de ahorro, presupuesto y planificación económica personal.",
  applicationName: "MetaBox",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: BASE_URL,
    siteName: "MetaBox",
    title: "MetaBox — Herramientas de ahorro y planificación",
    description:
      "Herramientas interactivas gratuitas de ahorro, presupuesto y planificación económica personal.",
  },
  twitter: {
    card: "summary",
    title: "MetaBox — Herramientas de ahorro y planificación",
    description:
      "Herramientas interactivas gratuitas de ahorro, presupuesto y planificación económica personal.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/web-app-manifest-192x192.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <ClientProviders>
          <a
            href="#contenido-principal"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#080F11] focus:px-4 focus:py-2 focus:font-semibold focus:text-[#C4DE4E]"
          >
            Saltar al contenido principal
          </a>

          <main
            id="contenido-principal"
            tabIndex={-1}
            className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full px-5 md:px-8 py-8 md:py-12 space-y-8 md:space-y-10"
          >
            {children}
          </main>

          <RegisterServiceWorker />
        </ClientProviders>
      </body>
    </html>
  );
}
