import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Source: Frankfurter API (https://frankfurter.dev), which republishes the
 * European Central Bank's daily reference rates. It's free, requires no API
 * key, and its terms explicitly allow this kind of use — so there's no
 * secret to protect here. The reason this still lives behind our own route
 * (instead of the client calling Frankfurter directly) is caching: without
 * it, every currency-converter keystroke would trigger an external request.
 */
const UPSTREAM_URL = "https://api.frankfurter.app/latest";

const querySchema = z.object({
  base: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Código de moneda inválido")
});

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes — matches how often the upstream source actually updates.
const cache = new Map<string, CacheEntry>();

// Same lightweight per-IP limiter pattern as /api/waitlist.
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 30;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > MAX_REQUESTS;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intentá de nuevo en un minuto." }, { status: 429 });
  }

  const parsed = querySchema.safeParse({ base: request.nextUrl.searchParams.get("base") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ error: "Código de moneda base inválido. Usá un código ISO de 3 letras, por ejemplo USD." }, { status: 400 });
  }
  const { base } = parsed.data;

  const cached = cache.get(base);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data, { headers: { "Cache-Control": "public, max-age=300" } });
  }

  try {
    const upstream = await fetch(`${UPSTREAM_URL}?from=${base}`, {
      signal: AbortSignal.timeout(8000)
    });

    if (!upstream.ok) {
      // Frankfurter returns 404 for unsupported/unknown currency codes.
      return NextResponse.json({ error: "No se encontraron tasas para esa moneda." }, { status: 404 });
    }

    const data = await upstream.json();
    cache.set(base, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    return NextResponse.json(data, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch {
    return NextResponse.json({ error: "No se pudo consultar el tipo de cambio en este momento. Probá de nuevo en unos segundos." }, { status: 503 });
  }
}
