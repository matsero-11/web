"use client";
import React, { useState, useEffect } from "react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { fmtEUR } from "@/lib/hooks";

function Button({ children, variant = "primary", onClick, icon: Icon, disabled }) {
  const base = {
    padding: "0.85rem 1.4rem",
    borderRadius: "0.9rem",
    fontWeight: 600,
    fontSize: "0.95rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s ease, background 0.2s ease, box-shadow 0.22s ease",
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    opacity: disabled ? 0.4 : 1,
    width: "100%",
  };
  const styles = {
    primary: { ...base, background: T.lime, color: "#12200A" },
    ghost: { ...base, background: "transparent", color: T.text, border: `1px solid ${T.border}` },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={styles[variant]}
      onMouseDown={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "scale(0.96)";
      }}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseEnter={(e) => {
        if (disabled || variant !== "primary") return;
        e.currentTarget.style.boxShadow = `0 0 0 6px ${T.limeSoft}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {Icon && <Icon size={17} />}
      {children}
    </button>
  );
}


function Card({ children, onClick, disabled, style, glow, result }) {
  const clickable = !!onClick && !disabled;
  return (
    <div
      onClick={disabled ? undefined : onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-disabled={disabled || undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        position: "relative",
        background: result ? "transparent" : T.surface,
        border: result ? "none" : `1px solid ${T.border}`,
        borderBottom: result ? `1px solid ${T.border}` : undefined,
        borderRadius: result ? 0 : "1.1rem",
        padding: result ? "1.1rem 0.5rem 1.4rem" : "1.25rem",
        cursor: clickable ? "pointer" : "default",
        opacity: disabled ? 0.45 : 1,
        transition: "border-color 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease",
        overflow: "hidden",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!clickable) return;
        e.currentTarget.style.borderColor = T.borderStrong;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 10px 24px -12px rgba(0,0,0,0.5)";
      }}
      onMouseLeave={(e) => {
        if (!clickable) return;
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
      onFocus={(e) => {
        if (!clickable) return;
        e.currentTarget.style.borderColor = T.lime;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${T.limeSoft}`;
      }}
      onBlur={(e) => {
        if (!clickable) return;
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {glow && (
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(60% 70% at 50% 0%, ${T.limeSoft} 0%, transparent 70%)`,
          }}
        />
      )}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}


/**
 * SliderControl — input numérico + slider sincronizados.
 *
 * Arquitectura clave para que la escritura nunca se bloquee:
 * - `inputText` es SOLO texto, y es lo único que controla el <input>.
 *   Mientras el usuario edita, este texto puede ser "", "1", "1.", "1.5"...
 *   sin que nada lo fuerce a convertirse en número en cada tecla.
 * - `value` (el número real, viene del padre vía props) NUNCA se escribe
 *   directamente en el input mientras el usuario está editando (`isEditing`).
 * - El slider actualiza `value` inmediatamente (arrastrar debe ser fluido),
 *   y sincroniza `inputText` solo si el usuario NO está escribiendo a la vez.
 * - La validación/limpieza (redondeo, mínimo, etc.) solo ocurre al confirmar
 *   (blur o Enter), nunca en cada pulsación.
 */
function SliderControl({ label, value, min, max, step, unit, onChange, accent = "lime" }) {
  const color = accent === "lavender" ? T.lavender : T.lime;
  const safeValue = Number.isFinite(value) ? value : 0;

  const [inputText, setInputText] = useState(String(safeValue));
  const [isEditing, setIsEditing] = useState(false);

  // Sincroniza el texto del input con el valor externo (p.ej. cambios desde
  // el slider, o desde otra herramienta vía URL/localStorage) — pero SOLO
  // cuando el usuario no está escribiendo activamente en la casilla.
  useEffect(() => {
    if (!isEditing) {
      setInputText(String(safeValue));
    }
    // eslint-disable-next-line
  }, [safeValue, isEditing]);

  const dynamicMax = Math.max(max, safeValue * 1.5);
  const pct = dynamicMax > min ? ((safeValue - min) / (dynamicMax - min)) * 100 : 0;

  // Se ejecuta SOLO al confirmar (blur / Enter) — nunca mientras se escribe.
  const commitText = (rawText) => {
    const text = rawText.trim();

    if (text === "") {
      onChange(0);
      setInputText("0");
      return;
    }

    // Admite coma decimal además de punto, por si el usuario escribe "1,5"
    const normalized = text.replace(",", ".");
    const num = Number(normalized);

    if (!Number.isFinite(num)) {
      // Texto no válido: no se sustituye en silencio, se revierte al último
      // valor válido conocido.
      setInputText(String(safeValue));
      return;
    }

    const clamped = Math.max(min, num);
    onChange(clamped);
    setInputText(String(clamped));
  };

  const handleTextChange = (e) => {
    // Sin validar, sin redondear, sin tocar min/max — solo guardamos lo que
    // el usuario está escribiendo, letra a letra.
    setInputText(e.target.value);
  };

  const handleFocus = () => setIsEditing(true);

  const handleBlur = (e) => {
    setIsEditing(false);
    commitText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitText(e.currentTarget.value);
      e.currentTarget.blur();
    }
  };

  const handleSliderChange = (e) => {
    const num = Number(e.target.value);
    onChange(num);
    // Si el usuario no está a la vez escribiendo en la casilla, refleja el
    // nuevo valor ahí también. Si está editando, no la tocamos — así el
    // slider nunca pisa lo que se está tecleando.
    if (!isEditing) setInputText(String(num));
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-2" style={{ gap: "0.75rem" }}>
        <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>{label}</span>
        <div className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
          <input
            type="text"
            inputMode="decimal"
            value={inputText}
            onChange={handleTextChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-label={label ? `${label} (valor numérico)` : "Valor numérico"}
            style={{
              ...fontDisplay,
              width: "5.5rem",
              background: T.surfaceAlt,
              border: `1px solid ${T.border}`,
              borderRadius: "0.5rem",
              padding: "0.25rem 0.5rem",
              color,
              fontSize: "1rem",
              fontWeight: 600,
              textAlign: "right",
              outline: "none",
            }}
            onFocusCapture={(e) => { e.currentTarget.style.borderColor = color; }}
            onBlurCapture={(e) => { e.currentTarget.style.borderColor = T.border; }}
          />
          {unit && (
            <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem" }}>{unit}</span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={dynamicMax}
        step={step}
        value={safeValue}
        aria-label={label || undefined}
        aria-valuemin={min}
        aria-valuemax={dynamicMax}
        aria-valuenow={safeValue}
        aria-valuetext={unit === "€" ? fmtEUR(safeValue) : unit ? `${safeValue} ${unit}` : `${safeValue}`}
        role="slider"
        onChange={handleSliderChange}
        className={accent === "lavender" ? "slider-lavender" : "slider-lime"}
        style={{
          width: "100%",
          height: "6px",
          borderRadius: "999px",
          appearance: "none",
          background: `linear-gradient(to right, ${color} ${pct}%, ${T.surfaceAlt} ${pct}%)`,
          outline: "none",
        }}
      />
    </div>
  );
}


function ProgressBar({ pct, gradientEnd }) {
  return (
    <div style={{ width: "100%", height: "10px", borderRadius: "999px", background: T.surfaceAlt, overflow: "hidden" }}>
      <div
        style={{
          width: `${Math.min(pct, 100)}%`,
          height: "100%",
          borderRadius: "999px",
          background: gradientEnd
            ? `linear-gradient(to right, ${T.lime}, ${gradientEnd})`
            : T.lime,
          transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      />
    </div>
  );
}


function Chip({ label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...fontBody,
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.55rem 0.9rem",
        borderRadius: "999px",
        fontSize: "0.85rem",
        fontWeight: 500,
        border: `1px solid ${active ? T.lime : T.border}`,
        background: active ? T.limeSoft : "transparent",
        color: active ? T.lime : T.textMuted,
        cursor: "pointer",
        transition: "all 0.18s ease",
      }}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
}


function IconTile({ icon: Icon, tone = "lime" }) {
  const bg = tone === "lavender" ? T.lavenderSoft : T.limeSoft;
  const fg = tone === "lavender" ? T.lavender : T.lime;
  return (
    <div style={{ background: bg, borderRadius: "0.7rem", padding: "0.6rem", display: "flex" }}>
      <Icon size={20} color={fg} />
    </div>
  );
}


function AdviceBlock({ text, children, icon: Icon, tone = "lime" }) {
  const bg = tone === "lavender" ? T.lavenderSoft : T.limeSoft;
  const fg = tone === "lavender" ? T.lavender : T.lime;
  const content = text ?? children;
  if (!content) return null;
  return (
    <div style={{ background: bg, borderRadius: "0.9rem", padding: "1rem", display: "flex", gap: "0.75rem", alignItems: "flex-start", marginTop: "1rem" }}>
      {Icon && <Icon size={20} color={fg} style={{ marginTop: "0.1rem", flexShrink: 0 }} />}
      <div style={{ ...fontBody, fontSize: "0.9rem", color: T.text, lineHeight: 1.4 }}>{content}</div>
    </div>
  );
}

export { Button, Card, SliderControl, ProgressBar, Chip, IconTile, AdviceBlock };
