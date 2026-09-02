"use client";

import React, { useId } from "react";
import { AlertTriangle, CheckCircle2, Info, Lightbulb } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { fmtEUR } from "@/lib/hooks";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function Button({
  children,
  variant = "primary",
  onClick,
  icon: Icon,
  disabled = false,
  type = "button",
  fullWidth = true,
  style = {},
}) {
  const styles = {
    primary: {
      background: T.lime,
      color: "#12200A",
      border: `1px solid ${T.lime}`,
    },
    ghost: {
      background: "transparent",
      color: T.text,
      border: `1px solid ${T.border}`,
    },
    coral: {
      background: T.coral,
      color: "#2B0C08",
      border: `1px solid ${T.coral}`,
    },
    lavender: {
      background: T.lavender,
      color: "#171127",
      border: `1px solid ${T.lavender}`,
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...fontBody,
        minHeight: "44px",
        width: fullWidth ? "100%" : "auto",
        padding: "0.72rem 1.15rem",
        borderRadius: "0.9rem",
        fontWeight: 650,
        fontSize: "0.95rem",
        lineHeight: 1.2,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        outline: "none",
        WebkitAppearance: "none",
        appearance: "none",
        transition:
          "transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease",
        ...styles[variant],
        ...style,
      }}
      onMouseDown={(event) => {
        if (!disabled) {
          event.currentTarget.style.transform = "scale(0.98)";
        }
      }}
      onMouseUp={(event) => {
        event.currentTarget.style.transform = "scale(1)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "scale(1)";
        event.currentTarget.style.boxShadow = "none";
      }}
      onFocus={(event) => {
        if (!disabled) {
          event.currentTarget.style.boxShadow = `0 0 0 4px ${T.limeSoft}`;
        }
      }}
      onBlur={(event) => {
        event.currentTarget.style.boxShadow = "none";
      }}
    >
      {Icon && <Icon size={17} aria-hidden="true" />}
      {children}
    </button>
  );
}

function Card({
  children,
  onClick,
  disabled = false,
  style = {},
  glow = false,
  result = false,
  ariaLabel,
  className = "",
}) {
  const clickable = typeof onClick === "function" && !disabled;

  return (
    <div
      className={className}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        position: "relative",
        width: "100%",
        textAlign: "left",
        color: T.text,
        font: "inherit",
        background: result ? "transparent" : T.surface,
        border: result ? "none" : `1px solid ${T.border}`,
        borderBottom: result ? `1px solid ${T.border}` : undefined,
        borderRadius: result ? 0 : "1.1rem",
        padding: result ? "1.1rem 0.5rem 1.4rem" : "1.25rem",
        cursor: clickable ? "pointer" : "default",
        opacity: disabled ? 0.5 : 1,
        overflow: "hidden",
        boxSizing: "border-box",
        outline: "none",
        WebkitAppearance: "none",
        appearance: "none",
        transition:
          "border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
        ...style,
      }}
      onMouseEnter={(event) => {
        if (!clickable) return;

        event.currentTarget.style.borderColor = T.borderStrong || T.lime;
        event.currentTarget.style.transform = "translateY(-2px)";
        event.currentTarget.style.boxShadow =
          "0 10px 24px -12px rgba(0,0,0,0.55)";
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
        event.currentTarget.style.boxShadow = `0 0 0 3px ${T.limeSoft}`;
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
            background: `radial-gradient(60% 70% at 50% 0%, ${T.limeSoft} 0%, transparent 70%)`,
          }}
        />
      )}

      <div style={{ position: "relative", width: "100%" }}>
        {children}
      </div>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  onChange,
  accent = "lime",
  description,
  disabled = false,
}) {
  const id = useId().replace(/:/g, "");
  const inputId = `slider-${id}`;
  const descriptionId = description ? `${inputId}-description` : undefined;

  const numericMin = Number(min);
  const numericMax = Math.max(Number(max), numericMin);
  const numericValue = Number.isFinite(Number(value))
    ? Number(value)
    : numericMin;
  const numericStep = Number(step) > 0 ? Number(step) : 1;
  const dynamicMax = Math.max(numericMax, numericValue);
  const current = clamp(numericValue, numericMin, dynamicMax);

  const percent =
    dynamicMax > numericMin
      ? clamp(
          ((current - numericMin) / (dynamicMax - numericMin)) * 100,
          0,
          100
        )
      : 0;

  const color =
    accent === "lavender"
      ? T.lavender
      : accent === "coral"
        ? T.coral
        : T.lime;

  const displayValue =
    unit === "€"
      ? fmtEUR(current)
      : unit
        ? `${current} ${unit}`
        : String(current);

  const update = (nextValue) => {
    const parsed = Number(nextValue);

    if (
      !Number.isFinite(parsed) ||
      disabled ||
      typeof onChange !== "function"
    ) {
      return;
    }

    const limited = clamp(parsed, numericMin, dynamicMax);

    const rounded =
      Math.round((limited - numericMin) / numericStep) * numericStep +
      numericMin;

    const decimalPlaces = String(numericStep).split(".")[1]?.length || 0;

    onChange(Number(rounded.toFixed(decimalPlaces)));
  };

  return (
    <div className="w-full">
      <div
        className="flex justify-between items-baseline mb-2"
        style={{ gap: "0.75rem", flexWrap: "wrap" }}
      >
        <div style={{ minWidth: 0 }}>
          {label && (
            <label
              htmlFor={inputId}
              style={{
                ...fontBody,
                color: T.text,
                fontSize: "0.88rem",
                fontWeight: 550,
              }}
            >
              {label}
            </label>
          )}

          {description && (
            <div
              id={descriptionId}
              style={{
                ...fontBody,
                color: T.textMuted,
                fontSize: "0.75rem",
                lineHeight: 1.45,
                marginTop: "0.2rem",
              }}
            >
              {description}
            </div>
          )}
        </div>

        <div
          className="flex items-center gap-1.5"
          style={{ minHeight: "40px" }}
        >
          <input
            type="number"
            value={current}
            min={numericMin}
            max={dynamicMax}
            step={numericStep}
            disabled={disabled}
            inputMode="decimal"
            onChange={(event) => {
              if (event.target.value !== "") {
                update(event.target.value);
              }
            }}
            aria-label={label ? `${label}. Valor numérico` : "Valor numérico"}
            aria-describedby={descriptionId}
            style={{
              ...fontDisplay,
              width: "5.9rem",
              minHeight: "40px",
              padding: "0.3rem 0.55rem",
              background: T.surfaceAlt,
              color,
              border: `1px solid ${T.border}`,
              borderRadius: "0.6rem",
              fontSize: "1rem",
              fontWeight: 650,
              textAlign: "right",
              outline: "none",
              opacity: disabled ? 0.55 : 1,
              boxSizing: "border-box",
            }}
            onFocus={(event) => {
              event.currentTarget.style.borderColor = color;
              event.currentTarget.style.boxShadow = `0 0 0 3px ${T.limeSoft}`;
            }}
            onBlur={(event) => {
              event.currentTarget.style.borderColor = T.border;
              event.currentTarget.style.boxShadow = "none";
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
        id={inputId}
        type="range"
        min={numericMin}
        max={dynamicMax}
        step={numericStep}
        value={current}
        disabled={disabled}
        onChange={(event) => update(event.target.value)}
        aria-label={label || undefined}
        aria-describedby={descriptionId}
        aria-valuemin={numericMin}
        aria-valuemax={dynamicMax}
        aria-valuenow={current}
        aria-valuetext={displayValue}
        className={
          accent === "lavender"
            ? "slider-lavender"
            : accent === "coral"
              ? "slider-coral"
              : "slider-lime"
        }
        style={{
          display: "block",
          width: "100%",
          minHeight: "44px",
          height: "44px",
          appearance: "none",
          WebkitAppearance: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          accentColor: color,
          background: `linear-gradient(to right, ${color} ${percent}%, ${T.surfaceAlt} ${percent}%)`,
          outline: "none",
          opacity: disabled ? 0.55 : 1,
        }}
      />

      <div
        aria-live="polite"
        style={{
          ...fontBody,
          color: T.textMuted,
          fontSize: "0.72rem",
          textAlign: "right",
          marginTop: "0.15rem",
        }}
      >
        {displayValue}
      </div>
    </div>
  );
}

function ProgressBar({
  pct = 0,
  gradientEnd,
  tone = "lime",
  label,
  showLabel = false,
  height = "10px",
}) {
  const realPercent = Number.isFinite(Number(pct)) ? Number(pct) : 0;
  const visiblePercent = clamp(realPercent, 0, 100);
  const overflow = Math.max(realPercent - 100, 0);

  const color =
    tone === "lavender"
      ? T.lavender
      : tone === "coral"
        ? T.coral
        : T.lime;

  return (
    <div style={{ width: "100%" }}>
      <div
        role="progressbar"
        aria-label={label || "Progreso"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(visiblePercent)}
        aria-valuetext={
          overflow > 0
            ? `${realPercent.toFixed(0)}%, por encima del objetivo`
            : `${visiblePercent.toFixed(0)}%`
        }
        style={{
          width: "100%",
          height,
          borderRadius: "999px",
          background: T.surfaceAlt,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${visiblePercent}%`,
            height: "100%",
            borderRadius: "999px",
            background: gradientEnd
              ? `linear-gradient(to right, ${color}, ${gradientEnd})`
              : color,
            transition: "width 0.35s ease",
          }}
        />
      </div>

      {(showLabel || label || overflow > 0) && (
        <div
          aria-live="polite"
          style={{
            ...fontBody,
            color: overflow > 0 ? T.lavender : T.textMuted,
            fontSize: "0.74rem",
            textAlign: "right",
            marginTop: "0.35rem",
          }}
        >
          {label || `${realPercent.toFixed(0)}%`}
          {overflow > 0 ? ` · ${overflow.toFixed(0)}% por encima` : ""}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  icon: Icon,
  active = false,
  onClick,
  disabled = false,
  tone = "lime",
  ariaLabel,
  style = {},
}) {
  const color =
    tone === "lavender"
      ? T.lavender
      : tone === "coral"
        ? T.coral
        : T.lime;

  const background =
    tone === "lavender"
      ? T.lavenderSoft
      : tone === "coral"
        ? "rgba(255, 119, 102, 0.12)"
        : T.limeSoft;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={Boolean(active)}
      aria-label={ariaLabel || label}
      style={{
        ...fontBody,
        minHeight: "44px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.42rem",
        padding: "0.58rem 0.9rem",
        borderRadius: "999px",
        fontSize: "0.85rem",
        fontWeight: active ? 650 : 500,
        border: `1px solid ${active ? color : T.border}`,
        background: active ? background : "transparent",
        color: active ? color : T.textMuted,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        outline: "none",
        WebkitAppearance: "none",
        appearance: "none",
        transition: "all 0.18s ease",
        ...style,
      }}
      onFocus={(event) => {
        if (!disabled) {
          event.currentTarget.style.boxShadow = `0 0 0 3px ${T.limeSoft}`;
        }
      }}
      onBlur={(event) => {
        event.currentTarget.style.boxShadow = "none";
      }}
    >
      {Icon && <Icon size={15} aria-hidden="true" />}
      {label}
    </button>
  );
}

function IconTile({ icon: Icon, tone = "lime", size = 20, label }) {
  const colors = {
    lime: {
      bg: T.limeSoft,
      fg: T.lime,
      border: T.lime,
    },
    lavender: {
      bg: T.lavenderSoft,
      fg: T.lavender,
      border: T.lavender,
    },
    coral: {
      bg: "rgba(255, 119, 102, 0.12)",
      fg: T.coral,
      border: T.coral,
    },
    muted: {
      bg: T.surfaceAlt,
      fg: T.textMuted,
      border: T.border,
    },
  };

  const selected = colors[tone] || colors.lime;

  return (
    <div
      aria-label={label}
      role={label ? "img" : undefined}
      style={{
        width: "2.55rem",
        height: "2.55rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "0.78rem",
        background: selected.bg,
        border: `1px solid ${selected.border}`,
      }}
    >
      {Icon && (
        <Icon
          size={size}
          color={selected.fg}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function AdviceBlock({
  text,
  children,
  icon: CustomIcon,
  tone = "lime",
  title,
  live = false,
  style = {},
}) {
  const content = text ?? children;

  if (!content) {
    return null;
  }

  const tones = {
    lime: {
      bg: T.limeSoft,
      fg: T.lime,
      border: "rgba(191, 255, 66, 0.24)",
      icon: Lightbulb,
    },
    lavender: {
      bg: T.lavenderSoft,
      fg: T.lavender,
      border: "rgba(190, 166, 255, 0.24)",
      icon: Info,
    },
    coral: {
      bg: "rgba(255, 119, 102, 0.12)",
      fg: T.coral,
      border: "rgba(255, 119, 102, 0.24)",
      icon: AlertTriangle,
    },
    success: {
      bg: T.limeSoft,
      fg: T.lime,
      border: "rgba(191, 255, 66, 0.24)",
      icon: CheckCircle2,
    },
  };

  const selected = tones[tone] || tones.lime;
  const Icon = CustomIcon || selected.icon;

  return (
    <aside
      role={tone === "coral" ? "alert" : undefined}
      aria-live={live ? "polite" : undefined}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "1rem",
        marginTop: "0.25rem",
        borderRadius: "0.95rem",
        background: selected.bg,
        border: `1px solid ${selected.border}`,
        boxSizing: "border-box",
        ...style,
      }}
    >
      <Icon
        size={19}
        color={selected.fg}
        aria-hidden="true"
        style={{
          marginTop: "0.08rem",
          flexShrink: 0,
        }}
      />

      <div style={{ minWidth: 0 }}>
        {title && (
          <div
            style={{
              ...fontBody,
              color: selected.fg,
              fontSize: "0.82rem",
              fontWeight: 650,
              marginBottom: "0.2rem",
            }}
          >
            {title}
          </div>
        )}

        <div
          style={{
            ...fontBody,
            color: T.text,
            fontSize: "0.9rem",
            lineHeight: 1.5,
          }}
        >
          {content}
        </div>
      </div>
    </aside>
  );
}

export {
  Button,
  Card,
  SliderControl,
  ProgressBar,
  Chip,
  IconTile,
  AdviceBlock,
};
