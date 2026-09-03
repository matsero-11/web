import { T, fontDisplay, fontBody } from "@/lib/design-tokens";

export const metadata = {
  title: "Aviso legal | MetaBox",
  description: "Aviso legal de MetaBox, herramientas gratuitas de ahorro y planificación económica personal.",
};

export default function AvisoLegalPage() {
  return (
    <div style={{ ...fontBody, color: T.text, lineHeight: 1.7, paddingTop: "1rem", paddingBottom: "3rem" }}>
      <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.8rem", marginBottom: "1.5rem" }}>
        Aviso legal
      </h1>

      <p style={{ color: T.textMuted, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.2rem", marginTop: "2rem", marginBottom: "0.8rem" }}>
        1. Titularidad del sitio web
      </h2>
      <p style={{ fontSize: "0.92rem" }}>
        Este sitio web, MetaBox (accesible en metabox-web.vercel.app), es un proyecto personal operado de forma independiente. Para cualquier consulta relacionada con este aviso legal, puedes ponerte en contacto a través de los medios habilitados en el sitio.
      </p>

      <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.2rem", marginTop: "2rem", marginBottom: "0.8rem" }}>
        2. Objeto
      </h2>
      <p style={{ fontSize: "0.92rem" }}>
        MetaBox ofrece herramientas interactivas y gratuitas de cálculo financiero personal (ahorro, presupuesto, préstamos, etc.) con fines exclusivamente informativos y orientativos.
      </p>

      <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.2rem", marginTop: "2rem", marginBottom: "0.8rem" }}>
        3. Naturaleza informativa del contenido
      </h2>
      <p style={{ fontSize: "0.92rem" }}>
        Los resultados, cálculos y proyecciones mostrados en las herramientas de MetaBox son orientativos y no constituyen asesoramiento financiero, fiscal ni legal. Antes de tomar decisiones financieras relevantes, se recomienda consultar con un profesional cualificado. MetaBox no se hace responsable del uso que se haga de la información proporcionada por sus herramientas.
      </p>

      <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.2rem", marginTop: "2rem", marginBottom: "0.8rem" }}>
        4. Propiedad intelectual
      </h2>
      <p style={{ fontSize: "0.92rem" }}>
        El diseño, código, textos e interfaz de MetaBox son propiedad de su titular, salvo las librerías de terceros utilizadas bajo sus respectivas licencias de código abierto. Queda prohibida su reproducción total o parcial sin autorización.
      </p>

      <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.2rem", marginTop: "2rem", marginBottom: "0.8rem" }}>
        5. Legislación aplicable
      </h2>
      <p style={{ fontSize: "0.92rem" }}>
        Este aviso legal se rige por la legislación española y europea aplicable, incluyendo la Ley 34/2002 de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE).
      </p>
    </div>
  );
}
