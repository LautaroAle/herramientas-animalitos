import type { DocumentTemplate } from "@/lib/document-templates/types";

export const notaColegioTemplate: DocumentTemplate = {
  slug: "nota-colegio",
  name: "Nota para el colegio",
  shortDescription: "Justificá una inasistencia o pedí un permiso para tu hijo/a.",
  disclaimer: "Cada institución puede tener su propio formato preferido — esta nota cubre lo esencial que casi todas piden.",
  keywords: ["nota para el colegio", "justificar inasistencia", "falta al colegio", "ausente en la escuela", "permiso escolar", "mi hijo faltó"],
  fields: [
    { id: "schoolName", label: "Nombre del colegio", type: "text" },
    { id: "studentName", label: "Nombre del alumno/a", type: "text", required: true },
    { id: "grade", label: "Grado / curso", type: "text", placeholder: "Ej: 4° B", required: true },
    { id: "parentName", label: "Tu nombre (madre/padre/tutor)", type: "text", required: true },
    { id: "dni", label: "Tu DNI", type: "text", required: true },
    { id: "reason", label: "Motivo", type: "select", options: ["Enfermedad", "Turno médico", "Motivos familiares", "Viaje", "Otro"], required: true },
    { id: "reasonDetail", label: "Detalle (opcional)", type: "textarea", placeholder: "Ej: fiebre y malestar general" },
    { id: "dateFrom", label: "Desde", type: "date", required: true },
    { id: "dateTo", label: "Hasta (si es más de un día)", type: "date" },
    { id: "city", label: "Ciudad", type: "text" }
  ],
  generate: (a) => {
    const today = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
    const dateFrom = a.dateFrom ? new Date(a.dateFrom).toLocaleDateString("es-AR") : "";
    const dateTo = a.dateTo ? new Date(a.dateTo).toLocaleDateString("es-AR") : "";
    const dateRange = dateTo && dateTo !== dateFrom ? `desde el ${dateFrom} hasta el ${dateTo}` : `el día ${dateFrom}`;
    const reason = a.reason || "";
    const reasonText = a.reasonDetail ? `${reason.toLowerCase()} (${a.reasonDetail})` : reason.toLowerCase();

    return [
      { type: "date-place", text: `${a.city || ""}, ${today}` },
      { type: "heading", text: "Nota de Justificación" },
      { type: "paragraph", text: a.schoolName ? `Sr./Sra. Director/a\n${a.schoolName}` : "Sr./Sra. Director/a" },
      { type: "spacer" },
      {
        type: "paragraph",
        text: `Por medio de la presente, yo, ${a.parentName || "[Nombre]"}, DNI N° ${a.dni || "[DNI]"}, en mi carácter de madre/padre/tutor del alumno/a ${a.studentName || "[Nombre del alumno]"}, de ${a.grade || "[grado]"}, informo que ${a.studentName ? "el/la mismo/a" : "mi hijo/a"} no asistirá / no pudo asistir a clases ${dateRange}, por motivo de ${reasonText}.`
      },
      { type: "paragraph", text: "Agradezco tengan a bien considerar esta justificación." },
      { type: "signature-line", label: `${a.parentName || "Firma"} — DNI ${a.dni || ""}` }
    ];
  },
  suggestedFilename: (a) => `nota-colegio-${(a.studentName || "documento").toLowerCase().replace(/\s+/g, "-")}`
};
