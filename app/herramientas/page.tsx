import type { Metadata } from "next";
import { CATEGORY_LABELS, TOOLS, type ToolCategory } from "@/lib/tools-registry";
import { ToolCard } from "@/components/tool-card";

export const metadata: Metadata = {
  title: "Todas las herramientas",
  description: "Explora el catálogo completo de herramientas gratuitas: PDF, imágenes, QR, seguridad, colores, conversores y más."
};

const ALL_CATEGORIES = Array.from(new Set(TOOLS.map((t) => t.category))) as ToolCategory[];

export default async function AllToolsPage({
  searchParams
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const activeCategory = resolvedSearchParams.categoria as ToolCategory | undefined;
  const categories = activeCategory ? ALL_CATEGORIES.filter((c) => c === activeCategory) : ALL_CATEGORIES;

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="font-display text-3xl font-semibold">Todas las herramientas</h1>
      <p className="mt-2 text-ink-950/60 dark:text-white/60">
        {activeCategory
          ? `Categoría: ${CATEGORY_LABELS[activeCategory]}`
          : "El catálogo completo, organizado por categoría."}
      </p>

      <div className="mt-10 space-y-14">
        {categories.map((category) => (
          <section key={category} aria-labelledby={`categoria-${category}`}>
            <h2 id={`categoria-${category}`} className="font-display text-xl font-semibold">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.filter((t) => t.category === category).map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
