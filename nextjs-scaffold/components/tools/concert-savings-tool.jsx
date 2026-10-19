"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Helmet } from "react-helmet-async";
import { Music2, Ticket, MapPin, Share2, Download, Copy } from "lucide-react";
import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { fmtEUR } from "@/lib/hooks";
import { Card, AdviceBlock, SliderControl, Chip } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";

/* 🧩 Parte 1: Constantes, Utilidades y StoryDeck */

const CITIES = [
  { id: "madrid", label: "Madrid", transport: 70, hotel: 95 },
  { id: "barcelona", label: "Barcelona", transport: 70, hotel: 110 },
  { id: "lisboa", label: "Lisboa", transport: 140, hotel: 90 },
  { id: "paris", label: "París", transport: 160, hotel: 140 },
  { id: "londres", label: "Londres", transport: 180, hotel: 150 },
  { id: "amsterdam", label: "Ámsterdam", transport: 170, hotel: 135 },
  { id: "berlin", label: "Berlín", transport: 190, hotel: 100 },
  { id: "milan", label: "Milán", transport: 150, hotel: 120 },
  { id: "otra", label: "Otra ciudad", transport: 150, hotel: 110 },
];

const TICKETS = [
  { id: "general", label: "General", price: 65 },
  { id: "grada", label: "Grada", price: 90 },
  { id: "pista", label: "Pista", price: 120 },
  { id: "vip", label: "VIP / Golden Circle", price: 280 },
  { id: "meet", label: "Meet & Greet", price: 450 },
];

const THEMES = [
  { id: "lima", label: "Lima" },
  { id: "lavanda", label: "Lavanda" },
  { id: "coral", label: "Coral" },
  { id: "aurora", label: "Aurora" },
];

const FAQS = [
  {
    q: "¿Cuánto cuesta realmente ir a un concierto fuera de tu ciudad?",
    a: "Hay que sumar cuatro partidas: la entrada, el transporte de ida y vuelta, el alojamiento y los extras (comida, merchandising y transporte local).",
  },
  {
    q: "¿Con cuánta antelación debo empezar a ahorrar?",
    a: "Cuanto antes mejor: repartir el total en más meses baja la cuota mensual y te da margen si los precios suben.",
  },
  {
    q: "¿Cómo se reparte el ahorro mensual sin errores de redondeo?",
    a: "La herramienta calcula todo en céntimos y reparte la diferencia entre los primeros meses.",
  },
  {
    q: "¿Los precios que muestra la herramienta son reales?",
    a: "No. Son estimaciones iniciales orientativas para empezar.",
  },
];

const MAX_MONTHS_SCHEDULE = 60;
const SLIDES = 5;

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const toCents = (v) => Math.round((Number(v) || 0) * 100);
const fromCents = (c) => c / 100;
const readNum = (v, fallback, min, max) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? clamp(n, min, max) : fallback;
};
const cityOf = (id) => CITIES.find((c) => c.id === id) || CITIES[0];
const ticketOf = (id) => TICKETS.find((t) => t.id === id) || TICKETS[0];
const plural = (n, one, many) => (n === 1 ? one : many);

const fmtBig = (c) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(fromCents(c));

const alpha = (color, a) =>
  typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color)
    ? color + Math.round(clamp(a, 0, 1) * 255).toString(16).padStart(2, "0")
    : color;

const bigSize = (s) => (s.length > 11 ? "2.6rem" : s.length > 9 ? "3.1rem" : s.length > 7 ? "3.7rem" : "4.5rem");

function themeOf(id) {
  const map = {
    lima: { a1: T.lime, a2: T.lavender, a3: T.coral, aurora: false },
    lavanda: { a1: T.lavender, a2: T.coral, a3: T.lime, aurora: false },
    coral: { a1: T.coral, a2: T.lime, a3: T.lavender, aurora: false },
    aurora: { a1: T.lime, a2: T.coral, a3: T.lavender, aurora: true },
  };
  return map[id] || map.lima;
}

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function monthsUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const days = (target.getTime() - Date.now()) / 86400000;
  if (days <= 0) return 0;
  return Math.max(1, Math.ceil(days / 30.4375));
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

async function buildShareImage({ artist, city, ticketLabel, totalText, monthlyText, monthsText, th }) {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  try {
    await document.fonts.ready;
  } catch {}

  const root = getComputedStyle(document.documentElement);
  const famD = root.getPropertyValue("--font-fraunces").trim();
  const famB = root.getPropertyValue("--font-inter").trim();
  const display = famD ? `${famD}, Georgia, serif` : "Georgia, serif";
  const body = famB ? `${famB}, system-ui, sans-serif` : "system-ui, sans-serif";

  ctx.fillStyle = "#0a1214";
  ctx.fillRect(0, 0, W, H);

  const g1 = ctx.createRadialGradient(80, 60, 0, 80, 60, 1200);
  g1.addColorStop(0, alpha(th.a1, 0.6));
  g1.addColorStop(1, alpha(th.a1, 0));
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  const g2 = ctx.createRadialGradient(W, H, 0, W, H, 1300);
  g2.addColorStop(0, alpha(th.a2, 0.55));
  g2.addColorStop(1, alpha(th.a2, 0));
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);

  const wrap = (text, x, y, maxW, lineH, maxLines) => {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach((w) => {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    lines.slice(0, maxLines).forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
    return y + Math.min(lines.length, maxLines) * lineH;
  };

  const X = 96;
  const maxW = W - X * 2;
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = th.a1;
  ctx.font = `700 40px ${body}`;
  ctx.fillText("PLAN DE CONCIERTO", X, 200);

  ctx.fillStyle = "#f5f2ea";
  ctx.font = `700 150px ${display}`;
  let y = wrap(artist || "Tu concierto", X, 400, maxW, 156, 3);

  ctx.fillStyle = th.a1;
  ctx.font = `600 56px ${body}`;
  ctx.fillText(city, X, y + 60);
  ctx.fillStyle = "#9fb3b1";
  ctx.font = `500 42px ${body}`;
  ctx.fillText(ticketLabel, X, y + 130);

  ctx.fillStyle = "#9fb3b1";
  ctx.font = `600 40px ${body}`;
  ctx.fillText("COSTE TOTAL", X, 1090);
  ctx.fillStyle = "#f5f2ea";
  ctx.font = `700 170px ${display}`;
  ctx.fillText(totalText, X, 1260);

  ctx.fillStyle = "#9fb3b1";
  ctx.font = `600 40px ${body}`;
  ctx.fillText("AHORRO MENSUAL", X, 1420);
  ctx.fillStyle = th.a1;
  ctx.font = `700 170px ${display}`;
  ctx.fillText(monthlyText, X, 1590);
  ctx.fillStyle = "#9fb3b1";
  ctx.font = `500 44px ${body}`;
  ctx.fillText(monthsText, X, 1660);

  ctx.fillStyle = "#f5f2ea";
  ctx.font = `700 46px ${display}`;
  ctx.fillText("MetaBox", X, 1820);
  ctx.fillStyle = "#9fb3b1";
  ctx.font = `500 36px ${body}`;
  ctx.textAlign = "right";
  ctx.fillText("metabox-web.vercel.app", W - X, 1820);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

function StoryDeck({ d, th, fx, onShare, onImage, onCopy, status }) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [canMotion, setCanMotion] = useState(false);
  const [motionOn, setMotionOn] = useState(false);

  const cardRefs = useRef([]);
  const startRef = useRef(null);
  const stepRef = useRef(220);
  const indexRef = useRef(0);

  const fxEff = fx && !reduce;

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const handler = (e) => setReduce(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    setCanMotion(typeof window.DeviceOrientationEvent !== "undefined" && window.matchMedia("(pointer: coarse)").matches);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
    };
  }, []);

  const resetTilt = (el) => {
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--glare", "0");
  };

  useEffect(() => {
    indexRef.current = index;
    cardRefs.current.forEach(resetTilt);
  }, [index]);

  useEffect(() => {
    if (!motionOn || !fxEff) return undefined;
    const onOrient = (e) => {
      if (e.gamma == null || e.beta == null) return;
      const el = cardRefs.current[indexRef.current];
      if (!el) return;
      const ry = clamp(e.gamma, -30, 30) * 0.55;
      const rx = clamp(e.beta - 50, -30, 30) * -0.45;
      el.style.setProperty("--ry", `${ry}deg`);
      el.style.setProperty("--rx", `${rx}deg`);
      el.style.setProperty("--gx", `${50 + ry * 2.5}%`);
      el.style.setProperty("--gy", `${40 - rx * 2.5}%`);
      el.style.setProperty("--glare", "1");
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, [motionOn, fxEff]);

  const enableMotion = async () => {
    try {
      const DOE = window.DeviceOrientationEvent;
      if (DOE && typeof DOE.requestPermission === "function") {
        const res = await DOE.requestPermission();
        if (res !== "granted") return;
      }
      setMotionOn(true);
    } catch {}
  };

  const go = (i) => setIndex(clamp(i, 0, SLIDES - 1));

  const applyTilt = (clientX, clientY) => {
    const el = cardRefs.current[index];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = clamp((clientX - r.left) / r.width, 0, 1);
    const py = clamp((clientY - r.top) / r.height, 0, 1);
    el.style.setProperty("--rx", `${(0.5 - py) * 14}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 18}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
    el.style.setProperty("--glare", "1");
  };

  const onPointerDown = (e) => {
    if (e.target.closest && e.target.closest("button, a, input, select, textarea")) return;
    const w = (cardRefs.current[index] && cardRefs.current[index].offsetWidth) || 300;
    stepRef.current = w * 0.62;
    startRef.current = { x: e.clientX, t: Date.now(), moved: false, id: e.pointerId };
  };

  const onPointerMove = (e) => {
    const s = startRef.current;
    if (!s) {
      if (fxEff && e.pointerType !== "touch") applyTilt(e.clientX, e.clientY);
      return;
    }
    const dx = e.clientX - s.x;
    if (!s.moved && Math.abs(dx) > 8) {
      s.moved = true;
      resetTilt(cardRefs.current[index]);
      setDragging(true);
      try {
        e.currentTarget.setPointerCapture(s.id);
      } catch {}
    }
    if (s.moved) setDragX(dx);
    else if (fxEff) applyTilt(e.clientX, e.clientY);
  };

  const finishPointer = (e, cancelled) => {
    const s = startRef.current;
    startRef.current = null;
    if (!s) return;
    if (s.moved && !cancelled) {
      const dx = e.clientX - s.x;
      const v = dx / Math.max(1, Date.now() - s.t);
      if (dx < -50 || v < -0.5) go(index + 1);
      else if (dx > 50 || v > 0.5) go(index - 1);
    }
    setDragX(0);
    setDragging(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  };

  const eyebrow = (txt) => (
    <div style={{ ...fontBody, color: th.a1, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>{txt}</div>
  );

  const footer = (k) => (
    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", ...fontBody, color: T.textMuted, fontSize: "0.8rem" }}>
      <span style={{ ...fontDisplay, color: T.text, fontWeight: 700, fontSize: "1rem" }}>MetaBox</span>
      <span>{k}/{SLIDES}</span>
    </div>
  );

  const depth = (z) => (fxEff ? { transform: `translateZ(${z}px)` } : null);

  const pill = (txt) => (
    <span
      key={txt}
      style={{ ...fontBody, fontSize: "0.8rem", fontWeight: 600, color: T.text, padding: "0.35rem 0.8rem", borderRadius: "999px", border: `1px solid ${alpha(th.a1, 0.45)}`, background: alpha(th.a1, 0.14) }}
    >
      {txt}
    </span>
  );

  const nameSize = d.artist.length > 22 ? "2rem" : d.artist.length > 12 ? "2.6rem" : "3.4rem";
  const totalText = fmtBig(d.totalC);
  const monthlyText = d.covered ? "¡Cubierto!" : fmtEUR(fromCents(d.monthlyC));

  const slideBtn = (primary) => ({
    ...fontBody,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    width: "100%",
    minHeight: "2.75rem",
    padding: "0.65rem 1rem",
    borderRadius: "0.9rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 700,
    background: primary ? th.a1 : "transparent",
    color: primary ? "#0b1214" : T.text,
    border: primary ? "none" : `1px solid ${alpha(th.a1, 0.5)}`,
  });

  const slides = [
    <>
      {eyebrow("Plan de concierto")}
      <div style={{ margin: "auto 0", ...depth(34) }}>
        <div style={{ ...fontDisplay, color: T.text, fontSize: nameSize, lineHeight: 1.02, fontWeight: 700, letterSpacing: "-0.02em", overflowWrap: "anywhere" }}>
          {d.artist || "Tu concierto"}
        </div>
        <div style={{ ...fontBody, color: th.a1, fontSize: "1.15rem", fontWeight: 600, marginTop: "0.9rem" }}>{d.city}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.9rem" }}>
          {[d.ticketLabel, `${d.people} ${plural(d.people, "persona", "personas")}`, `${d.nights} ${plural(d.nights, "noche", "noches")}`].map(pill)}
        </div>
      </div>
      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginBottom: "0.9rem" }}>Desliza para ver tu plan →</div>
      {footer(1)}
    </>,
    <>
      {eyebrow("Coste total")}
      <div style={{ margin: "auto 0", ...depth(34) }}>
        <div style={{ ...fontDisplay, color: T.text, fontSize: bigSize(totalText), lineHeight: 1, fontWeight: 700, letterSpacing: "-0.02em" }}>{totalText}</div>
        <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.9rem", marginTop: "0.6rem" }}>Entrada, viaje, alojamiento y extras</div>
        {d.totalC > 0 && (
          <div style={{ display: "flex", height: "0.7rem", borderRadius: "999px", overflow: "hidden", background: "rgba(255,255,255,0.08)", marginTop: "1.1rem" }}>
            {d.breakdown.map((b) => (b.c > 0 ? <div key={b.key} style={{ width: `${(b.c / d.totalC) * 100}%`, background: b.color }} /> : null))}
          </div>
        )}
      </div>
      {footer(2)}
    </>,
    <>
      {eyebrow(d.covered ? "Presupuesto" : "Cada mes")}
      <div style={{ margin: "auto 0", ...depth(34) }}>
        <div style={{ ...fontDisplay, color: th.a1, fontSize: bigSize(monthlyText), lineHeight: 1, fontWeight: 700, letterSpacing: "-0.02em" }}>{monthlyText}</div>
        <div style={{ ...fontBody, color: T.text, fontSize: "1rem", marginTop: "0.6rem" }}>
          {d.covered ? "Ya tienes todo ahorrado" : `durante ${d.m} ${plural(d.m, "mes", "meses")}${d.usingDate ? " hasta el concierto" : ""}`}
        </div>
      </div>
      {footer(3)}
    </>,
    <>
      {eyebrow("Hitos del plan")}
      <div style={{ margin: "auto 0", display: "flex", flexDirection: "column", gap: "1rem", ...depth(30) }}>
        {d.totalC > 0 ? (
          d.milestones.map((ms) => (
            <div key={ms.percent}>
              <span style={{ ...fontDisplay, color: T.text, fontSize: "1.7rem", fontWeight: 700 }}>{ms.percent}%</span>
            </div>
          ))
        ) : (
          <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.9rem" }}>Añade importes para ver tus hitos.</div>
        )}
      </div>
      {footer(4)}
    </>,
    <>
      {eyebrow("Comparte")}
      <div style={{ margin: "auto 0", ...depth(30) }}>
        <div style={{ ...fontDisplay, color: T.text, fontSize: "1.9rem", lineHeight: 1.1, fontWeight: 700 }}>Tu plan, en una historia</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "1rem" }}>
          <button type="button" tabIndex={index === 4 ? 0 : -1} onClick={onShare} style={slideBtn(true)}>
            <Share2 size={16} aria-hidden="true" /> Compartir plan
          </button>
          <button type="button" tabIndex={index === 4 ? 0 : -1} onClick={onImage} style={slideBtn(false)}>
            <Download size={16} aria-hidden="true" /> Guardar imagen
          </button>
        </div>
        <div role="status" aria-live="polite" style={{ ...fontBody, color: th.a1, fontSize: "0.85rem", fontWeight: 600, minHeight: "1.3rem", marginTop: "0.7rem", textAlign: "center" }}>
          {status}
        </div>
      </div>
      {footer(5)}
    </>,
  ];

  const faceBg = `radial-gradient(120% 75% at 0% 0%, ${alpha(th.a1, 0.55)}, transparent 58%), radial-gradient(100% 70% at 100% 100%, ${alpha(th.a2, 0.5)}, transparent 62%), linear-gradient(165deg, #12211f 0%, #0a1214 70%)`;

  const css = `
    @keyframes cs-float-a { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(14%,10%,0) scale(1.18); } }
    @keyframes cs-float-b { 0%,100% { transform: translate3d(0,0,0) scale(1.05); } 50% { transform: translate3d(-12%,-9%,0) scale(0.92); } }
    @keyframes cs-sway { 0% { transform: rotateY(-2.5deg) rotateX(1deg); } 100% { transform: rotateY(2.5deg) rotateX(-1deg); } }
    .cs-tilt { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transition: transform 160ms ease-out; }
    .cs-sway { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; animation: cs-sway 7s ease-in-out infinite alternate; }
    .cs-blob-a { animation: cs-float-a 9s ease-in-out infinite; }
    .cs-blob-b { animation: cs-float-b 11s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .cs-sway, .cs-blob-a, .cs-blob-b { animation: none !important; }
      .cs-tilt { transition: none; }
    }
  `;

  return (
    <div>
      <style>{css}</style>
      <div
        role="region"
        aria-label="Resumen de tu plan en tarjetas"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => finishPointer(e, false)}
        onPointerCancel={(e) => finishPointer(e, true)}
        style={{ position: "relative", height: "clamp(27rem, 66vh, 35rem)", perspective: "1100px", overflow: "hidden", touchAction: "pan-y", userSelect: "none", borderRadius: "1.5rem" }}
      >
        {slides.map((content, i) => {
          const rel = i - (index - dragX / stepRef.current);
          const abs = Math.abs(rel);
          const active = i === index;
          const transform = fxEff
            ? `translateX(${rel * 62}%) translateZ(${-Math.min(abs, 3) * 150}px) rotateY(${-clamp(rel, -1.6, 1.6) * 38}deg) scale(${1 - Math.min(abs, 2) * 0.05})`
            : `translateX(${rel * 108}%
          /* 🧩 Parte 2: Lógica, cálculos y manejadores de ConcertSavingsTool */

function ConcertSavingsTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const p = initialParams || {};

  const [artist, setArtist] = useState(() => (typeof p.artist === "string" ? p.artist.slice(0, 40) : ""));
  const [city, setCity] = useState(() => (CITIES.some((c) => c.id === p.city) ? p.city : "madrid"));
  const [ticket, setTicket] = useState(() => (TICKETS.some((t) => t.id === p.ticket) ? p.ticket : "general"));
  const [ticketPrice, setTicketPrice] = useState(() => readNum(p.ticketPrice, ticketOf(p.ticket).price, 0, 1500));
  const [people, setPeople] = useState(() => readNum(p.people, 1, 1, 8));
  const [transport, setTransport] = useState(() => readNum(p.transport, cityOf(p.city).transport, 0, 600));
  const [hotel, setHotel] = useState(() => readNum(p.hotel, cityOf(p.city).hotel, 0, 500));
  const [nights, setNights] = useState(() => readNum(p.nights, 2, 0, 10));
  const [extras, setExtras] = useState(() => readNum(p.extras, 120, 0, 1500));
  const [months, setMonths] = useState(() => readNum(p.months, 8, 1, 36));
  const [saved, setSaved] = useState(() => readNum(p.saved, 0, 0, 100000));
  const [eventDate, setEventDate] = useState(() => (typeof p.date === "string" ? p.date : ""));
  const [styleId, setStyleId] = useState(() => (THEMES.some((t) => t.id === p.estilo) ? p.estilo : "lima"));
  const [fx, setFx] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        artist: artist || null,
        city,
        ticket,
        ticketPrice,
        people,
        transport,
        hotel,
        nights,
        extras,
        months,
        saved,
        date: eventDate || null,
        estilo: styleId,
      });
    }
  }, [artist, city, ticket, ticketPrice, people, transport, hotel, nights, extras, months, saved, eventDate, styleId, onStateChange]);

  useEffect(() => {
    if (!status) return undefined;
    const id = setTimeout(() => setStatus(""), 2600);
    return () => clearTimeout(id);
  }, [status]);

  const handleCity = (id) => {
    setCity(id);
    const c = cityOf(id);
    setTransport(c.transport);
    setHotel(c.hotel);
  };

  const handleTicket = (id) => {
    setTicket(id);
    setTicketPrice(ticketOf(id).price);
  };

  const cityObj = cityOf(city);
  const ticketObj = ticketOf(ticket);
  const rooms = Math.max(1, Math.ceil(people / 2));

  const ticketsC = toCents(ticketPrice) * people;
  const transportC = toCents(transport) * people;
  const hotelC = toCents(hotel) * nights * rooms;
  const extrasC = toCents(extras);
  const totalC = ticketsC + transportC + hotelC + extrasC;

  const maxSaved = Math.max(Math.ceil(fromCents(totalC)), 100);
  const savedC = Math.min(toCents(saved), totalC);
  const remainingC = Math.max(totalC - savedC, 0);

  const dateMonths = monthsUntil(eventDate);
  const usingDate = dateMonths !== null && dateMonths > 0;
  const dateInPast = Boolean(eventDate) && dateMonths === 0;
  const m = clamp(usingDate ? dateMonths : months, 1, MAX_MONTHS_SCHEDULE);

  const covered = totalC > 0 && remainingC === 0;
  const monthlyC = remainingC === 0 ? 0 : Math.ceil(remainingC / m);
  const pct = totalC > 0 ? (savedC / totalC) * 100 : 0;

  const { schedule, accC, milestones } = useMemo(() => {
    const base = Math.floor(remainingC / m);
    const leftover = remainingC % m;
    const sched = Array.from({ length: m }, (_, i) => base + (i < leftover ? 1 : 0));
    const acc = [savedC];
    sched.forEach((c) => acc.push(acc[acc.length - 1] + c));
    const marks = [25, 50, 75, 100].map((percent) => {
      const target = Math.ceil((totalC * percent) / 100);
      const idx = acc.findIndex((v) => v >= target);
      return { percent, month: idx };
    });
    return { schedule: sched, accC: acc, milestones: marks };
  }, [remainingC, m, savedC, totalC]);

  const chartData = useMemo(() => accC.map((c, i) => ({ mes: i, ahorro: fromCents(c) })), [accC]);

  const th = themeOf(styleId);

  const breakdown = [
    { key: "tickets", label: "Entradas", c: ticketsC, color: T.lime },
    { key: "transport", label: "Viaje", c: transportC, color: T.lavender },
    { key: "hotel", label: "Alojamiento", c: hotelC, color: T.coral },
    { key: "extras", label: "Extras", c: extrasC, color: T.textMuted },
  ];
  const biggest = breakdown.reduce((a, b) => (b.c > a.c ? b : a), breakdown[0]);
  const biggestPct = totalC > 0 ? Math.round((biggest.c / totalC) * 100) : 0;

  let advice;
  if (totalC === 0) {
    advice = "Añade el precio de la entrada y del viaje para ver cuánto tienes que ahorrar cada mes.";
  } else if (covered) {
    advice = "Ya tienes el presupuesto completo. Guarda un pequeño colchón para imprevistos del viaje y reserva cuanto antes.";
  } else if (m <= 2) {
    advice = "Con tan poco margen la cuota mensual se dispara. Si puedes, compara otra zona de entrada o ajusta los gastos del viaje para bajar el total.";
  } else if (biggest.key === "tickets") {
    advice = `La entrada es tu mayor gasto (${biggestPct}% del total). Revisa si otro tipo de entrada encaja con tu presupuesto.`;
  } else if (biggest.key === "transport") {
    advice = `El viaje es tu mayor gasto (${biggestPct}% del total). Comparar fechas y reservar con antelación suele ayudar a bajarlo.`;
  } else if (biggest.key === "hotel") {
    advice = `El alojamiento es tu mayor gasto (${biggestPct}% del total). Compartir habitación o alojarte algo más lejos del recinto suele reducirlo.`;
  } else {
    advice = `Los extras son tu mayor gasto (${biggestPct}% del total). Fija un tope para merchandising y comida antes del evento.`;
  }

  const artistName = artist.trim();

  const summaryText = () =>
    `${artistName ? `Concierto de ${artistName}` : "Mi concierto"} en ${cityObj.label}: coste total ${fmtEUR(fromCents(totalC))} ` +
    `(entradas ${fmtEUR(fromCents(ticketsC))}, viaje ${fmtEUR(fromCents(transportC))}, alojamiento ${fmtEUR(fromCents(hotelC))}, extras ${fmtEUR(fromCents(extrasC))}). ` +
    (covered
      ? "Ya tengo todo el presupuesto ahorrado."
      : `Llevo ${fmtEUR(fromCents(savedC))} y ahorrando ${fmtEUR(fromCents(monthlyC))} al mes durante ${m} ${plural(m, "mes", "meses")} lo consigo.`);

  const csvRows = () => [
    ...breakdown.map((b) => ({ seccion: "Coste", concepto: b.label, importe: fromCents(b.c).toFixed(2) })),
    { seccion: "Resumen", concepto: "Total", importe: fromCents(totalC).toFixed(2) },
    { seccion: "Resumen", concepto: "Ya ahorrado", importe: fromCents(savedC).toFixed(2) },
    { seccion: "Resumen", concepto: "Falta por ahorrar", importe: fromCents(remainingC).toFixed(2) },
    ...schedule.map((c, i) => ({ seccion: "Plan", concepto: `Mes ${i + 1}`, importe: fromCents(c).toFixed(2) })),
  ];

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = summaryText();
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Mi plan de ahorro para concierto", text, url });
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
    const ok = await copyText(`${text} ${url}`);
    setStatus(ok ? "Resumen y enlace copiados" : "No se pudo copiar");
  };

  const handleCopy = async () => {
    const ok = await copyText(summaryText());
    setStatus(ok ? "Resumen copiado" : "No se pudo copiar");
  };

  const handleImage = async () => {
    setStatus("Generando imagen…");
    const blob = await buildShareImage({
      artist: artistName,
      city: cityObj.label,
      ticketLabel: ticketObj.label,
      totalText: fmtBig(totalC),
      monthlyText: covered ? "¡Cubierto!" : fmtEUR(fromCents(monthlyC)),
      monthsText: covered ? "Presupuesto cubierto" : `durante ${m} ${plural(m, "mes", "meses")}`,
      th,
    });
    if (!blob) {
      setStatus("No se pudo crear la imagen");
      return;
    }
    const file = new File([blob], "mi-plan-concierto.png", { type: "image/png" });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Mi plan de ahorro para concierto", text: summaryText() });
        setStatus("¡Listo!");
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") {
        setStatus("");
        return;
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mi-plan-concierto.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setStatus("Imagen guardada");
  };

  const deckData = {
    artist: artistName,
    city: cityObj.label,
    ticketLabel: ticketObj.label,
    people,
    nights,
    totalC,
    monthlyC,
    m,
    usingDate,
    pct,
    covered,
    remainingC,
    breakdown,
    milestones,
  };
            
/* 🧩 Parte 3: Renderizado visual, interfaz y exportación */

  const cardPad = { paddingTop: "1.2rem", paddingBottom: "1.2rem" };
  const labelStyle = { ...fontBody, color: T.text, fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", display: "block" };
  const hintStyle = { ...fontBody, color: T.textMuted, fontSize: "0.8rem", lineHeight: 1.5, marginTop: "0.6rem" };
  const chipRow = { display: "flex", flexWrap: "wrap", gap: "0.5rem" };
  const iconInline = { display: "inline", marginRight: "0.35rem", verticalAlign: "-2px", color: T.lime };
  const sliderGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))", gap: "1.5rem" };
  const cardTitle = { ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" };

  return (
    <div className="view-enter" style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "1rem", paddingBottom: "6rem" }}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="MetaBox" />
        <meta property="og:locale" content="es_ES" />
      </Helmet>

      <ToolHeader
        title="Ahorro para concierto y viaje"
        subtitle="Entrada, viaje, alojamiento y extras: cuánto ahorrar cada mes para ir a ver a tu artista."
        onBack={onBack}
      />

      <Card style={cardPad}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label htmlFor="concert-artist" style={labelStyle}>
              <Music2 size={14} aria-hidden="true" style={iconInline} /> Artista o grupo
            </label>
            <input
              id="concert-artist"
              type="text"
              value={artist}
              maxLength={40}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Nombre de tu artista o grupo"
              style={{
                ...fontBody,
                width: "100%",
                minHeight: "2.75rem",
                background: T.surfaceAlt,
                border: `1px solid ${T.border}`,
                borderRadius: "0.9rem",
                padding: "0.7rem 1rem",
                color: T.text,
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          <div>
            <div style={labelStyle}>
              <MapPin size={14} aria-hidden="true" style={iconInline} /> Ciudad del concierto
            </div>
            <div style={chipRow}>
              {CITIES.map((c) => (
                <Chip key={c.id} label={c.label} active={city === c.id} onClick={() => handleCity(c.id)} />
              ))}
            </div>
          </div>

          <div>
            <div style={labelStyle}>
              <Ticket size={14} aria-hidden="true" style={iconInline} /> Tipo de entrada
            </div>
            <div style={chipRow}>
              {TICKETS.map((t) => (
                <Chip key={t.id} label={t.label} active={ticket === t.id} onClick={() => handleTicket(t.id)} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <section aria-label="Tu plan en tarjetas">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <div style={{ ...fontBody, color: T.text, fontWeight: 600, fontSize: "0.95rem" }}>Tu plan en tarjetas</div>
          <Chip label={fx ? "Efecto 3D: sí" : "Efecto 3D: no"} active={fx} onClick={() => setFx((v) => !v)} />
        </div>
        <div style={{ ...chipRow, marginBottom: "1rem", alignItems: "center" }}>
          <span style={{ ...fontBody, color: T.textMuted, fontSize: "0.85rem", marginRight: "0.25rem" }}>Estilo</span>
          {THEMES.map((t) => (
            <Chip key={t.id} label={t.label} active={styleId === t.id} onClick={() => setStyleId(t.id)} />
          ))}
        </div>

        <StoryDeck d={deckData} th={th} fx={fx} onShare={handleShare} onImage={handleImage} onCopy={handleCopy} status={status} />
      </section>

      <AdviceBlock text={advice} />

      <Card style={cardPad}>
        <div style={cardTitle}>Entradas, viaje y alojamiento</div>
        <div style={sliderGrid}>
          <SliderControl label="Precio por entrada" value={ticketPrice} min={0} max={1500} step={5} unit="€" onChange={setTicketPrice} />
          <SliderControl label="Personas que van" value={people} min={1} max={8} step={1} unit={plural(people, "persona", "personas")} onChange={setPeople} accent="lavender" />
          <SliderControl label="Viaje por persona (ida y vuelta)" value={transport} min={0} max={600} step={10} unit="€" onChange={setTransport} />
          <SliderControl label="Hotel por noche (habitación)" value={hotel} min={0} max={500} step={5} unit="€" onChange={setHotel} />
          <SliderControl label="Noches de alojamiento" value={nights} min={0} max={10} step={1} unit={plural(nights, "noche", "noches")} onChange={setNights} accent="lavender" />
          <SliderControl label="Extras (comida, merch, transporte local)" value={extras} min={0} max={1500} step={10} unit="€" onChange={setExtras} />
        </div>
      </Card>

      <Card style={cardPad}>
        <div style={cardTitle}>Plazo y lo que ya llevas ahorrado</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label htmlFor="concert-date" style={labelStyle}>Fecha del concierto (opcional, más preciso)</label>
            <input
              id="concert-date"
              type="date"
              value={eventDate}
              min={todayISO()}
              onChange={(e) => setEventDate(e.target.value)}
              style={{ ...fontBody, width: "100%", minHeight: "2.75rem", padding: "0.6rem 1rem", fontSize: "0.9rem", color: T.text }}
            />
          </div>

          {!usingDate && (
            <SliderControl label="Meses hasta el concierto" value={months} min={1} max={36} step={1} unit={plural(months, "mes", "meses")} onChange={setMonths} accent="lavender" />
          )}

          <SliderControl label="Ya ahorrado para este plan" value={Math.min(saved, maxSaved)} min={0} max={maxSaved} step={5} unit="€" onChange={setSaved} />
        </div>
      </Card>

      <Card style={cardPad}>
        <div style={cardTitle}>Tu camino hasta el concierto</div>
        <div style={{ width: "100%", height: "190px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillConcert" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={th.a1} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={th.a1} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={16} />
              <YAxis hide domain={[0, totalC > 0 ? fromCents(totalC) : 1]} />
              <Tooltip
                contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.85rem" }}
                formatter={(v) => [fmtEUR(v), "Ahorrado"]}
                labelFormatter={(l) => (l === 0 ? "Hoy" : `Mes ${l}`)}
              />
              <Area type="monotone" dataKey="ahorro" stroke={th.a1} strokeWidth={2} fill="url(#fillConcert)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <AdSlot minHeight="0px" />

      <RelatedTools ids={["savings", "challenge", "interest"]} onNavigate={onNavigate} primaryId="savings" />

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem", paddingTop: "0.5rem" }}>
        <CopySummaryButton getText={summaryText} />
        <ExportCSVButton filename="ahorro-concierto-viaje" getRows={csvRows} />
      </div>
    </div>
  );
}

export default ConcertSavingsTool;
    
