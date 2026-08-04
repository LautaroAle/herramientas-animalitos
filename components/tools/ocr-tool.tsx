"use client";

import { useState } from "react";
import { FileDropZone, FileListRow } from "@/components/tools/file-drop-zone";
import { CopyButton, DownloadButton } from "@/components/tools/action-buttons";
import { StatusBanner } from "@/components/tools/tool-shell";

const LANGUAGES = [
  { code: "spa", label: "Español" },
  { code: "eng", label: "Inglés" },
  { code: "por", label: "Portugués" },
  { code: "fra", label: "Francés" },
  { code: "deu", label: "Alemán" },
  { code: "ita", label: "Italiano" }
];

export function OcrTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [language, setLanguage] = useState("spa");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  function handleFile(f: File) {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setText("");
    setError("");
  }

  async function extractText() {
    if (!file) return;
    setBusy(true);
    setError("");
    setText("");
    setProgress(0);
    try {
      const Tesseract = await import("tesseract.js");
      const { data } = await Tesseract.recognize(file, language, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
            setProgressLabel("Reconociendo texto…");
          } else {
            setProgressLabel(m.status);
          }
        }
      });
      const extracted = data.text.trim();
      if (!extracted) {
        setError("No se detectó texto en esta imagen. Probá con una foto más nítida o cambiá el idioma.");
      } else {
        setText(extracted);
      }
    } catch {
      setError("No se pudo procesar la imagen. Probá con otro archivo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <FileDropZone accept="image/jpeg,image/png,image/webp" onFiles={(f) => f[0] && handleFile(f[0])} hint="JPG, PNG o WEBP — funciona mejor con texto nítido y buena iluminación" />
      {file && (
        <ul>
          <FileListRow file={file} onRemove={() => { setFile(null); setPreviewUrl(""); setText(""); }} />
        </ul>
      )}

      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- object URL preview
        <img src={previewUrl} alt="Vista previa" className="max-h-64 rounded-xl2 border border-ink-950/8 dark:border-white/8" />
      )}

      <div>
        <label className="text-sm font-medium">Idioma del texto</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mt-1.5 w-full max-w-xs rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {error && <StatusBanner kind="error">{error}</StatusBanner>}

      <button
        onClick={extractText}
        disabled={!file || busy}
        className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Extrayendo texto…" : "Extraer texto"}
      </button>

      {busy && (
        <div>
          <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-ink-950/10 dark:bg-white/10">
            <div className="h-full bg-signal-gradient transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-ink-950/50 dark:text-white/50">{progressLabel} {progress > 0 ? `${progress}%` : ""}</p>
        </div>
      )}

      {text && (
        <div>
          <label htmlFor="ocr-result" className="text-sm font-medium">
            Texto extraído (editable)
          </label>
          <textarea
            id="ocr-result"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="mt-1.5 w-full rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 font-mono text-sm outline-none focus-visible:border-signal-violet dark:border-white/15 dark:bg-ink-950"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton value={text} />
            <DownloadButton data={text} filename="texto-extraido.txt" />
          </div>
        </div>
      )}

      <p className="text-xs text-ink-950/40 dark:text-white/40">
        El reconocimiento corre en tu navegador (Tesseract.js) — la imagen nunca se sube a un servidor. La primera
        vez descarga los datos del idioma elegido; después queda en caché.
      </p>
    </div>
  );
}
