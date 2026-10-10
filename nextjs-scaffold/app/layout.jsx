import "./globals.css";
import { Fraunces, Inter } from "next/font/google";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import ClientProviders from "@/components/ClientProviders";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://metabox-web.vercel.app";

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

// Configuración recomendada en Next.js para PWA y barra de estado en móviles
export const viewport = {
  themeColor: "#080F11",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "MetaBox — Herramientas de ahorro y planificación",
    template: "%s | MetaBox",
  },

  description:
    "Herramientas interactivas gratuitas de ahorro, presupuesto y planificación económica personal 100% privadas.",

  applicationName: "MetaBox",

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MetaBox",
  },

  formatDetection: {
    telephone: false,
  },

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
      <head>
        <meta
          name="google-site-verification"
          content="ieioMsOsbPGm3H8sX-9FpBz_DMuBSfWAQMFYKw0wgsA"
        />
        {/* Compatibilidad adicional PWA para iOS Safari */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased bg-[#080F11] text-white">
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

