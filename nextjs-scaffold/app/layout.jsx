import "./globals.css";
import { Fraunces, Inter } from "next/font/google";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import ClientProviders from "@/components/ClientProviders";

const BASE_URL = "https://metabox-web.vercel.app"; // Recuerda cambiar esto cuando tengas tu dominio propio (.com o .es)

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "MetaBox — Herramientas de ahorro y planificación",
    template: "%s | MetaBox",
  },

  description:
    "Herramientas interactivas gratuitas de ahorro, presupuesto y planificación económica personal.",

  applicationName: "MetaBox",

  // Directivas de rastreo e indexación avanzada para Google
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Espacio para la verificación de Google Search Console
  verification: {
    google: "PEGA_AQUI_TU_CODIGO_DE_SEARCH_CONSOLE",
  },

  alternates: {
    canonical: BASE_URL,
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
      {
        url: "/favicon.ico",
      },
      {
        url: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
    apple: "/web-app-manifest-192x192.png",
  },

  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${inter.variable}`}
    >
      <body className="antialiased">
        <ClientProviders>
          <main className="mx-auto w-full max-w-md space-y-8 px-5 py-8 md:max-w-2xl md:space-y-10 md:px-8 md:py-12 lg:max-w-4xl">
            {children}
          </main>

          <RegisterServiceWorker />
        </ClientProviders>
      </body>
    </html>
  );
}
