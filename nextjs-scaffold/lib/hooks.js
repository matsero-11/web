"use client";
import { useState, useEffect, useRef } from "react";

function useAnimatedNumber(target, duration = 500) {
  const safeTarget = Number.isFinite(target) ? target : 0;
  const [value, setValue] = useState(safeTarget);
  const prevRef = useRef(safeTarget);
  useEffect(() => {
    const start = prevRef.current;
    const startTime = performance.now();
    let raf;
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (safeTarget - start) * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = safeTarget;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line
  }, [safeTarget]);
  return value;
}

const numberFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtEUR = (n) => {
  const safe = Number.isFinite(n) ? n : 0;
  return numberFormatter.format(safe) + " €";
};

// Para valores sin unidad de moneda (ej. meses, personas, %) con el mismo
// formato numérico es-ES y protección anti-NaN.
const fmtNumber = (n, options = {}) => {
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("es-ES", options).format(safe);
};

export { useAnimatedNumber, fmtEUR, fmtNumber };
