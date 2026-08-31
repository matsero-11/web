"use client";
import React from "react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Registro en consola para depuración; aquí es también donde se
    // conectaría en el futuro un servicio de analítica/errores si se añade.
    console.error("Error en herramienta:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: "100%",
            padding: "2rem 1.25rem",
            textAlign: "center",
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: "1.1rem",
            marginTop: "2rem",
          }}
        >
          <div style={{ ...fontDisplay, color: T.text, fontSize: "1.3rem", marginBottom: "0.5rem" }}>
            Algo ha fallado en esta herramienta
          </div>
          <p style={{ ...fontBody, color: T.textMuted, fontSize: "0.9rem", marginBottom: "1.25rem" }}>
            El resto de la web sigue funcionando con normalidad. Puedes volver a intentarlo o elegir otra herramienta.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              ...fontBody,
              background: T.lime,
              color: "#12200A",
              border: "none",
              borderRadius: "0.9rem",
              padding: "0.75rem 1.4rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
