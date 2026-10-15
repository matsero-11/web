import React from "react";
import { GUIDES } from "@/lib/guides-data";
import { T, fontBody, fontDisplay } from "@/lib/design-tokens";
import { BookOpen, Lightbulb, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function GuideDetail({ guideId }) {
  const guide = GUIDES.find((g) => g.id === guideId) || GUIDES[0];

  return (
    <article
      style={{
        maxWidth: "52rem",
        margin: "0 auto",
        padding: "2rem 1rem",
        color: T.text,
        ...fontBody,
      }}
    >
      {/* Cabecera */}
      <header style={{ marginBottom: "2.5rem" }}>
        {guide.badge && (
          <span
            style={{
              display: "inline-block",
              padding: "0.35rem 0.85rem",
              marginBottom: "1rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.03em",
              color: T.lime,
              backgroundColor: T.limeSoft,
              border: `1px solid ${T.lime}`,
              borderRadius: "2rem",
              ...fontDisplay,
            }}
          >
            {guide.badge}
          </span>
        )}

        <h1
          style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: T.text,
            marginBottom: "0.8rem",
            lineHeight: 1.2,
            ...fontDisplay,
          }}
        >
          {guide.title}
        </h1>

        <p
          style={{
            fontSize: "1.05rem",
            color: T.textMuted,
            marginBottom: "1.2rem",
            lineHeight: 1.6,
          }}
        >
          {guide.subtitle}
        </p>

        {guide.meta && (
          <div
            style={{
              fontSize: "0.8rem",
              color: T.textMuted,
              fontWeight: 500,
            }}
          >
            {guide.meta}
          </div>
        )}
      </header>

      {/* Caja de Resumen Rápido */}
      {guide.summaryBox && (
        <div
          style={{
            padding: "1.5rem",
            marginBottom: "2.5rem",
            backgroundColor: T.surface,
            borderLeft: `4px solid ${T.lime}`,
            borderRadius: "0 1rem 1rem 0",
            borderTop: `1px solid ${T.border}`,
            borderRight: `1px solid ${T.border}`,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: T.lime,
              marginBottom: "0.5rem",
              ...fontDisplay,
            }}
          >
            {guide.summaryBox.label}
          </span>
          <p
            style={{
              color: T.text,
              fontSize: "0.95rem",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {guide.summaryBox.text}
          </p>
        </div>
      )}

      {/* Índice Interactivo */}
      {guide.tableOfContents && (
        <nav
          aria-label="Índice de contenidos"
          style={{
            padding: "1.5rem",
            marginBottom: "3rem",
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: "1.1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.8rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: T.text,
              marginBottom: "1rem",
              ...fontDisplay,
            }}
          >
            <BookOpen size={16} color={T.lime} />
            <span>En esta guía</span>
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: "0.6rem",
            }}
          >
            {guide.tableOfContents.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  style={{
                    color: T.lime,
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: 500,
                  }}
                >
                  <span style={{ color: T.textMuted }}>→</span> {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Secciones de contenido */}
      <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
        {guide.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            style={{ scrollMarginTop: "5rem" }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: T.text,
                marginBottom: "1rem",
                lineHeight: 1.3,
                ...fontDisplay,
              }}
            >
              {section.title}
            </h2>

            {section.content && (
              <p
                style={{
                  color: T.textMuted,
                  lineHeight: 1.7,
                  marginBottom: "1.5rem",
                  fontSize: "1rem",
                }}
              >
                {section.content}
              </p>
            )}

            {/* Ejemplo práctico */}
            {section.example && (
              <div
                style={{
                  margin: "1.5rem 0",
                  padding: "1.5rem",
                  backgroundColor: T.surfaceAlt,
                  border: `1px solid ${T.border}`,
                  borderRadius: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: T.lime,
                    marginBottom: "0.5rem",
                    ...fontDisplay,
                  }}
                >
                  <Lightbulb size={16} />
                  <span>{section.example.title}</span>
                </div>
                <p
                  style={{
                    color: T.text,
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {section.example.text}
                </p>
              </div>
            )}

            {/* Tabla de datos */}
            {section.table && (
              <div
                style={{
                  overflowX: "auto",
                  margin: "1.5rem 0",
                  border: `1px solid ${T.border}`,
                  borderRadius: "1rem",
                  backgroundColor: T.surface,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    fontSize: "0.9rem",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: T.surfaceAlt,
                        borderBottom: `1px solid ${T.border}`,
                        color: T.text,
                      }}
                    >
                      {section.table.headers.map((th, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "1rem",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            ...fontDisplay,
                          }}
                        >
                          {th}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: i < section.table.rows.length - 1 ? `1px solid ${T.border}` : "none",
                        }}
                      >
                        {Array.isArray(row)
                          ? row.map((cell, j) => (
                              <td
                                key={j}
                                style={{
                                  padding: "1rem",
                                  color: T.textMuted,
                                }}
                              >
                                {cell}
                              </td>
                            ))
                          : row.map &&
                            row.map((cell, j) => (
                              <td
                                key={j}
                                style={{
                                  padding: "1rem",
                                  color: T.textMuted,
                                }}
                              >
                                {cell}
                              </td>
                            ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pasos numerados */}
            {section.steps && (
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  margin: "1.5rem 0",
                }}
              >
                {section.steps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "1.2rem",
                      padding: "1.2rem",
                      backgroundColor: T.surface,
                      border: `1px solid ${T.border}`,
                      borderRadius: "1rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        color: T.lime,
                        fontFamily: "monospace",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        backgroundColor: T.limeSoft,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "0.5rem",
                      }}
                    >
                      {step.num}
                    </span>
                    <div>
                      <h4
                        style={{
                          fontWeight: 600,
                          color: T.text,
                          marginBottom: "0.3rem",
                          fontSize: "1rem",
                          ...fontDisplay,
                        }}
                      >
                        {step.title}
                      </h4>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: T.textMuted,
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Errores frecuentes */}
            {section.errors && (
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  margin: "1.5rem 0",
                }}
              >
                {section.errors.map((error, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "1.2rem",
                      backgroundColor: "rgba(239, 68, 68, 0.05)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      borderRadius: "1rem",
                    }}
                  >
                    <h4
                      style={{
                        fontWeight: 600,
                        color: "#f87171",
                        marginBottom: "0.3rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.95rem",
                        ...fontDisplay,
                      }}
                    >
                      <AlertTriangle size={16} />
                      <span>{error.title}</span>
                    </h4>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: T.textMuted,
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {error.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Preguntas frecuentes */}
            {section.faqs && (
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  margin: "1.5rem 0",
                }}
              >
                {section.faqs.map((faq, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "1.2rem",
                      backgroundColor: T.surface,
                      border: `1px solid ${T.border}`,
                      borderRadius: "1rem",
                    }}
                  >
                    <h4
                      style={{
                        fontWeight: 600,
                        color: T.text,
                        marginBottom: "0.5rem",
                        fontSize: "0.95rem",
                        ...fontDisplay,
                      }}
                    >
                      {faq.q}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: T.textMuted,
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </article>
  );
            }
              
