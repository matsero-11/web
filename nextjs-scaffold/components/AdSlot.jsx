"use client";

import React from "react";
import { T, fontBody } from "@/lib/design-tokens";

function AdSlot({
  children,
  slot,
  label = "Publicidad",
  minHeight = "0px",
  reserveSpace = false,
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
        margin: hasContent || reserveSpace ? "0.25rem 0" : 0,
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
        <span
          aria-hidden="true"
          style={{
            display: "block",
            width: "100%",
            minHeight: safeMinHeight,
          }}
        />
      )}
    </aside>
  );
}

export default AdSlot;
