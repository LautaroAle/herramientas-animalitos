export interface DetectedValue {
  label: string;
  value: string;
}

/**
 * Deliberately simple pattern matching, not language understanding: finds
 * things that LOOK like a date, an order/invoice number, a DNI, an amount,
 * or an email in raw extracted PDF text, and offers them as tap-to-fill
 * suggestions. It will miss unusual formats and can't infer what a number
 * *means* — the person still confirms/edits everything, so a wrong guess
 * costs a click, not a mistake in the final document.
 */
export function extractReferenceValues(text: string): DetectedValue[] {
  const found: DetectedValue[] = [];
  const seen = new Set<string>();

  function add(label: string, value: string) {
    const key = `${label}:${value}`;
    if (!seen.has(key)) {
      seen.add(key);
      found.push({ label, value: value.trim() });
    }
  }

  const dateMatches = text.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g) ?? [];
  dateMatches.slice(0, 3).forEach((d) => add("Fecha", d));

  const orderMatches = text.match(/\b(?:orden|pedido|order|factura|nro\.?|n[°º])\s*[:#]?\s*\d{4,}\b/gi) ?? [];
  orderMatches.slice(0, 3).forEach((o) => add("N° de orden/factura", o.replace(/\s+/g, " ")));

  const dniMatches = text.match(/\b\d{1,2}\.?\d{3}\.?\d{3}\b/g) ?? [];
  dniMatches.slice(0, 2).forEach((d) => add("DNI", d));

  const amountMatches = text.match(/\$\s?\d{1,3}(\.\d{3})*(,\d{2})?|\bARS\s?\d+([.,]\d+)?/gi) ?? [];
  amountMatches.slice(0, 3).forEach((m) => add("Monto", m.trim()));

  const emailMatches = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) ?? [];
  emailMatches.slice(0, 2).forEach((e) => add("Email", e));

  return found.slice(0, 10);
}
