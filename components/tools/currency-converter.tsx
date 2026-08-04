"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { StatusBanner } from "@/components/tools/tool-shell";

const CURRENCIES = [
  { code: "USD", name: "Dólar estadounidense" },
  { code: "EUR", name: "Euro" },
  { code: "ARS", name: "Peso argentino" },
  { code: "MXN", name: "Peso mexicano" },
  { code: "COP", name: "Peso colombiano" },
  { code: "CLP", name: "Peso chileno" },
  { code: "PEN", name: "Sol peruano" },
  { code: "BRL", name: "Real brasileño" },
  { code: "GBP", name: "Libra esterlina" },
  { code: "JPY", name: "Yen japonés" },
  { code: "CAD", name: "Dólar canadiense" },
  { code: "CHF", name: "Franco suizo" },
  { code: "CNY", name: "Yuan chino" },
  { code: "AUD", name: "Dólar australiano" }
];

export function CurrencyConverter() {
  const [amountInput, setAmountInput] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("ARS");

  const amount = useDebouncedValue(amountInput, 250);
  const { data, loading, error, retry } = useExchangeRates(from);

  const result = useMemo(() => {
    const value = parseFloat(amount);
    if (!data || Number.isNaN(value)) return null;
    if (to === data.base) return value;
    const rate = data.rates[to];
    if (rate === undefined) return null;
    return value * rate;
  }, [data, amount, to]);

  const rateForOne = data?.rates[to];

  // Argentina-specific: the ECB-based rate above only ever reflects the
  // *official* USD/ARS rate. For Argentine users that's routinely a very
  // different number from the "blue" (informal market) rate they actually
  // use day to day — showing only the official figure without context is
  // what looks "wrong" even though the math is correct for what it is.
  const showArsContext = (from === "USD" && to === "ARS") || (from === "ARS" && to === "USD");
  const [blueDollar, setBlueDollar] = useState<{ oficial: number; blue: number } | null>(null);
  const [blueError, setBlueError] = useState(false);

  useEffect(() => {
    if (!showArsContext) return;
    let cancelled = false;
    fetch("/api/dolar-blue")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json?.oficial?.value_sell || !json?.blue?.value_sell) return;
        setBlueDollar({ oficial: json.oficial.value_sell, blue: json.blue.value_sell });
      })
      .catch(() => !cancelled && setBlueError(true));
    return () => {
      cancelled = true;
    };
  }, [showArsContext]);

  return (
    <div>
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <label className="text-sm font-medium">Cantidad</label>
          <input
            type="number"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2.5 font-mono text-sm dark:border-white/15 dark:bg-ink-950"
          />
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-2 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          aria-label="Invertir monedas"
          className="mb-2 flex h-10 w-10 items-center justify-center justify-self-center rounded-full border border-ink-950/15 dark:border-white/15"
        >
          ⇄
        </button>

        <div>
          <label className="text-sm font-medium">Resultado</label>
          <div className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2.5 font-mono text-sm dark:border-white/15 dark:bg-ink-950">
            {loading ? "Cargando…" : result !== null ? result.toLocaleString("es", { maximumFractionDigits: 4 }) : "—"}
          </div>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-2 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-4 space-y-2">
          <StatusBanner kind="error">{error}</StatusBanner>
          <button onClick={retry} className="chip inline-flex items-center gap-1.5">
            <RefreshCw size={13} /> Reintentar
          </button>
        </div>
      )}

      {showArsContext && (
        <div className="mt-4 rounded-xl2 border border-amber-500/25 bg-amber-500/5 p-4 text-sm">
          <p className="font-medium text-amber-700 dark:text-amber-400">
            El valor de arriba usa el tipo de cambio <strong>oficial</strong> (fuente: BCE). Para Argentina, el dólar{" "}
            <strong>blue</strong> suele ser distinto:
          </p>
          {blueDollar ? (
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-ink-950/50 dark:text-white/50">Oficial (venta)</p>
                <p className="font-mono text-base font-semibold">${blueDollar.oficial.toLocaleString("es")}</p>
              </div>
              <div>
                <p className="text-xs text-ink-950/50 dark:text-white/50">Blue (venta)</p>
                <p className="font-mono text-base font-semibold">${blueDollar.blue.toLocaleString("es")}</p>
              </div>
            </div>
          ) : blueError ? (
            <p className="mt-2 text-xs text-ink-950/50 dark:text-white/50">No se pudo cargar el dólar blue en este momento.</p>
          ) : (
            <p className="mt-2 text-xs text-ink-950/50 dark:text-white/50">Cargando cotización blue…</p>
          )}
          <p className="mt-2 text-xs text-ink-950/45 dark:text-white/45">Fuente: Bluelytics · valores informativos, no oficiales.</p>
        </div>
      )}

      {data && !error && (
        <p className="mt-4 text-xs text-ink-950/45 dark:text-white/45">
          1 {from} = {rateForOne?.toLocaleString("es", { maximumFractionDigits: 4 }) ?? "—"} {to} · Fuente: Banco
          Central Europeo (vía Frankfurter API) · Actualizado {data.date}
        </p>
      )}
    </div>
  );
}
