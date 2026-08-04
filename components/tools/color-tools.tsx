"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/action-buttons";

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return null;
  const [, r, g, b] = match;
  if (r === undefined || g === undefined || b === undefined) return null;
  return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  if (r === 0 && g === 0 && b === 0) return [0, 0, 0, 100];
  const rp = r / 255;
  const gp = g / 255;
  const bp = b / 255;
  const k = 1 - Math.max(rp, gp, bp);
  const c = (1 - rp - k) / (1 - k);
  const m = (1 - gp - k) / (1 - k);
  const y = (1 - bp - k) / (1 - k);
  return [Math.round(c * 100), Math.round(m * 100), Math.round(y * 100), Math.round(k * 100)];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(rgbA: [number, number, number], rgbB: [number, number, number]): number {
  const lumA = relativeLuminance(rgbA);
  const lumB = relativeLuminance(rgbB);
  const [lighter, darker] = lumA > lumB ? [lumA, lumB] : [lumB, lumA];
  return (lighter + 0.05) / (darker + 0.05);
}

function buildPalette(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  const [h, s] = rgbToHsl(...rgb);
  const lightnesses = [90, 75, 60, 45, 30, 15];
  return lightnesses.map((l) => hslToHex(h, s, l));
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex(255 * f(0), 255 * f(8), 255 * f(4));
}

type Tab = "convertir" | "paleta" | "contraste";
const TABS: { id: Tab; label: string }[] = [
  { id: "convertir", label: "Convertir" },
  { id: "paleta", label: "Paleta" },
  { id: "contraste", label: "Contraste" }
];

export function ColorTools() {
  const [tab, setTab] = useState<Tab>("convertir");
  const [hex, setHex] = useState("#5B4CF5");
  const [foreground, setForeground] = useState("#0A0B10");
  const [background, setBackground] = useState("#FAFAFC");

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => (rgb ? rgbToHsl(...rgb) : null), [rgb]);
  const cmyk = useMemo(() => (rgb ? rgbToCmyk(...rgb) : null), [rgb]);
  const palette = useMemo(() => buildPalette(hex), [hex]);

  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  const ratio = fgRgb && bgRgb ? contrastRatio(fgRgb, bgRgb) : null;

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

      {tab === "convertir" && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={rgb ? hex : "#5B4CF5"}
              onChange={(e) => setHex(e.target.value)}
              className="h-16 w-16 cursor-pointer rounded-xl2 border border-ink-950/15 dark:border-white/15"
            />
            <input
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="flex-1 rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 font-mono text-sm dark:border-white/15 dark:bg-ink-950"
            />
          </div>

          {!rgb && <p className="text-sm text-red-500 md:col-span-2">Ingresá un color HEX válido, por ejemplo #5B4CF5.</p>}

          {rgb && hsl && cmyk && (
            <div className="space-y-2 md:col-span-2">
              {[
                { label: "HEX", value: hex.toUpperCase() },
                { label: "RGB", value: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` },
                { label: "HSL", value: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` },
                { label: "CMYK", value: `cmyk(${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${cmyk[3]}%)` }
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2 rounded-lg border border-ink-950/8 p-3 dark:border-white/8">
                  <span className="w-14 text-xs font-semibold uppercase text-ink-950/50 dark:text-white/50">{row.label}</span>
                  <code className="flex-1 font-mono text-sm">{row.value}</code>
                  <CopyButton value={row.value} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "paleta" && (
        <div className="mt-6">
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="h-14 w-14 cursor-pointer rounded-xl2 border border-ink-950/15 dark:border-white/15"
          />
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {palette.map((color) => (
              <button
                key={color}
                onClick={() => navigator.clipboard.writeText(color)}
                className="group flex flex-col items-center gap-2"
                title={`Copiar ${color}`}
              >
                <span
                  className="h-16 w-full rounded-lg border border-ink-950/10 transition-transform group-hover:scale-105 dark:border-white/10"
                  style={{ backgroundColor: color }}
                />
                <code className="text-xs">{color}</code>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "contraste" && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Color de texto</label>
              <div className="mt-1.5 flex items-center gap-2">
                <input type="color" value={foreground} onChange={(e) => setForeground(e.target.value)} className="h-10 w-10 cursor-pointer rounded-lg" />
                <input
                  value={foreground}
                  onChange={(e) => setForeground(e.target.value)}
                  className="flex-1 rounded-lg border border-ink-950/15 bg-paper-50 px-3 py-2 font-mono text-sm dark:border-white/15 dark:bg-ink-950"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Color de fondo</label>
              <div className="mt-1.5 flex items-center gap-2">
                <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="h-10 w-10 cursor-pointer rounded-lg" />
                <input
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="flex-1 rounded-lg border border-ink-950/15 bg-paper-50 px-3 py-2 font-mono text-sm dark:border-white/15 dark:bg-ink-950"
                />
              </div>
            </div>
          </div>

          <div
            className="flex h-32 items-center justify-center rounded-xl2 border border-ink-950/10 text-lg font-semibold dark:border-white/10"
            style={{ backgroundColor: background, color: foreground }}
          >
            Texto de ejemplo
          </div>

          {ratio !== null && (
            <div className="rounded-lg border border-ink-950/8 p-4 dark:border-white/8">
              <p className="font-display text-2xl font-semibold">{ratio.toFixed(2)}:1</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li className={ratio >= 4.5 ? "text-emerald-500" : "text-red-500"}>
                  {ratio >= 4.5 ? "✓" : "✕"} WCAG AA para texto normal (mínimo 4.5:1)
                </li>
                <li className={ratio >= 3 ? "text-emerald-500" : "text-red-500"}>
                  {ratio >= 3 ? "✓" : "✕"} WCAG AA para texto grande (mínimo 3:1)
                </li>
                <li className={ratio >= 7 ? "text-emerald-500" : "text-red-500"}>
                  {ratio >= 7 ? "✓" : "✕"} WCAG AAA para texto normal (mínimo 7:1)
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
