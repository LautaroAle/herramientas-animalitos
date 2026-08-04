/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

// Exact hosts the browser needs to reach for our client-side AI/media tools.
// Nothing here is a paid API or a secret — these are public CDNs serving
// open model weights / WASM binaries, fetched directly by the user's browser.
//   - staticimgly.com : @imgly/background-removal's segmentation model
//   - cdn.jsdelivr.net : Tesseract.js's OCR engine + language data
//   - unpkg.com        : ffmpeg.wasm's core + wasm binary
const EXTERNAL_ASSET_HOSTS = ["https://staticimgly.com", "https://cdn.jsdelivr.net", "https://unpkg.com"];

function buildCsp() {
  const baseScriptSrc = isDev
    ? `'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:`
    : `'self' 'unsafe-inline' 'wasm-unsafe-eval' blob:`;
  // Tesseract.js spawns its worker from a blob: URL whose body is
  // `importScripts("https://cdn.jsdelivr.net/...")`. That importScripts()
  // call is governed by script-src (not worker-src or connect-src), so the
  // CDN hosts need to be allowed here too, or the worker fails to load.
  const scriptSrc = `${baseScriptSrc} ${EXTERNAL_ASSET_HOSTS.join(" ")}`;
  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    // 'self' covers our own /api/exchange-rates etc.; the CDN hosts above
    // cover model/wasm downloads; ws: is only needed for dev-mode HMR.
    // 'blob:' is needed because @imgly/background-removal downloads its
    // model, wraps it in a local blob: URL via URL.createObjectURL, and
    // then fetch()es that blob URL — that fetch is governed by connect-src,
    // just like any other network-facing request the page makes.
    `connect-src 'self' blob: ${EXTERNAL_ASSET_HOSTS.join(" ")}${isDev ? " ws:" : ""}`,
    // ffmpeg.wasm creates its worker from a blob: URL. Tesseract.js instead
    // instantiates its worker directly against a jsdelivr URL by default —
    // so worker-src needs the CDN hosts too, not just 'self' and blob:.
    `worker-src 'self' blob: ${EXTERNAL_ASSET_HOSTS.join(" ")}`
  ].join("; ");
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: buildCsp() }
        ]
      },
      {
        // @imgly/background-removal's own docs specify these exact two
        // header values as required for its WASM model to run reliably
        // (SharedArrayBuffer needs cross-origin isolation). Scoped to just
        // this route so it can't affect the other tools on the site.
        source: "/herramientas/imagenes",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" }
        ]
      }
    ];
  }
};

export default nextConfig;
