import type { TranslationProvider } from "@/lib/providers/translation-provider";

/**
 * MyMemory (https://mymemory.translated.net) is a free translation memory
 * + machine-translation API that requires no API key for low-volume,
 * anonymous use (roughly 5,000 words/day per IP, per their published
 * limits). That's the right fit for a free tool with no account system —
 * if usage ever outgrows it, swap this file for one that implements the
 * same `TranslationProvider` interface against DeepL/Google Cloud
 * Translation; nothing outside `lib/providers/` needs to change.
 */
const ENDPOINT = "https://api.mymemory.translated.net/get";
const MAX_CHUNK_LENGTH = 480; // MyMemory's free tier caps requests around 500 chars.

export const SUPPORTED_LANGUAGES = [
  { code: "es", name: "Español" },
  { code: "en", name: "Inglés" },
  { code: "pt", name: "Portugués" },
  { code: "fr", name: "Francés" },
  { code: "de", name: "Alemán" },
  { code: "it", name: "Italiano" },
  { code: "nl", name: "Neerlandés" },
  { code: "ru", name: "Ruso" },
  { code: "zh", name: "Chino" },
  { code: "ja", name: "Japonés" },
  { code: "ko", name: "Coreano" },
  { code: "ar", name: "Árabe" },
  { code: "hi", name: "Hindi" },
  { code: "tr", name: "Turco" },
  { code: "pl", name: "Polaco" },
  { code: "sv", name: "Sueco" },
  { code: "el", name: "Griego" },
  { code: "he", name: "Hebreo" },
  { code: "id", name: "Indonesio" },
  { code: "vi", name: "Vietnamita" },
  { code: "th", name: "Tailandés" },
  { code: "cs", name: "Checo" },
  { code: "ro", name: "Rumano" },
  { code: "uk", name: "Ucraniano" }
] as const;

/** Splits text into chunks under MyMemory's length limit, breaking on whitespace so words stay intact. */
function chunkText(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining.length > maxLength) {
    let splitAt = remaining.lastIndexOf(" ", maxLength);
    if (splitAt <= 0) splitAt = maxLength;
    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

export class MyMemoryTranslationProvider implements TranslationProvider {
  async supportedLanguages() {
    return SUPPORTED_LANGUAGES.map((l) => ({ code: l.code, name: l.name }));
  }

  async detectLanguage(): Promise<string> {
    // MyMemory has no detection endpoint. Detection in this app runs
    // client-side (franc-min, in the translator hook) purely as a UX
    // convenience to pre-select the source language dropdown — it never
    // blocks translation, so there's no server-side implementation needed.
    throw new Error("MyMemory no ofrece detección de idioma; se resuelve en el cliente.");
  }

  async translate({ text, sourceLang, targetLang }: { text: string; sourceLang: string; targetLang: string }): Promise<string> {
    const chunks = chunkText(text, MAX_CHUNK_LENGTH);
    const translated: string[] = [];

    for (const chunk of chunks) {
      // "de" is an optional contact param MyMemory's docs recommend adding —
      // it raises the anonymous daily quota from ~1,250 to ~10,000 words and
      // has no other effect. It's not a secret key, just an identifier.
      const url = `${ENDPOINT}?q=${encodeURIComponent(chunk)}&langpair=${sourceLang}|${targetLang}&de=soporte@centro-de-herramientas.example.com`;
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error("El servicio de traducción no respondió correctamente.");

      const json = await response.json();

      // MyMemory returns HTTP 200 even when it can't translate — the real
      // status lives in the body. responseStatus other than 200/"200" means
      // something went wrong (bad language pair, quota exceeded, etc.).
      const status = Number(json?.responseStatus);
      if (status && status !== 200) {
        throw new Error(json?.responseDetails || "El servicio de traducción rechazó la solicitud.");
      }

      const translatedChunk = json?.responseData?.translatedText;
      if (typeof translatedChunk !== "string" || !translatedChunk.trim()) {
        throw new Error("Respuesta de traducción inesperada.");
      }
      // When the anonymous daily quota is exhausted, MyMemory still returns
      // HTTP 200 with a warning string *inside* translatedText instead of an
      // actual translation. Treat that as an error rather than showing the
      // warning text to the user as if it were their translation.
      if (translatedChunk.toUpperCase().includes("MYMEMORY WARNING")) {
        throw new Error("Se alcanzó el límite gratuito de traducciones por hoy. Probá de nuevo más tarde.");
      }

      translated.push(translatedChunk);
    }

    return translated.join(" ");
  }
}
