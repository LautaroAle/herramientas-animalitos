import type { DocumentTemplate } from "@/lib/document-templates/types";

export const presentacionTemplate: DocumentTemplate = {
  slug: "presentacion",
  name: "Carta de presentación",
  shortDescription: "Para acompañar tu CV cuando te postulás a un empleo.",
  disclaimer: "Es un punto de partida sólido — siempre suma editar un par de frases con detalles bien tuyos antes de enviarla.",
  keywords: ["carta de presentación", "postularme a un empleo", "aplicar a un trabajo", "carta para adjuntar al cv", "cover letter"],
  fields: [
    { id: "fullName", label: "Tu nombre completo", type: "text", required: true },
    { id: "position", label: "Puesto al que te postulás", type: "text", required: true },
    { id: "company", label: "Empresa", type: "text", required: true },
    { id: "recipientName", label: "Nombre del reclutador/a (si lo sabés)", type: "text" },
    { id: "keySkills", label: "Tus 2-3 fortalezas principales para este puesto", type: "textarea", required: true, placeholder: "Ej: 5 años de experiencia en atención al cliente, manejo de Excel avanzado, liderazgo de equipos" },
    { id: "whyInterested", label: "¿Por qué te interesa esta empresa/puesto?", type: "textarea", required: true },
    { id: "email", label: "Tu email de contacto", type: "text" },
    { id: "phone", label: "Tu teléfono", type: "text" },
    { id: "city", label: "Ciudad", type: "text" }
  ],
  generate: (a) => {
    const today = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
    const contact = [a.email, a.phone].filter(Boolean).join(" · ");

    return [
      { type: "date-place", text: `${a.city || ""}, ${today}` },
      { type: "heading", text: "Carta de Presentación" },
      { type: "paragraph", text: a.recipientName ? `Estimado/a ${a.recipientName}:` : "Estimados/as:" },
      { type: "spacer" },
      {
        type: "paragraph",
        text: `Mi nombre es ${a.fullName || "[Nombre]"} y me dirijo a ustedes para postularme al puesto de ${a.position || "[puesto]"} en ${a.company || "[empresa]"}.`
      },
      { type: "paragraph", text: a.keySkills || "" },
      { type: "paragraph", text: a.whyInterested || "" },
      {
        type: "paragraph",
        text: "Quedo a disposición para ampliar cualquier detalle de mi perfil en una entrevista, y agradezco desde ya la consideración de mi postulación."
      },
      { type: "paragraph", text: "Saludos cordiales," },
      { type: "signature-line", label: [a.fullName, contact].filter(Boolean).join(" — ") }
    ];
  },
  suggestedFilename: (a) => `carta-presentacion-${(a.company || "documento").toLowerCase().replace(/\s+/g, "-")}`
};
