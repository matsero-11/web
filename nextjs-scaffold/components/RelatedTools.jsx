"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, BookOpen, Sparkles } from "lucide-react";
import { T, fontBody } from "@/lib/design-tokens";
import { Card, IconTile } from "@/components/ui";
import { ALL_TOOLS } from "@/lib/tools-registry";

const MAX_TOOL_RECOMMENDATIONS = 3;
const MAX_EDITORIAL_RECOMMENDATIONS = 2;
const MAX_PARTNER_RECOMMENDATIONS = 1;

const recommendationStyles = {
  next: {
    label: "Siguiente paso",
    color: T.lime,
    background: T.limeSoft,
    border: T.lime,
    icon: Sparkles,
  },
  related: {
    label: "Herramienta relacionada",
    color: T.textMuted,
    background: T.surfaceAlt,
    border: T.border,
    icon: ArrowUpRight,
  },
  editorial: {
    label: "Guía",
    color: T.lavender,
    background: T.lavenderSoft,
    border: T.lavender,
    icon: BookOpen,
  },
  partner: {
    label: "Enlace patrocinado",
    color: T.textMuted,
    background: T.surfaceAlt,
    border: T.border,
    icon: ArrowUpRight,
  },
};

function getRecommendationStyle(type) {
  return recommendationStyles[type] || recommendationStyles.related;
}

function ToolRecommendationCard({
  tool,
  type,
  onNavigate,
  context,
}) {
  const router = useRouter();
  const style = getRecommendationStyle(type);
  const Icon = style.icon;

  const handleClick = () => {
    const targetId = typeof tool.id === "object" && tool.id !== null ? (tool.id.id || tool.id.slug) : tool.id;
    if (!targetId) return;

    if (typeof onNavigate === "function") {
      onNavigate(targetId);
    } else {
      router.push(`/herramientas/${targetId}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const cardContent = (
    <Card
      style={{
        padding: "1rem",
        border: `1px solid ${style.border}`,
        background: type === "next" ? style.background : T.surface,
        transition: "transform 0.18s ease, border-color 0.18s ease, background 0.18s ease",
      }}
    >
      <div className="flex items-center gap-3.5">
        <IconTile icon={tool.icon} tone={tool.tone} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center justify-between gap-3">
            <div
              style={{
                ...fontBody,
                color: T.text,
                fontWeight: 600,
                fontSize: "0.9rem",
                lineHeight: 1.3,
              }}
            >
              {tool.label}
            </div>

            <Icon
              size={16}
              aria-hidden="true"
              style={{
                color: style.color,
                flexShrink: 0,
              }}
            />
          </div>

          <div
            style={{
              ...fontBody,
              color: T.textMuted,
              fontSize: "0.78rem",
              lineHeight: 1.45,
              marginTop: "0.2rem",
            }}
          >
            {context || tool.desc}
          </div>

          <div
            style={{
              ...fontBody,
              color: style.color,
              fontWeight: 600,
              fontSize: "0.7rem",
              letterSpacing: "0.01em",
              marginTop: "0.5rem",
            }}
          >
            {style.label}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Abrir ${tool.label}. ${tool.desc}`}
      style={{
        cursor: "pointer",
        display: "block",
      }}
    >
      {cardContent}
    </div>
  );
}

function EditorialRecommendationCard({ recommendation }) {
  const type = recommendation.type === "partner" ? "partner" : "editorial";
  const style = getRecommendationStyle(type);
  const Icon = style.icon;
  const isExternal = Boolean(recommendation.href);
  const isActive = recommendation.active !== false;

  if (!isActive) return null;

  if (!isExternal && recommendation.status !== "coming-soon") {
    return null;
  }

  const content = (
    <Card
      style={{
        padding: "1rem",
        border: `1px solid ${style.border}`,
        background: style.background,
        cursor: isExternal ? "pointer" : "default",
        transition: "transform 0.18s ease, border-color 0.18s ease",
      }}
    >
      <div className="flex items-start gap-3.5">
        <div
          aria-hidden="true"
          style={{
            width: "2.35rem",
            height: "2.35rem",
            borderRadius: "0.75rem",
            background: T.surface,
            border: `1px solid ${style.border}`,
            color: style.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={17} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center justify-between gap-3">
            <div
              style={{
                ...fontBody,
                color: T.text,
                fontWeight: 600,
                fontSize: "0.9rem",
                lineHeight: 1.3,
              }}
            >
              {recommendation.title}
            </div>

            {isExternal && (
              <ArrowUpRight
                size={16}
                aria-hidden="true"
                style={{
                  color: style.color,
                  flexShrink: 0,
                }}
              />
            )}
          </div>

          {recommendation.description && (
            <div
              style={{
                ...fontBody,
                color: T.textMuted,
                fontSize: "0.78rem",
                lineHeight: 1.45,
                marginTop: "0.2rem",
              }}
            >
              {recommendation.description}
            </div>
          )}

          <div
            style={{
              ...fontBody,
              color: style.color,
              fontWeight: 600,
              fontSize: "0.7rem",
              letterSpacing: "0.01em",
              marginTop: "0.5rem",
            }}
          >
            {recommendation.label || style.label}
          </div>

          {type === "partner" && recommendation.disclosure && (
            <div
              style={{
                ...fontBody,
                color: T.textMuted,
                fontSize: "0.7rem",
                lineHeight: 1.4,
                marginTop: "0.35rem",
              }}
            >
              {recommendation.disclosure}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  if (!isExternal) {
    return (
      <div
        aria-label={`${recommendation.title}. Próximamente.`}
        style={{ opacity: 0.82 }}
      >
        {content}
      </div>
    );
  }

  return (
    <a
      href={recommendation.href}
      target={recommendation.external ? "_blank" : undefined}
      rel={recommendation.external ? "noopener noreferrer sponsored" : undefined}
      aria-label={`${recommendation.title}. ${recommendation.description || ""}`}
      style={{
        display: "block",
        textDecoration: "none",
      }}
    >
      {content}
    </a>
  );
}

function RelatedTools({
  ids = [],
  onNavigate,
  primaryId,
  context,
  title = "También puede interesarte",
  editorialRecommendations = [],
  partnerRecommendations = [],
  maxTools = MAX_TOOL_RECOMMENDATIONS,
  showWhenEmpty = false,
}) {
  const toolRecommendations = useMemo(() => {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const uniqueIds = [...new Set(ids)].slice(0, maxTools);

    return uniqueIds
      .map((id) => ALL_TOOLS.find((tool) => tool.id === id))
      .filter(Boolean)
      .map((tool) => ({
        tool,
        type: tool.id === primaryId ? "next" : "related",
      }))
      .sort((a, b) => {
        if (a.type === "next") return -1;
        if (a.type === "next") return 1;
        return 0;
      });
  }, [ids, maxTools, primaryId]);

  const editorialItems = useMemo(
    () =>
      Array.isArray(editorialRecommendations)
        ? editorialRecommendations
            .filter(Boolean)
            .slice(0, MAX_EDITORIAL_RECOMMENDATIONS)
        : [],
    [editorialRecommendations]
  );

  const partnerItems = useMemo(
    () =>
      Array.isArray(partnerRecommendations)
        ? partnerRecommendations
            .filter(
              (item) =>
                item &&
                item.active === true &&
                typeof item.href === "string" &&
                item.href.trim() !== ""
            )
            .slice(0, MAX_PARTNER_RECOMMENDATIONS)
        : [],
    [partnerRecommendations]
  );

  const hasContent =
    toolRecommendations.length > 0 ||
    editorialItems.length > 0 ||
    partnerItems.length > 0;

  if (!hasContent && !showWhenEmpty) {
    return null;
  }

  return (
    <section
      aria-label={title}
      style={{
        marginTop: "2.5rem",
      }}
    >
      <div
        style={{
          ...fontBody,
          color: T.textMuted,
          fontSize: "0.82rem",
          marginBottom: "0.8rem",
          fontWeight: 500,
        }}
      >
        {title}
      </div>

      {context && (
        <div
          aria-live="polite"
          style={{
            ...fontBody,
            color: T.textMuted,
            fontSize: "0.78rem",
            lineHeight: 1.5,
            marginBottom: "0.9rem",
          }}
        >
          {context}
        </div>
      )}

      {hasContent ? (
        <div className="flex flex-col gap-3">
          {toolRecommendations.map(({ tool, type }) => (
            <ToolRecommendationCard
              key={tool.id}
              tool={tool}
              type={type}
              onNavigate={onNavigate}
              context={type === "next" ? context : undefined}
            />
          ))}

          {editorialItems.map((recommendation) => (
            <EditorialRecommendationCard
              key={recommendation.id || recommendation.title}
              recommendation={{
                ...recommendation,
                type: "editorial",
              }}
            />
          ))}

          {partnerItems.map((recommendation) => (
            <EditorialRecommendationCard
              key={recommendation.id || recommendation.title}
              recommendation={{
                ...recommendation,
                type: "partner",
                label: recommendation.label || "Enlace patrocinado",
              }}
            />
          ))}
        </div>
      ) : (
        <Card
          style={{
            padding: "1rem",
            border: `1px dashed ${T.border}`,
            background: "transparent",
          }}
        >
          <div
            style={{
              ...fontBody,
              color: T.textMuted,
              fontSize: "0.8rem",
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            Completa esta herramienta para descubrir tu siguiente paso.
          </div>
        </Card>
      )}
    </section>
  );
}

export default RelatedTools;
      
