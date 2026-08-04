import type { DocumentTemplate, ContentBlock } from "@/lib/document-templates/types";

export const contratoAlquilerTemplate: DocumentTemplate = {
  slug: "contrato-alquiler",
  name: "Contrato de alquiler simple",
  shortDescription: "Un contrato de locación básico entre propietario e inquilino.",
  disclaimer:
    "Cubre lo esencial de un alquiler simple entre particulares. Para alquileres de vivienda en Argentina, la Ley de Alquileres tiene requisitos adicionales según el caso (actualización de precio, garantías, etc.) — para contratos de valor alto o dudas específicas, te recomendamos que lo revise un escribano o abogado antes de firmar.",
  keywords: ["contrato de alquiler", "contrato de locacion", "alquilar mi casa", "alquilar un departamento", "contrato simple", "inquilino", "propietario"],
  fields: [
    { id: "landlordName", label: "Nombre del propietario/a", type: "text", required: true },
    { id: "landlordDni", label: "DNI del propietario/a", type: "text", required: true },
    { id: "tenantName", label: "Nombre del inquilino/a", type: "text", required: true },
    { id: "tenantDni", label: "DNI del inquilino/a", type: "text", required: true },
    { id: "propertyAddress", label: "Dirección del inmueble", type: "text", required: true },
    { id: "purpose", label: "Destino del inmueble", type: "select", options: ["Vivienda", "Comercial"], required: true },
    { id: "startDate", label: "Fecha de inicio del contrato", type: "date", required: true },
    { id: "durationMonths", label: "Duración (en meses)", type: "text", placeholder: "24", required: true },
    { id: "monthlyRent", label: "Monto mensual", type: "text", placeholder: "150000", required: true },
    { id: "currency", label: "Moneda", type: "select", options: ["ARS", "USD"], required: true },
    { id: "paymentDay", label: "Día de pago de cada mes", type: "text", placeholder: "10" },
    { id: "depositAmount", label: "Depósito en garantía (opcional)", type: "text" },
    { id: "city", label: "Ciudad", type: "text", required: true }
  ],
  generate: (a) => {
    const today = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
    const startDate = a.startDate ? new Date(a.startDate).toLocaleDateString("es-AR") : "";

    const blocks: ContentBlock[] = [
      { type: "date-place", text: `${a.city || ""}, ${today}` },
      { type: "heading", text: "Contrato de Locación" },
      {
        type: "paragraph",
        text: `Entre ${a.landlordName || "[Propietario/a]"}, DNI N° ${a.landlordDni || "[DNI]"}, en adelante "EL LOCADOR", y ${a.tenantName || "[Inquilino/a]"}, DNI N° ${a.tenantDni || "[DNI]"}, en adelante "EL LOCATARIO", se celebra el presente contrato de locación, sujeto a las siguientes cláusulas:`
      },
      { type: "heading", text: "Primera — Objeto" },
      {
        type: "paragraph",
        text: `EL LOCADOR da en locación al LOCATARIO el inmueble ubicado en ${a.propertyAddress || "[dirección]"}, con destino exclusivo a ${(a.purpose || "vivienda").toLowerCase()}.`
      },
      { type: "heading", text: "Segunda — Plazo" },
      {
        type: "paragraph",
        text: `El plazo de locación se establece en ${a.durationMonths || "[cantidad]"} meses, a partir del ${startDate || "[fecha]"}.`
      },
      { type: "heading", text: "Tercera — Precio y forma de pago" },
      {
        type: "paragraph",
        text: `El precio mensual de la locación se fija en ${a.currency || "ARS"} ${a.monthlyRent || "[monto]"}, pagadero por adelantado dentro de los primeros ${a.paymentDay || "10"} días de cada mes.`
      }
    ];

    if (a.depositAmount) {
      blocks.push(
        { type: "heading", text: "Cuarta — Depósito en garantía" },
        {
          type: "paragraph",
          text: `EL LOCATARIO entrega en concepto de depósito en garantía la suma de ${a.currency || "ARS"} ${a.depositAmount}, que será devuelta al finalizar el contrato, previa verificación del estado del inmueble.`
        }
      );
    }

    blocks.push(
      { type: "heading", text: "Firmas" },
      { type: "signature-line", label: `${a.landlordName || "El Locador"} — DNI ${a.landlordDni || ""}` },
      { type: "signature-line", label: `${a.tenantName || "El Locatario"} — DNI ${a.tenantDni || ""}` }
    );

    return blocks;
  },
  suggestedFilename: (a) => `contrato-alquiler-${(a.propertyAddress || "documento").toLowerCase().replace(/\s+/g, "-").slice(0, 40)}`
};
