"use client";

import { useState } from "react";
import { Volume2, Wand2 } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/providers/translation.mymemory";
import { detectLanguage } from "@/lib/detect-language";
import { CopyButton } from "@/components/tools/action-buttons";
import { StatusBanner } from "@/components/tools/tool-shell";

/** Best-effort mapping from our 2-letter codes to BCP-47 tags the SpeechSynthesis API expects. */
const SPEECH_LOCALE: Record<string, string> = {
  es: "es-ES", en: "en-US", pt: "pt-PT", fr: "fr-FR", de: "de-DE", it: "it-IT",
  nl: "nl-NL", ru: "ru-RU", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR", ar: "ar-SA",
  hi: "hi-IN", tr: "tr-TR", pl: "pl-PL", sv: "sv-SE", el: "el-GR", he: "he-IL",
  id: "id-ID", vi: "vi-VN", th: "th-TH", cs: "cs-CZ", ro: "ro-RO", uk: "uk-UA"
};

function speak(text: string, langCode: string) {
  if (!("speechSynthesis" in window) || !text.trim()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = SPEECH_LOCALE[langCode] ?? "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function TranslatorTool() {
  const [sourceLang, setSourceLang] = useState("es");
  const [targetLang, setTargetLang] = useState("en");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState("");

  async function handleDetect() {
    setDetecting(true);
    const detected = await detectLanguage(sourceText);
    setDetecting(false);
    if (detected) setSourceLang(detected);
  }

  async function handleTranslate() {
    if (!sourceText.trim()) return;
    setTranslating(true);
    setError("");
    setTranslatedText("");
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceText, sourceLang, targetLang })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Error desconocido");
      setTranslatedText(json.translation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo traducir el texto.");
    } finally {
      setTranslating(false);
    }
  }

  function swapLanguages() {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  }

  return (
    <div>
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
        <button onClick={swapLanguages} aria-label="Invertir idiomas" className="flex h-10 w-10 items-center justify-center justify-self-center rounded-full border border-ink-950/15 dark:border-white/15">
          ⇄
        </button>
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Escribí o pegá el texto a traducir…"
            rows={8}
            maxLength={2000}
            className="w-full rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 text-sm outline-none focus-visible:border-signal-violet dark:border-white/15 dark:bg-ink-950"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <button onClick={handleDetect} disabled={detecting || sourceText.trim().length < 8} className="chip inline-flex items-center gap-1.5 disabled:opacity-40">
                <Wand2 size={13} /> {detecting ? "Detectando…" : "Detectar idioma"}
              </button>
              <button onClick={() => speak(sourceText, sourceLang)} disabled={!sourceText.trim()} className="chip inline-flex items-center gap-1.5 disabled:opacity-40">
                <Volume2 size={13} /> Escuchar
              </button>
            </div>
            <span className="text-xs text-ink-950/40 dark:text-white/40">{sourceText.length}/2000</span>
          </div>
        </div>

        <div>
          <textarea
            readOnly
            value={translatedText}
            placeholder="La traducción va a aparecer acá."
            rows={8}
            className="w-full rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 text-sm dark:border-white/15 dark:bg-ink-950"
          />
          <div className="mt-2 flex gap-2">
            <CopyButton value={translatedText} />
            <button onClick={() => speak(translatedText, targetLang)} disabled={!translatedText} className="chip inline-flex items-center gap-1.5 disabled:opacity-40">
              <Volume2 size={13} /> Escuchar
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <StatusBanner kind="error">{error}</StatusBanner>
        </div>
      )}

      <button
        onClick={handleTranslate}
        disabled={!sourceText.trim() || translating}
        className="mt-4 rounded-full bg-signal-gradient px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {translating ? "Traduciendo…" : "Traducir"}
      </button>

      <p className="mt-4 text-xs text-ink-950/40 dark:text-white/40">
        Traducción automática vía MyMemory. Para textos legales, médicos o de alto riesgo, revisá el resultado con
        una persona traductora — como cualquier traducción automática, puede cometer errores de matiz o contexto.
      </p>
    </div>
  );
}
