import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Reddit deprecated unauthenticated .json access in May 2026 (returns 403
 * for every request now, regardless of headers) — so this now goes through
 * Reddit's official OAuth Data API instead. It's still free for read-only,
 * non-commercial use (~100 requests/minute), but requires registering a
 * free "script" app at https://www.reddit.com/prefs/apps to get a
 * client ID + secret. See README.md for the exact steps.
 */
const USER_AGENT = "web:centro-de-herramientas-gratuitas:v1.0 (by /u/centro_herramientas)";

const querySchema = z.object({
  q: z.string().trim().min(2).max(150)
});

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}
const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 15;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > MAX_REQUESTS;
}

// The OAuth access token is cached in memory and reused until shortly
// before it expires (Reddit tokens last ~1 hour) — this keeps us well
// under the rate limit instead of requesting a new token per search.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("REDDIT_NOT_CONFIGURED");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error("REDDIT_AUTH_FAILED");
  }

  const json = await response.json();
  const token: string = json.access_token;
  const expiresInSeconds: number = json.expires_in ?? 3600;
  cachedToken = { value: token, expiresAt: Date.now() + (expiresInSeconds - 60) * 1000 };
  return token;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Demasiadas búsquedas seguidas. Esperá un minuto e intentá de nuevo." }, { status: 429 });
  }

  const parsed = querySchema.safeParse({ q: request.nextUrl.searchParams.get("q") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ error: "Escribí al menos 2 caracteres para buscar." }, { status: 400 });
  }
  const { q } = parsed.data;

  const cacheKey = q.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {
    const token = await getAccessToken();
    const url = `https://oauth.reddit.com/search?q=${encodeURIComponent(q)}&limit=25&sort=relevance&type=link`;
    const upstream = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(10000)
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "No se pudo consultar Reddit en este momento. Probá de nuevo en unos segundos." }, { status: 503 });
    }

    const json = await upstream.json();
    const posts = (json?.data?.children ?? []).map((child: { data: Record<string, unknown> }) => ({
      title: child.data.title,
      subreddit: child.data.subreddit_name_prefixed,
      score: child.data.score,
      numComments: child.data.num_comments,
      permalink: `https://reddit.com${child.data.permalink}`,
      selftext: typeof child.data.selftext === "string" ? child.data.selftext.slice(0, 500) : ""
    }));

    const data = { posts };
    cache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof Error && err.message === "REDDIT_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "Esta herramienta necesita una credencial gratuita de Reddit configurada por el dueño del sitio. Ver README.md." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "No se pudo consultar Reddit en este momento. Probá de nuevo en unos segundos." }, { status: 503 });
  }
}
