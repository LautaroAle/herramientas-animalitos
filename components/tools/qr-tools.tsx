"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { DownloadButton } from "@/components/tools/action-buttons";
import { downloadFile } from "@/lib/utils";

type QrType = "texto" | "wifi" | "contacto" | "email" | "sms" | "evento";

const TYPES: { id: QrType; label: string }[] = [
  { id: "texto", label: "Texto / URL" },
  { id: "wifi", label: "WiFi" },
  { id: "contacto", label: "Contacto" },
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS" },
  { id: "evento", label: "Evento" }
];

function buildPayload(type: QrType, fields: Record<string, string>): string {
  switch (type) {
    case "texto":
      return fields.content || "";
    case "wifi":
      return `WIFI:T:${fields.security || "WPA"};S:${fields.ssid || ""};P:${fields.password || ""};;`;
    case "contacto":
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${fields.lastName || ""};${fields.firstName || ""}`,
        `FN:${[fields.firstName, fields.lastName].filter(Boolean).join(" ")}`,
        fields.phone ? `TEL:${fields.phone}` : "",
        fields.email ? `EMAIL:${fields.email}` : "",
        fields.org ? `ORG:${fields.org}` : "",
        "END:VCARD"
      ]
        .filter(Boolean)
        .join("\n");
    case "email":
      return `mailto:${fields.to || ""}?subject=${encodeURIComponent(fields.subject || "")}&body=${encodeURIComponent(
        fields.body || ""
      )}`;
    case "sms":
      return `SMSTO:${fields.phone || ""}:${fields.message || ""}`;
    case "evento":
      return [
        "BEGIN:VEVENT",
        `SUMMARY:${fields.title || ""}`,
        fields.start ? `DTSTART:${fields.start.replace(/[-:]/g, "")}` : "",
        fields.end ? `DTEND:${fields.end.replace(/[-:]/g, "")}` : "",
        fields.location ? `LOCATION:${fields.location}` : "",
        "END:VEVENT"
      ]
        .filter(Boolean)
        .join("\n");
    default:
      return "";
  }
}

const FIELD_CONFIG: Record<QrType, { name: string; label: string; placeholder?: string; type?: string }[]> = {
  texto: [{ name: "content", label: "Texto o URL", placeholder: "https://tusitio.com" }],
  wifi: [
    { name: "ssid", label: "Nombre de la red (SSID)" },
    { name: "password", label: "Contraseña" },
    { name: "security", label: "Seguridad (WPA, WEP o nopass)", placeholder: "WPA" }
  ],
  contacto: [
    { name: "firstName", label: "Nombre" },
    { name: "lastName", label: "Apellido" },
    { name: "phone", label: "Teléfono" },
    { name: "email", label: "Email" },
    { name: "org", label: "Empresa" }
  ],
  email: [
    { name: "to", label: "Destinatario" },
    { name: "subject", label: "Asunto" },
    { name: "body", label: "Mensaje" }
  ],
  sms: [
    { name: "phone", label: "Teléfono" },
    { name: "message", label: "Mensaje" }
  ],
  evento: [
    { name: "title", label: "Título del evento" },
    { name: "start", label: "Inicio", type: "datetime-local" },
    { name: "end", label: "Fin", type: "datetime-local" },
    { name: "location", label: "Ubicación" }
  ]
};

export function QrTools() {
  const [type, setType] = useState<QrType>("texto");
  const [fields, setFields] = useState<Record<string, string>>({ content: "https://tusitio.com" });
  const [dataUrl, setDataUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const payload = buildPayload(type, fields);

  useEffect(() => {
    if (!payload.trim()) {
      setDataUrl("");
      return;
    }
    QRCode.toDataURL(payload, { width: 480, margin: 1, color: { dark: "#0A0B10", light: "#00000000" } })
      .then((url) => {
        setDataUrl(url);
        setError("");
      })
      .catch(() => setError("No se pudo generar el código QR con estos datos."));
  }, [payload]);

  async function downloadSvg() {
    const svg = await QRCode.toString(payload, { type: "svg", margin: 1 });
    downloadFile(new Blob([svg], { type: "image/svg+xml" }), "codigo-qr.svg");
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setType(t.id);
                setFields({});
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                type === t.id
                  ? "bg-signal-gradient text-white"
                  : "bg-ink-950/5 text-ink-950/70 hover:bg-ink-950/10 dark:bg-white/10 dark:text-white/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {FIELD_CONFIG[type].map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
              </label>
              <input
                id={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder}
                value={fields[field.name] || ""}
                onChange={(e) => setFields((f) => ({ ...f, [field.name]: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm outline-none focus-visible:border-signal-violet dark:border-white/15 dark:bg-ink-950"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 rounded-xl2 border border-dashed border-ink-950/15 p-6 dark:border-white/15">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- data: URL, no next/image optimization applies
          <img src={dataUrl} alt="Código QR generado" className="h-56 w-56" />
        ) : (
          <p className="text-sm text-ink-950/40 dark:text-white/40">Completá los datos para ver el QR.</p>
        )}
        {dataUrl && (
          <div className="flex flex-wrap justify-center gap-2">
            <DownloadButton data={dataUrl} filename="codigo-qr.png" label="Descargar PNG" />
            <button onClick={downloadSvg} className="chip">
              Descargar SVG
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
