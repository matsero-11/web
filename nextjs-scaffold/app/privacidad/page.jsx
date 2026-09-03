import { T, fontDisplay, fontBody } from "@/lib/design-tokens";

export const metadata = {
  title: "Política de privacidad | MetaBox",
  description: "Política de privacidad de MetaBox: qué datos se recogen y cómo se tratan.",
};

export default function PrivacidadPage() {
  return (
    <div style={{ ...fontBody, color: T.text, lineHeight: 1.7, paddingTop: "1rem", paddingBottom: "3rem" }}>
      <h1 style={{ ...fontDisplay, color: T.text, fontSize: "1.8rem", marginBottom: "1.5rem" }}>
        Política de privacidad
      </h1>

      <p style={{ color: T.textMuted, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.2rem", marginTop: "2rem", marginBottom: "0.8rem" }}>
        1. Qué datos recoge MetaBox
      </h2>
      <p style={{ fontSize: "0.92rem" }}>
        MetaBox no requiere registro ni cuenta de usuario, y no recoge datos personales identificables (nombre, email, dirección, etc.) para el funcionamiento de sus herramientas.
      </p>
      <p style={{ fontSize: "0.92rem", marginTop: "0.6rem" }}>
        Los valores que introduces en las herramientas (importes, plazos, objetivos) se guardan únicamente en el almacenamiento local de tu propio navegador (<em>localStorage</em>), con el fin de que puedas retomar donde lo dejaste al volver a entrar. Estos datos no se envían a ningún servidor ni son accesibles por MetaBox ni por terceros: permanecen exclusivamente en tu dispositivo, y puedes borrarlos en cualquier momento limpiando los datos de navegación de tu navegador.
      </p>

      <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.2rem", marginTop: "2rem", marginBottom: "0.8rem" }}>
        2. Analítica y publicidad
      </h2>
      <p style={{ fontSize: "0.92rem" }}>
        Actualmente MetaBox no utiliza herramientas de analítica ni publicidad de terceros. Si en el futuro se incorporan (por ejemplo, Google AdSense o un servicio de analítica), esta política se actualizará para reflejarlo, y se solicitará el consentimiento correspondiente cuando la normativa lo exija. Consulta la <a href="/cookies" style={{ color: T.lime }}>política de cookies</a> para más detalle sobre el estado actual.
      </p>

      <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.2rem", marginTop: "2rem", marginBottom: "0.8rem" }}>
        3. Derechos del usuario (RGPD)
      </h2>
      <p style={{ fontSize: "0.92rem" }}>
        Dado que MetaBox no recoge ni almacena datos personales en servidores propios, no existe un tratamiento de datos sobre el que ejercer los derechos de acceso, rectificación, supresión, oposición, limitación o portabilidad. Si en el futuro se incorpora algún tratamiento de datos personales, esta política se actualizará detallando cómo ejercer dichos derechos, conforme al Reglamento General de Protección de Datos (RGPD).
      </p>

      <h2 style={{ ...fontDisplay, color: T.text, fontSize: "1.2rem", marginTop: "2rem", marginBottom: "0.8rem" }}>
        4. Cambios en esta política
      </h2>
      <p style={{ fontSize: "0.92rem" }}>
        Esta política de privacidad puede actualizarse para reflejar cambios en el funcionamiento de MetaBox. Se recomienda revisar esta página periódicamente.
      </p>
    </div>
  );
}
