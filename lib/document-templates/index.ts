import type { DocumentTemplate } from "@/lib/document-templates/types";
import { renunciaTemplate } from "@/lib/document-templates/templates/renuncia";
import { reclamoTemplate } from "@/lib/document-templates/templates/reclamo";
import { notaColegioTemplate } from "@/lib/document-templates/templates/nota-colegio";
import { presentacionTemplate } from "@/lib/document-templates/templates/presentacion";
import { contratoAlquilerTemplate } from "@/lib/document-templates/templates/contrato-alquiler";
import { descargoTemplate } from "@/lib/document-templates/templates/descargo";

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  renunciaTemplate,
  reclamoTemplate,
  descargoTemplate,
  contratoAlquilerTemplate,
  presentacionTemplate,
  notaColegioTemplate
];

export function getDocumentTemplate(slug: string): DocumentTemplate | undefined {
  return DOCUMENT_TEMPLATES.find((t) => t.slug === slug);
}

export * from "@/lib/document-templates/types";
