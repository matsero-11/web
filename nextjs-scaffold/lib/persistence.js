"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * Recuerda el último valor introducido por el usuario en esta herramienta,
 * incluso tras recargar la página. Sigue funcionando igual en SSR: en el
 * primer render usa el valor por defecto (evita el desajuste de hidratación
 * servidor/cliente) y solo lee localStorage una vez montado en el cliente.
 */
export function usePersistentState(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved !== null) setValue(JSON.parse(saved));
    } catch {
      // localStorage puede fallar en modo incógnito estricto o si el JSON
      // guardado está corrupto — en ese caso, simplemente seguimos con el
      // valor por defecto en vez de romper la herramienta.
    }
    setHydrated(true);
    // eslint-disable-next-line
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // almacenamiento lleno o deshabilitado: la herramienta sigue
      // funcionando en memoria, solo deja de persistir entre sesiones.
    }
  }, [key, value, hydrated]);

  return [value, setValue];
}

/**
 * Combina persistencia en localStorage y sincronización con la URL en un
 * único hook, para que no compitan entre sí sobre qué valor "gana" al
 * cargar la página. Prioridad: parámetro de URL (para enlaces compartidos)
 * > localStorage (última sesión) > valor por defecto.
 * Solo para valores numéricos (los sliders de la app son siempre números).
 */
export function useSharedState(key, defaultValue) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromUrl = searchParams.get(key);
  const initialFromUrl = fromUrl !== null && !Number.isNaN(Number(fromUrl)) ? Number(fromUrl) : null;

  const [value, setValue] = useState(initialFromUrl !== null ? initialFromUrl : defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (initialFromUrl === null) {
      try {
        const saved = window.localStorage.getItem(key);
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (typeof parsed === "number" && !Number.isNaN(parsed)) setValue(parsed);
        }
      } catch {
        // localStorage no disponible o valor corrupto: seguimos con el valor por defecto
      }
    }
    setHydrated(true);
    // eslint-disable-next-line
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // almacenamiento lleno o deshabilitado: sigue funcionando solo en memoria
    }
  }, [key, value, hydrated]);

  const updateValue = useCallback(
    (next) => {
      setValue(next);
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, String(next));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    // eslint-disable-next-line
    [key, pathname]
  );

  return [value, updateValue];
}

