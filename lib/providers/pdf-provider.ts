/**
 * Contract for document-processing backends used by the PDF tools
 * (convert, merge, split, compress, rotate, sign). A self-hosted service
 * (e.g. Gotenberg/LibreOffice in a container) and a managed API (e.g.
 * ConvertAPI, Adobe PDF Services) can both implement this without the tool
 * routes knowing which one is active.
 */
export interface PdfProvider {
  convertToPdf(input: { file: Buffer; sourceMimeType: string; filename: string }): Promise<Buffer>;
  convertFromPdf(input: { file: Buffer; targetFormat: "docx" | "xlsx" | "jpg" }): Promise<Buffer>;
  merge(files: Buffer[]): Promise<Buffer>;
  split(input: { file: Buffer; ranges: [number, number][] }): Promise<Buffer[]>;
  compress(input: { file: Buffer; quality: "low" | "medium" | "high" }): Promise<Buffer>;
  rotate(input: { file: Buffer; pageRotations: Record<number, 90 | 180 | 270> }): Promise<Buffer>;
  reorder(input: { file: Buffer; newPageOrder: number[] }): Promise<Buffer>;
  removePages(input: { file: Buffer; pages: number[] }): Promise<Buffer>;
  addWatermark(input: { file: Buffer; text: string }): Promise<Buffer>;
}
