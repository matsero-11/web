"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const METABOX_STORAGE_PREFIX = "metabox:";

const isBrowser = () => typeof window !== "undefined";

const createStorageKey = (key) => `${METABOX_STORAGE_PREFIX}${key}`;

const isPlainObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.prototype.toString.call(value) === "[object Object]";

const cloneValue = (value) => {
  if (value === undefined) return value;

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const isValidStoredValue = (value) =>
  value !== undefined &&
  typeof value !== "function" &&
  typeof value !== "symbol" &&
  typeof value !== "bigint";

const safeParse = (rawValue, fallback) => {
  if (rawValue === null || rawValue === undefined) {
    return cloneValue(fallback);
  }

  try {
    const parsed = JSON.parse(rawValue);
    return isValidStoredValue(parsed) ? parsed : cloneValue(fallback);
  } catch {
    return cloneValue(fallback);
  }
};

const safeStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
};

const getStoredValue = (key, fallback) => {
  if (!isBrowser()) return cloneValue(fallback);

  try {
    return safeParse(window.localStorage.getItem(createStorageKey(key)), fallback);
  } catch {
    return cloneValue(fallback);
  }
};

const setStoredValue = (key, value) => {
  if (!isBrowser()) return false;

  const serialized = safeStringify(value);
  if (serialized === null) return false;

  try {
    window.localStorage.setItem(createStorageKey(key), serialized);
    return true;
  } catch {
    return false;
  }
};

const removeStoredValue = (key) => {
  if (!isBrowser()) return false;

  try {
    window.localStorage.removeItem(createStorageKey(key));
    return true;
  } catch {
    return false;
  }
};

const getMetaboxStorageEntries = () => {
  if (!isBrowser()) return {};

  const entries = {};

  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const storageKey = window.localStorage.key(index);

      if (!storageKey || !storageKey.startsWith(METABOX_STORAGE_PREFIX)) {
        continue;
      }

      const key = storageKey.replace(METABOX_STORAGE_PREFIX, "");
      entries[key] = safeParse(window.localStorage.getItem(storageKey), null);
    }
  } catch {
    return {};
  }

  return entries;
};

const normalizeUpdater = (nextValue, previousValue) =>
  typeof nextValue === "function" ? nextValue(previousValue) : nextValue;

/**
 * Guarda cualquier valor JSON-compatible de MetaBox en localStorage.
 *
 * Mantiene compatibilidad con:
 * const [value, setValue] = usePersistentState("mi_clave", valorInicial);
 *
 * Opciones:
 * - validate: recibe el valor candidato y devuelve true/false.
 * - sanitize: recibe el valor candidato y devuelve el valor normalizado.
 * - syncTabs: sincroniza cambios entre pestañas abiertas.
 */
export function usePersistentState(key, defaultValue, options = {}) {
  const {
    validate,
    sanitize,
    syncTabs = true,
  } = options;

  const defaultRef = useRef(cloneValue(defaultValue));
  const validateRef = useRef(validate);
  const sanitizeRef = useRef(sanitize);

  useEffect(() => {
    defaultRef.current = cloneValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    validateRef.current = validate;
  }, [validate]);

  useEffect(() => {
    sanitizeRef.current = sanitize;
  }, [sanitize]);

  const [value, setValue] = useState(() => cloneValue(defaultValue));
  const [hydrated, setHydrated] = useState(false);

  const normalizeValue = useCallback((candidate, fallback) => {
    const sanitized =
      typeof sanitizeRef.current === "function"
        ? sanitizeRef.current(candidate)
        : candidate;

    const isValid =
      typeof validateRef.current !== "function" ||
      validateRef.current(sanitized);

    return isValid ? sanitized : cloneValue(fallback);
  }, []);

  useEffect(() => {
    const stored = getStoredValue(key, defaultRef.current);
    setValue(normalizeValue(stored, defaultRef.current));
    setHydrated(true);
  }, [key, normalizeValue]);

  useEffect(() => {
    if (!hydrated) return;
    setStoredValue(key, value);
  }, [hydrated, key, value]);

  useEffect(() => {
    if (!syncTabs || !isBrowser()) return undefined;

    const handleStorage = (event) => {
      if (event.key !== createStorageKey(key)) return;

      const nextValue = safeParse(event.newValue, defaultRef.current);
      setValue(normalizeValue(nextValue, defaultRef.current));
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [key, normalizeValue, syncTabs]);

  const updateValue = useCallback(
    (nextValue) => {
      setValue((previousValue) => {
        const candidate = normalizeUpdater(nextValue, previousValue);
        return normalizeValue(candidate, previousValue);
      });
    },
    [normalizeValue]
  );

  const resetValue = useCallback(() => {
    const fallback = cloneValue(defaultRef.current);
    removeStoredValue(key);
    setValue(fallback);
  }, [key]);

  return [value, updateValue, { hydrated, resetValue }];
}

/**
 * Estado persistente numérico pensado para sliders y cálculos.
 * No sincroniza automáticamente con la URL: protege la privacidad del usuario.
 *
 * Mantiene compatibilidad con las llamadas existentes:
 * const [value, setValue] = useSharedState("clave", 100);
 *
 * Opciones:
 * - min, max, step: normalización numérica.
 * - syncTabs: sincroniza cambios entre pestañas.
 */
export function useSharedState(key, defaultValue, options = {}) {
  const {
    min = -Infinity,
    max = Infinity,
    step,
    syncTabs = true,
  } = options;

  const normalizeNumber = useCallback(
    (candidate) => {
      const numericValue = Number(candidate);

      if (!Number.isFinite(numericValue)) {
        return Number(defaultValue);
      }

      const clampedValue = Math.min(Math.max(numericValue, min), max);

      if (!Number.isFinite(step) || step <= 0) {
        return clampedValue;
      }

      const rounded = Math.round(clampedValue / step) * step;
      const decimals = String(step).includes(".")
        ? String(step).split(".")[1].length
        : 0;

      return Number(rounded.toFixed(decimals));
    },
    [defaultValue, max, min, step]
  );

  const [value, setValue, meta] = usePersistentState(key, defaultValue, {
    syncTabs,
    sanitize: normalizeNumber,
    validate: (candidate) => Number.isFinite(Number(candidate)),
  });

  return [value, setValue, meta];
}

/**
 * Estado numérico persistente y compartible por URL bajo demanda.
 *
 * Úsalo solo para herramientas que quieras compartir explícitamente,
 * por ejemplo una calculadora puntual. No lo uses para presupuesto,
 * metas privadas, fondo de emergencia ni datos personales.
 *
 * La URL tiene prioridad sobre localStorage:
 * URL > localStorage > valor por defecto.
 */
export function useShareableNumberState(key, defaultValue, options = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    min = -Infinity,
    max = Infinity,
    step,
    syncTabs = true,
    updateUrl = true,
  } = options;

  const rawUrlValue = searchParams.get(key);

  const normalizeNumber = useCallback(
    (candidate) => {
      const numericValue = Number(candidate);

      if (!Number.isFinite(numericValue)) {
        return Number(defaultValue);
      }

      const clampedValue = Math.min(Math.max(numericValue, min), max);

      if (!Number.isFinite(step) || step <= 0) {
        return clampedValue;
      }

      const rounded = Math.round(clampedValue / step) * step;
      const decimals = String(step).includes(".")
        ? String(step).split(".")[1].length
        : 0;

      return Number(rounded.toFixed(decimals));
    },
    [defaultValue, max, min, step]
  );

  const urlValue = useMemo(() => {
    if (rawUrlValue === null) return null;

    const parsed = Number(rawUrlValue);
    return Number.isFinite(parsed) ? normalizeNumber(parsed) : null;
  }, [normalizeNumber, rawUrlValue]);

  const [value, setPersistentValue, meta] = usePersistentState(key, defaultValue, {
    syncTabs,
    sanitize: normalizeNumber,
    validate: (candidate) => Number.isFinite(Number(candidate)),
  });

  const hasAppliedUrlRef = useRef(false);

  useEffect(() => {
    if (hasAppliedUrlRef.current || urlValue === null) return;

    hasAppliedUrlRef.current = true;
    setPersistentValue(urlValue);
  }, [setPersistentValue, urlValue]);

  const updateValue = useCallback(
    (nextValue, updateOptions = {}) => {
      const { share = updateUrl } = updateOptions;

      setPersistentValue((previousValue) => {
        const candidate = normalizeUpdater(nextValue, previousValue);
        return normalizeNumber(candidate);
      });

      if (!share) return;

      const resolvedPrevious =
        typeof nextValue === "function" ? value : nextValue;

      const normalizedNext = normalizeNumber(resolvedPrevious);
      const params = new URLSearchParams(searchParams.toString());

      params.set(key, String(normalizedNext));

      router.replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    },
    [
      key,
      normalizeNumber,
      pathname,
      router,
      searchParams,
      setPersistentValue,
      updateUrl,
      value,
    ]
  );

  const createShareUrl = useCallback(
    (extraParams = {}) => {
      if (!isBrowser()) return "";

      const params = new URLSearchParams(searchParams.toString());
      params.set(key, String(value));

      Object.entries(extraParams).forEach(([paramKey, paramValue]) => {
        if (
          paramValue !== undefined &&
          paramValue !== null &&
          String(paramValue).trim() !== ""
        ) {
          params.set(paramKey, String(paramValue));
        }
      });

      return `${window.location.origin}${pathname}?${params.toString()}`;
    },
    [key, pathname, searchParams, value]
  );

  const clearUrlValue = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [key, pathname, router, searchParams]);

  return [
    value,
    updateValue,
    {
      ...meta,
      fromUrl: urlValue !== null,
      createShareUrl,
      clearUrlValue,
    },
  ];
}

/**
 * Lee todos los datos guardados por MetaBox usando el prefijo "metabox:".
 * Útil para crear "Mi plan", exportar datos o depurar almacenamiento local.
 */
export function getMetaboxLocalData() {
  return getMetaboxStorageEntries();
}

/**
 * Elimina una sola clave de MetaBox.
 */
export function removeMetaboxLocalData(key) {
  return removeStoredValue(key);
}

/**
 * Elimina todos los datos propios de MetaBox sin tocar otros datos del navegador.
 */
export function clearMetaboxLocalData() {
  if (!isBrowser()) return false;

  try {
    const keysToDelete = [];

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const storageKey = window.localStorage.key(index);

      if (storageKey?.startsWith(METABOX_STORAGE_PREFIX)) {
        keysToDelete.push(storageKey);
      }
    }

    keysToDelete.forEach((storageKey) => {
      window.localStorage.removeItem(storageKey);
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Exporta todos los datos de MetaBox en un objeto JSON portable.
 * El componente que llame a esta función puede convertirlo en descarga.
 */
export function exportMetaboxLocalData() {
  return {
    app: "MetaBox",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: getMetaboxStorageEntries(),
  };
}

/**
 * Importa un respaldo de datos exportado desde MetaBox.
 * Fusiona claves válidas, ignora formatos dañados y no toca claves ajenas.
 */
export function importMetaboxLocalData(payload) {
  if (!isBrowser() || !isPlainObject(payload) || !isPlainObject(payload.data)) {
    return {
      success: false,
      importedKeys: [],
      reason: "Formato de importación no válido.",
    };
  }

  const importedKeys = [];

  try {
    Object.entries(payload.data).forEach(([key, value]) => {
      if (!key || !isValidStoredValue(value)) return;

      const saved = setStoredValue(key, value);

      if (saved) {
        importedKeys.push(key);
      }
    });

    return {
      success: true,
      importedKeys,
      reason: "",
    };
  } catch {
    return {
      success: false,
      importedKeys,
      reason: "No se pudieron importar todos los datos.",
    };
  }
                                       }
