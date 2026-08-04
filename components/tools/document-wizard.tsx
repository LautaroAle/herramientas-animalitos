"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Download, FileText, RotateCcw, Sparkles, Upload, ExternalLink, X } from "lucide-react";
import { DOCUMENT_TEMPLATES, getDocumentTemplate, type Answers } from "@/lib/document-templates";
import { matchIntent } from "@/lib/document-templates/match-intent";
import { extractReferenceValues, type DetectedValue } from "@/lib/pdf-field-extraction";
import { downloadFile } from "@/lib/utils";
import { StatusBanner } from "@/components/tools/tool-shell";

type Phase = "elegir" | "preguntas" | "listo";

/** Needs the CV builder / invoice generator, which already exist as their own dedicated tools — no point rebuilding them here. */
const RELATED_TOOLS = [
  { name: "Currículum (CV)", description: "Plantillas moderna y ATS, exporta a PDF.", href: "/herramientas/cv" },
  { name: "Presupuesto / Factura proforma", description: "Ítems, IVA automático, exporta a PDF.", href: "/herramientas/facturas" }
];

export function DocumentWizard() {
  const [templateSlug, setTemplateSlug] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("elegir");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [intentText, setIntentText] = useState("");
  const intentMatches = useMemo(() => matchIntent(intentText), [intentText]);

  const [detectedValues, setDetectedValues] = useState<DetectedValue[]>([]);
  const [extractingPdf, setExtractingPdf] = useState(false);
  const [referenceFileName, setReferenceFileName] = useState("");

  const template = templateSlug ? getDocumentTemplate(templateSlug) : undefined;
  const currentField = template?.fields[stepIndex];

  const blocks = useMemo(() => (template ? template.generate(answers) : []), [template, answers]);
  const previewText = useMemo(
    () => blocks.filter((b) => b.type === "paragraph" || b.type === "heading").map((b) => ("text" in b ? b.text : "")).join("\n\n"),
    [blocks]
  );

  function selectTemplate(slug: string) {
    setTemplateSlug(slug);
    setAnswers({});
    setStepIndex(0);
    setDetectedValues([]);
    setReferenceFileName("");
    setPhase("preguntas");
    setError("");
  }

  function goNext() {
    if (!template || !currentField) return;
    if (currentField.required && !answers[currentField.id]?.trim()) {
      setError("Este dato es necesario para generar el documento.");
      return;
    }
    setError("");
    if (stepIndex < template.fields.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      setPhase("listo");
    }
  }

  function goBack() {
    setError("");
    if (stepIndex === 0) {
      setPhase("elegir");
      setTemplateSlug(null);
    } else {
      setStepIndex((i) => i - 1);
    }
  }

  function startOver() {
    setTemplateSlug(null);
    setAnswers({});
    setStepIndex(0);
    setIntentText("");
    setDetectedValues([]);
    setReferenceFileName("");
    setPhase("elegir");
    setError("");
  }

  async function handleReferenceUpload(file: File) {
    setExtractingPdf(true);
    setReferenceFileName(file.name);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const bytes = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      let fullText = "";
      for (let pageNum = 1; pageNum <= Math.min(doc.numPages, 5); pageNum++) {
        const page = await doc.getPage(pageNum);
        const content = await page.getTextContent();
        fullText += content.items.map((item) => ("str" in item ? item.str : "")).join(" ") + " ";
      }
      setDetectedValues(extractReferenceValues(fullText));
    } catch {
      setDetectedValues([]);
    } finally {
      setExtractingPdf(false);
    }
  }

  function insertIntoCurrentField(value: string) {
    if (!currentField) return;
    setAnswers((a) => ({ ...a, [currentField.id]: value }));
  }

  async function handleDownload(format: "pdf" | "docx") {
    if (!template) return;
    setBusy(true);
    setError("");
    try {
      if (format === "pdf") {
        const { renderDocumentPdf } = await import("@/lib/document-templates/renderer-pdf");
        const blob = await renderDocumentPdf(blocks);
        downloadFile(blob, `${template.suggestedFilename(answers)}.pdf`);
      } else {
        const { renderDocumentDocx } = await import("@/lib/document-templates/renderer-docx");
        const blob = await renderDocumentDocx(blocks);
        downloadFile(blob, `${template.suggestedFilename(answers)}.docx`);
      }
    } catch {
      setError("No se pudo generar el documento. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  // ---- Phase: choose document type ----
  if (phase === "elegir" || !template) {
    return (
      <div>
        <div className="rounded-xl2 border border-ink-950/8 bg-white p-5 dark:border-white/8 dark:bg-ink-900">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Sparkles size={16} className="text-signal-violet" /> Contame en tus palabras qué necesitás
          </label>
          <input
            value={intentText}
            onChange={(e) => setIntentText(e.target.value)}
            placeholder="Ej: me llegó un producto roto y quiero que me devuelvan la plata"
            className="mt-2 w-full rounded-full border border-ink-950/15 bg-paper-50 px-4 py-2.5 text-sm outline-none focus-visible:border-signal-violet dark:border-white/15 dark:bg-ink-950"
          />
          <p className="mt-1.5 text-xs text-ink-950/45 dark:text-white/45">
            Busca por palabras clave — no es una IA leyendo tu situación, así que si no detecta nada, elegí manualmente abajo.
          </p>

          {intentMatches.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {intentMatches.map((m) => (
                <button
                  key={m.template.slug}
                  onClick={() => selectTemplate(m.template.slug)}
                  className="rounded-xl2 border-2 border-signal-violet bg-signal-violet/5 p-3 text-left transition-transform hover:-translate-y-0.5"
                >
                  <p className="text-sm font-semibold text-signal-violet">{m.template.name}</p>
                  <p className="mt-1 text-xs text-ink-950/60 dark:text-white/60">{m.template.shortDescription}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="mb-3 mt-8 text-sm font-medium text-ink-950/60 dark:text-white/60">O elegí directamente:</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DOCUMENT_TEMPLATES.map((t) => (
            <button
              key={t.slug}
              onClick={() => selectTemplate(t.slug)}
              className="flex flex-col items-start gap-2 rounded-xl2 border border-ink-950/8 bg-white p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-signal-violet/40 dark:border-white/8 dark:bg-ink-900 dark:shadow-soft-dark"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-gradient text-white">
                <FileText size={18} />
              </span>
              <p className="font-display font-semibold">{t.name}</p>
              <p className="text-sm text-ink-950/60 dark:text-white/60">{t.shortDescription}</p>
            </button>
          ))}
          {RELATED_TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="flex flex-col items-start gap-2 rounded-xl2 border border-dashed border-ink-950/15 bg-paper-50 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-signal-violet/40 dark:border-white/15 dark:bg-ink-950"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-950/10 text-ink-950/60 dark:bg-white/10 dark:text-white/60">
                <ExternalLink size={16} />
              </span>
              <p className="font-display font-semibold">{t.name}</p>
              <p className="text-sm text-ink-950/60 dark:text-white/60">{t.description} (otra herramienta del sitio)</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // ---- Phase: one question at a time ----
  if (phase === "preguntas" && currentField) {
    const progress = ((stepIndex + 1) / template.fields.length) * 100;
    return (
      <div className="mx-auto max-w-lg">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-950/10 dark:bg-white/10">
          <div className="h-full bg-signal-gradient transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-ink-950/45 dark:text-white/45">
          Pregunta {stepIndex + 1} de {template.fields.length} · {template.name}
        </p>

        {stepIndex === 0 && (
          <div className="mt-4 rounded-xl2 border border-dashed border-ink-950/15 p-3 dark:border-white/15">
            {referenceFileName ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-950/60 dark:text-white/60">
                  {extractingPdf ? "Leyendo…" : "Referencia:"} <strong>{referenceFileName}</strong>
                </span>
                <button onClick={() => { setReferenceFileName(""); setDetectedValues([]); }} aria-label="Quitar referencia" className="text-ink-950/30 hover:text-red-500 dark:text-white/30">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-950/50 dark:text-white/50">
                <Upload size={13} />
                Subí un PDF de referencia (opcional) — comprobante, recibo, notificación…
                <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => e.target.files?.[0] && handleReferenceUpload(e.target.files[0])} />
              </label>
            )}
          </div>
        )}

        {detectedValues.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-ink-950/45 dark:text-white/45">Encontramos esto en tu PDF — tocá para usarlo en la pregunta actual:</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {detectedValues.map((d, i) => (
                <button
                  key={i}
                  onClick={() => insertIntoCurrentField(d.value)}
                  className="rounded-full bg-signal-violet/10 px-2.5 py-1 text-xs font-medium text-signal-violet hover:bg-signal-violet/20"
                >
                  {d.label}: {d.value}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="mt-6 block text-lg font-medium">
          {currentField.label}
          {currentField.required && <span className="text-signal-coral"> *</span>}
        </label>
        {currentField.helpText && <p className="mt-1 text-sm text-ink-950/50 dark:text-white/50">{currentField.helpText}</p>}

        <div className="mt-4">
          {currentField.type === "textarea" ? (
            <textarea
              autoFocus
              value={answers[currentField.id] || ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [currentField.id]: e.target.value }))}
              placeholder={currentField.placeholder}
              rows={4}
              className="w-full rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 text-sm outline-none focus-visible:border-signal-violet dark:border-white/15 dark:bg-ink-950"
            />
          ) : currentField.type === "select" ? (
            <select
              autoFocus
              value={answers[currentField.id] || ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [currentField.id]: e.target.value }))}
              className="w-full rounded-xl2 border border-ink-950/15 bg-paper-50 px-4 py-3 text-sm dark:border-white/15 dark:bg-ink-950"
            >
              <option value="">Elegí una opción…</option>
              {currentField.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              autoFocus
              type={currentField.type === "date" ? "date" : "text"}
              value={answers[currentField.id] || ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [currentField.id]: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && goNext()}
              placeholder={currentField.placeholder}
              className="w-full rounded-xl2 border border-ink-950/15 bg-paper-50 px-4 py-3 text-sm outline-none focus-visible:border-signal-violet dark:border-white/15 dark:bg-ink-950"
            />
          )}
        </div>

        {error && (
          <div className="mt-3">
            <StatusBanner kind="error">{error}</StatusBanner>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button onClick={goBack} className="chip inline-flex items-center gap-1.5">
            <ArrowLeft size={14} /> Atrás
          </button>
          <button onClick={goNext} className="inline-flex items-center gap-1.5 rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white">
            {stepIndex === template.fields.length - 1 ? "Ver documento" : "Siguiente"} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // ---- Phase: ready — preview and download ----
  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-950/45 dark:text-white/45">{template.name}</p>
      <div className="mt-3 max-h-96 overflow-y-auto whitespace-pre-line rounded-xl2 border border-ink-950/8 bg-white p-6 text-sm leading-relaxed shadow-soft dark:border-white/8 dark:bg-ink-900 dark:shadow-soft-dark">
        {previewText}
      </div>

      <div className="mt-4 rounded-xl2 border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-400">
        {template.disclaimer}
      </div>

      {error && (
        <div className="mt-3">
          <StatusBanner kind="error">{error}</StatusBanner>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => setPhase("preguntas")} className="chip inline-flex items-center gap-1.5">
          <ArrowLeft size={14} /> Editar respuestas
        </button>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleDownload("pdf")} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
            <Download size={14} /> {busy ? "Generando…" : "Descargar PDF"}
          </button>
          <button onClick={() => handleDownload("docx")} disabled={busy} className="chip inline-flex items-center gap-1.5">
            <Download size={14} /> Descargar Word
          </button>
          <button onClick={startOver} className="chip inline-flex items-center gap-1.5">
            <RotateCcw size={14} /> Empezar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
}
