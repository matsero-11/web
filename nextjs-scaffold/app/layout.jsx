import "./globals.css";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

export const metadata = {
  title: {
    default: "MetaBox — Herramientas de ahorro y planificación",
    template: "%s | MetaBox",
  },
  description:
    "Herramientas interactivas gratuitas de ahorro, presupuesto y planificación económica personal.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#080F11",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full px-5 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
          {children}
        </div>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
