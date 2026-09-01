"use client";
import React from "react";

function AdSlot({ children, label = "publicidad", minHeight = "0px" }) {
  if (!children) return null;
  return (
    <div
      style={{
        width: "100%",
        minHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
      aria-label={label}
      role="complementary"
    >
      {children}
    </div>
  );
}

export default AdSlot;
