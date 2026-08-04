"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { downloadFile } from "@/lib/utils";
import { StatusBanner } from "@/components/tools/tool-shell";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("es", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

export function InvoiceGenerator() {
  const [invoiceNumber, setInvoiceNumber] = useState("0001");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState("USD");
  const [taxPercent, setTaxPercent] = useState(21);

  const [sellerName, setSellerName] = useState("Tu Empresa SRL");
  const [sellerDetails, setSellerDetails] = useState("CUIT/RFC: 00-00000000-0\nemail@tuempresa.com");
  const [clientName, setClientName] = useState("Nombre del cliente");
  const [clientDetails, setClientDetails] = useState("cliente@correo.com");

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: crypto.randomUUID(), description: "Servicio de consultoría", quantity: 1, unitPrice: 500 }
  ]);
  const [notes, setNotes] = useState("Gracias por su confianza.");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function addItem() {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 }]);
  }

  function updateItem(id: string, patch: Partial<InvoiceItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  }

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items]);
  const taxAmount = subtotal * (taxPercent / 100);
  const total = subtotal + taxAmount;

  async function generatePdf() {
    setBusy(true);
    setError("");
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const accent = rgb(0.357, 0.298, 0.961); // matches --signal-violet
      const gray = rgb(0.4, 0.4, 0.45);
      const black = rgb(0.05, 0.05, 0.07);

      let y = 800;
      const marginX = 50;

      page.drawText("FACTURA", { x: marginX, y, size: 26, font: bold, color: accent });
      page.drawText(`N.º ${invoiceNumber}`, { x: 420, y, size: 12, font, color: gray });
      y -= 18;
      page.drawText(`Fecha: ${date}`, { x: 420, y, size: 10, font, color: gray });

      y -= 50;
      page.drawText("De", { x: marginX, y, size: 9, font: bold, color: gray });
      page.drawText("Para", { x: 320, y, size: 9, font: bold, color: gray });
      y -= 14;
      let clientY = y; // same starting point as the seller block below, so both columns align
      for (const line of [sellerName, ...sellerDetails.split("\n")]) {
        page.drawText(line, { x: marginX, y, size: 10, font, color: black });
        y -= 13;
      }
      for (const line of [clientName, ...clientDetails.split("\n")]) {
        page.drawText(line, { x: 320, y: clientY, size: 10, font, color: black });
        clientY -= 13;
      }

      y = Math.min(y, clientY) - 20;
      page.drawLine({ start: { x: marginX, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.85, 0.85, 0.88) });
      y -= 20;

      page.drawText("Descripción", { x: marginX, y, size: 9, font: bold, color: gray });
      page.drawText("Cant.", { x: 350, y, size: 9, font: bold, color: gray });
      page.drawText("Precio", { x: 410, y, size: 9, font: bold, color: gray });
      page.drawText("Importe", { x: 480, y, size: 9, font: bold, color: gray });
      y -= 16;

      for (const item of items) {
        if (y < 120) break; // guard against overflow for very long item lists
        page.drawText(item.description || "-", { x: marginX, y, size: 10, font, color: black, maxWidth: 280 });
        page.drawText(String(item.quantity), { x: 350, y, size: 10, font, color: black });
        page.drawText(formatCurrency(item.unitPrice, currency), { x: 410, y, size: 10, font, color: black });
        page.drawText(formatCurrency(item.quantity * item.unitPrice, currency), { x: 480, y, size: 10, font, color: black });
        y -= 18;
      }

      y -= 10;
      page.drawLine({ start: { x: 350, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.85, 0.85, 0.88) });
      y -= 20;

      page.drawText("Subtotal", { x: 410, y, size: 10, font, color: gray });
      page.drawText(formatCurrency(subtotal, currency), { x: 480, y, size: 10, font, color: black });
      y -= 16;
      page.drawText(`IVA (${taxPercent}%)`, { x: 410, y, size: 10, font, color: gray });
      page.drawText(formatCurrency(taxAmount, currency), { x: 480, y, size: 10, font, color: black });
      y -= 20;
      page.drawText("Total", { x: 410, y, size: 13, font: bold, color: accent });
      page.drawText(formatCurrency(total, currency), { x: 480, y, size: 13, font: bold, color: accent });

      if (notes.trim()) {
        y -= 50;
        page.drawText("Notas", { x: marginX, y, size: 9, font: bold, color: gray });
        y -= 14;
        page.drawText(notes, { x: marginX, y, size: 10, font, color: black, maxWidth: 495, lineHeight: 14 });
      }

      const bytes = await pdfDoc.save();
      downloadFile(new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }), `factura-${invoiceNumber}.pdf`);
    } catch {
      setError("No se pudo generar el PDF de la factura.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">N.º de factura</label>
            <input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950" />
          </div>
          <div>
            <label className="text-sm font-medium">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">De (tu negocio)</label>
            <input value={sellerName} onChange={(e) => setSellerName(e.target.value)} className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950" />
            <textarea value={sellerDetails} onChange={(e) => setSellerDetails(e.target.value)} rows={2} className="mt-2 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-xs dark:border-white/15 dark:bg-ink-950" />
          </div>
          <div>
            <label className="text-sm font-medium">Para (cliente)</label>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950" />
            <textarea value={clientDetails} onChange={(e) => setClientDetails(e.target.value)} rows={2} className="mt-2 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-xs dark:border-white/15 dark:bg-ink-950" />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Ítems</label>
            <button onClick={addItem} className="chip inline-flex items-center gap-1.5">
              <Plus size={13} /> Agregar
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_60px_80px_auto] gap-2">
                <input
                  placeholder="Descripción"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  className="rounded-lg border border-ink-950/15 bg-paper-50 px-2.5 py-1.5 text-sm dark:border-white/15 dark:bg-ink-950"
                />
                <input
                  type="number"
                  aria-label="Cantidad"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                  className="rounded-lg border border-ink-950/15 bg-paper-50 px-2 py-1.5 text-sm dark:border-white/15 dark:bg-ink-950"
                />
                <input
                  type="number"
                  aria-label="Precio unitario"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                  className="rounded-lg border border-ink-950/15 bg-paper-50 px-2 py-1.5 text-sm dark:border-white/15 dark:bg-ink-950"
                />
                <button onClick={() => removeItem(item.id)} aria-label="Quitar ítem" className="text-ink-950/30 hover:text-red-500 dark:text-white/30">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Moneda</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950">
              {["USD", "EUR", "ARS", "MXN", "COP", "CLP", "PEN", "BRL"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">IVA (%)</label>
            <input type="number" value={taxPercent} onChange={(e) => setTaxPercent(Number(e.target.value))} className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Notas</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950" />
        </div>

        {error && <StatusBanner kind="error">{error}</StatusBanner>}
        <button
          onClick={generatePdf}
          disabled={busy}
          className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Generando…" : "Descargar factura en PDF"}
        </button>
      </div>

      {/* Live preview */}
      <div className="rounded-xl2 border border-ink-950/8 bg-white p-6 text-sm shadow-soft dark:border-white/8 dark:bg-ink-900 dark:shadow-soft-dark">
        <div className="flex items-start justify-between">
          <p className="font-display text-xl font-semibold text-signal-violet">FACTURA</p>
          <div className="text-right text-xs text-ink-950/50 dark:text-white/50">
            <p>N.º {invoiceNumber}</p>
            <p>{date}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-semibold text-ink-950/50 dark:text-white/50">De</p>
            <p className="mt-1 whitespace-pre-line">{sellerName}{"\n"}{sellerDetails}</p>
          </div>
          <div>
            <p className="font-semibold text-ink-950/50 dark:text-white/50">Para</p>
            <p className="mt-1 whitespace-pre-line">{clientName}{"\n"}{clientDetails}</p>
          </div>
        </div>

        <table className="mt-6 w-full text-xs">
          <thead>
            <tr className="border-b border-ink-950/10 text-left text-ink-950/50 dark:border-white/10 dark:text-white/50">
              <th className="pb-2 font-medium">Descripción</th>
              <th className="pb-2 font-medium">Cant.</th>
              <th className="pb-2 text-right font-medium">Precio</th>
              <th className="pb-2 text-right font-medium">Importe</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-ink-950/5 dark:border-white/5">
                <td className="py-1.5">{item.description || "—"}</td>
                <td className="py-1.5">{item.quantity}</td>
                <td className="py-1.5 text-right">{formatCurrency(item.unitPrice, currency)}</td>
                <td className="py-1.5 text-right">{formatCurrency(item.quantity * item.unitPrice, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-40 space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-ink-950/50 dark:text-white/50">Subtotal</span><span>{formatCurrency(subtotal, currency)}</span></div>
          <div className="flex justify-between"><span className="text-ink-950/50 dark:text-white/50">IVA ({taxPercent}%)</span><span>{formatCurrency(taxAmount, currency)}</span></div>
          <div className="flex justify-between border-t border-ink-950/10 pt-1 font-semibold text-signal-violet dark:border-white/10"><span>Total</span><span>{formatCurrency(total, currency)}</span></div>
        </div>
      </div>
    </div>
  );
}
