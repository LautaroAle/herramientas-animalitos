import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug, CATEGORY_LABELS } from "@/lib/tools-registry";
import { Icon } from "@/components/ui/icon";
import { ComingSoonForm } from "@/components/tools/coming-soon-form";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return { title: tool.name, description: tool.shortDescription };
}

export default async function ToolFallbackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool || tool.implemented) {
    // Implemented tools have their own dedicated route folder and are
    // matched by Next.js before this dynamic catch-all runs. Reaching here
    // with `implemented: true` means the route folder is missing — treat
    // an unknown slug the same as a 404.
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-signal-gradient text-white">
        <Icon name={tool.icon} size={26} />
      </span>
      <p className="mt-5 text-xs font-medium uppercase tracking-wide text-ink-950/50 dark:text-white/50">
        {CATEGORY_LABELS[tool.category]} · Próximamente
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold">{tool.name}</h1>
      <p className="mt-3 text-ink-950/60 dark:text-white/60">{tool.shortDescription}</p>
      <p className="mt-1 text-sm text-ink-950/45 dark:text-white/45">
        Esta herramienta depende de un servicio externo y está en construcción. Dejá tu correo y te avisamos apenas esté disponible.
      </p>
      <ComingSoonForm toolSlug={tool.slug} />
    </div>
  );
}
