// Maps franc-min's ISO 639-3 output to the ISO 639-1 codes this app uses.
const FRANC_TO_APP_CODE: Record<string, string> = {
  spa: "es",
  eng: "en",
  por: "pt",
  fra: "fr",
  deu: "de",
  ita: "it",
  nld: "nl",
  rus: "ru",
  cmn: "zh",
  jpn: "ja",
  kor: "ko",
  arb: "ar",
  hin: "hi",
  tur: "tr",
  pol: "pl",
  swe: "sv",
  ell: "el",
  heb: "he",
  ind: "id",
  vie: "vi",
  tha: "th",
  ces: "cs",
  ron: "ro",
  ukr: "uk"
};

/**
 * Best-effort language detection, computed entirely in the browser.
 * Returns null when the text is too short/ambiguous or the detected
 * language isn't one this app supports — callers should treat that as
 * "leave the current selection as-is", never as an error.
 */
export async function detectLanguage(text: string): Promise<string | null> {
  if (text.trim().length < 8) return null;
  const { franc } = await import("franc-min");
  const code = franc(text, { minLength: 8 });
  return FRANC_TO_APP_CODE[code] ?? null;
}
