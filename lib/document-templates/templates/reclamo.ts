import type { DocumentTemplate } from "@/lib/document-templates/types";

const REQUEST_PHRASES: Record<string, string> = {
  Reembolso: "el reembolso total del dinero abonado",
  "Cambio del producto": "el cambio del producto por uno nuevo en perfectas condiciones",
  Reparación: "la reparación sin cargo del producto",
  "Cancelar el servicio": "la cancelación inmediata del servicio y el cese de cualquier cobro asociado"
};

export const reclamoTemplate: DocumentTemplate = {
  slug: "reclamo",
  name: "Carta de reclamo formal",
  shortDescription: "Para reclamarle a una tienda, vendedor o empresa por un producto o servicio.",
  disclaimer:
    "Esto genera una carta de reclamo formal, el paso habitual antes de una denuncia en Defensa del Consumidor. No es lo mismo que una Carta Documento oficial de Correo Argentino (que es un servicio postal certificado con su propio formulario) — si necesitás esa vía, podés llevar este mismo texto a una sucursal de Correo Argentino.",
  keywords: [
    "reclamo", "reclamar", "me llegó roto", "producto roto", "producto defectuoso", "quiero mi plata",
    "quiero un reembolso", "no me devuelven la plata", "estafa", "no funciona", "garantía", "devolución",
    "carta documento", "queja formal", "denuncia", "defensa del consumidor"
  ],
  fields: [
    { id: "fullName", label: "Tu nombre completo", type: "text", required: true },
    { id: "dni", label: "Tu DNI", type: "text", required: true },
    { id: "recipientCompany", label: "¿A quién le reclamás?", type: "text", placeholder: "Ej: Mercado Libre, Movistar, Juan Pérez…", required: true },
    { id: "whereBought", label: "¿Dónde lo compraste / contrataste?", type: "text", placeholder: "Ej: Mercado Libre, tienda física en…", required: true },
    { id: "purchaseDate", label: "Fecha de la compra", type: "date" },
    { id: "orderNumber", label: "N° de orden, factura o pedido (si tenés)", type: "text" },
    { id: "whatHappened", label: "¿Qué pasó?", type: "textarea", placeholder: "Ej: Me llegó el producto roto / El servicio nunca funcionó / Me cobraron algo que no contraté…", required: true },
    { id: "whatYouWant", label: "¿Qué querés pedir?", type: "select", options: Object.keys(REQUEST_PHRASES), required: true },
    { id: "deadlineDays", label: "Plazo para responder (días hábiles)", type: "text", placeholder: "10" },
    { id: "city", label: "Ciudad", type: "text", required: true }
  ],
  generate: (a) => {
    const today = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
    const purchaseDate = a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString("es-AR") : "";
    const requestPhrase = REQUEST_PHRASES[a.whatYouWant || ""] || "una solución a la situación planteada";
    const deadline = a.deadlineDays || "10";

    return [
      { type: "date-place", text: `${a.city || ""}, ${today}` },
      { type: "heading", text: "Carta de Reclamo" },
      { type: "paragraph", text: `A: ${a.recipientCompany || "[Empresa]"}` },
      { type: "spacer" },
      {
        type: "paragraph",
        text: `Quien suscribe, ${a.fullName || "[Nombre completo]"}, DNI N° ${a.dni || "[DNI]"}, en su carácter de consumidor/a, se dirige a ustedes a fin de formular el siguiente reclamo respecto de un producto o servicio adquirido en/con ${a.whereBought || "[lugar de compra]"}${purchaseDate ? ` con fecha ${purchaseDate}` : ""}${a.orderNumber ? `, identificado con el N° de orden/factura ${a.orderNumber}` : ""}.`
      },
      { type: "paragraph", text: `Hechos: ${a.whatHappened || "[Descripción de lo ocurrido]"}` },
      {
        type: "paragraph",
        text: "La presente situación constituye un incumplimiento de las obligaciones asumidas frente al consumidor, en los términos de la Ley N° 24.240 de Defensa del Consumidor, que garantiza el derecho a recibir productos y servicios en condiciones adecuadas de uso y funcionamiento."
      },
      {
        type: "paragraph",
        text: `En virtud de lo expuesto, solicito formalmente ${requestPhrase}, dentro de un plazo de ${deadline} días hábiles a partir de la recepción de la presente.`
      },
      {
        type: "paragraph",
        text: "En caso de no obtener una respuesta satisfactoria dentro del plazo indicado, me veré en la necesidad de iniciar el reclamo correspondiente ante la autoridad de Defensa del Consumidor de mi jurisdicción."
      },
      { type: "paragraph", text: "Quedo a la espera de su pronta respuesta." },
      { type: "signature-line", label: `${a.fullName || "Firma"} — DNI ${a.dni || ""}` }
    ];
  },
  suggestedFilename: (a) => `reclamo-${(a.recipientCompany || "documento").toLowerCase().replace(/\s+/g, "-")}`
};
