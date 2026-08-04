import { DOCUMENT_TEMPLATES } from "@/lib/document-templates";
import type { DocumentTemplate } from "@/lib/document-templates/types";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export interface IntentMatch {
  template: DocumentTemplate;
  score: number;
}

/**
 * Scores every document template by how many of its registered keywords
 * appear in the person's free-text description, and returns matches sorted
 * best-first. This is plain substring matching, not language understanding
 * — it works well for common phrasings ("me llegó roto", "quiero renunciar")
 * but won't catch everything, which is why the UI always offers the full
 * list as a fallback.
 */
export function matchIntent(description: string, limit = 3): IntentMatch[] {
  const normalizedInput = normalize(description);
  if (normalizedInput.trim().length < 4) return [];

  const scored = DOCUMENT_TEMPLATES.map((template) => {
    const score = template.keywords.reduce((sum, keyword) => {
      return normalizedInput.includes(normalize(keyword)) ? sum + keyword.split(" ").length : sum;
    }, 0);
    return { template, score };
  });

  return scored
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
