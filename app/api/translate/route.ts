import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MyMemoryTranslationProvider, SUPPORTED_LANGUAGES } from "@/lib/providers/translation.mymemory";

const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code) as [string, ...string[]];

const bodySchema = z.object({
  text: z.string().trim().min(1, "El texto no puede estar vacío").max(2000, "Máximo 2000 caracteres por traducción"),
  sourceLang: z.enum(LANGUAGE_CODES),
  targetLang: z.enum(LANGUAGE_CODES)
});

// Same lightweight per-IP limiter pattern used by /api/waitlist and /api/exchange-rates.
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 20;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > MAX_REQUESTS;
}

// A single provider instance is enough — it's stateless. Swapping providers
// later means changing this one import, per lib/providers/README.md.
const translationProvider = new MyMemoryTranslationProvider();

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Demasiadas traducciones seguidas. Esperá un minuto e intentá de nuevo." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { text, sourceLang, targetLang } = parsed.data;
  if (sourceLang === targetLang) {
    return NextResponse.json({ translation: text });
  }

  try {
    const translation = await translationProvider.translate({ text, sourceLang, targetLang });
    return NextResponse.json({ translation });
  } catch {
    return NextResponse.json({ error: "No se pudo traducir en este momento. Probá de nuevo en unos segundos." }, { status: 503 });
  }
}
