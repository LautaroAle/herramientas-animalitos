"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Sparkles } from "lucide-react";

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  // Avoid rendering theme-dependent UI until mounted, so the server and
  // client markup match (prevents hydration warnings from next-themes).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 border-b border-ink-950/8 bg-paper-50/80 backdrop-blur-lg dark:border-white/8 dark:bg-ink-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-signal-gradient text-white">
            <Sparkles size={16} />
          </span>
          Centro de Herramientas
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/herramientas" className="text-ink-950/70 transition-colors hover:text-ink-950 dark:text-white/70 dark:hover:text-white">
            Todas las herramientas
          </Link>
          <Link href="/#populares" className="text-ink-950/70 transition-colors hover:text-ink-950 dark:text-white/70 dark:hover:text-white">
            Populares
          </Link>
          <Link href="/#faq" className="text-ink-950/70 transition-colors hover:text-ink-950 dark:text-white/70 dark:hover:text-white">
            Preguntas frecuentes
          </Link>
        </nav>

        <button
          type="button"
          aria-label={mounted && resolvedTheme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-950/10 transition-colors hover:bg-ink-950/5 dark:border-white/10 dark:hover:bg-white/10"
        >
          {mounted && resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
