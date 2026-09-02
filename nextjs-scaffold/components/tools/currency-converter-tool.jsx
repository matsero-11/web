"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_BASE = "https://api.frankfurter.dev/v2";
const STORAGE_KEY = "currency-converter-state-v5";
const CACHE_TTL = 15 * 60 * 1000;

const DEFAULT_STATE = {
  amount: "100",
  from: "EUR",
  to: "USD",
};

const FALLBACK_CURRENCIES = [
  ["AED", "Dirham de los Emiratos Árabes Unidos"],
  ["AUD", "Dólar australiano"],
  ["BGN", "Lev búlgaro"],
  ["BRL", "Real brasileño"],
  ["CAD", "Dólar canadiense"],
  ["CHF", "Franco suizo"],
  ["CNY", "Yuan chino"],
  ["CZK", "Corona checa"],
  ["DKK", "Corona danesa"],
  ["EUR", "Euro"],
  ["GBP", "Libra esterlina"],
  ["HKD", "Dólar de Hong Kong"],
  ["HUF", "Florín húngaro"],
  ["IDR", "Rupia indonesia"],
  ["ILS", "Nuevo séquel israelí"],
  ["INR", "Rupia india"],
  ["ISK", "Corona islandesa"],
  ["JPY", "Yen japonés"],
  ["KRW", "Won surcoreano"],
  ["MXN", "Peso mexicano"],
  ["MYR", "Ringgit malasio"],
  ["NOK", "Corona noruega"],
  ["NZD", "Dólar neozelandés"],
  ["PHP", "Peso filipino"],
  ["PLN", "Esloti polaco"],
  ["RON", "Leu rumano"],
  ["SEK", "Corona sueca"],
  ["SGD", "Dólar de Singapur"],
  ["THB", "Baht tailandés"],
  ["TRY", "Lira turca"],
  ["USD", "Dólar estadounidense"],
  ["XAF", "Franco CFA de África Central"],
  ["XOF", "Franco CFA de África Occidental"],
  ["ZAR", "Rand sudafricano"],
].map(([code, name]) => ({ code, name }));

function getSafeStoredState() {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : null;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function getInitialState() {
  const stored = getSafeStoredState();

  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  const params = new URLSearchParams(window.location.search);

  const amount =
    params.get("amount") ||
    stored?.amount ||
    DEFAULT_STATE.amount;

  const from =
    params.get("from") ||
    stored?.from ||
    DEFAULT_STATE.from;

  const to =
    params.get("to") ||
    stored?.to ||
    DEFAULT_STATE.to;

  return {
    amount: String(amount),
    from: String(from).toUpperCase(),
    to: String(to).toUpperCase(),
  };
}

function parseAmount(input) {
  const value = String(input).trim().replace(",", ".");

  if (!value) {
    return {
      value: null,
      error: "Introduce un importe.",
    };
  }

  if (!/^d+(.d+)?$/.test(value)) {
    return {
      value: null,
      error: "Escribe un número válido, por ejemplo 125,50.",
    };
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return {
      value: null,
      error: "El importe no es válido.",
    };
  }

  if (number > 999999999999) {
    return {
      value: null,
      error: "El importe supera el límite permitido.",
    };
  }

  return {
    value: number,
    error: "",
  };
}

function normalizeCurrencies(data) {
  if (Array.isArray(data)) {
    return data
      .map((item) => {
        const code = String(
          item?.iso_code ||
            item?.code ||
            item?.currency ||
            "",
        ).toUpperCase();

        const name = String(
          item?.name ||
            item?.currency_name ||
            code ||
            "",
        ).trim();

        return { code, name };
      })
      .filter((currency) => currency.code && currency.name);
  }

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([code, name]) => ({
        code: String(code).toUpperCase(),
        name: String(name).trim(),
      }))
      .filter((currency) => currency.code && currency.name);
  }

  return [];
}

function mergeCurrencies(...groups) {
  return Array.from(
    new Map(
      groups
        .flat()
        .filter(
          (currency) =>
            currency?.code && currency?.name,
        )
        .map((currency) => [currency.code, currency]),
    ).values(),
  ).sort((a, b) => a.code.localeCompare(b.code));
}

function formatNumber(value) {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 6,
  }).format(value);
}

function formatCurrency(value, currency) {
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${formatNumber(value)} ${currency}`;
  }
}

function CopyButton({ text, children }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text || typeof navigator === "undefined") {
      return;
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }

      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!text}
      className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {copied ? "Copiado" : children}
    </button>
  );
}

export default function CurrencyConverterTool() {
  const initialState = useMemo(getInitialState, []);

  const [amount, setAmount] = useState(initialState.amount);
  const [fromCurrency, setFromCurrency] = useState(initialState.from);
  const [toCurrency, setToCurrency] = useState(initialState.to);
  const [search, setSearch] = useState("");

  const [currencies, setCurrencies] = useState([]);
  const [catalogStatus, setCatalogStatus] = useState("loading");

  const [rate, setRate] = useState(null);
  const [rateDate, setRateDate] = useState("");
  const [rateStatus, setRateStatus] = useState("idle");
  const [rateError, setRateError] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const cacheRef = useRef(new Map());
  const requestRef = useRef(null);

  const parsedAmount = useMemo(
    () => parseAmount(amount),
    [amount],
  );

  const allCurrencies = useMemo(
    () =>
      mergeCurrencies(
        currencies.length ? currencies : FALLBACK_CURRENCIES,
        FALLBACK_CURRENCIES,
      ),
    [currencies],
  );

  const selectedCurrencies = useMemo(
    () =>
      allCurrencies.filter(
        (currency) =>
          currency.code === fromCurrency ||
          currency.code === toCurrency,
      ),
    [allCurrencies, fromCurrency, toCurrency],
  );

  const filteredCurrencies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return allCurrencies;
    }

    const matches = allCurrencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(query) ||
        currency.name.toLowerCase().includes(query),
    );

    return mergeCurrencies(selectedCurrencies, matches);
  }, [allCurrencies, search, selectedCurrencies]);

  const convertedAmount = useMemo(() => {
    if (parsedAmount.value === null || rate === null) {
      return null;
    }

    return parsedAmount.value * rate;
  }, [parsedAmount.value, rate]);

  const summary = useMemo(() => {
    if (parsedAmount.value === null) {
      return parsedAmount.error;
    }

    if (convertedAmount === null) {
      return "No hay un tipo de cambio disponible.";
    }

    return `${formatNumber(parsedAmount.value)} ${fromCurrency} = ${formatCurrency(
      convertedAmount,
      toCurrency,
    )}. 1 ${fromCurrency} = ${formatNumber(rate)} ${toCurrency}.`;
  }, [
    convertedAmount,
    fromCurrency,
    parsedAmount.error,
    parsedAmount.value,
    rate,
    toCurrency,
  ]);

  const loadCurrencies = useCallback(async () => {
    setCatalogStatus("loading");

    try {
      const response = await fetch(`${API_BASE}/currencies`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Currency catalogue unavailable");
      }

      const data = await response.json();
      const normalized = normalizeCurrencies(data);

      if (!normalized.length) {
        throw new Error("Empty currency catalogue");
      }

      setCurrencies(normalized);
      setCatalogStatus("ready");
    } catch {
      setCurrencies([]);
      setCatalogStatus("fallback");
    }
  }, []);

  const loadRate = useCallback(async () => {
    if (parsedAmount.value === null) {
      requestRef.current?.abort();
      setRate(null);
      setRateDate("");
      setRateStatus("idle");
      setRateError("");
      return;
    }

    if (fromCurrency === toCurrency) {
      requestRef.current?.abort();
      setRate(1);
      setRateDate(new Date().toISOString().slice(0, 10));
      setRateStatus("success");
      setRateError("");
      return;
    }

    const cacheKey = `${fromCurrency}:${toCurrency}`;
    const cached = cacheRef.current.get(cacheKey);

    if (
      cached &&
      Date.now() - cached.timestamp < CACHE_TTL
    ) {
      setRate(cached.rate);
      setRateDate(cached.date);
      setRateStatus("success");
      setRateError("");
      return;
    }

    requestRef.current?.abort();

    const controller = new AbortController();
    requestRef.current = controller;

    setRateStatus("loading");
    setRateError("");

    try {
      const response = await fetch(
        `${API_BASE}/rate/${encodeURIComponent(
          fromCurrency,
        )}/${encodeURIComponent(toCurrency)}`,
        {
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error("Rate request failed");
      }

      const data = await response.json();
      const nextRate = Number(data?.rate);

      if (!Number.isFinite(nextRate) || nextRate <= 0) {
        throw new Error("Invalid exchange rate");
      }

      const value = {
        rate: nextRate,
        date: data?.date || "",
        timestamp: Date.now(),
      };

      cacheRef.current.set(cacheKey, value);

      setRate(value.rate);
      setRateDate(value.date);
      setRateStatus("success");
      setRateError("");
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      setRate(null);
      setRateDate("");
      setRateStatus("error");
      setRateError(
        "No se pudo obtener el tipo de cambio. Inténtalo de nuevo.",
      );
    }
  }, [fromCurrency, parsedAmount.value, toCurrency]);

  useEffect(() => {
    loadCurrencies();

    return () => {
      requestRef.current?.abort();
    };
  }, [loadCurrencies]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          amount,
          from: fromCurrency,
          to: toCurrency,
        }),
      );
    } catch {
      // El componente continúa funcionando sin localStorage.
    }
  }, [amount, fromCurrency, toCurrency]);

  useEffect(() => {
    const timeout = window.setTimeout(loadRate, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [loadRate]);

  function swapCurrencies() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  async function handleCopyLink() {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);

    url.searchParams.set("amount", amount);
    url.searchParams.set("from", fromCurrency);
    url.searchParams.set("to", toCurrency);

    window.history.replaceState({}, "", url.toString());

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }

      await navigator.clipboard.writeText(url.toString());
      setLinkCopied(true);

      window.setTimeout(() => {
        setLinkCopied(false);
      }, 1800);
    } catch {
      setLinkCopied(false);
    }
  }

  return (
    <section
      aria-labelledby="currency-converter-title"
      className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <header className="mb-6">
        <p className="mb-2 text-sm font-semibold text-blue-600">
          Herramienta financiera
        </p>

        <h1
          id="currency-converter-title"
          className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
        >
          Conversor de divisas
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Convierte importes entre monedas con tipos de cambio diarios.
        </p>
      </header>

      <div className="mb-5">
        <label
          htmlFor="currency-search"
          className="mb-2 block text-sm font-medium text-slate-800"
        >
          Buscar moneda
        </label>

        <input
          id="currency-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Busca por código o nombre"
          className="h-11 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Importe
          </span>

          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={Boolean(parsedAmount.error)}
            aria-describedby="amount-message"
            className={`h-12 w-full rounded-xl border px-4 text-lg outline-none transition focus:ring-4 ${
              parsedAmount.error
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
            }`}
          />

          <span
            id="amount-message"
            className={`mt-2 block text-xs ${
              parsedAmount.error
                ? "text-red-600"
                : "text-slate-500"
            }`}
          >
            {parsedAmount.error ||
              "Admite coma o punto decimal."}
          </span>
        </label>

        <button
          type="button"
          onClick={swapCurrencies}
          aria-label="Intercambiar monedas"
          title="Intercambiar monedas"
          className="h-12 w-12 rounded-xl border border-slate-300 text-xl text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          ⇄
        </button>

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Desde
            </span>

            <select
              value={fromCurrency}
              onChange={(event) => setFromCurrency(event.target.value)}
              aria-label="Moneda de origen"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {filteredCurrencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} — {currency.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-800">
              A
            </span>

            <select
              value={toCurrency}
              onChange={(event) => setToCurrency(event.target.value)}
              aria-label="Moneda de destino"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {filteredCurrencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} — {currency.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div
        aria-live="polite"
        className="mt-6 rounded-2xl bg-slate-950 p-5 text-white sm:p-6"
      >
        <p className="text-sm text-slate-300">Resultado</p>

        {rateStatus === "loading" ? (
          <p className="mt-3 text-lg">
            Consultando el tipo de cambio…
          </p>
        ) : rateStatus === "error" ? (
          <div className="mt-3">
            <p className="text-lg text-red-300">{rateError}</p>

            <button
              type="button"
              onClick={loadRate}
              className="mt-3 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-100 transition hover:bg-red-950 focus:outline-none focus:ring-4 focus:ring-red-900"
            >
              Reintentar
            </button>
          </div>
        ) : convertedAmount === null ? (
          <p className="mt-3 text-lg text-amber-300">{summary}</p>
        ) : (
          <>
            <p className="mt-3 break-words text-3xl font-bold tracking-tight sm:text-4xl">
              {formatCurrency(convertedAmount, toCurrency)}
            </p>

            <p className="mt-3 text-sm text-slate-300">{summary}</p>

            {rateDate ? (
              <p className="mt-2 text-xs text-slate-400">
                Fecha del tipo de cambio: {rateDate}
              </p>
            ) : null}
          </>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <CopyButton text={summary}>
          Copiar resultado
        </CopyButton>

        <button
          type="button"
          onClick={handleCopyLink}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          {linkCopied ? "Enlace copiado" : "Copiar enlace"}
        </button>

        <button
          type="button"
          onClick={loadRate}
          disabled={rateStatus === "loading"}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Actualizar cambio
        </button>
      </div>

      <footer className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
        <span>
          {catalogStatus === "loading"
            ? "Cargando catálogo…"
            : catalogStatus === "fallback"
              ? "Catálogo provisional"
              : `${currencies.length} divisas disponibles`}
        </span>

        <span>
          {rateStatus === "success"
            ? "Tipo de cambio disponible"
            : "Esperando tipo de cambio"}
        </span>
      </footer>
    </section>
  );
    }
