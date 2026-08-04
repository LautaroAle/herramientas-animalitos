"use client";

import { useRef, useState } from "react";
import { downloadFile, dataUrlToUint8Array } from "@/lib/utils";
import { StatusBanner } from "@/components/tools/tool-shell";
import { FileDropZone, FileListRow } from "@/components/tools/file-drop-zone";
import { SignaturePad } from "@/components/tools/signature-pad";

type Tab = "imagen-a-pdf" | "pdf-a-jpg" | "word-a-pdf" | "unir-pdf" | "firmar-pdf";

const TABS: { id: Tab; label: string }[] = [
  { id: "imagen-a-pdf", label: "Imagen → PDF" },
  { id: "pdf-a-jpg", label: "PDF → JPG" },
  { id: "word-a-pdf", label: "Word → PDF" },
  { id: "unir-pdf", label: "Unir PDFs" },
  { id: "firmar-pdf", label: "Firmar PDF" }
];

// ---------------------------------------------------------------------------
// Imagen(es) → PDF
// ---------------------------------------------------------------------------
function ImageToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function convert() {
    setBusy(true);
    setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const isPng = file.type === "image/png";
        const image = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      const bytes = await pdfDoc.save();
      downloadFile(new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }), "imagenes.pdf");
    } catch {
      setError("No se pudo generar el PDF. Verificá que las imágenes sean JPG o PNG.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <FileDropZone accept="image/jpeg,image/png" multiple onFiles={(f) => setFiles((prev) => [...prev, ...f])} hint="JPG o PNG — una página por imagen, en el orden que las agregues" />
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <FileListRow key={i} file={file} onRemove={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} />
          ))}
        </ul>
      )}
      {error && <StatusBanner kind="error">{error}</StatusBanner>}
      <button
        onClick={convert}
        disabled={files.length === 0 || busy}
        className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Generando PDF…" : `Convertir ${files.length || ""} imagen${files.length === 1 ? "" : "es"} a PDF`}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF → JPG
// ---------------------------------------------------------------------------
function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pages, setPages] = useState<{ url: string; index: number }[]>([]);

  async function convert() {
    if (!file) return;
    setBusy(true);
    setError("");
    setPages([]);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

      const bytes = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const results: { url: string; index: number }[] = [];

      for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
        const page = await doc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");
        if (!context) continue;
        await page.render({ canvasContext: context, viewport }).promise;
        results.push({ url: canvas.toDataURL("image/jpeg", 0.92), index: pageNumber });
      }
      setPages(results);
    } catch {
      setError("No se pudo leer este PDF. Verificá que el archivo no esté dañado o protegido con contraseña.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <FileDropZone accept="application/pdf" onFiles={(f) => f[0] && setFile(f[0])} hint="Un archivo PDF — se exporta una imagen JPG por página" />
      {file && (
        <ul>
          <FileListRow file={file} onRemove={() => setFile(null)} />
        </ul>
      )}
      {error && <StatusBanner kind="error">{error}</StatusBanner>}
      <button
        onClick={convert}
        disabled={!file || busy}
        className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Convirtiendo…" : "Convertir a JPG"}
      </button>

      {pages.length > 0 && (
        <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3">
          {pages.map((page) => (
            <div key={page.index} className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- data: URL thumbnail, no next/image optimization applies */}
              <img src={page.url} alt={`Página ${page.index}`} className="w-full rounded-lg border border-ink-950/10 dark:border-white/10" />
              <button
                onClick={() => downloadFile(page.url, `pagina-${page.index}.jpg`)}
                className="chip w-full text-center"
              >
                Descargar página {page.index}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Word (.docx) → PDF
// ---------------------------------------------------------------------------
function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function convert() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const mammoth = await import("mammoth");
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });

      const container = document.createElement("div");
      container.style.padding = "32px";
      container.style.fontFamily = "Georgia, serif";
      container.style.fontSize = "14px";
      container.style.lineHeight = "1.6";
      container.innerHTML = html;
      document.body.appendChild(container);

      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({ margin: 10, filename: file.name.replace(/\.docx$/i, ".pdf"), image: { type: "jpeg", quality: 0.95 } })
        .from(container)
        .save();

      document.body.removeChild(container);
    } catch {
      setError("No se pudo convertir este documento. Verificá que sea un archivo .docx válido.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <FileDropZone accept=".docx" onFiles={(f) => f[0] && setFile(f[0])} hint="Un archivo Word (.docx)" />
      {file && (
        <ul>
          <FileListRow file={file} onRemove={() => setFile(null)} />
        </ul>
      )}
      <p className="text-xs text-ink-950/45 dark:text-white/45">
        Convierte el texto, títulos, listas e imágenes del documento. El diseño exacto de páginas complejas (columnas,
        tablas muy elaboradas) puede variar respecto al original.
      </p>
      {error && <StatusBanner kind="error">{error}</StatusBanner>}
      <button
        onClick={convert}
        disabled={!file || busy}
        className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Convirtiendo…" : "Convertir a PDF"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Unir PDFs
// ---------------------------------------------------------------------------
function MergePdfs() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function merge() {
    setBusy(true);
    setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const donor = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(donor, donor.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const bytes = await mergedPdf.save();
      downloadFile(new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }), "pdf-unido.pdf");
    } catch {
      setError("No se pudieron unir estos PDF. Verificá que ningún archivo esté dañado o protegido con contraseña.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <FileDropZone accept="application/pdf" multiple onFiles={(f) => setFiles((prev) => [...prev, ...f])} hint="Dos o más PDF — se combinan en el orden en que los agregues" />
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <FileListRow key={i} file={file} onRemove={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} />
          ))}
        </ul>
      )}
      {error && <StatusBanner kind="error">{error}</StatusBanner>}
      <button
        onClick={merge}
        disabled={files.length < 2 || busy}
        className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Uniendo…" : "Unir PDFs"}
      </button>
    </div>
  );
}

// Matches the signature pad's actual canvas dimensions (480x180) — used to
// estimate the stamp's on-screen height from its width before the real
// embedded image is available. The PDF export itself uses the real
// embedded image's aspect ratio, so this only affects the drag preview.
const SIGNATURE_ASPECT_RATIO = 480 / 180;

// ---------------------------------------------------------------------------
// Firmar PDF con firma manuscrita
// ---------------------------------------------------------------------------
function SignPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pagePreviewUrl, setPagePreviewUrl] = useState("");
  const [pageDisplaySize, setPageDisplaySize] = useState({ w: 0, h: 0 });
  const [pagePointSize, setPagePointSize] = useState({ w: 0, h: 0 });
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [stampWidth, setStampWidth] = useState(160);
  const [stampPos, setStampPos] = useState({ x: 40, y: 40 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  async function handleFile(f: File) {
    setFile(f);
    setError("");
    setBusy(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const bytes = await f.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      setPageCount(doc.numPages);
      await renderPage(doc, 1);
    } catch {
      setError("No se pudo leer este PDF.");
    } finally {
      setBusy(false);
    }
  }

  async function renderPage(doc: import("pdfjs-dist").PDFDocumentProxy, pageNum: number) {
    const page = await doc.getPage(pageNum);
    const baseViewport = page.getViewport({ scale: 1 });
    setPagePointSize({ w: baseViewport.width, h: baseViewport.height });

    const displayScale = Math.min(560 / baseViewport.width, 1.4);
    const viewport = page.getViewport({ scale: displayScale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d")!;
    await page.render({ canvasContext: context, viewport }).promise;
    setPagePreviewUrl(canvas.toDataURL("image/png"));
    setPageDisplaySize({ w: viewport.width, h: viewport.height });
    setStampPos({ x: 24, y: viewport.height - 24 - stampWidth / SIGNATURE_ASPECT_RATIO });
  }

  async function changePage(num: number) {
    if (!file || num < 1 || num > pageCount) return;
    setPageNumber(num);
    setBusy(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const bytes = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      await renderPage(doc, num);
    } finally {
      setBusy(false);
    }
  }

  function onStampPointerDown(e: React.PointerEvent) {
    const rect = previewRef.current!.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left - stampPos.x, y: e.clientY - rect.top - stampPos.y });
    setDragging(true);
  }

  function onPreviewPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const rect = previewRef.current!.getBoundingClientRect();
    const stampHeight = stampWidth / SIGNATURE_ASPECT_RATIO;
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, pageDisplaySize.w - stampWidth));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, pageDisplaySize.h - stampHeight));
    setStampPos({ x, y });
  }

  async function applySignature() {
    if (!file || !signatureDataUrl) {
      setError("Dibujá tu firma antes de aplicarla.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
      const page = pdfDoc.getPage(pageNumber - 1);
      const signatureBytes = dataUrlToUint8Array(signatureDataUrl);
      const signatureImage = await pdfDoc.embedPng(signatureBytes);

      const scaleFactor = pagePointSize.w / pageDisplaySize.w;
      const stampWidthPt = stampWidth * scaleFactor;
      const stampHeightPt = (stampWidth / (signatureImage.width / signatureImage.height)) * scaleFactor;
      const xPt = stampPos.x * scaleFactor;
      const yPt = pagePointSize.h - (stampPos.y + stampWidth / SIGNATURE_ASPECT_RATIO) * scaleFactor;

      page.drawImage(signatureImage, { x: xPt, y: yPt, width: stampWidthPt, height: stampHeightPt });

      const bytes = await pdfDoc.save();
      downloadFile(new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }), "documento-firmado.pdf");
    } catch (err) {
      console.error("Error al firmar el PDF:", err);
      setError("No se pudo aplicar la firma a este PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <FileDropZone accept="application/pdf" onFiles={(f) => f[0] && handleFile(f[0])} hint="Un archivo PDF" />
      {file && (
        <ul>
          <FileListRow file={file} onRemove={() => { setFile(null); setPagePreviewUrl(""); }} />
        </ul>
      )}

      {pageCount > 1 && (
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="page-number">Página a firmar:</label>
          <input
            id="page-number"
            type="number"
            min={1}
            max={pageCount}
            value={pageNumber}
            onChange={(e) => changePage(Number(e.target.value))}
            className="w-20 rounded-lg border border-ink-950/15 bg-paper-50 px-2 py-1 dark:border-white/15 dark:bg-ink-950"
          />
          <span className="text-ink-950/45 dark:text-white/45">de {pageCount}</span>
        </div>
      )}

      <SignaturePad onChange={setSignatureDataUrl} />

      {pagePreviewUrl && (
        <div>
          <p className="mb-2 text-xs text-ink-950/50 dark:text-white/50">Arrastrá la firma hasta la posición deseada.</p>
          <div
            ref={previewRef}
            onPointerMove={onPreviewPointerMove}
            onPointerUp={() => setDragging(false)}
            className="relative inline-block touch-none select-none rounded-lg border border-ink-950/10 dark:border-white/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- pixel-accurate rendered page */}
            <img src={pagePreviewUrl} alt={`Página ${pageNumber}`} draggable={false} className="block" />
            {signatureDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- draggable overlay
              <img
                src={signatureDataUrl}
                alt="Tu firma"
                onPointerDown={onStampPointerDown}
                draggable={false}
                className="absolute cursor-move opacity-90"
                style={{ left: stampPos.x, top: stampPos.y, width: stampWidth }}
              />
            )}
          </div>
          <div className="mt-3 max-w-xs">
            <label className="text-sm font-medium">Tamaño de la firma</label>
            <input
              type="range"
              min={60}
              max={320}
              value={stampWidth}
              onChange={(e) => setStampWidth(Number(e.target.value))}
              className="mt-2 block w-full accent-signal-violet"
            />
          </div>
        </div>
      )}

      {error && <StatusBanner kind="error">{error}</StatusBanner>}
      <button
        onClick={applySignature}
        disabled={!file || !signatureDataUrl || busy}
        className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Procesando…" : "Firmar y descargar PDF"}
      </button>
    </div>
  );
}

export function PdfTools() {
  const [tab, setTab] = useState<Tab>("imagen-a-pdf");

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

      <div className="mt-6">
        {tab === "imagen-a-pdf" && <ImageToPdf />}
        {tab === "pdf-a-jpg" && <PdfToJpg />}
        {tab === "word-a-pdf" && <WordToPdf />}
        {tab === "unir-pdf" && <MergePdfs />}
        {tab === "firmar-pdf" && <SignPdf />}
      </div>

      <p className="mt-8 text-xs text-ink-950/40 dark:text-white/40">
        Todo se procesa en tu navegador: tus archivos nunca se suben a un servidor. Excel → PDF, PowerPoint → PDF y
        PDF → Word/Excel editable todavía están en construcción — requieren un motor de renderizado que preserve el
        formato original con fidelidad, algo que no puede hacerse bien solo en el navegador.
      </p>
    </div>
  );
}
