"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const API_BASE = "https://api.frankfurter.dev/v2";
const STORAGE_KEY = "currency-converter-lime-coral-v2";
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

function readStoredState() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    return parsed && typeof parsed === "object"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function getInitialState() {
  const stored = readStoredState();

  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  const params = new URLSearchParams(window.location.search);

  return {
    amount: String(
      params.get("amount") ||
        stored?.amount ||
        DEFAULT_STATE.amount,
    ),
    from: String(
      params.get("from") ||
        stored?.from ||
        DEFAULT_STATE.from,
    ).toUpperCase(),
    to: String(
      params.get("to") ||
        stored?.to ||
        DEFAULT_STATE.to,
    ).toUpperCase(),
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
      .map((item) => ({
        code: String(
          item?.iso_code ||
            item?.code ||
            item?.currency ||
            "",
        ).toUpperCase(),
        name: String(
          item?.name ||
            item?.currency_name ||
            item?.iso_code ||
            item?.code ||
            "",
        ).trim(),
      }))
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
        throw new Error("Clipboard API unavailable");
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
      className="rounded-2xl border border-[#FF806F]/35 bg-[#202A25] px-4 py-3 text-sm font-black text-[#FF806F] transition duration-300 hover:-translate-y-0.5 hover:border-[#FF806F] hover:bg-[#FF806F]/10 focus:outline-none focus:ring-4 focus:ring-[#FF806F]/15 disabled:cursor-not-allowed disabled:opacity-50"
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

  const [hasConverted, setHasConverted] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const cacheRef = useRef(new Map());
  const requestRef = useRef(null);
  const animationTimerRef = useRef(null);

  const parsedAmount = useMemo(
    () => parseAmount(amount),
    [amount],
  );

  const allCurrencies = useMemo(
    () =>
      mergeCurrencies(
        currencies.length
          ? currencies
          : FALLBACK_CURRENCIES,
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
    if (!hasConverted || parsedAmount.value === null) {
      return null;
    }

    if (rate === null) {
      return null;
    }

    return parsedAmount.value * rate;
  }, [hasConverted, parsedAmount.value, rate]);

  const summary = useMemo(() => {
    if (parsedAmount.value === null) {
      return parsedAmount.error;
    }

    if (!hasConverted) {
      return "Pulsa «Convertir ahora» para obtener el resultado.";
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
    hasConverted,
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

  const requestRate = useCallback(async () => {
    if (parsedAmount.value === null) {
      requestRef.current?.abort();
      setRate(null);
      setRateDate("");
      setRateStatus("idle");
      setRateError("");
      return false;
    }

    if (fromCurrency === toCurrency) {
      requestRef.current?.abort();
      setRate(1);
      setRateDate(new Date().toISOString().slice(0, 10));
      setRateStatus("success");
      setRateError("");
      return true;
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
      return true;
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

      const nextValue = {
        rate: nextRate,
        date: data?.date || "",
        timestamp: Date.now(),
      };

      cacheRef.current.set(cacheKey, nextValue);

      setRate(nextValue.rate);
      setRateDate(nextValue.date);
      setRateStatus("success");
      setRateError("");

      return true;
    } catch (error) {
      if (error?.name === "AbortError") {
        return false;
      }

      setRate(null);
      setRateDate("");
      setRateStatus("error");
      setRateError(
        "No se pudo obtener el tipo de cambio. Inténtalo de nuevo.",
      );

      return false;
    }
  }, [fromCurrency, parsedAmount.value, toCurrency]);

  useEffect(() => {
    loadCurrencies();

    return () => {
      requestRef.current?.abort();

      if (animationTimerRef.current) {
        window.clearTimeout(animationTimerRef.current);
      }
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
      // Continúa funcionando aunque localStorage no esté disponible.
    }
  }, [amount, fromCurrency, toCurrency]);

  useEffect(() => {
    setHasConverted(false);
    setResultVisible(false);
    setRate(null);
    setRateDate("");
    setRateStatus("idle");
    setRateError("");
  }, [amount, fromCurrency, toCurrency]);

  async function handleConvert() {
    if (parsedAmount.value === null) {
      setHasConverted(false);
      setResultVisible(false);
      return;
    }

    if (animationTimerRef.current) {
      window.clearTimeout(animationTimerRef.current);
    }

    setHasConverted(true);
    setResultVisible(false);

    const success = await requestRate();

    if (success) {
      animationTimerRef.current = window.setTimeout(() => {
        setResultVisible(true);
      }, 120);
    }
  }

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
        throw new Error("Clipboard API unavailable");
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

  const usesCfa =
    fromCurrency === "XAF" ||
    fromCurrency === "XOF" ||
    toCurrency === "XAF" ||
    toCurrency === "XOF";

  return (
    <section
      aria-labelledby="currency-converter-title"
      className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#C7F36B]/25 bg-[#101413] p-5 text-[#F5F7EF] shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#FF806F]/15 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#C7F36B]/10 blur-3xl"
      />

      <header className="relative mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C7F36B] text-xl font-black text-[#101413] shadow-[0_8px_24px_rgba(199,243,107,0.2)]">
            ⇄
          </div>

          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#C7F36B]">
              Mercado global
            </p>

            <p className="text-xs text-[#AAB5A9]">
              Conversión monetaria
            </p>
          </div>
        </div>

        <h1
          id="currency-converter-title"
          className="text-3xl font-black tracking-tight text-[#F5F7EF] sm:text-5xl"
        >
          Conversor de divisas
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#AAB5A9]">
          Convierte cualquier importe de forma rápida, clara y sin
          complicaciones.
        </p>
      </header>

      <div className="relative rounded-3xl border border-[#C7F36B]/15 bg-[#18201D] p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FF806F]">
              Paso 1
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#F5F7EF]">
              Indica el importe y las monedas
            </h2>
          </div>

          <span className="rounded-full bg-[#C7F36B] px-3 py-1 text-xs font-black text-[#101413]">
            Fácil y rápido
          </span>
        </div>

        <div className="mb-5">
          <label
            htmlFor="currency-search"
            className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#AAB5A9]"
          >
            Buscar moneda
          </label>

          <input
            id="currency-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busca por código o nombre"
            className="h-12 w-full rounded-2xl border border-[#C7F36B]/20 bg-[#101413] px-4 text-[#F5F7EF] outline-none placeholder:text-[#718077] transition focus:border-[#C7F36B] focus:ring-4 focus:ring-[#C7F36B]/10"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <label>
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#AAB5A9]">
              Importe
            </span>

            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-invalid={Boolean(parsedAmount.error)}
              aria-describedby="amount-message"
              className={`h-14 w-full rounded-2xl border bg-[#101413] px-4 text-xl font-bold text-[#F5F7EF] outline-none transition focus:ring-4 ${
                parsedAmount.error
                  ? "border-[#FF806F] focus:border-[#FF806F] focus:ring-[#FF806F]/15"
                  : "border-[#C7F36B]/25 focus:border-[#C7F36B] focus:ring-[#C7F36B]/10"
              }`}
            />

            <span
              id="amount-message"
              className={`mt-2 block text-xs ${
                parsedAmount.error
                  ? "text-[#FF806F]"
                  : "text-[#AAB5A9]"
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
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FF806F]/40 bg-[#FF806F]/10 text-2xl text-[#FF806F] transition duration-300 hover:rotate-180 hover:bg-[#FF806F]/20 focus:outline-none focus:ring-4 focus:ring-[#FF806F]/15"
          >
            ⇄
          </button>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#AAB5A9]">
                Desde
              </span>

              <select
                value={fromCurrency}
                onChange={(event) =>
                  setFromCurrency(event.target.value)
                }
                aria-label="Moneda de origen"
                className="h-14 w-full rounded-2xl border border-[#C7F36B]/25 bg-[#101413] px-3 font-bold text-[#F5F7EF] outline-none transition focus:border-[#C7F36B] focus:ring-4 focus:ring-[#C7F36B]/10"
              >
                {filteredCurrencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} — {currency.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#AAB5A9]">
                A
              </span>

              <select
                value={toCurrency}
                onChange={(event) =>
                  setToCurrency(event.target.value)
                }
                aria-label="Moneda de destino"
                className="h-14 w-full rounded-2xl border border-[#C7F36B]/25 bg-[#101413] px-3 font-bold text-[#F5F7EF] outline-none transition focus:border-[#C7F36B] focus:ring-4 focus:ring-[#C7F36B]/10"
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

        {usesCfa ? (
          <p className="
