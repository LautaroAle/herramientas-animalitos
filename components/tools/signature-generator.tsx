"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Image as ImageIcon } from "lucide-react";
import { downloadFile } from "@/lib/utils";
import { StatusBanner } from "@/components/tools/tool-shell";

interface SignatureData {
  fullName: string;
  jobTitle: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  linkedin: string;
  twitter: string;
  accentColor: string;
  photoUrl: string;
}

const DEFAULTS: SignatureData = {
  fullName: "Ana Gómez",
  jobTitle: "Gerenta de Marketing",
  company: "Centro de Herramientas",
  phone: "+54 9 11 1234-5678",
  email: "ana@tuempresa.com",
  website: "https://tuempresa.com",
  linkedin: "",
  twitter: "",
  accentColor: "#5B4CF5",
  photoUrl: ""
};

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
      />
    </div>
  );
}

/** Builds table-based HTML with inline styles only — the format email clients (Gmail, Outlook) actually preserve. */
function buildSignatureHtml(data: SignatureData): string {
  const contactLine = [data.phone, data.email, data.website]
    .filter(Boolean)
    .map((item) => `<span style="color:#5b5f6b;">${item}</span>`)
    .join(`<span style="color:#c7c9d1;"> &nbsp;|&nbsp; </span>`);

  const socialLinks = [
    data.linkedin && `<a href="${data.linkedin}" style="color:${data.accentColor};text-decoration:none;margin-right:12px;">LinkedIn</a>`,
    data.twitter && `<a href="${data.twitter}" style="color:${data.accentColor};text-decoration:none;">Twitter / X</a>`
  ]
    .filter(Boolean)
    .join("");

  const photoCell = data.photoUrl
    ? `<td style="vertical-align:top;padding-right:18px;">
         <img src="${data.photoUrl}" width="72" height="72" alt="${data.fullName}" style="border-radius:50%;object-fit:cover;display:block;" />
       </td>`
    : "";

  return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;border-collapse:collapse;">
  <tr>
    ${photoCell}
    <td style="vertical-align:top;border-left:3px solid ${data.accentColor};padding-left:16px;">
      <div style="font-size:16px;font-weight:bold;color:#111319;">${data.fullName}</div>
      <div style="font-size:13px;color:${data.accentColor};margin-top:2px;">${data.jobTitle}${data.company ? ` · ${data.company}` : ""}</div>
      <div style="font-size:12px;margin-top:10px;">${contactLine}</div>
      ${socialLinks ? `<div style="font-size:12px;margin-top:8px;">${socialLinks}</div>` : ""}
    </td>
  </tr>
</table>`;
}

export function SignatureGenerator() {
  const [data, setData] = useState<SignatureData>(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [exportingImage, setExportingImage] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  function update<K extends keyof SignatureData>(key: K, value: SignatureData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhotoUpload(file: File) {
    if (file.size > 500 * 1024) {
      setError("La foto pesa demasiado. Usá una imagen de menos de 500 KB para no inflar el tamaño del email.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => update("photoUrl", reader.result as string);
    reader.readAsDataURL(file);
  }

  const html = useMemo(() => buildSignatureHtml(data), [data]);

  async function copyRichHtml() {
    try {
      if (typeof ClipboardItem !== "undefined") {
        const plainText = `${data.fullName}\n${data.jobTitle}${data.company ? ` · ${data.company}` : ""}\n${[data.phone, data.email, data.website].filter(Boolean).join(" | ")}`;
        const item = new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plainText], { type: "text/plain" })
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(html);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("No se pudo copiar automáticamente. Copiá el HTML manualmente desde el cuadro de abajo.");
    }
  }

  async function exportAsImage() {
    if (!previewRef.current) return;
    setExportingImage(true);
    setError("");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(previewRef.current, { backgroundColor: "#ffffff", scale: 2 });
      canvas.toBlob((blob) => {
        if (blob) downloadFile(blob, "firma-email.png");
      }, "image/png");
    } catch {
      setError("No se pudo exportar la firma como imagen.");
    } finally {
      setExportingImage(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre completo" value={data.fullName} onChange={(v) => update("fullName", v)} />
          <Field label="Cargo" value={data.jobTitle} onChange={(v) => update("jobTitle", v)} />
          <Field label="Empresa" value={data.company} onChange={(v) => update("company", v)} />
          <Field label="Teléfono" value={data.phone} onChange={(v) => update("phone", v)} />
          <Field label="Email" value={data.email} onChange={(v) => update("email", v)} type="email" />
          <Field label="Sitio web" value={data.website} onChange={(v) => update("website", v)} />
          <Field label="LinkedIn (URL, opcional)" value={data.linkedin} onChange={(v) => update("linkedin", v)} placeholder="https://linkedin.com/in/..." />
          <Field label="Twitter / X (URL, opcional)" value={data.twitter} onChange={(v) => update("twitter", v)} placeholder="https://x.com/..." />
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm font-medium">Color de acento</label>
            <input
              type="color"
              value={data.accentColor}
              onChange={(e) => update("accentColor", e.target.value)}
              className="mt-1.5 h-10 w-16 cursor-pointer rounded-lg border border-ink-950/15 dark:border-white/15"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Foto o logo (opcional)</label>
            <label className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ink-950/20 px-3.5 py-2 text-sm text-ink-950/60 hover:border-signal-violet/50 dark:border-white/20 dark:text-white/60">
              <ImageIcon size={15} />
              {data.photoUrl ? "Cambiar imagen" : "Subir imagen"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
              />
            </label>
          </div>
        </div>

        <p className="text-xs text-ink-950/45 dark:text-white/45">
          Para máxima compatibilidad con Outlook (que suele bloquear imágenes incrustadas), lo ideal es alojar la
          foto en una URL pública y pegarla directamente en vez de subir el archivo. El archivo subido se incrusta
          igual y funciona bien en Gmail y la mayoría de los clientes modernos.
        </p>

        {error && <StatusBanner kind="error">{error}</StatusBanner>}

        <div className="flex flex-wrap gap-2">
          <button onClick={copyRichHtml} className="inline-flex items-center gap-1.5 rounded-full bg-signal-gradient px-4 py-2 text-sm font-medium text-white">
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copiado — pegala en tu cliente de email" : "Copiar firma"}
          </button>
          <button onClick={() => downloadFile(new Blob([html], { type: "text/html" }), "firma-email.html")} className="chip inline-flex items-center gap-1.5">
            <Download size={14} /> Exportar HTML
          </button>
          <button onClick={exportAsImage} disabled={exportingImage} className="chip inline-flex items-center gap-1.5 disabled:opacity-50">
            <Download size={14} /> {exportingImage ? "Generando…" : "Exportar imagen"}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Vista previa</p>
        <div ref={previewRef} className="rounded-xl2 border border-ink-950/8 bg-white p-6 dark:border-white/8">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>

        <p className="mb-2 mt-6 text-sm font-medium">Código HTML</p>
        <textarea
          readOnly
          value={html}
          rows={10}
          className="w-full rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 font-mono text-xs dark:border-white/15 dark:bg-ink-950"
        />
      </div>
    </div>
  );
}
