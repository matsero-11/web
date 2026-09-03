"use client";

import React, {
  useEffect,
  useId,
  useState,
} from "react";

import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { fmtEUR } from "@/lib/hooks";

/* -------------------------------------------------------------------------- */
/* Utilidades                                                                 */
/* -------------------------------------------------------------------------- */

function getSafeMin(min) {
  const parsed = Number(min);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function getSafeStep(step) {
  const parsed = Number(step);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }

  return parsed;
}

function getSafeMax(max, min, step) {
  const parsed = Number(max);

  if (Number.isFinite(parsed) && parsed > min) {
    return parsed;
  }

  return Math.max(10000000, min + step);
}

function getSafeValue(value, min) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return min;
  }

  return Math.max(min, parsed);
}

function countDecimals(value) {
  const text = String(value);

  if (!text.includes(".")) {
    return 0;
  }

  return text.split(".")[1].length;
}

function roundToStep(value, min, step) {
  const decimals = countDecimals(step);
  const rounded =
    Math.round((value - min) / step) * step + min;

  return Number(rounded.toFixed(decimals));
}

function parseInputText(rawValue) {
  const text = String(rawValue)
    .trim()
    .replace(/\s/g, "")
    .replace(",", ".");

  if (text === "") {
    return {
      valid: false,
      empty: true,
      value: null,
    };
  }

  if (!/^\d+(\.\d+)?$/.test(text)) {
    return {
      valid: false,
      empty: false,
      value: null,
    };
  }

  const value = Number(text);

  if (!Number.isFinite(value)) {
    return {
      valid: false,
      empty: false,
      value: null,
    };
  }

  return {
    valid: true,
    empty: false,
    value,
  };
}

function getAccentValues(accent) {
  if (accent === "lavender") {
    return {
      color: T.lavender,
      className: "slider-lavender",
    };
  }

  if (accent === "coral") {
    return {
      color: T.coral,
      className: "slider-coral",
    };
  }

  return {
    color: T.lime,
    className: "slider-lime",
  };
}

/* -------------------------------------------------------------------------- */
/* Button                                                                     */
/* -------------------------------------------------------------------------- */

function Button({
  children,
  variant = "primary",
  onClick,
  icon: Icon,
  disabled = false,
  type = "button",
}) {
  const base = {
    padding: "0.85rem 1.4rem",
    borderRadius: "0.9rem",
    fontWeight: 600,
    fontSize: "0.95rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition:
      "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s ease, background 0.2s ease, box-shadow 0.22s ease",
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    opacity: disabled ? 0.4 : 1,
    width: "100%",
  };

  const styles = {
    primary: {
      ...base,
      background: T.lime,
      color: "#12200A",
    },
    ghost: {
      ...base,
      background: "transparent",
      color: T.text,
      border: `1px solid ${T.border}`,
    },
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={styles[variant] || styles.primary}
      onMouseDown={(event) => {
        if (disabled) return;

        event.currentTarget.style.transform =
          "scale(0.96)";
      }}
      onMouseUp={(event) => {
        if (disabled) return;

        event.currentTarget.style.transform =
          "scale(1)";
      }}
      onMouseEnter={(event) => {
        if (disabled || variant !== "primary") return;

        event.currentTarget.style.boxShadow =
          `0 0 0 6px ${T.limeSoft}`;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "scale(1)";
        event.currentTarget.style.boxShadow = "none";
      }}
    >
      {Icon && <Icon size={17} aria-hidden="true" />}
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

function Card({
  children,
  onClick,
  disabled = false,
  style,
  glow = false,
  result = false,
}) {
  const clickable =
    typeof onClick === "function" && !disabled;

  const handleKeyDown = (event) => {
    if (!clickable) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(event);
    }
  };

  return (
    <div
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-disabled={disabled || undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      style={{
        position: "relative",
        background: result ? "transparent" : T.surface,
        border: result ? "none" : `1px solid ${T.border}`,
        borderBottom: result
          ? `1px solid ${T.border}`
          : undefined,
        borderRadius: result ? 0 : "1.1rem",
        padding: result
          ? "1.1rem 0.5rem 1.4rem"
          : "1.25rem",
        cursor: clickable ? "pointer" : "default",
        opacity: disabled ? 0.45 : 1,
        transition:
          "border-color 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease",
        overflow: "hidden",
        ...style,
      }}
      onMouseEnter={(event) => {
        if (!clickable) return;

        event.currentTarget.style.borderColor =
          T.borderStrong;
        event.currentTarget.style.transform =
          "translateY(-2px)";
        event.currentTarget.style.boxShadow =
          "0 10px 24px -12px rgba(0,0,0,0.5)";
      }}
      onMouseLeave={(event) => {
        if (!clickable) return;

        event.currentTarget.style.borderColor = T.border;
        event.currentTarget.style.transform = "translateY(0)";
        event.currentTarget.style.boxShadow = "none";
      }}
      onFocus={(event) => {
        if (!clickable) return;

        event.currentTarget.style.borderColor = T.lime;
        event.currentTarget.style.boxShadow =
          `0 0 0 3px ${T.limeSoft}`;
      }}
      onBlur={(event) => {
        if (!clickable) return;

        event.currentTarget.style.borderColor = T.border;
        event.currentTarget.style.boxShadow = "none";
      }}
    >
      {glow && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(
              60% 70% at 50% 0%,
              ${T.limeSoft} 0%,
              transparent 70%
            )`,
          }}
        />
      )}

      <div style={{ position: "relative" }}>
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SliderControl                                                              */
/* -------------------------------------------------------------------------- */

function SliderControl({
  label,
  value,
  min = 0,
  max = 10000000,
  step = 1,
  unit,
  onChange,
  accent = "lime",
  disabled = false,
}) {
  const inputId = useId();
  const sliderId = `${inputId}-slider`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const safeMin = getSafeMin(min);
  const safeStep = getSafeStep(step);
  const safeMax = getSafeMax(
    max,
    safeMin,
    safeStep,
  );

  const safeValue = getSafeValue(value, safeMin);
  const { color, className } = getAccentValues(accent);

  const [inputText, setInputText] = useState(
    String(safeValue),
  );

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) {
      setInputText(String(safeValue));
      setError("");
    }
  }, [safeValue, isEditing]);

  const sliderValue = Math.min(
    Math.max(safeValue, safeMin),
    safeMax,
  );

  const sliderPosition =
    safeMax > safeMin
      ? ((sliderValue - safeMin) /
          (safeMax - safeMin)) *
        100
      : 0;

  const percentage = Math.max(
    0,
    Math.min(100, sliderPosition),
  );

  const emitChange = (nextValue) => {
    if (
      typeof onChange === "function" &&
      Number.isFinite(nextValue)
    ) {
      onChange(nextValue);
    }
  };

  const handleInputChange = (event) => {
    const nextText = event.currentTarget.value;

    setInputText(nextText);
    setError("");

    const parsed = parseInputText(nextText);

    if (parsed.valid) {
      const nextValue = Math.max(
        safeMin,
        parsed.value,
      );

      emitChange(nextValue);
    }
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    setError("");
  };

  const commitInput = (rawValue) => {
    const parsed = parseInputText(rawValue);

    if (parsed.empty) {
      setError("Introduce un número.");
      return false;
    }

    if (!parsed.valid) {
      setError("Introduce un número válido.");
      return false;
    }

    const minimumValue = Math.max(
      safeMin,
      parsed.value,
    );

    const nextValue = roundToStep(
      minimumValue,
      safeMin,
      safeStep,
    );

    emitChange(nextValue);
    setInputText(String(nextValue));
    setError("");

    return true;
  };

  const handleInputBlur = (event) => {
    const committed = commitInput(
      event.currentTarget.value,
    );

    setIsEditing(false);

    if (!committed) {
      setInputText(String(safeValue));
    }
  };

  const handleInputKeyDown = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    const committed = commitInput(
      event.currentTarget.value,
    );

    if (committed) {
      event.currentTarget.blur();
    }
  };

  const handleSliderChange = (event) => {
    const nextValue = Number(
      event.currentTarget.value,
    );

    if (!Number.isFinite(nextValue)) {
      return;
    }

    emitChange(nextValue);
    setInputText(String(nextValue));
    setError("");
  };

  const formattedValue =
    unit === "€"
      ? fmtEUR(safeValue)
      : unit
        ? `${safeValue} ${unit}`
        : String(safeValue);

  const hintText =
    safeValue > safeMax
      ? `El slider muestra hasta ${safeMax}; el valor real es ${formattedValue}.`
      : `Rango del slider: ${safeMin}–${safeMax}.`;

  return (
    <div
      className="w-full"
      style={{
        minWidth: 0,
      }}
    >
      <div
        className="mb-2 flex items-baseline justify-between"
        style={{
          gap: "0.75rem",
        }}
      >
        <label
          htmlFor={inputId}
          style={{
            ...fontBody,
            color: T.textMuted,
            fontSize: "0.85rem",
          }}
        >
          {label}
        </label>

        <div
          className="flex items-center gap-1.5"
          style={{
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          <input
            id={inputId}
            name={inputId}
            type="text"
            inputMode="decimal"
            value={inputText}
            disabled={disabled}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            aria-label={
              label
                ? `${label} (valor numérico)`
                : "Valor numérico"
            }
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${errorId} ${hintId}`
                : hintId
            }
            style={{
              ...fontDisplay,
              width: "6.5rem",
              minWidth: 0,
              background: T.surfaceAlt,
              border: `1px solid ${
                error ? T.coral : T.border
              }`,
              borderRadius: "0.5rem",
              padding: "0.3rem 0.55rem",
              color,
              fontSize: "1rem",
              fontWeight: 600,
              textAlign: "right",
              outline: "none",
              opacity: disabled ? 0.55 : 1,
              cursor: disabled
                ? "not-allowed"
                : "text",
            }}
          />

          {unit && (
            <span
              aria-hidden="true"
              style={{
                ...fontBody,
                color: T.textMuted,
                fontSize: "0.85rem",
              }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>

      <input
        id={sliderId}
        type="range"
        min={safeMin}
        max={safeMax}
        step={safeStep}
        value={sliderValue}
        disabled={disabled}
        onChange={handleSliderChange}
        aria-label={
          label
            ? `${label} mediante deslizador`
            : "Control deslizante"
        }
        aria-valuemin={safeMin}
        aria-valuemax={safeMax}
        aria-valuenow={sliderValue}
        aria-valuetext={formattedValue}
        className={className}
        style={{
          "--slider-position": `${percentage}%`,
        }}
      />

      <p
        id={hintId}
        style={{
          ...fontBody,
          marginTop: "0.4rem",
          color: T.textSubtle,
          fontSize: "0.7rem",
          lineHeight: 1.4,
        }}
      >
        {hintText}
      </p>

      {error && (
        <p
          id={errorId}
          role="alert"
          style={{
            ...fontBody,
            marginTop: "0.35rem",
            color: T.coral,
            fontSize: "0.75rem",
            lineHeight: 1.4,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ProgressBar                                                                */
/* -------------------------------------------------------------------------- */

function ProgressBar({ pct, gradientEnd }) {
  const safePercentage = Number.isFinite(Number(pct))
    ? Math.max(0, Math.min(100, Number(pct)))
    : 0;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safePercentage}
      style={{
        width: "100%",
        height: "10px",
        borderRadius: "999px",
        background: T.surfaceAlt,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${safePercentage}%`,
          height: "100%",
          borderRadius: "999px",
          background: gradientEnd
            ? `linear-gradient(
                to right,
                ${T.lime},
                ${gradientEnd}
              )`
            : T.lime,
          transition:
            "width 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Chip                                                                       */
/* -------------------------------------------------------------------------- */

function Chip({
  label,
  icon: Icon,
  active = false,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={active}
      style={{
        ...fontBody,
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.55rem 0.9rem",
        borderRadius: "999px",
        fontSize: "0.85rem",
        fontWeight: 500,
        border: `1px solid ${
          active ? T.lime : T.border
        }`,
        background: active
          ? T.limeSoft
          : "transparent",
        color: active ? T.lime : T.textMuted,
        cursor: disabled
          ? "not-allowed"
          : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.18s ease",
      }}
    >
      {Icon && <Icon size={14} aria-hidden="true" />}
      {label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* IconTile                                                                   */
/* -------------------------------------------------------------------------- */

function IconTile({ icon: Icon, tone = "lime" }) {
  const background =
    tone === "lavender"
      ? T.lavenderSoft
      : T.limeSoft;

  const color =
    tone === "lavender"
      ? T.lavender
      : T.lime;

  return (
    <div
      aria-hidden="true"
      style={{
        background,
        borderRadius: "0.7rem",
        padding: "0.6rem",
        display: "flex",
      }}
    >
      <Icon size={20} color={color} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* AdviceBlock                                                                */
/* -------------------------------------------------------------------------- */

function AdviceBlock({
  text,
  children,
  icon: Icon,
  tone = "lime",
}) {
  const background =
    tone === "lavender"
      ? T.lavenderSoft
      : T.limeSoft;

  const color =
    tone === "lavender"
      ? T.lavender
      : T.lime;

  const content = text ?? children;

  if (!content) {
    return null;
  }

  return (
    <div
      style={{
        background,
        borderRadius: "0.9rem",
        padding: "1rem",
        display: "flex",
        gap: "0.75rem",
        alignItems: "flex-start",
        marginTop: "1rem",
      }}
    >
      {Icon && (
        <Icon
          size={20}
          color={color}
          aria-hidden="true"
          style={{
            marginTop: "0.1rem",
            flexShrink: 0,
          }}
        />
      )}

      <div
        style={{
          ...fontBody,
          fontSize: "0.9rem",
          color: T.text,
          lineHeight: 1.4,
        }}
      >
        {content}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Exportaciones                                                              */
/* -------------------------------------------------------------------------- */

export {
  Button,
  Card,
  SliderControl,
  ProgressBar,
  Chip,
  IconTile,
  AdviceBlock,
};
    
