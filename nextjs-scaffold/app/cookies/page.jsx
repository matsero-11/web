import { T, fontDisplay, fontBody } from "@/lib/design-tokens";

export const metadata = {
  title: "Política de cookies | MetaBox",
  description: "Política de cookies y almacenamiento local de MetaBox.",
};

export default function CookiesPage() {
  return (
    <div style={{ ...fontBody, color: T.text, lineHeight: 1.7, paddingTop: "1rem", paddingBottom: "3rem" }}>
      <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.8rem", marginBottom: "1.5rem" }}>
        Política de cookies
      </h1>

      <p style={{ color: T.textMuted, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.2rem", marginTop: "2rem", marginBottom: "0.8rem" }}>
        1. Situación actual
      </h2>
      <p style={{ fontSize: "0.92rem" }}>
        MetaBox no utiliza cookies de terceros ni de seguimiento en la actualidad. La web utiliza únicamente <em>localStorage</em>, una forma de almacenamiento local del navegador, para recordar los valores que introduces en las herramientas y que puedas continuar donde lo dejaste. Este almacenamiento es estrictamente necesario para el funcionamiento de la web, permanece en tu dispositivo, no se transmite a ningún servidor y no requiere consentimiento según la normativa vigente, al no tratarse de una cookie de seguimiento ni publicitaria.
      </p>

      <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.2rem", marginTop: "2rem", marginBottom: "0.8rem" }}>
        2. Futuras cookies
      </h2>
      <p style={{ fontSize: "0.92rem" }}>
        Si en el futuro MetaBox incorpora servicios de terceros que utilicen cookies (por ejemplo, Google AdSense para publicidad o Google Analytics para estadísticas de uso), esta política se actualizará para detallar qué cookies se utilizan, su finalidad y su duración, y se mostrará un aviso de consentimiento antes de activarlas, conforme exige la normativa española y europea.
      </p>

      <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.2rem", marginTop: "2rem", marginBottom: "0.8rem" }}>
        3. Cómo eliminar los datos guardados
      </h2>
      <p style={{ fontSize: "0.92rem" }}>
        Puedes eliminar en cualquier momento los datos guardados por MetaBox en tu navegador borrando los datos de navegación (almacenamiento local / cookies) de tu navegador para este sitio, desde la configuración de tu propio navegador.
      </p>
    </div>
  );
}
