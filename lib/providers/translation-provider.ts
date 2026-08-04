/**
 * Contract every translation backend must satisfy. The "Traductor" tool's UI
 * is written against this interface only — swapping DeepL for Google
 * Translate, Azure, or a self-hosted model means adding one new file that
 * implements `TranslationProvider`, not touching the tool's component.
 */
export interface TranslationProvider {
  /** BCP-47 style language codes this provider can translate between. */
  supportedLanguages(): Promise<{ code: string; name: string }[]>;

  /** Detects the language of the given text. */
  detectLanguage(text: string): Promise<string>;

  /** Translates `text` from `sourceLang` ("auto" to detect) into `targetLang`. */
  translate(input: { text: string; sourceLang: string; targetLang: string }): Promise<string>;
}

/**
 * Thrown by real implementations when a required credential is missing.
 * Callers (API routes) should catch this and return a 503 with the message
 * verbatim — it already tells the operator exactly what to configure.
 */
export class ProviderNotConfiguredError extends Error {}
