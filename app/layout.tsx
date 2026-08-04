import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { KindnessBanner } from "@/components/kindness-banner";
import { Footer } from "@/components/footer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

const SITE_URL = "https://centro-de-herramientas.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Centro de Herramientas Gratuitas — PDF, imágenes, QR y más",
    template: "%s · Centro de Herramientas Gratuitas"
  },
  description:
    "Herramientas gratuitas y rápidas para PDF, imágenes, códigos QR, contraseñas, colores, conversores y calculadoras. Sin registro, sin instalar nada.",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Centro de Herramientas Gratuitas",
    title: "Centro de Herramientas Gratuitas",
    description: "Todas las herramientas que necesitas todos los días, en un solo lugar."
  },
  twitter: {
    card: "summary_large_image",
    title: "Centro de Herramientas Gratuitas",
    description: "Todas las herramientas que necesitas todos los días, en un solo lugar."
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-signal-violet focus:px-4 focus:py-2 focus:text-white"
          >
            Saltar al contenido
          </a>
          <Header />
          <KindnessBanner />
          <main id="contenido">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
