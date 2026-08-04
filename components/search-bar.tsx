"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import { Search, ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";
import { TOOLS, type ToolDefinition } from "@/lib/tools-registry";
import { Icon } from "@/components/ui/icon";

/**
 * Fuzzy, synonym-aware search over the tools registry.
 *
 * Fuse.js does the typo tolerance ("combinar pdf" -> "Unir PDFs" via the
 * `keywords` field). Weighting `name` highest keeps exact-name matches on
 * top, while `keywords` catches the many ways people phrase the same intent
 * (e.g. "unir", "combinar" and "mezclar" pdf all resolve to the same tool).
 */
const fuse = new Fuse(TOOLS, {
  keys: [
    { name: "name", weight: 0.5 },
    { name: "keywords", weight: 0.35 },
    { name: "shortDescription", weight: 0.15 }
  ],
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 2
});

export function SearchBar({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results: ToolDefinition[] = useMemo(() => {
    if (query.trim().length < 2) return [];
    return fuse.search(query).slice(0, 8).map((r) => r.item);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="glass flex items-center gap-3 rounded-full px-5 py-3.5 shadow-soft dark:shadow-soft-dark">
        <Search size={20} className="shrink-0 text-ink-950/40 dark:text-white/40" aria-hidden />
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen && results.length > 0}
          aria-controls="search-results"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Busca una herramienta: “unir pdf”, “quitar fondo”, “imc”…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-950/40 dark:placeholder:text-white/40"
        />
      </div>

      {isOpen && results.length > 0 && (
        <ul
          id="search-results"
          role="listbox"
          className="glass absolute z-20 mt-2 w-full overflow-hidden rounded-2xl shadow-soft dark:shadow-soft-dark"
        >
          {results.map((tool) => (
            <li key={tool.slug} role="option" aria-selected={false}>
              <Link
                href={tool.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-signal-violet/8"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-signal-gradient text-white">
                  <Icon name={tool.icon} size={15} />
                </span>
                <span className="flex-1">
                  <span className="block font-medium">{tool.name}</span>
                  <span className="block text-xs text-ink-950/50 dark:text-white/50">{tool.shortDescription}</span>
                </span>
                {tool.implemented ? (
                  <ArrowUpRight size={16} className="shrink-0 text-ink-950/30 dark:text-white/30" />
                ) : (
                  <Clock size={14} className="shrink-0 text-ink-950/30 dark:text-white/30" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.trim().length >= 2 && results.length === 0 && (
        <div className="glass absolute z-20 mt-2 w-full rounded-2xl px-5 py-4 text-sm text-ink-950/60 shadow-soft dark:text-white/60 dark:shadow-soft-dark">
          Sin resultados para “{query}”. Prueba con otra palabra.
        </div>
      )}
    </div>
  );
}
