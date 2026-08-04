import type { ContentBlock } from "@/lib/document-templates/types";

export async function renderDocumentPdf(blocks: ContentBlock[]): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const black = rgb(0.07, 0.08, 0.1);
  const gray = rgb(0.45, 0.47, 0.52);

  const marginX = 56;
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const contentWidth = pageWidth - marginX * 2;
  let y = pageHeight - 64;

  function wrapText(text: string, useFont: typeof font, size: number, maxWidth: number): string[] {
    const lines: string[] = [];
    for (const rawLine of text.split("\n")) {
      const words = rawLine.split(/\s+/).filter(Boolean);
      let current = "";
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (useFont.widthOfTextAtSize(test, size) > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      lines.push(current);
    }
    return lines;
  }

  function ensureSpace(neededHeight: number) {
    if (y - neededHeight < 64) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = pageHeight - 64;
    }
  }

  for (const block of blocks) {
    switch (block.type) {
      case "heading": {
        ensureSpace(28);
        page.drawText(block.text, { x: marginX, y, size: 15, font: bold, color: black });
        y -= 26;
        break;
      }
      case "paragraph": {
        const lines = wrapText(block.text, font, 10.5, contentWidth);
        for (const line of lines) {
          ensureSpace(16);
          page.drawText(line, { x: marginX, y, size: 10.5, font, color: black });
          y -= 16;
        }
        y -= 6;
        break;
      }
      case "date-place": {
        ensureSpace(16);
        const width = font.widthOfTextAtSize(block.text, 10.5);
        page.drawText(block.text, { x: pageWidth - marginX - width, y, size: 10.5, font, color: gray });
        y -= 24;
        break;
      }
      case "signature-line": {
        ensureSpace(50);
        y -= 30;
        page.drawLine({ start: { x: marginX, y }, end: { x: marginX + 220, y }, thickness: 1, color: gray });
        y -= 14;
        page.drawText(block.label, { x: marginX, y, size: 9.5, font, color: gray });
        y -= 20;
        break;
      }
      case "spacer": {
        y -= 14;
        break;
      }
    }
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
}
