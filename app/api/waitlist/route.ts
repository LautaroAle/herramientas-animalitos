import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getToolBySlug } from "@/lib/tools-registry";

const bodySchema = z.object({
  email: z.string().email().max(254),
  toolSlug: z.string().min(1).max(64)
});

/**
 * In-memory sliding-window rate limiter: 5 requests / 10 minutes per IP.
 *
 * NOTE: this resets on every server restart/redeploy and is per-instance,
 * so it's fine for a single Vercel function instance under light load but
 * not a substitute for a shared store. Swap the Map below for Upstash
 * Redis (or Vercel KV) before scaling to multiple instances — the
 * `isRateLimited` function signature is the only thing that needs to stay
 * the same for the route below to keep working unmodified.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > MAX_REQUESTS;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intentá de nuevo más tarde." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const { email, toolSlug } = parsed.data;
  const tool = getToolBySlug(toolSlug);
  if (!tool) {
    return NextResponse.json({ error: "Herramienta desconocida." }, { status: 404 });
  }

  // Persistence intentionally not wired to a real table yet — this project
  // ships without a provisioned database (see README "Qué falta para
  // producción"). Once PostgreSQL + Prisma are provisioned, replace this
  // with `prisma.waitlistSignup.upsert(...)` keyed on (email, toolSlug).
  console.info(`[waitlist] ${email} -> ${tool.slug}`);

  return NextResponse.json({ ok: true }, { status: 201 });
}
