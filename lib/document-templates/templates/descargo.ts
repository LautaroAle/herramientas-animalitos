import type { DocumentTemplate, ContentBlock } from "@/lib/document-templates/types";

export const descargoTemplate: DocumentTemplate = {
  slug: "descargo",
  name: "Descargo",
  shortDescription: "Respondé formalmente a una notificación, sanción o acusación.",
  disclaimer:
    "Sirve para dejar tu versión de los hechos por escrito frente a una notificación (laboral, de un consorcio, de una institución, etc.). Para sanciones laborales graves o con riesgo de despido, te recomendamos que lo revise un abogado laboral antes de presentarlo.",
  keywords: ["descargo", "responder a una sancion", "me llegó una notificacion", "explicar lo que paso", "llamado de atencion", "responder a una acusacion"],
  fields: [
    { id: "fullName", label: "Tu nombre completo", type: "text", required: true },
    { id: "dni", label: "Tu DNI", type: "text", required: true },
    { id: "recipient", label: "¿A quién va dirigido?", type: "text", placeholder: "Ej: Gerencia de RR.HH., Consorcio de propietarios…", required: true },
    { id: "reference", label: "¿Qué notificación estás respondiendo?", type: "text", placeholder: "Ej: Notificación del 15/03/2026 por llegadas tarde", required: true },
    { id: "explanation", label: "¿Qué querés explicar o aclarar?", type: "textarea", required: true },
    { id: "requestedAction", label: "¿Qué pedís? (opcional)", type: "textarea", placeholder: "Ej: que se deje sin efecto el apercibimiento" },
    { id: "city", label: "Ciudad", type: "text", required: true }
  ],
  generate: (a) => {
    const today = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });

    const blocks: ContentBlock[] = [
      { type: "date-place" as const, text: `${a.city || ""}, ${today}` },
      { type: "heading" as const, text: "Descargo" },
      { type: "paragraph" as const, text: `A: ${a.recipient || "[Destinatario]"}` },
      {
        type: "paragraph" as const,
        text: `Quien suscribe, ${a.fullName || "[Nombre completo]"}, DNI N° ${a.dni || "[DNI]"}, se dirige a ustedes en relación a ${a.reference || "[referencia de la notificación]"}, a fin de formular el presente descargo.`
      },
      { type: "paragraph" as const, text: a.explanation || "" }
    ];

    if (a.requestedAction?.trim()) {
      blocks.push({ type: "paragraph" as const, text: `En virtud de lo expuesto, solicito ${a.requestedAction}.` });
    }

    blocks.push(
      { type: "paragraph" as const, text: "Quedo a disposición para ampliar cualquier detalle de lo aquí expresado." },
      { type: "signature-line" as const, label: `${a.fullName || "Firma"} — DNI ${a.dni || ""}` }
    );

    return blocks;
  },
  suggestedFilename: (a) => `descargo-${(a.fullName || "documento").toLowerCase().replace(/\s+/g, "-")}`
};
