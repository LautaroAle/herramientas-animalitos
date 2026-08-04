"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/action-buttons";
import { StatusBanner } from "@/components/tools/tool-shell";
import { useDebouncedValue } from "@/hooks/use-debounce";

type Tab = "json" | "base64" | "url" | "jwt";
const TABS: { id: Tab; label: string }[] = [
  { id: "json", label: "JSON" },
  { id: "base64", label: "Base64" },
  { id: "url", label: "URL Encode/Decode" },
  { id: "jwt", label: "Decodificador JWT" }
];

// ---------------------------------------------------------------------------
// JSON formatter / validator
// ---------------------------------------------------------------------------
function JsonTool() {
  const [input, setInput] = useState('{\n  "nombre": "Ejemplo",\n  "activo": true,\n  "items": [1, 2, 3]\n}');
  const debouncedInput = useDebouncedValue(input, 200);
  const [indent, setIndent] = useState(2);

  const result = useMemo(() => {
    if (!debouncedInput.trim()) return { formatted: "", error: null as string | null };
    try {
      const parsed = JSON.parse(debouncedInput);
      return { formatted: JSON.stringify(parsed, null, indent), error: null };
    } catch (err) {
      return { formatted: "", error: err instanceof Error ? err.message : "JSON inválido" };
    }
  }, [debouncedInput, indent]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">Entrada</label>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="rounded-lg border border-ink-950/15 bg-paper-50 px-2 py-1 text-xs dark:border-white/15 dark:bg-ink-950"
          >
            <option value={2}>2 espacios</option>
            <option value={4}>4 espacios</option>
            <option value={0}>Minificado</option>
          </select>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={14}
          spellCheck={false}
          className="w-full rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 font-mono text-xs outline-none focus-visible:border-signal-violet dark:border-white/15 dark:bg-ink-950"
        />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">Resultado</label>
          {result.formatted && <CopyButton value={result.formatted} />}
        </div>
        {result.error ? (
          <StatusBanner kind="error">{result.error}</StatusBanner>
        ) : (
          <pre className="h-[336px] overflow-auto rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 font-mono text-xs dark:border-white/15 dark:bg-ink-950">
            {result.formatted}
          </pre>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Base64 encode/decode
// ---------------------------------------------------------------------------
function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("Texto de ejemplo");

  const result = useMemo(() => {
    try {
      return mode === "encode"
        ? { value: btoa(unescape(encodeURIComponent(input))), error: null as string | null }
        : { value: decodeURIComponent(escape(atob(input))), error: null };
    } catch {
      return { value: "", error: "No se pudo decodificar. Verificá que el texto sea Base64 válido." };
    }
  }, [input, mode]);

  return (
    <div>
      <div className="flex gap-2">
        {(["encode", "decode"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === m ? "bg-signal-gradient text-white" : "bg-ink-950/5 text-ink-950/70 dark:bg-white/10 dark:text-white/70"
            }`}
          >
            {m === "encode" ? "Codificar" : "Decodificar"}
          </button>
        ))}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
        className="mt-4 w-full rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 font-mono text-sm dark:border-white/15 dark:bg-ink-950"
      />
      {result.error ? (
        <div className="mt-4">
          <StatusBanner kind="error">{result.error}</StatusBanner>
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-2 rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 dark:border-white/15 dark:bg-ink-950">
          <code className="flex-1 break-all font-mono text-sm">{result.value}</code>
          <CopyButton value={result.value} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// URL encode/decode
// ---------------------------------------------------------------------------
function UrlTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("https://ejemplo.com/buscar?q=hola mundo&lang=es");

  const result = useMemo(() => {
    try {
      return { value: mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input), error: null as string | null };
    } catch {
      return { value: "", error: "No se pudo decodificar esa cadena." };
    }
  }, [input, mode]);

  return (
    <div>
      <div className="flex gap-2">
        {(["encode", "decode"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === m ? "bg-signal-gradient text-white" : "bg-ink-950/5 text-ink-950/70 dark:bg-white/10 dark:text-white/70"
            }`}
          >
            {m === "encode" ? "Codificar" : "Decodificar"}
          </button>
        ))}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        className="mt-4 w-full rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 font-mono text-sm dark:border-white/15 dark:bg-ink-950"
      />
      {result.error ? (
        <div className="mt-4">
          <StatusBanner kind="error">{result.error}</StatusBanner>
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-2 rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 dark:border-white/15 dark:bg-ink-950">
          <code className="flex-1 break-all font-mono text-sm">{result.value}</code>
          <CopyButton value={result.value} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// JWT decoder (reads the payload only — never verifies the signature)
// ---------------------------------------------------------------------------
function base64UrlDecode(segment: string): string {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/").padEnd(segment.length + ((4 - (segment.length % 4)) % 4), "=");
  return decodeURIComponent(escape(atob(normalized)));
}

function JwtTool() {
  const [token, setToken] = useState("");

  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    const parts = token.trim().split(".");
    if (parts.length !== 3) return { error: "Un JWT válido tiene 3 partes separadas por puntos (header.payload.signature)." };
    try {
      const header = JSON.parse(base64UrlDecode(parts[0]!));
      const payload = JSON.parse(base64UrlDecode(parts[1]!));
      return { header, payload, error: null as string | null };
    } catch {
      return { error: "No se pudo decodificar este token. Verificá que sea un JWT válido." };
    }
  }, [token]);

  return (
    <div>
      <label className="text-sm font-medium">Token JWT</label>
      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        rows={4}
        className="mt-1.5 w-full rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 font-mono text-xs dark:border-white/15 dark:bg-ink-950"
      />
      <p className="mt-2 text-xs text-ink-950/45 dark:text-white/45">
        Esto solo decodifica el contenido del token — no verifica la firma ni confirma que sea auténtico.
      </p>

      {decoded?.error && (
        <div className="mt-4">
          <StatusBanner kind="error">{decoded.error}</StatusBanner>
        </div>
      )}

      {decoded && !decoded.error && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-ink-950/50 dark:text-white/50">Header</p>
            <pre className="mt-1.5 overflow-auto rounded-lg border border-ink-950/8 bg-paper-50 p-3 font-mono text-xs dark:border-white/8 dark:bg-ink-950">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-ink-950/50 dark:text-white/50">Payload</p>
            <pre className="mt-1.5 overflow-auto rounded-lg border border-ink-950/8 bg-paper-50 p-3 font-mono text-xs dark:border-white/8 dark:bg-ink-950">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export function DevKit() {
  const [tab, setTab] = useState<Tab>("json");

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
        {tab === "json" && <JsonTool />}
        {tab === "base64" && <Base64Tool />}
        {tab === "url" && <UrlTool />}
        {tab === "jwt" && <JwtTool />}
      </div>
    </div>
  );
}
