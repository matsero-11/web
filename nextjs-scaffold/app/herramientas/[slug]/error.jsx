"use client";

import { useEffect } from "react";

const T = {
  bg: "#080F11",
  text: "#F5F2EA",
  textMuted: "#9FB3B1",
  lime: "#C4DE4E",
  coral: "#FF9484",
};

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Error al renderizar una herramienta:", error);
  }, [error]);

  return (
    <main
      role="alert"
      aria-labelledby="tool-error-title"
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
      <div
        aria-live="polite"
        style={{
          color: T.coral,
          fontSize: "0.85rem",
          marginBottom: "0.5rem",
        }}
      >
        Algo ha fallado
      </div>

      <h1
        id="tool-error-title"
        style={{
          color: T.text,
          fontSize: "1.3rem",
          margin: "0 0 0.5rem",
        }}
      >
        Esta herramienta no ha podido cargarse
      </h1>

      <p
        style={{
          color: T.textMuted,
          fontSize: "0.9rem",
          maxWidth: "320px",
          margin: "0 0 1.5rem",
        }}
      >
        El resto de la plataforma sigue funcionando con normalidad. Puedes
        reintentar o volver a la home.
      </p>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={reset}
          style={{
            background: T.lime,
            color: "#12200A",
            border: "none",
            borderRadius: "0.7rem",
            padding: "0.7rem 1.2rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>

        <a
          href="/"
          style={{
            color: T.text,
            border: "1px solid rgba(245,242,234,0.2)",
            borderRadius: "0.7rem",
            padding: "0.7rem 1.2rem",
            textDecoration: "none",
            fontSize: "0.95rem",
          }}
        >
          Volver a la home
        </a>
      </div>
    </main>
  );
}
