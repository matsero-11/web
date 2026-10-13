"use client";

export default function Error({ error, reset }) {
  return (
    <main style={{ padding: "2rem", background: "#080F11", color: "#F5F2EA", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#FF9484", marginBottom: "1rem" }}>⚠️ Error técnico detectado:</h2>
      <pre style={{ background: "#12200A", padding: "1rem", borderRadius: "8px", overflowX: "auto", color: "#C4DE4E", fontSize: "0.85rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {error?.message || "Error desconocido"}
        {"\n\n"}
        {error?.stack}
      </pre>
      <button 
        onClick={reset}
        style={{ marginTop: "1.5rem", background: "#C4DE4E", color: "#000", padding: "0.6rem 1.2rem", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", border: "none" }}
      >
        Reintentar
      </button>
    </main>
  );
}
