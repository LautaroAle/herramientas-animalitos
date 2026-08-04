"use client";

import { useState } from "react";
import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { FileDropZone, FileListRow } from "@/components/tools/file-drop-zone";
import { StatusBanner } from "@/components/tools/tool-shell";
import { downloadFile, formatBytes } from "@/lib/utils";

type Tab = "comprimir" | "gif";
const TABS: { id: Tab; label: string }[] = [
  { id: "comprimir", label: "Comprimir video" },
  { id: "gif", label: "Video → GIF" }
];

const CORE_VERSION = "0.12.10";
const CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

let ffmpegSingleton: Promise<FFmpeg> | null = null;

/** Loads the ffmpeg.wasm engine once per session and reuses it across tabs/conversions. */
function getFFmpeg(onLog?: (message: string) => void): Promise<FFmpeg> {
  if (!ffmpegSingleton) {
    ffmpegSingleton = (async () => {
      const { FFmpeg: FFmpegClass } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const instance = new FFmpegClass();
      instance.on("log", ({ message }) => onLog?.(message));
      await instance.load({
        coreURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm")
      });
      return instance;
    })();
  }
  return ffmpegSingleton;
}

const QUALITY_PRESETS = [
  { id: "alta", label: "Alta calidad", crf: 20 },
  { id: "equilibrada", label: "Equilibrada", crf: 26 },
  { id: "maxima", label: "Máxima compresión", crf: 32 }
] as const;

const RESOLUTION_CAPS = [
  { id: "original", label: "Original", height: null },
  { id: "1080", label: "1080p", height: 1080 },
  { id: "720", label: "720p", height: 720 },
  { id: "480", label: "480p", height: 480 }
] as const;

function CompressVideo() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<(typeof QUALITY_PRESETS)[number]["id"]>("equilibrada");
  const [resolution, setResolution] = useState<(typeof RESOLUTION_CAPS)[number]["id"]>("720");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);

  async function compress() {
    if (!file) return;
    setBusy(true);
    setError("");
    setResultUrl("");
    setProgress(0);
    setPhase("Cargando el motor de video (solo la primera vez)…");
    try {
      const { fetchFile } = await import("@ffmpeg/util");
      const ffmpeg = await getFFmpeg();
      ffmpeg.on("progress", ({ progress: p }) => setProgress(Math.min(100, Math.round(p * 100))));

      setPhase("Procesando…");
      await ffmpeg.writeFile("input", await fetchFile(file));

      const crf = QUALITY_PRESETS.find((q) => q.id === quality)!.crf;
      const cap = RESOLUTION_CAPS.find((r) => r.id === resolution)!.height;
      const scaleFilter = cap ? ["-vf", `scale=-2:'min(${cap},ih)'`] : [];

      await ffmpeg.exec([
        "-i", "input",
        ...scaleFilter,
        "-c:v", "libx264",
        "-crf", String(crf),
        "-preset", "veryfast",
        "-c:a", "aac",
        "-b:a", "128k",
        "output.mp4"
      ]);

      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data as unknown as BlobPart], { type: "video/mp4" });
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch {
      setError("No se pudo comprimir este video. Probá con un archivo más liviano o en formato MP4.");
    } finally {
      setBusy(false);
      setPhase("");
    }
  }

  return (
    <div className="space-y-4">
      <FileDropZone accept="video/mp4,video/quicktime,video/webm" onFiles={(f) => f[0] && setFile(f[0])} hint="MP4, MOV o WEBM" />
      {file && (
        <ul>
          <FileListRow file={file} onRemove={() => { setFile(null); setResultUrl(""); }} />
        </ul>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Calidad</label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as typeof quality)}
            className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
          >
            {QUALITY_PRESETS.map((q) => (
              <option key={q.id} value={q.id}>{q.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Resolución máxima</label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as typeof resolution)}
            className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
          >
            {RESOLUTION_CAPS.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <StatusBanner kind="error">{error}</StatusBanner>}
      <button
        onClick={compress}
        disabled={!file || busy}
        className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Comprimiendo…" : "Comprimir video"}
      </button>

      {busy && (
        <div>
          <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-ink-950/10 dark:bg-white/10">
            <div className="h-full bg-signal-gradient transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-ink-950/50 dark:text-white/50">{phase} {progress > 0 ? `${progress}%` : ""}</p>
        </div>
      )}

      {resultUrl && file && (
        <div className="flex flex-col items-center gap-3 rounded-xl2 border border-ink-950/8 p-4 dark:border-white/8">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- user-generated content preview, no captions available */}
          <video src={resultUrl} controls className="max-h-72 rounded-lg" />
          <p className="text-sm text-ink-950/60 dark:text-white/60">
            {formatBytes(file.size)} → <span className="font-semibold text-emerald-500">{formatBytes(resultSize)}</span>{" "}
            ({Math.round((1 - resultSize / file.size) * 100)}% menos)
          </p>
          <button onClick={() => downloadFile(resultUrl, "video-comprimido.mp4")} className="chip">
            Descargar MP4
          </button>
        </div>
      )}
    </div>
  );
}

function VideoToGif() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(480);
  const [fps, setFps] = useState(10);
  const [duration, setDuration] = useState(4);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);

  async function convert() {
    if (!file) return;
    setBusy(true);
    setError("");
    setResultUrl("");
    setProgress(0);
    setPhase("Cargando el motor de video (solo la primera vez)…");
    try {
      const { fetchFile } = await import("@ffmpeg/util");
      const ffmpeg = await getFFmpeg();
      ffmpeg.on("progress", ({ progress: p }) => setProgress(Math.min(100, Math.round(p * 100))));

      setPhase("Generando GIF…");
      await ffmpeg.writeFile("input", await fetchFile(file));
      await ffmpeg.exec([
        "-i", "input",
        "-t", String(duration),
        "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos`,
        "output.gif"
      ]);

      const data = await ffmpeg.readFile("output.gif");
      const blob = new Blob([data as unknown as BlobPart], { type: "image/gif" });
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch {
      setError("No se pudo generar el GIF. Probá con un video más corto o en formato MP4.");
    } finally {
      setBusy(false);
      setPhase("");
    }
  }

  return (
    <div className="space-y-4">
      <FileDropZone accept="video/mp4,video/quicktime,video/webm" onFiles={(f) => f[0] && setFile(f[0])} hint="MP4, MOV o WEBM — se toman los primeros segundos del video" />
      {file && (
        <ul>
          <FileListRow file={file} onRemove={() => { setFile(null); setResultUrl(""); }} />
        </ul>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Ancho (px)</label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Cuadros por segundo</label>
          <input
            type="number"
            min={5}
            max={24}
            value={fps}
            onChange={(e) => setFps(Number(e.target.value))}
            className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Duración (segundos)</label>
          <input
            type="number"
            min={1}
            max={15}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
          />
        </div>
      </div>
      <p className="text-xs text-ink-950/45 dark:text-white/45">
        Se toma desde el inicio del video. Duraciones más largas o anchos más grandes generan GIFs pesados.
      </p>

      {error && <StatusBanner kind="error">{error}</StatusBanner>}
      <button
        onClick={convert}
        disabled={!file || busy}
        className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Generando…" : "Convertir a GIF"}
      </button>

      {busy && (
        <div>
          <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-ink-950/10 dark:bg-white/10">
            <div className="h-full bg-signal-gradient transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-ink-950/50 dark:text-white/50">{phase} {progress > 0 ? `${progress}%` : ""}</p>
        </div>
      )}

      {resultUrl && (
        <div className="flex flex-col items-center gap-3 rounded-xl2 border border-ink-950/8 p-4 dark:border-white/8">
          {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF preview */}
          <img src={resultUrl} alt="GIF generado" className="max-h-72 rounded-lg" />
          <p className="text-sm text-ink-950/60 dark:text-white/60">{formatBytes(resultSize)}</p>
          <button onClick={() => downloadFile(resultUrl, "animacion.gif")} className="chip">
            Descargar GIF
          </button>
        </div>
      )}
    </div>
  );
}

export function VideoTools() {
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
        {tab === "comprimir" && <CompressVideo />}
        {tab === "gif" && <VideoToGif />}
      </div>

      <p className="mt-8 text-xs text-ink-950/40 dark:text-white/40">
        El procesamiento corre en tu navegador con WebAssembly (ffmpeg.wasm): tu video nunca se sube a un servidor.
        La primera conversión descarga el motor (~30 MB) y puede tardar; los videos largos o en alta resolución
        pueden ser lentos según la potencia de tu dispositivo.
      </p>
    </div>
  );
}
