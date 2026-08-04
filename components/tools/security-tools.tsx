"use client";

import { useMemo, useState } from "react";
import CryptoJS from "crypto-js";
import { CopyButton } from "@/components/tools/action-buttons";

type Tab = "contrasenas" | "hash" | "uuid";
const TABS: { id: Tab; label: string }[] = [
  { id: "contrasenas", label: "Contraseñas" },
  { id: "hash", label: "Hash (MD5 / SHA-1 / SHA-256)" },
  { id: "uuid", label: "UUID y tokens" }
];

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

function generatePassword(length: number, useUpper: boolean, useLower: boolean, useDigits: boolean, useSymbols: boolean) {
  const pool = [useUpper && UPPER, useLower && LOWER, useDigits && DIGITS, useSymbols && SYMBOLS].filter(Boolean).join("");
  if (!pool) return "";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (v) => pool[v % pool.length]).join("");
}

function analyzeStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Muy débil", color: "bg-red-500" },
    { label: "Débil", color: "bg-orange-500" },
    { label: "Aceptable", color: "bg-yellow-500" },
    { label: "Fuerte", color: "bg-lime-500" },
    { label: "Muy fuerte", color: "bg-emerald-500" }
  ];
  const level = levels[Math.min(score, levels.length - 1)]!;
  return { score, ...level };
}

function randomToken(bytesLength: number, format: "hex" | "base64"): string {
  const bytes = new Uint8Array(bytesLength);
  crypto.getRandomValues(bytes);
  if (format === "hex") return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function SecurityTools() {
  const [tab, setTab] = useState<Tab>("contrasenas");

  // Password generator state
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState(() => generatePassword(16, true, true, true, true));
  const strength = useMemo(() => analyzeStrength(password), [password]);

  // Hash state
  const [hashInput, setHashInput] = useState("Escribí un texto para calcular su hash");
  const hashes = useMemo(
    () => ({
      md5: CryptoJS.MD5(hashInput).toString(),
      sha1: CryptoJS.SHA1(hashInput).toString(),
      sha256: CryptoJS.SHA256(hashInput).toString()
    }),
    [hashInput]
  );

  // UUID / token state
  const [uuid, setUuid] = useState(() => crypto.randomUUID());
  const [token, setToken] = useState(() => randomToken(32, "hex"));

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

      {tab === "contrasenas" && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-3 rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 font-mono text-lg dark:border-white/15 dark:bg-ink-950">
            <span className="flex-1 break-all">{password}</span>
            <CopyButton value={password} />
          </div>

          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-950/10 dark:bg-white/10">
              <div
                className={`h-full ${strength.color} transition-all`}
                style={{ width: `${(strength.score / 5) * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-sm font-medium">{strength.label}</p>
          </div>

          <div>
            <label htmlFor="length" className="text-sm font-medium">
              Longitud: {length}
            </label>
            <input
              id="length"
              type="range"
              min={6}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="mt-2 block w-full max-w-xs accent-signal-violet"
            />
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {[
              { label: "Mayúsculas (A-Z)", checked: useUpper, set: setUseUpper },
              { label: "Minúsculas (a-z)", checked: useLower, set: setUseLower },
              { label: "Números (0-9)", checked: useDigits, set: setUseDigits },
              { label: "Símbolos (!@#$…)", checked: useSymbols, set: setUseSymbols }
            ].map((opt) => (
              <label key={opt.label} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={opt.checked}
                  onChange={(e) => opt.set(e.target.checked)}
                  className="accent-signal-violet"
                />
                {opt.label}
              </label>
            ))}
          </div>

          <button
            onClick={() => setPassword(generatePassword(length, useUpper, useLower, useDigits, useSymbols))}
            className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white"
          >
            Generar nueva contraseña
          </button>
        </div>
      )}

      {tab === "hash" && (
        <div className="mt-6 space-y-4">
          <textarea
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            rows={4}
            className="w-full rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 font-mono text-sm outline-none focus-visible:border-signal-violet dark:border-white/15 dark:bg-ink-950"
          />
          {(["md5", "sha1", "sha256"] as const).map((algo) => (
            <div key={algo} className="rounded-lg border border-ink-950/8 p-3 dark:border-white/8">
              <p className="text-xs font-semibold uppercase text-ink-950/50 dark:text-white/50">{algo}</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 break-all font-mono text-sm">{hashes[algo]}</code>
                <CopyButton value={hashes[algo]} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "uuid" && (
        <div className="mt-6 space-y-6">
          <div>
            <p className="text-sm font-medium">UUID v4</p>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 font-mono text-sm dark:border-white/15 dark:bg-ink-950">
              <span className="flex-1 break-all">{uuid}</span>
              <CopyButton value={uuid} />
            </div>
            <button onClick={() => setUuid(crypto.randomUUID())} className="chip mt-2">
              Generar otro
            </button>
          </div>

          <div>
            <p className="text-sm font-medium">Token seguro (32 bytes, hex)</p>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 font-mono text-sm dark:border-white/15 dark:bg-ink-950">
              <span className="flex-1 break-all">{token}</span>
              <CopyButton value={token} />
            </div>
            <button onClick={() => setToken(randomToken(32, "hex"))} className="chip mt-2">
              Generar otro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
