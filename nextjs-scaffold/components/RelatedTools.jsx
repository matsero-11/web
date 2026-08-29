"use client";
import React from "react";
import { T, fontBody } from "@/lib/design-tokens";
import { Card, IconTile } from "@/components/ui";
import { ALL_TOOLS } from "@/lib/tools-registry";

function RelatedTools({ ids, onNavigate }) {
  if (!ids || ids.length === 0) return null;
  const items = ids.map((id) => ALL_TOOLS.find((t) => t.id === id)).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div style={{ marginTop: "0.4rem" }}>
      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.78rem", marginBottom: "0.6rem" }}>
        También puede interesarte
      </div>
      <div className="flex flex-col gap-2">
        {items.map((t) => (
          <Card key={t.id} onClick={() => onNavigate(t.id)} style={{ padding: "0.75rem 0.9rem" }}>
            <div className="flex items-center gap-3">
              <IconTile icon={t.icon} tone={t.tone} />
              <div>
                <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.85rem" }}>{t.label}</div>
                <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.75rem" }}>{t.desc}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RelatedTools;
