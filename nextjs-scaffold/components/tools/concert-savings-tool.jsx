"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
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
  { id: "cyberpunk", label: "Cyberpunk" },
  { id: "gold", label: "Oro" },
  { id: "platinum", label: "Platino" },
  { id: "ocean", label: "Océano" },
  { id: "sunset", label: "Atardecer" },
  { id: "emerald", label: "Esmeralda" },
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
    lima: { a1: T.lime, a2: T.lavender, a3: T.coral },
    lavanda: { a1: T.lavender, a2: T.coral, a3: T.lime },
    coral: { a1: T.coral, a2: T.lime, a3: T.lavender },
    aurora: { a1: T.lime, a2: T.coral, a3: T.lavender },
    cyberpunk: { a1: "#00F0FF", a2: "#FF003C", a3: "#7000FF" },
    gold: { a1: "#FFD700", a2: "#FFA500", a3: "#B8860B" },
    platinum: { a1: "#E0E0E0", a2: "#9E9E9E", a3: "#FFFFFF" },
    ocean: { a1: "#00B4D8", a2: "#03045E", a3: "#90E0EF" },
    sunset: { a1: "#FF7B54", a2: "#FFD56B", a3: "#FF4C60" },
    emerald: { a1: "#00FF87", a2: "#60EFFF", a3: "#00B4D8" },
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
async function buildShareImage({ artist, city, ticketLabel, totalText, monthlyText, monthsText, th, artistImage }) {
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

  if (artistImage) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = artistImage;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, 420, 180, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, W / 2 - 180, 420 - 180, 360, 360);
      ctx.restore();
      
      ctx.beginPath();
      ctx.arc(W / 2, 420, 180, 0, Math.PI * 2, true);
      ctx.strokeStyle = th.a1;
      ctx.lineWidth = 8;
      ctx.stroke();
    } catch (e) {
      console.log("No se pudo cargar la imagen para el canvas", e);
    }
  }

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
  ctx.textAlign = "left";

  ctx.fillStyle = th.a1;
  ctx.font = `700 40px ${body}`;
  ctx.fillText("MI PLAN DE CONCIERTO", X, 200);

  ctx.fillStyle = "#f5f2ea";
  ctx.font = `700 120px ${display}`;
  
  let y = wrap(artist || "Tu concierto", X, artistImage ? 760 : 400, maxW, 126, 3);

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
function StoryDeck({ d, th, fx, onShare, onImage, status }) {
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
    <div style={{ ...fontBody, color: th.a1, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>{txt}</div>
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
      style={{ 
        ...fontBody, 
        fontSize: "0.8rem", 
        fontWeight: 700, 
        color: T.text, 
        padding: "0.4rem 0.9rem", 
        borderRadius: "999px", 
        border: `1px solid ${alpha(th.a1, 0.5)}`, 
        background: alpha(th.a1, 0.15),
        boxShadow: `0 4px 10px ${alpha(th.a1, 0.1)}`,
        backdropFilter: "blur(4px)"
      }}
    >
      {txt}
    </span>
  );

  const nameSize = d.artist.length > 22 ? "2rem" : d.artist.length > 12 ? "2.6rem" : "3.4rem";
  const totalText = fmtBig(d.totalC);
  const monthlyText = d.covered ? "¡Cubierto!" : fmtEUR(fromCents(d.monthlyC));

  const metallicStyle = {
    ...fontDisplay,
    fontSize: nameSize,
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: "-0.02em",
    overflowWrap: "anywhere",
    background: `linear-gradient(135deg, #ffffff 0%, ${th.a1} 40%, ${th.a2} 70%, #ffffff 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    filter: `drop-shadow(0px 4px 15px ${alpha(th.a1, 0.6)}) drop-shadow(0px 0px 30px ${alpha(th.a2, 0.3)})`,
    color: T.text,
    backgroundSize: "200% auto",
    animation: "metallic-shine 4s linear infinite",
  };

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

  const ArtistAvatar = () => {
    if (!d.artistImage) return null;
    return (
      <div style={{ display: "flex", justifyContent: "center", margin: "1rem 0", ...depth(50) }}>
        <div style={{ position: "relative", width: "110px", height: "110px", borderRadius: "50%", padding: "4px", background: `linear-gradient(135deg, ${th.a1}, ${th.a2})`, boxShadow: `0 10px 25px ${alpha(th.a1, 0.4)}` }}>
          <img src={d.artistImage} alt={d.artist} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "3px solid #0a1214" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(45deg, rgba(255,255,255,0.2) 0%, transparent 60%)" }} />
        </div>
      </div>
    );
  };

  const slides = [
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {eyebrow("MI PLAN DE CONCIERTO")}
        <div style={{ 
          fontSize: "0.65rem", 
          color: th.a1, 
          border: `1px solid ${alpha(th.a1, 0.6)}`, 
          padding: "3px 8px", 
          borderRadius: "8px", 
          textTransform: "uppercase", 
          fontWeight: 800, 
          letterSpacing: "0.1em", 
          background: alpha(th.a1, 0.15),
          boxShadow: `0 4px 12px ${alpha(th.a1, 0.2)}`
        }}>
          {d.ticketLabel}
        </div>
      </div>
      
      <ArtistAvatar />

      <div style={{ margin: "auto 0", textAlign: "center", ...depth(34) }}>
        <div style={metallicStyle}>
          {d.artist || "Tu concierto"}
        </div>
        
        <div style={{ 
          ...fontBody, 
          color: th.a1, 
          fontSize: "1.1rem", 
          fontWeight: 700, 
          marginTop: "0.9rem", 
          letterSpacing: "0.1em",
          textShadow: `0 2px 10px ${alpha(th.a1, 0.4)}`
        }}>
          {d.city.toUpperCase()}
        </div>
        
        <div style={{ display: "flex", justifyContent: "center", gap: "3px", marginTop: "1.5rem", opacity: 0.7 }}>
          {[...Array(20)].map((_, i) => (
            <div key={i} style={{ 
              width: Math.random() > 0.6 ? "2px" : "4px", 
              height: "20px", 
              background: th.a1,
              borderRadius: "2px",
              opacity: Math.random() * 0.5 + 0.5
            }} />
          ))}
        </div>
        
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.6rem", marginTop: "1.2rem" }}>
          {[`${d.people} ${plural(d.people, "persona", "personas")}`, `${d.nights} ${plural(d.nights, "noche", "noches")}`].map(pill)}
        </div>
      </div>
      <div style={{ ...fontBody, color: T.textMuted, fontSize: "0.8rem", marginBottom: "0.9rem", textAlign: "center", letterSpacing: "0.05em" }}>Desliza para ver tu plan →</div>
      {footer(1)}
    </>,
    <>
      {eyebrow("Coste total")}
      <div style={{ margin: "auto 0", ...depth(34) }}><div style={{ ...fontDisplay, color: T.text, fontSize: bigSize(totalText), lineHeight: 1, fontWeight: 700, letterSpacing: "-0.02em" }}>{totalText}</div></div>
      {footer(2)}
    </>,
    <>
      {eyebrow(d.covered ? "Presupuesto" : "Cada mes")}
      <div style={{ margin: "auto 0", ...depth(34) }}><div style={{ ...fontDisplay, color: th.a1, fontSize: bigSize(monthlyText), lineHeight: 1, fontWeight: 700, letterSpacing: "-0.02em" }}>{monthlyText}</div></div>
      {footer(3)}
    </>,
    <>
      {eyebrow("Hitos del plan")}
      <div style={{ margin: "auto 0", display: "flex", flexDirection: "column", gap: "1rem", ...depth(30) }}>
        {d.totalC > 0 ? (d.milestones.map((ms) => (<div key={ms.percent}><span style={{ ...fontDisplay, color: T.text, fontSize: "1.7rem", fontWeight: 700 }}>{ms.percent}%</span></div>))) : null}
      </div>
      {footer(4)}
    </>,
    <>
      {eyebrow("Comparte")}
      <div style={{ margin: "auto 0", ...depth(30) }}>
        <div style={{ ...fontDisplay, color: T.text, fontSize: "1.9rem", lineHeight: 1.1, fontWeight: 700 }}>Tu plan, en una historia</div>
        <button type="button" tabIndex={index === 4 ? 0 : -1} onClick={onShare} style={slideBtn(true)}><Share2 size={16} aria-hidden="true" /> Compartir plan</button>
      </div>
      {footer(5)}
    </>,
  ];

  const faceBg = `
    radial-gradient(80% 60% at 20% 10%, ${alpha(th.a1, 0.4)} 0%, transparent 60%),
    radial-gradient(70% 50% at 80% 90%, ${alpha(th.a2, 0.45)} 0%, transparent 60%),
    radial-gradient(100% 100% at 50% 50%, ${alpha(th.a3 || th.a1, 0.15)} 0%, transparent 100%),
    linear-gradient(165deg, #12211f 0%, #0a1214 100%)
  `;

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
    @keyframes metallic-shine {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  return (
    <div>
      <style>{css}</style>
      <div role="region" aria-label="Resumen de tu plan en tarjetas" tabIndex={0} onKeyDown={onKeyDown} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={(e) => finishPointer(e, false)} onPointerCancel={(e) => finishPointer(e, true)} style={{ position: "relative", height: "clamp(27rem, 66vh, 35rem)", perspective: "1100px", overflow: "hidden", touchAction: "pan-y", userSelect: "none", borderRadius: "1.5rem" }}>
        {slides.map((content, i) => {
          const rel = i - (index - dragX / stepRef.current);
          const abs = Math.abs(rel);
          const active = i === index;
          const transform = fxEff ? `translateX(${rel * 62}%) translateZ(${-Math.min(abs, 3) * 150}px) rotateY(${-clamp(rel, -1.6, 1.6) * 38}deg) scale(${1 - Math.min(abs, 2) * 0.05})` : `translateX(${rel * 108}%) scale(${1 - Math.min(abs, 2) * 0.04})`;
          return (
            <div key={i} ref={(el) => { cardRefs.current[i] = el; }} role="group" aria-hidden={!active} onClick={() => { if (!active) go(i); }} style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, margin: "0 auto", width: "min(86%, 21rem)", transform, opacity: Math.max(0, 1 - Math.min(abs, 2.2) * 0.38), zIndex: 100 - Math.round(abs * 10), visibility: abs > 2.3 ? "hidden" : "visible", transformStyle: "preserve-3d", transition: dragging ? "none" : "transform 460ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 320ms ease" }}>
              <div className="cs-tilt">
                <div className={fxEff ? "cs-sway" : undefined} style={fxEff ? undefined : { position: "relative", width: "100%", height: "100%" }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: "1.75rem", overflow: "hidden", background: faceBg, border: `1px solid ${alpha(th.a1, 0.35)}` }}>
                    <div className="cs-blob-a" style={{ position: "absolute", top: "-12%", right: "-18%", width: "70%", height: "52%", borderRadius: "50%", background: alpha(th.a2, 0.45), filter: "blur(38px)" }} />
                  </div>
                  <div style={{ position: "absolute", inset: 0, padding: "1.5rem", display: "flex", flexDirection: "column", transformStyle: "preserve-3d" }}>{content}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function ConcertSavingsTool({ onBack, onNavigate, initialParams = {}, onStateChange }) {
  const p = initialParams || {};

  const [artist, setArtist] = useState(() => (typeof p.artist === "string" ? p.artist.slice(0, 40) : ""));
  const [artistImage, setArtistImage] = useState(null); 
  
  const [city, setCity] = useState(() => (CITIES.some((c) => c.id === p.city) ? p.city : "madrid"));
  const [ticket, setTicket] = useState(() => (TICKETS.some((t) => t.id === p.ticket) ? p.ticket : "general"));
  const [ticketPrice, setTicketPrice] = useState(() => readNum(p.ticketPrice, ticketOf(p.ticket).price, 0, 5000));
  const [people, setPeople] = useState(() => readNum(p.people, 1, 1, 15));
  const [transport, setTransport] = useState(() => readNum(p.transport, cityOf(p.city).transport, 0, 10000));
  const [hotel, setHotel] = useState(() => readNum(p.hotel, cityOf(p.city).hotel, 0, 5000));
  const [nights, setNights] = useState(() => readNum(p.nights, 2, 0, 15));
  const [extras, setExtras] = useState(() => readNum(p.extras, 120, 0, 5000));
  const [months, setMonths] = useState(() => readNum(p.months, 8, 1, 36));
  const [saved, setSaved] = useState(() => readNum(p.saved, 0, 0, 100000));
  const [eventDate, setEventDate] = useState(() => (typeof p.date === "string" ? p.date : ""));
  const [styleId, setStyleId] = useState(() => (THEMES.some((t) => t.id === p.estilo) ? p.estilo : "lima"));
  const [fx, setFx] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!artist.trim()) {
      setArtistImage(null);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(artist)}&limit=1`);
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          setArtistImage(data.data[0].picture_xl || data.data[0].picture_big);
        } else {
          setArtistImage(null);
        }
      } catch (e) {
        console.error("Error buscando artista:", e);
        setArtistImage(null);
      }
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [artist]);

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({ artist: artist || null, city, ticket, ticketPrice, people, transport, hotel, nights, extras, months, saved, date: eventDate || null, estilo: styleId });
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
    (covered ? "Ya tengo todo el presupuesto ahorrado." : `Llevo ${fmtEUR(fromCents(savedC))} y ahorrando ${fmtEUR(fromCents(monthlyC))} al mes durante ${m} ${plural(m, "mes", "meses")} lo consigo.`);

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
      artistImage,
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

  const deckData = { artist: artistName, artistImage, city: cityObj.label, ticketLabel: ticketObj.label, people, nights, totalC, monthlyC, m, usingDate, pct, covered, remainingC, breakdown, milestones };

  const pageTitle = "Ahorro para concierto y viaje: cuánto ahorrar al mes | MetaBox";
  const pageDescription = "Calcula cuánto ahorrar cada mes para ir a un concierto: entrada, viaje, alojamiento y extras, con plan mes a mes. Gratis, sin registro y 100% privado.";
  const pageUrl = "https://metabox-web.vercel.app/herramientas/ahorro-concierto-viaje";

  const cardPad = { paddingTop: "1.2rem", paddingBottom: "1.2rem" };
  const labelStyle = { ...fontBody, color: T.text, fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", display: "block" };
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

      <ToolHeader title="Ahorro para concierto y viaje" subtitle="Entrada, viaje, alojamiento y extras: cuánto ahorrar cada mes para ir a ver a tu artista." onBack={onBack} />

      <Card style={cardPad}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label htmlFor="concert-artist" style={labelStyle}><Music2 size={14} aria-hidden="true" style={iconInline} /> Artista o grupo</label>
            <input id="concert-artist" type="text" value={artist} maxLength={40} onChange={(e) => setArtist(e.target.value)} placeholder="Nombre de tu artista o grupo" style={{ ...fontBody, width: "100%", minHeight: "2.75rem", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "0.9rem", padding: "0.7rem 1rem", color: T.text, fontSize: "0.95rem", outline: "none" }} />
          </div>
          <div>
            <div style={labelStyle}><MapPin size={14} aria-hidden="true" style={iconInline} /> Ciudad del concierto</div>
            <div style={chipRow}>{CITIES.map((c) => (<Chip key={c.id} label={c.label} active={city === c.id} onClick={() => handleCity(c.id)} />))}</div>
          </div>
          <div>
            <div style={labelStyle}><Ticket size={14} aria-hidden="true" style={iconInline} /> Tipo de entrada</div>
            <div style={chipRow}>{TICKETS.map((t) => (<Chip key={t.id} label={t.label} active={ticket === t.id} onClick={() => handleTicket(t.id)} />))}</div>
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
          {THEMES.map((t) => (<Chip key={t.id} label={t.label} active={styleId === t.id} onClick={() => setStyleId(t.id)} />))}
        </div>
        <StoryDeck d={deckData} th={th} fx={fx} onShare={handleShare} onImage={handleImage} status={status} />
      </section>

      <AdviceBlock text={advice} />

      <Card style={cardPad}>
        <div style={cardTitle}>Entradas, viaje y alojamiento</div>
        <div style={sliderGrid}>
          <SliderControl label="Precio por entrada" value={ticketPrice} min={0} max={5000} step={10} unit="€" onChange={setTicketPrice} />
          <SliderControl label="Personas que van" value={people} min={1} max={15} step={1} unit={plural(people, "persona", "personas")} onChange={setPeople} accent="lavender" />
          <SliderControl label="Viaje por persona (ida y vuelta)" value={transport} min={0} max={10000} step={50} unit="€" onChange={setTransport} />
          <SliderControl label="Hotel por noche (habitación)" value={hotel} min={0} max={5000} step={20} unit="€" onChange={setHotel} />
          <SliderControl label="Noches de alojamiento" value={nights} min={0} max={15} step={1} unit={plural(nights, "noche", "noches")} onChange={setNights} accent="lavender" />
          <SliderControl label="Extras (comida, merch, transporte local)" value={extras} min={0} max={5000} step={20} unit="€" onChange={setExtras} />
        </div>
      </Card>

      <Card style={cardPad}>
        <div style={cardTitle}>Plazo y lo que ya llevas ahorrado</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label htmlFor="concert-date" style={labelStyle}>Fecha del concierto (opcional, más preciso)</label>
            <input id="concert-date" type="date" value={eventDate} min={todayISO()} onChange={(e) => setEventDate(e.target.value)} style={{ ...fontBody, width: "100%", minHeight: "2.75rem", padding: "0.6rem 1rem", fontSize: "0.9rem", color: T.text }} />
          </div>
          {!usingDate && (<SliderControl label="Meses hasta el concierto" value={months} min={1} max={36} step={1} unit={plural(months, "mes", "meses")} onChange={setMonths} accent="lavender" />)}
          <SliderControl label="Ya ahorrado para este plan" value={Math.min(saved, maxSaved)} min={0} max={maxSaved} step={5} unit="€" onChange={setSaved} />
        </div>
      </Card>

      <Card style={cardPad}>
        <div style={cardTitle}>Tu camino hasta el concierto</div>
        <div style={{ width: "100%", height: "190px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs><linearGradient id="fillConcert" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={th.a1} stopOpacity={0.45} /><stop offset="100%" stopColor={th.a1} stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="mes" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={16} />
              <YAxis hide domain={[0, totalC > 0 ? fromCents(totalC) : 1]} />
              <Tooltip contentStyle={{ background: T.surfaceAlt, border: "none", borderRadius: "0.5rem", color: T.text, fontSize: "0.85rem" }} formatter={(v) => [fmtEUR(v), "Ahorrado"]} labelFormatter={(l) => (l === 0 ? "Hoy" : `Mes ${l}`)} />
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
