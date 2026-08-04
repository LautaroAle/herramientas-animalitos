/**
 * A document type is defined once as data (fields + a generate function)
 * and rendered by two shared, generic renderers (PDF and DOCX). Adding a
 * new document type never touches the renderers or the wizard UI — it's a
 * new file in `templates/` registered in `index.ts`.
 */

export type FieldType = "text" | "textarea" | "date" | "select";

export interface DocumentField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  /** Shown under the field to help someone who's never written this document before. */
  helpText?: string;
}

export type Answers = Record<string, string>;

/** A document-agnostic content block. Both renderers (PDF, DOCX) know how to draw every variant. */
export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "spacer" }
  | { type: "signature-line"; label: string }
  | { type: "date-place"; text: string };

export interface DocumentTemplate {
  slug: string;
  name: string;
  shortDescription: string;
  /** Plain-language note about this document's legal weight, shown before generating. */
  disclaimer: string;
  /** Words/phrases used to auto-match this template against a free-text description of what the person needs. */
  keywords: string[];
  fields: DocumentField[];
  generate: (answers: Answers) => ContentBlock[];
  suggestedFilename: (answers: Answers) => string;
}
