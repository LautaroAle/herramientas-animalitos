"use client";

import { useMemo, useState } from "react";
import { CopyButton, DownloadButton } from "@/components/tools/action-buttons";

const LOREM_WORDS =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat".split(
    " "
  );

function countStats(text: string) {
  const words = text.trim().length === 0 ? [] : text.trim().split(/\s+/);
  const charsWithSpaces = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text.trim().length === 0 ? 0 : (text.match(/[.!?]+/g) ?? []).length || 1;
  const paragraphs = text.trim().length === 0 ? 0 : text.split(/\n{2,}/).filter((p) => p.trim().length > 0).length;
  const readingMinutes = Math.max(1, Math.round(words.length / 200));
  return { words: words.length, charsWithSpaces, charsNoSpaces, sentences, paragraphs, readingMinutes };
}

function generateLoremIpsum(paragraphCount: number): string {
  const paragraphs: string[] = [];
  for (let p = 0; p < paragraphCount; p++) {
    const sentenceCount = 3 + (p % 3);
    const sentences: string[] = [];
    for (let s = 0; s < sentenceCount; s++) {
      const wordCount = 8 + ((p + s) % 10);
      const words = Array.from({ length: wordCount }, (_, i) => LOREM_WORDS[(p * 7 + s * 13 + i) % LOREM_WORDS.length]);
      const sentence = words.join(" ");
      sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".");
    }
    paragraphs.push(sentences.join(" "));
  }
  return paragraphs.join("\n\n");
}

type Tab = "contador" | "transformar" | "limpiar" | "lineas" | "lorem";

const TABS: { id: Tab; label: string }[] = [
  { id: "contador", label: "Contador" },
  { id: "transformar", label: "Mayúsculas / minúsculas" },
  { id: "limpiar", label: "Limpiar texto" },
  { id: "lineas", label: "Líneas y duplicados" },
  { id: "lorem", label: "Lorem Ipsum" }
];

export function TextTools() {
  const [tab, setTab] = useState<Tab>("contador");
  const [text, setText] = useState(
    "Pega o escribí tu texto acá.\nEsta herramienta cuenta palabras y caracteres, transforma mayúsculas y minúsculas, limpia espacios y saltos, ordena líneas y elimina duplicados."
  );
  const [loremCount, setLoremCount] = useState(3);

  const stats = useMemo(() => countStats(text), [text]);

  function applyTransform(fn: (s: string) => string) {
    setText((current) => fn(current));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-ink-950/8 pb-4 dark:border-white/8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-signal-gradient text-white"
                : "bg-ink-950/5 text-ink-950/70 hover:bg-ink-950/10 dark:bg-white/10 dark:text-white/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "lorem" && (
        <div className="mt-6">
          <label htmlFor="text-input" className="sr-only">
            Texto de entrada
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="w-full rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 font-mono text-sm outline-none focus-visible:border-signal-violet dark:border-white/15 dark:bg-ink-950"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton value={text} />
            <DownloadButton data={text} filename="texto.txt" />
          </div>
        </div>
      )}

      {tab === "contador" && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {[
            { label: "Palabras", value: stats.words },
            { label: "Caracteres", value: stats.charsWithSpaces },
            { label: "Sin espacios", value: stats.charsNoSpaces },
            { label: "Oraciones", value: stats.sentences },
            { label: "Párrafos", value: stats.paragraphs },
            { label: "Min. de lectura", value: stats.readingMinutes }
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-ink-950/8 p-4 text-center dark:border-white/8">
              <p className="font-display text-2xl font-semibold">{stat.value}</p>
              <p className="mt-1 text-xs text-ink-950/50 dark:text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "transformar" && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => applyTransform((s) => s.toUpperCase())} className="chip">MAYÚSCULAS</button>
          <button onClick={() => applyTransform((s) => s.toLowerCase())} className="chip">minúsculas</button>
          <button
            onClick={() =>
              applyTransform((s) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
            }
            className="chip"
          >
            Capitalizar Cada Palabra
          </button>
          <button onClick={() => applyTransform((s) => s.split("").reverse().join(""))} className="chip">
            Invertir texto
          </button>
        </div>
      )}

      {tab === "limpiar" && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => applyTransform((s) => s.replace(/[ \t]+/g, " ").trim())} className="chip">
            Eliminar espacios extra
          </button>
          <button onClick={() => applyTransform((s) => s.replace(/\n+/g, " "))} className="chip">
            Eliminar saltos de línea
          </button>
          <button onClick={() => applyTransform((s) => s.replace(/\n{3,}/g, "\n\n"))} className="chip">
            Compactar párrafos
          </button>
        </div>
      )}

      {tab === "lineas" && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() =>
              applyTransform((s) =>
                Array.from(new Set(s.split("\n").map((l) => l.trim()).filter((l) => l.length > 0))).join("\n")
              )
            }
            className="chip"
          >
            Eliminar líneas duplicadas
          </button>
          <button
            onClick={() => applyTransform((s) => s.split("\n").sort((a, b) => a.localeCompare(b, "es")).join("\n"))}
            className="chip"
          >
            Ordenar líneas (A-Z)
          </button>
          <button onClick={() => applyTransform((s) => s.split("\n").reverse().join("\n"))} className="chip">
            Invertir orden de líneas
          </button>
          <button
            onClick={() => applyTransform((s) => [...s.split("\n")].sort(() => Math.random() - 0.5).join("\n"))}
            className="chip"
          >
            Ordenar al azar
          </button>
        </div>
      )}

      {tab === "lorem" && (
        <div className="mt-6">
          <label htmlFor="lorem-count" className="text-sm font-medium">
            Párrafos a generar: {loremCount}
          </label>
          <input
            id="lorem-count"
            type="range"
            min={1}
            max={10}
            value={loremCount}
            onChange={(e) => setLoremCount(Number(e.target.value))}
            className="mt-2 block w-full max-w-xs accent-signal-violet"
          />
          <textarea
            readOnly
            rows={10}
            value={generateLoremIpsum(loremCount)}
            className="mt-4 w-full rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 font-mono text-sm dark:border-white/15 dark:bg-ink-950"
          />
          <div className="mt-3">
            <CopyButton value={generateLoremIpsum(loremCount)} />
          </div>
        </div>
      )}
    </div>
  );
}
