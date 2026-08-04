"use client";

import { useState } from "react";
import { UploadCloud, FileText, X, GripVertical } from "lucide-react";
import { formatBytes } from "@/lib/utils";

/** Drag-and-drop / click file picker, styled consistently across every tool that accepts file uploads. */
export function FileDropZone({
  accept,
  multiple,
  onFiles,
  hint
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  hint: string;
}) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        onFiles(Array.from(e.dataTransfer.files));
      }}
      className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl2 border-2 border-dashed p-10 text-center transition-colors ${
        isDragging
          ? "border-signal-violet bg-signal-violet/5"
          : "border-ink-950/15 hover:border-signal-violet/50 dark:border-white/15"
      }`}
    >
      <UploadCloud size={28} className="text-ink-950/40 dark:text-white/40" />
      <div>
        <p className="text-sm font-medium">Arrastrá tus archivos acá o hacé clic para elegirlos</p>
        <p className="mt-1 text-xs text-ink-950/45 dark:text-white/45">{hint}</p>
      </div>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => e.target.files && onFiles(Array.from(e.target.files))}
      />
    </label>
  );
}

export function FileListRow({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-ink-950/8 px-4 py-2.5 dark:border-white/8">
      <GripVertical size={14} className="shrink-0 text-ink-950/25 dark:text-white/25" />
      <FileText size={16} className="shrink-0 text-signal-violet" />
      <span className="flex-1 truncate text-sm">{file.name}</span>
      <span className="shrink-0 text-xs text-ink-950/40 dark:text-white/40">{formatBytes(file.size)}</span>
      <button onClick={onRemove} aria-label={`Quitar ${file.name}`} className="shrink-0 text-ink-950/30 hover:text-red-500 dark:text-white/30">
        <X size={15} />
      </button>
    </li>
  );
}
