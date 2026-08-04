"use client";

import { useState } from "react";
import { Search, ExternalLink, MessageSquare, ArrowUp, Youtube, ShoppingBag } from "lucide-react";
import { StatusBanner } from "@/components/tools/tool-shell";
import { extractFrequentTerms, type TermFrequency } from "@/lib/keyword-extraction";

interface RedditPost {
  title: string;
  subreddit: string;
  score: number;
  numComments: number;
  permalink: string;
  selftext: string;
}

export function ResearchPanel() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<RedditPost[] | null>(null);
  const [terms, setTerms] = useState<TermFrequency[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [searchedFor, setSearchedFor] = useState("");

  async function search() {
    if (!query.trim()) return;
    setBusy(true);
    setError("");
    setPosts(null);
    setSearchedFor(query);
    try {
      const response = await fetch(`/api/reddit-search?q=${encodeURIComponent(query)}`);
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Error desconocido");
      const foundPosts: RedditPost[] = json.posts;
      setPosts(foundPosts);
      setTerms(extractFrequentTerms(foundPosts.map((p) => `${p.title} ${p.selftext}`)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la búsqueda.");
      setPosts([]); // still show the YouTube/Shopping quick links below even if Reddit failed
    } finally {
      setBusy(false);
    }
  }

  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${searchedFor} review comparativa`)}`;
  const shoppingUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(searchedFor)}`;

  return (
    <div>
      <div className="rounded-xl2 border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-400">
        Esto busca discusiones <strong>reales</strong> en Reddit y detecta automáticamente qué palabras se repiten más —
        no es una IA redactando una conclusión, es información real para que decidas vos, más rápido que buscando a
        mano.
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
          disabled={!query.trim() || busy}
          className="inline-flex items-center gap-1.5 rounded-full bg-signal-gradient px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          <Search size={15} /> {busy ? "Buscando…" : "Investigar"}
        </button>
      </div>

      {error && (
        <div className="mt-4">
          <StatusBanner kind="error">{error}</StatusBanner>
        </div>
      )}

      {posts && (
        <div className="mt-8 space-y-8">
          <div className="flex flex-wrap gap-2">
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="chip inline-flex items-center gap-1.5">
              <Youtube size={14} /> Ver reviews en YouTube
            </a>
            <a href={shoppingUrl} target="_blank" rel="noopener noreferrer" className="chip inline-flex items-center gap-1.5">
              <ShoppingBag size={14} /> Comparar precios en Google Shopping
            </a>
          </div>

          {terms.length > 0 && (
            <div>
              <p className="text-sm font-semibold">Palabras que más se repiten en las discusiones encontradas</p>
              <p className="text-xs text-ink-950/45 dark:text-white/45">
                Cuanto más grande, más posts distintos la mencionan. Es un conteo automático, no una interpretación.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {terms.map((t) => (
                  <span
                    key={t.term}
                    className="rounded-full bg-signal-violet/10 px-3 py-1 font-medium text-signal-violet"
                    style={{ fontSize: `${Math.min(11 + t.count * 1.5, 20)}px` }}
                  >
                    {t.term} <span className="opacity-50">×{t.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-3 text-sm font-semibold">
              {posts.length > 0 ? `${posts.length} discusiones encontradas en Reddit` : "Sin resultados en Reddit para esta búsqueda"}
            </p>
            <div className="space-y-3">
              {posts.map((post, i) => (
                <a
                  key={i}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl2 border border-ink-950/8 bg-white p-4 transition-colors hover:border-signal-violet/40 dark:border-white/8 dark:bg-ink-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">{post.title}</p>
                    <ExternalLink size={14} className="mt-0.5 shrink-0 text-ink-950/30 dark:text-white/30" />
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-ink-950/50 dark:text-white/50">
                    <span>{post.subreddit}</span>
                    <span className="inline-flex items-center gap-1"><ArrowUp size={12} /> {post.score}</span>
                    <span className="inline-flex items-center gap-1"><MessageSquare size={12} /> {post.numComments}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
