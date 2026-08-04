import type { DocumentTemplate } from "@/lib/document-templates/types";

export const renunciaTemplate: DocumentTemplate = {
  slug: "renuncia",
  name: "Carta de renuncia",
  shortDescription: "Notificá tu renuncia a tu empleador de forma formal.",
  disclaimer:
    "Usa el formato estándar de Argentina (art. 240 de la Ley de Contrato de Trabajo). Si estás en otro país, puede necesitar ajustes. Para renuncias con reclamos económicos pendientes, te recomendamos revisarla con un abogado laboral antes de entregarla.",
  keywords: ["renuncia", "renunciar", "dejo el trabajo", "dejar mi trabajo", "me voy de la empresa", "presentar la renuncia"],
  fields: [
    { id: "fullName", label: "Tu nombre completo", type: "text", required: true },
    { id: "dni", label: "Tu DNI", type: "text", required: true },
    { id: "company", label: "Nombre de la empresa", type: "text", required: true },
    { id: "position", label: "Tu puesto", type: "text", required: true },
    { id: "lastDay", label: "Último día de trabajo", type: "date", required: true },
    { id: "city", label: "Ciudad", type: "text", required: true },
    {
      id: "recipient",
      label: "¿A quién va dirigida?",
      type: "text",
      placeholder: "Ej: Gerencia de Recursos Humanos",
      helpText: "Si no sabés el nombre de una persona puntual, usá el área (RR.HH., Gerencia General, etc.)"
    }
  ],
  generate: (a) => {
    const today = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
    const lastDay = a.lastDay ? new Date(a.lastDay).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" }) : "";

    return [
      { type: "date-place", text: `${a.city || ""}, ${today}` },
      { type: "heading", text: "Carta de Renuncia" },
      { type: "paragraph", text: `${a.recipient || "A quien corresponda"}\n${a.company || ""}` },
      { type: "spacer" },
      {
        type: "paragraph",
        text: `Por medio de la presente, yo, ${a.fullName || "[Nombre completo]"}, DNI N° ${a.dni || "[DNI]"}, notifico a ustedes mi decisión de renunciar de manera voluntaria e irrevocable al cargo de ${a.position || "[puesto]"} que vengo desempeñando en ${a.company || "[empresa]"}, en los términos del artículo 240 de la Ley de Contrato de Trabajo N° 20.744.`
      },
      {
        type: "paragraph",
        text: `Mi último día efectivo de trabajo será el ${lastDay || "[fecha]"}. Quedo a disposición para colaborar con el proceso de transición de mis tareas y responsabilidades hasta esa fecha.`
      },
      {
        type: "paragraph",
        text: "Solicito se me haga entrega, dentro de los plazos legales correspondientes, de la liquidación final, el certificado de trabajo y demás documentación laboral que me corresponda."
      },
      { type: "paragraph", text: "Sin otro particular, saludo a ustedes atentamente." },
      { type: "signature-line", label: `${a.fullName || "Firma"} — DNI ${a.dni || ""}` }
    ];
  },
  suggestedFilename: (a) => `carta-renuncia-${(a.fullName || "documento").toLowerCase().replace(/\s+/g, "-")}`
};
