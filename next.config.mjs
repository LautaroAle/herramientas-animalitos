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
  // 'unsafe-eval' is required in both dev (Next.js Fast Refresh) and
  // production: @imgly/background-removal's WASM engine (onnxruntime-web)
  // uses real eval()/Function() in its threading glue code, not just
  // WebAssembly compilation — 'wasm-unsafe-eval' alone isn't enough for it.
  const scriptSrc = `'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: ${EXTERNAL_ASSET_HOSTS.join(" ")}`;
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
      }
    ];
  }
};

export default nextConfig;
