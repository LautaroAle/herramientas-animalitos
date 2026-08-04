import { NextResponse } from "next/server";

/**
 * Bluelytics (https://bluelytics.com.ar) is a free, no-key, widely-used
 * public API that tracks both Argentina's official USD/ARS rate and the
 * informal "blue" (parallel market) rate — a gap that can be 20-40%+ and
 * that no ECB-based source (like the one behind /api/exchange-rates) can
 * ever capture, since it isn't an official reference rate.
 */
const UPSTREAM_URL = "https://api.bluelytics.com.ar/v2/latest";
const CACHE_TTL_MS = 15 * 60 * 1000; // Bluelytics itself updates roughly every 15–30 min.

let cache: { data: unknown; expiresAt: number } | null = null;

export async function GET() {
  if (cache && cache.expiresAt > Date.now()) {
    return NextResponse.json(cache.data, { headers: { "Cache-Control": "public, max-age=300" } });
  }

  try {
    const upstream = await fetch(UPSTREAM_URL, { signal: AbortSignal.timeout(8000) });
    if (!upstream.ok) {
      return NextResponse.json({ error: "No se pudo consultar el dólar blue en este momento." }, { status: 503 });
    }
    const data = await upstream.json();
    cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    return NextResponse.json(data, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch {
    return NextResponse.json({ error: "No se pudo consultar el dólar blue en este momento." }, { status: 503 });
  }
}
