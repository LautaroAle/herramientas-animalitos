"use client";

import { useState } from "react";
import { Search, Youtube, ShoppingBag, MessageCircle, Scale, Globe, ExternalLink } from "lucide-react";

interface SearchSource {
  id: string;
  label: string;
  description: string;
  icon: typeof Youtube;
  buildUrl: (q: string) => string;
}

const SOURCES: SearchSource[] = [
  {
    id: "youtube",
    label: "Reviews en YouTube",
    description: "Videos de desempaquetado, pruebas y comparativas.",
    icon: Youtube,
    buildUrl: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${q} review comparativa`)}`
  },
  {
    id: "reddit",
    label: "Discusiones en Reddit",
    description: "Opiniones reales de gente que ya lo compró o lo usa.",
    icon: MessageCircle,
    buildUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(`site:reddit.com ${q}`)}`
  },
  {
    id: "shopping",
    label: "Comparar precios",
    description: "Precios en distintas tiendas para el mismo producto.",
    icon: ShoppingBag,
    buildUrl: (q) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`
  },
  {
    id: "comparativas",
    label: "Comparativas y foros",
    description: "Artículos tipo \"mejores opciones\" y foros especializados.",
    icon: Scale,
    buildUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(`${q} comparativa opiniones cual comprar`)}`
  },
  {
    id: "general",
    label: "Búsqueda general",
    description: "Por si preferís explorar vos mismo desde cero.",
    icon: Globe,
    buildUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`
  }
];

export function ResearchPanel() {
  const [query, setQuery] = useState("");
  const [searchedFor, setSearchedFor] = useState("");

  function search() {
    if (!query.trim()) return;
    setSearchedFor(query.trim());
  }

  return (
    <div>
      <div className="rounded-xl2 border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-400">
        Esto no es una IA leyendo reseñas por vos — es un lanzador de búsquedas ya armadas hacia los lugares donde
        realmente está la información (Reddit, YouTube, tiendas), para que llegues en un clic en vez de escribir
        cada búsqueda a mano.
      </div>

      <div className="mt-5 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Ej: aspiradora robot, notebook para diseño, mejor aire acondicionado…"
          className="flex-1 rounded-full border border-ink-950/15 bg-paper-50 px-5 py-3 text-sm outline-none focus-visible:border-signal-violet dark:border-white/15 dark:bg-ink-950"
        />
        <button
          onClick={search}
          disabled={!query.trim()}
          className="inline-flex items-center gap-1.5 rounded-full bg-signal-gradient px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          <Search size={15} /> Investigar
        </button>
      </div>

      {searchedFor && (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SOURCES.map((source) => (
            <a
              key={source.id}
              href={source.buildUrl(searchedFor)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-xl2 border border-ink-950/8 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-signal-violet/40 dark:border-white/8 dark:bg-ink-900"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-signal-gradient text-white">
                <source.icon size={18} />
              </span>
              <div className="flex-1">
                <p className="flex items-center gap-1.5 font-medium">
                  {source.label} <ExternalLink size={12} className="text-ink-950/30 dark:text-white/30" />
                </p>
                <p className="mt-0.5 text-sm text-ink-950/55 dark:text-white/55">{source.description}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
