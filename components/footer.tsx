import Link from "next/link";
import { CATEGORY_LABELS, TOOLS, type ToolCategory } from "@/lib/tools-registry";

const FEATURED_CATEGORIES: ToolCategory[] = ["texto", "qr", "seguridad", "pdf", "imagenes", "video", "desarrollo", "calculadoras"];

export function Footer() {
  return (
    <footer id="footer" className="border-t border-ink-950/8 bg-white dark:border-white/8 dark:bg-ink-900">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 py-14 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-lg font-semibold">Centro de Herramientas</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-950/60 dark:text-white/60">
            Herramientas gratuitas, rápidas y sin registro. Entra, resuelve y sal.
          </p>
        </div>

        {FEATURED_CATEGORIES.map((category) => (
          <div key={category}>
            <p className="text-sm font-semibold text-ink-950/80 dark:text-white/80">{CATEGORY_LABELS[category]}</p>
            <ul className="mt-4 space-y-2.5">
              {TOOLS.filter((t) => t.category === category).slice(0, 4).map((tool) => (
                <li key={tool.slug}>
                  <Link href={tool.href} className="text-sm text-ink-950/60 hover:text-signal-violet dark:text-white/60">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ink-950/8 px-6 py-6 text-center text-xs text-ink-950/50 dark:border-white/8 dark:text-white/50">
        © {new Date().getFullYear()} Centro de Herramientas Gratuitas. Todos los derechos reservados.
      </div>
    </footer>
  );
}
