import "./globals.css";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

export const metadata = {
  title: {
    default: "Raíz — Herramientas de ahorro y planificación",
    template: "%s | Raíz",
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
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
