/**
 * html2pdf.js ships no official TypeScript types. This minimal ambient
 * declaration is enough for the one call pattern we use
 * (`html2pdf().from(element).set(options).save(filename)`).
 */
declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: Record<string, unknown>;
    jsPDF?: Record<string, unknown>;
  }
  interface Html2PdfInstance {
    from(element: HTMLElement): Html2PdfInstance;
    set(options: Html2PdfOptions): Html2PdfInstance;
    save(filename?: string): Promise<void>;
  }
  function html2pdf(): Html2PdfInstance;
  export default html2pdf;
}
