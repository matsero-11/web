"use client";
import { useEffect } from "react";

const T = { bg: "#080F11", text: "#F5F2EA", textMuted: "#9FB3B1", lime: "#C4DE4E", coral: "#FF9484" };

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Error global de la app:", error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div
          style={{
            minHeight: "100vh",
            background: T.bg,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ color: T.coral, fontSize: "0.85rem", marginBottom: "0.5rem" }}>Algo ha fallado</div>
          <h1 style={{ color: T.text, fontSize: "1.3rem", marginBottom: "1.5rem" }}>
            La aplicación no ha podido cargarse
          </h1>
          <button
            onClick={() => reset()}
            style={{ background: T.lime, color: "#12200A", border: "none", borderRadius: "0.7rem", padding: "0.7rem 1.2rem", fontWeight: 600, cursor: "pointer" }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
