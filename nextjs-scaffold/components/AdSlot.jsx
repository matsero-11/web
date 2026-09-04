"use client";

import React from "react";
import { T, fontBody } from "@/lib/design-tokens";

function AdSlot({
  children,
  slot,
  label = "Publicidad",
  minHeight = "90px",      // Altura estándar por defecto para banners de anuncios
  reserveSpace = true,     // Deja el espacio reservado por defecto para evitar saltos (CLS)
  className = "",
  style = {},
  position = "inline",
}) {
  const hasContent = Boolean(children);
  const shouldRender = hasContent || reserveSpace;

  if (!shouldRender) {
    return null;
  }

  const safeMinHeight =
    typeof minHeight === "number" ? `${minHeight}px` : minHeight;

  return (
    <aside
      className={className}
      aria-label={label}
      data-ad-slot={slot || undefined}
      data-ad-position={position}
      role="complementary"
      style={{
        width: "100%",
        minHeight: safeMinHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        boxSizing: "border-box",
        margin: "1rem 0",
        ...style,
      }}
    >
      {hasContent && (
        <div
          style={{
            ...fontBody,
            width: "100%",
            color: T.textMuted,
            fontSize: "0.68rem",
            lineHeight: 1.2,
            letterSpacing: "0.06em",
            textAlign: "center",
            textTransform: "uppercase",
            marginBottom: "0.45rem",
          }}
        >
          {label}
        </div>
      )}

      {hasContent ? (
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      ) : (
        <div
          aria-hidden="true"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minHeight: safeMinHeight,
            // NOTA: Si en algún momento de desarrollo quieres ver visualmente 
            // dónde está el espacio del anuncio, puedes descomentar la línea de abajo:
            // border: `1px dashed ${T.border}`,
            // borderRadius: "0.5rem",
          }}
        />
      )}
    </aside>
  );
}

export default AdSlot;

