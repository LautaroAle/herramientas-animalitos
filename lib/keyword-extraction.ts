/**
 * Deliberately simple: counts which words/short phrases repeat across
 * multiple distinct posts. This is NOT sentiment analysis or an AI
 * "conclusion" — it's a transparent frequency count, labeled as such in the
 * UI. It's the honest thing to ship without an LLM: real signal from real
 * data, no fabricated synthesis.
 */
const SPANISH_STOPWORDS = new Set([
  "de", "la", "que", "el", "en", "y", "a", "los", "del", "se", "las", "por", "un", "para",
  "con", "no", "una", "su", "al", "lo", "como", "más", "pero", "sus", "le", "ya", "o", "este",
  "sí", "porque", "esta", "entre", "cuando", "muy", "sin", "sobre", "también", "me", "hasta",
  "hay", "donde", "quien", "desde", "todo", "nos", "durante", "todos", "uno", "les", "ni",
  "contra", "otros", "ese", "eso", "ante", "ellos", "e", "esto", "mí", "antes", "algunos",
  "qué", "unos", "yo", "otro", "otras", "otra", "él", "tanto", "esa", "estos", "mucho",
  "quienes", "nada", "muchos", "cual", "poco", "ella", "estar", "estas", "algunas", "algo",
  "nosotros", "mi", "mis", "tú", "te", "ti", "tu", "tus", "ellas", "nosotras", "vosotros",
  "vosotras", "os", "mío", "mía", "míos", "mías", "tuyo", "tuya", "tuyos", "tuyas", "suyo",
  "suya", "suyos", "suyas", "nuestro", "nuestra", "nuestros", "nuestras", "vuestro", "vuestra",
  "es", "soy", "eres", "somos", "sois", "son", "fui", "fue", "fuimos", "han", "he", "ha",
  "está", "están", "esto", "eso", "aquello", "reddit", "com", "www", "https", "http"
]);

export interface TermFrequency {
  term: string;
  count: number;
}

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents for matching, keep stopword list accent-flexible via includes below
    .replace(/[^a-z0-9áéíóúñü\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Extracts the most frequent meaningful words that appear in at least
 * `minDocuments` distinct texts (so a single ranty post can't dominate the
 * results) and returns the top `limit` by document frequency.
 */
export function extractFrequentTerms(texts: string[], options?: { limit?: number; minDocuments?: number }): TermFrequency[] {
  const limit = options?.limit ?? 12;
  const minDocuments = options?.minDocuments ?? 2;

  const documentCounts = new Map<string, number>();

  for (const text of texts) {
    const wordsInDoc = new Set(normalize(text).filter((w) => w.length > 3 && !SPANISH_STOPWORDS.has(w)));
    for (const word of wordsInDoc) {
      documentCounts.set(word, (documentCounts.get(word) ?? 0) + 1);
    }
  }

  return Array.from(documentCounts.entries())
    .filter(([, count]) => count >= minDocuments)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term, count]) => ({ term, count }));
}
