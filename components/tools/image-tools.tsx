"use client";

import { useRef, useState } from "react";
import { downloadFile, formatBytes } from "@/lib/utils";
import { StatusBanner } from "@/components/tools/tool-shell";
import { FileDropZone, FileListRow } from "@/components/tools/file-drop-zone";

type Tab = "comprimir" | "redimensionar" | "recortar" | "convertir" | "fondo";

const TABS: { id: Tab; label: string }[] = [
  { id: "comprimir", label: "Comprimir" },
  { id: "redimensionar", label: "Redimensionar" },
  { id: "recortar", label: "Recortar" },
  { id: "convertir", label: "Convertir formato" },
  { id: "fondo", label: "Quitar fondo (IA)" }
];

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
}

const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0"
};

// ---------------------------------------------------------------------------
// Comprimir
// ---------------------------------------------------------------------------
function CompressImage() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.75);
  const [format, setFormat] = useState<"image/jpeg" | "image/webp">("image/jpeg");
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function compress() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const img = await loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      if (format === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, format, quality);
      if (!blob) throw new Error("sin resultado");
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch {
      setError("No se pudo comprimir esta imagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <FileDropZone accept="image/jpeg,image/png,image/webp" onFiles={(f) => f[0] && setFile(f[0])} hint="JPG, PNG o WEBP" />
      {file && (
        <ul>
          <FileListRow file={file} onRemove={() => setFile(null)} />
        </ul>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Calidad: {Math.round(quality * 100)}%</label>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="mt-2 block w-full accent-signal-violet"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Formato de salida</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as typeof format)}
            className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
          >
            <option value="image/jpeg">JPG</option>
            <option value="image/webp">WEBP</option>
          </select>
        </div>
      </div>

      {error && <StatusBanner kind="error">{error}</StatusBanner>}
      <button
        onClick={compress}
        disabled={!file || busy}
        className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Comprimiendo…" : "Comprimir imagen"}
      </button>

      {resultUrl && file && (
        <div className="flex flex-col items-center gap-3 rounded-xl2 border border-ink-950/8 p-4 dark:border-white/8">
          {/* eslint-disable-next-line @next/next/no-img-element -- object URL preview */}
          <img src={resultUrl} alt="Resultado comprimido" className="max-h-64 rounded-lg" />
          <p className="text-sm text-ink-950/60 dark:text-white/60">
            {formatBytes(file.size)} → <span className="font-semibold text-emerald-500">{formatBytes(resultSize)}</span>{" "}
            ({Math.round((1 - resultSize / file.size) * 100)}% menos)
          </p>
          <button onClick={() => downloadFile(resultUrl, `comprimida.${format === "image/jpeg" ? "jpg" : "webp"}`)} className="chip">
            Descargar
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Redimensionar
// ---------------------------------------------------------------------------
function ResizeImage() {
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState<{ w: number; h: number } | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [lockAspect, setLockAspect] = useState(true);
  const [resultUrl, setResultUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(f: File) {
    setFile(f);
    setResultUrl("");
    const img = await loadImage(f);
    setOriginal({ w: img.naturalWidth, h: img.naturalHeight });
    setWidth(img.naturalWidth);
    setHeight(img.naturalHeight);
  }

  function updateWidth(value: number) {
    setWidth(value);
    if (lockAspect && original) setHeight(Math.round((value / original.w) * original.h));
  }

  function updateHeight(value: number) {
    setHeight(value);
    if (lockAspect && original) setWidth(Math.round((value / original.h) * original.w));
  }

  async function resize() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const img = await loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      const blob = await canvasToBlob(canvas, file.type === "image/png" ? "image/png" : "image/jpeg", 0.92);
      if (!blob) throw new Error("sin resultado");
      setResultUrl(URL.createObjectURL(blob));
    } catch {
      setError("No se pudo redimensionar esta imagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <FileDropZone accept="image/jpeg,image/png,image/webp" onFiles={(f) => f[0] && handleFile(f[0])} hint="JPG, PNG o WEBP" />
      {file && (
        <ul>
          <FileListRow file={file} onRemove={() => setFile(null)} />
        </ul>
      )}

      {original && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Ancho (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => updateWidth(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Alto (px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => updateHeight(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} className="accent-signal-violet" />
            Mantener proporción original ({original.w}×{original.h})
          </label>
        </div>
      )}

      {error && <StatusBanner kind="error">{error}</StatusBanner>}
      <button
        onClick={resize}
        disabled={!file || busy}
        className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Redimensionando…" : "Redimensionar"}
      </button>

      {resultUrl && (
        <div className="flex flex-col items-center gap-3 rounded-xl2 border border-ink-950/8 p-4 dark:border-white/8">
          {/* eslint-disable-next-line @next/next/no-img-element -- object URL preview */}
          <img src={resultUrl} alt="Resultado redimensionado" className="max-h-64 rounded-lg" />
          <button onClick={() => downloadFile(resultUrl, "redimensionada.jpg")} className="chip">
            Descargar
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recortar
// ---------------------------------------------------------------------------
function CropImage() {
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [selection, setSelection] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  async function handleFile(f: File) {
    setFile(f);
    setResultUrl("");
    setSelection(null);
    const img = await loadImage(f);
    setImgEl(img);
  }

  function pointerPos(e: React.PointerEvent) {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(e.clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(e.clientY - rect.top, rect.height))
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    const pos = pointerPos(e);
    setDragStart(pos);
    setSelection({ x: pos.x, y: pos.y, w: 0, h: 0 });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragStart) return;
    const pos = pointerPos(e);
    setSelection({
      x: Math.min(dragStart.x, pos.x),
      y: Math.min(dragStart.y, pos.y),
      w: Math.abs(pos.x - dragStart.x),
      h: Math.abs(pos.y - dragStart.y)
    });
  }

  function onPointerUp() {
    setDragStart(null);
  }

  async function crop() {
    if (!file || !imgEl || !selection || selection.w < 5 || selection.h < 5) {
      setError("Dibujá un área de recorte arrastrando sobre la imagen.");
      return;
    }
    setError("");
    const scaleX = imgEl.naturalWidth / displaySize.w;
    const scaleY = imgEl.naturalHeight / displaySize.h;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(selection.w * scaleX);
    canvas.height = Math.round(selection.h * scaleY);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      imgEl,
      selection.x * scaleX,
      selection.y * scaleY,
      selection.w * scaleX,
      selection.h * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    const blob = await canvasToBlob(canvas, file.type === "image/png" ? "image/png" : "image/jpeg", 0.92);
    if (blob) setResultUrl(URL.createObjectURL(blob));
  }

  return (
    <div className="space-y-4">
      <FileDropZone accept="image/jpeg,image/png,image/webp" onFiles={(f) => f[0] && handleFile(f[0])} hint="JPG, PNG o WEBP" />
      {file && (
        <ul>
          <FileListRow file={file} onRemove={() => setFile(null)} />
        </ul>
      )}

      {imgEl && (
        <div>
          <p className="mb-2 text-xs text-ink-950/50 dark:text-white/50">Arrastrá sobre la imagen para marcar el área a recortar.</p>
          <div
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="relative inline-block max-w-full touch-none select-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- needs pixel-accurate ref for crop math */}
            <img
              src={imgEl.src}
              alt="Imagen a recortar"
              draggable={false}
              onLoad={(e) => setDisplaySize({ w: e.currentTarget.clientWidth, h: e.currentTarget.clientHeight })}
              className="max-h-[420px] max-w-full rounded-lg"
            />
            {selection && (
              <div
                className="absolute border-2 border-signal-violet bg-signal-violet/15"
                style={{ left: selection.x, top: selection.y, width: selection.w, height: selection.h }}
              />
            )}
          </div>
        </div>
      )}

      {error && <StatusBanner kind="error">{error}</StatusBanner>}
      <button
        onClick={crop}
        disabled={!file}
        className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Recortar
      </button>

      {resultUrl && (
        <div className="flex flex-col items-center gap-3 rounded-xl2 border border-ink-950/8 p-4 dark:border-white/8">
          {/* eslint-disable-next-line @next/next/no-img-element -- object URL preview */}
          <img src={resultUrl} alt="Resultado recortado" className="max-h-64 rounded-lg" />
          <button onClick={() => downloadFile(resultUrl, "recortada.jpg")} className="chip">
            Descargar
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Convertir formato
// ---------------------------------------------------------------------------
function ConvertFormat() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<"image/jpeg" | "image/png" | "image/webp">("image/png");
  const [resultUrl, setResultUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function convert() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const img = await loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      if (target === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, target, 0.95);
      if (!blob) throw new Error("sin resultado");
      setResultUrl(URL.createObjectURL(blob));
    } catch {
      setError("No se pudo convertir esta imagen a ese formato.");
    } finally {
      setBusy(false);
    }
  }

  const extension = target === "image/jpeg" ? "jpg" : target === "image/png" ? "png" : "webp";

  return (
    <div className="space-y-4">
      <FileDropZone accept="image/*" onFiles={(f) => f[0] && setFile(f[0])} hint="JPG, PNG o WEBP" />
      {file && (
        <ul>
          <FileListRow file={file} onRemove={() => setFile(null)} />
        </ul>
      )}

      <div>
        <label className="text-sm font-medium">Convertir a</label>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value as typeof target)}
          className="mt-1.5 w-full max-w-xs rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
        >
          <option value="image/png">PNG</option>
          <option value="image/jpeg">JPG</option>
          <option value="image/webp">WEBP</option>
        </select>
      </div>
      <p className="text-xs text-ink-950/45 dark:text-white/45">
        SVG e ICO no están disponibles todavía: son formatos vectoriales/multi-resolución que necesitan un motor
        aparte para convertirse con calidad, no una simple re-codificación de canvas.
      </p>

      {error && <StatusBanner kind="error">{error}</StatusBanner>}
      <button
        onClick={convert}
        disabled={!file || busy}
        className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Convirtiendo…" : "Convertir"}
      </button>

      {resultUrl && (
        <div className="flex flex-col items-center gap-3 rounded-xl2 border border-ink-950/8 p-4 dark:border-white/8">
          {/* eslint-disable-next-line @next/next/no-img-element -- object URL preview */}
          <img src={resultUrl} alt="Resultado convertido" className="max-h-64 rounded-lg" />
          <button onClick={() => downloadFile(resultUrl, `convertida.${extension}`)} className="chip">
            Descargar .{extension}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quitar fondo (IA) — runs a real segmentation model in the browser
// ---------------------------------------------------------------------------
function RemoveBackground() {
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  async function removeBg() {
    if (!file) return;
    setBusy(true);
    setError("");
    setProgress("Descargando modelo de IA (solo la primera vez)…");
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          if (total > 0) setProgress(`Procesando… ${Math.round((current / total) * 100)}%`);
        }
      });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Error al quitar el fondo:", err);
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("Failed to fetch")) {
        setError(
          "No se pudo descargar el modelo de IA. Esto casi siempre lo causa un bloqueador de anuncios o una extensión de privacidad (uBlock, Brave Shield, etc.) bloqueando staticimgly.com. Probá desactivarla para este sitio o abrir la página en una ventana de incógnito, y volvé a intentar."
        );
      } else {
        setError(
          "No se pudo quitar el fondo. Esta función descarga un modelo de IA (~40 MB) la primera vez — revisá tu conexión e intentá de nuevo."
        );
      }
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <div className="space-y-4">
      <FileDropZone accept="image/jpeg,image/png,image/webp" onFiles={(f) => f[0] && setFile(f[0])} hint="JPG, PNG o WEBP — funciona mejor con un sujeto claro en primer plano" />
      {file && (
        <ul>
          <FileListRow file={file} onRemove={() => setFile(null)} />
        </ul>
      )}
      <p className="text-xs text-ink-950/45 dark:text-white/45">
        Esta herramienta corre un modelo de IA de segmentación directamente en tu navegador — la imagen nunca se
        sube a un servidor. La primera vez descarga el modelo (~40 MB), así que puede tardar un poco; después queda
        en caché y es más rápido. Si tenés un bloqueador de anuncios o una extensión de privacidad, puede que
        necesites desactivarla para este sitio para que el modelo se descargue.
      </p>

      {error && <StatusBanner kind="error">{error}</StatusBanner>}
      <button
        onClick={removeBg}
        disabled={!file || busy}
        className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? progress || "Procesando…" : "Quitar fondo"}
      </button>

      {resultUrl && (
        <div className="flex flex-col items-center gap-3 rounded-xl2 border border-ink-950/8 p-4 dark:border-white/8">
          <div style={CHECKERBOARD_STYLE} className="rounded-lg p-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- object URL preview */}
            <img src={resultUrl} alt="Resultado sin fondo" className="max-h-64 rounded-lg" />
          </div>
          <button onClick={() => downloadFile(resultUrl, "sin-fondo.png")} className="chip">
            Descargar PNG
          </button>
        </div>
      )}
    </div>
  );
}

export function ImageTools() {
  const [tab, setTab] = useState<Tab>("comprimir");

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
        {tab === "comprimir" && <CompressImage />}
        {tab === "redimensionar" && <ResizeImage />}
        {tab === "recortar" && <CropImage />}
        {tab === "convertir" && <ConvertFormat />}
        {tab === "fondo" && <RemoveBackground />}
      </div>

      <p className="mt-8 text-xs text-ink-950/40 dark:text-white/40">
        Todo se procesa en tu navegador, incluida la IA de quitar fondo: nada se sube a un servidor. Mejorar calidad
        con IA (super-resolución) y eliminar objetos todavía están en construcción — son modelos más pesados que
        necesitan más validación antes de ofrecerlos como herramientas confiables.
      </p>
    </div>
  );
}
