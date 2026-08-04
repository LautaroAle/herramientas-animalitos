/**
 * html2canvas's package.json doesn't declare a "types" field pointing at its
 * own bundled dist/types/index.d.ts, and the @types/html2canvas package on
 * npm is a deprecated empty stub — so neither resolves automatically. This
 * covers the one call signature we actually use.
 */
declare module "html2canvas" {
  interface Html2CanvasOptions {
    backgroundColor?: string | null;
    scale?: number;
    useCORS?: boolean;
  }
  function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
  export default html2canvas;
}
