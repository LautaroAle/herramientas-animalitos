"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { copyToClipboard, downloadFile } from "@/lib/utils";

export function CopyButton({ value, label = "Copiar" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyToClipboard(value);
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink-950/15 px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-ink-950/5 dark:border-white/15 dark:hover:bg-white/10"
    >
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
      {copied ? "Copiado" : label}
    </button>
  );
}

export function DownloadButton({
  data,
  filename,
  label = "Descargar"
}: {
  data: string | Blob;
  filename: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => downloadFile(data, filename)}
      className="inline-flex items-center gap-1.5 rounded-full bg-signal-gradient px-3.5 py-1.5 text-sm font-medium text-white"
    >
      <Download size={14} />
      {label}
    </button>
  );
}
