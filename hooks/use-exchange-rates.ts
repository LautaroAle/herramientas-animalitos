import { useCallback, useEffect, useState } from "react";

export interface ExchangeRatesResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

interface UseExchangeRatesResult {
  data: ExchangeRatesResponse | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

// Session-lived cache so switching back to a base currency you already
// fetched doesn't hit the network (or our own rate limit) again.
const sessionCache = new Map<string, ExchangeRatesResponse>();

export function useExchangeRates(base: string): UseExchangeRatesResult {
  const [data, setData] = useState<ExchangeRatesResponse | null>(sessionCache.get(base) ?? null);
  const [loading, setLoading] = useState(!sessionCache.has(base));
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const retry = useCallback(() => setRetryToken((t) => t + 1), []);

  useEffect(() => {
    const cached = sessionCache.get(base);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchRates(attempt: number): Promise<void> {
      try {
        const response = await fetch(`/api/exchange-rates?base=${encodeURIComponent(base)}`);
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || "Error desconocido");
        if (cancelled) return;
        sessionCache.set(base, json);
        setData(json);
      } catch (err) {
        // One automatic retry on transient failures before surfacing an error.
        if (attempt < 1) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          if (!cancelled) return fetchRates(attempt + 1);
        }
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar las tasas de cambio.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchRates(0);
    return () => {
      cancelled = true;
    };
  }, [base, retryToken]);

  return { data, loading, error, retry };
}
