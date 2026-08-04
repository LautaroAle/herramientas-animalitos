/**
 * Contract for AI-powered image operations that cannot run client-side:
 * background removal, upscaling, and object removal all need a model that's
 * too large to ship to the browser. Any provider (remove.bg, Clipdrop,
 * Replicate, a self-hosted model) implements this same shape.
 */
export interface ImageAiProvider {
  removeBackground(image: Buffer): Promise<Buffer>;
  upscale(input: { image: Buffer; factor: 2 | 4 | 8 }): Promise<Buffer>;
  removeObject(input: { image: Buffer; maskImage: Buffer }): Promise<Buffer>;
}
