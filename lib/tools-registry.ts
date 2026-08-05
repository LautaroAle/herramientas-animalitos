/**
 * Tools Registry
 * ------------------------------------------------------------------
 * Single source of truth for every tool on the platform: its route,
 * category, search synonyms and implementation status.
 *
 * Adding a new tool NEVER requires touching the landing page, the
 * search index, the category pages or the sitemap generator — all of
 * those read from this file. To add a tool:
 *
 *   1. Add an entry below with a unique `slug`.
 *   2. If it's a real, working tool, set `implemented: true` and point
 *      `href` at its route (create the route under app/herramientas/<slug>).
 *   3. If it's not built yet, leave `implemented: false` — it will
 *      automatically render on the generic "próximamente" page and
 *      collect waitlist signups, and won't appear in sitemap.xml.
 */

export type ToolCategory =
  | "pdf"
  | "imagenes"
  | "qr"
  | "codigo-barras"
  | "conversores"
  | "texto"
  | "traduccion"
  | "cv"
  | "calculadoras"
  | "seguridad"
  | "email"
  | "colores"
  | "productividad"
  | "video"
  | "desarrollo"
  | "facturas"
  | "documentos"
  | "investigacion";

export interface ToolDefinition {
  slug: string;
  name: string;
  shortDescription: string;
  category: ToolCategory;
  /** Extra keywords/synonyms so fuzzy search finds this tool even with typos or alternate phrasing. */
  keywords: string[];
  implemented: boolean;
  /** Route the tool lives at. For unimplemented tools this is still reserved for when it ships. */
  href: string;
  icon: IconName;
}

export type IconName =
  | "FileText"
  | "Image"
  | "QrCode"
  | "Barcode"
  | "Calculator"
  | "Type"
  | "Languages"
  | "UserSquare"
  | "ShieldCheck"
  | "Mail"
  | "Palette"
  | "Timer"
  | "Video"
  | "Code2"
  | "Receipt"
  | "ScanText"
  | "FileSignature"
  | "Search";

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  pdf: "PDF",
  imagenes: "Imágenes",
  qr: "Códigos QR",
  "codigo-barras": "Códigos de barras",
  conversores: "Conversores",
  texto: "Texto",
  traduccion: "Traducción",
  cv: "Currículum",
  calculadoras: "Calculadoras",
  seguridad: "Seguridad",
  email: "Firmas de email",
  colores: "Colores",
  productividad: "Productividad",
  video: "Video",
  desarrollo: "Desarrollo",
  facturas: "Facturas",
  documentos: "Documentos",
  investigacion: "Investigación"
};

export const CATEGORY_ICONS: Record<ToolCategory, IconName> = {
  pdf: "FileText",
  imagenes: "Image",
  qr: "QrCode",
  "codigo-barras": "Barcode",
  conversores: "Calculator",
  texto: "Type",
  traduccion: "Languages",
  cv: "UserSquare",
  calculadoras: "Calculator",
  seguridad: "ShieldCheck",
  email: "Mail",
  colores: "Palette",
  productividad: "Timer",
  video: "Video",
  desarrollo: "Code2",
  facturas: "Receipt",
  documentos: "FileSignature",
  investigacion: "Search"
};

export const TOOLS: ToolDefinition[] = [
  // ---- Texto (fully implemented as one multitool workspace) ----
  {
    slug: "texto",
    name: "Herramientas de texto",
    shortDescription: "Contar, transformar, limpiar y generar texto en un solo lugar.",
    category: "texto",
    keywords: [
      "contador de palabras", "contador de caracteres", "eliminar espacios", "eliminar saltos de linea",
      "mayusculas", "minusculas", "capitalizar", "invertir texto", "eliminar duplicados",
      "ordenar lineas", "texto aleatorio", "lorem ipsum", "word counter"
    ],
    implemented: true,
    href: "/herramientas/texto",
    icon: "Type"
  },
  // ---- QR ----
  {
    slug: "qr",
    name: "Generador de códigos QR",
    shortDescription: "QR para texto, URL, WiFi, contacto, email, SMS y eventos.",
    category: "qr",
    keywords: ["qr wifi", "qr contacto", "qr ubicacion", "qr whatsapp", "qr email", "qr sms", "qr evento", "generador qr"],
    implemented: true,
    href: "/herramientas/qr",
    icon: "QrCode"
  },
  // ---- Seguridad ----
  {
    slug: "seguridad",
    name: "Contraseñas, hash y tokens",
    shortDescription: "Generador de contraseñas, analizador de fuerza, hash MD5/SHA-1/SHA-256, UUID y tokens.",
    category: "seguridad",
    keywords: [
      "generador de contraseñas", "analizador de contraseña", "hash md5", "sha1", "sha256",
      "generador uuid", "generador token", "password strength"
    ],
    implemented: true,
    href: "/herramientas/seguridad",
    icon: "ShieldCheck"
  },
  // ---- Colores ----
  {
    slug: "colores",
    name: "Selector y paletas de color",
    shortDescription: "Convierte HEX, RGB, HSL y CMYK, genera paletas y revisa el contraste.",
    category: "colores",
    keywords: ["selector de color", "hex a rgb", "hsl", "cmyk", "paleta de colores", "gradientes", "contraste", "accesibilidad de color"],
    implemented: true,
    href: "/herramientas/colores",
    icon: "Palette"
  },
  // ---- Conversores ----
  {
    slug: "conversores",
    name: "Conversor de unidades",
    shortDescription: "Moneda*, peso, longitud, área, volumen, tiempo, temperatura, presión, velocidad, datos y ángulos.",
    category: "conversores",
    keywords: [
      "conversor de peso", "conversor de longitud", "conversor de area", "conversor de volumen",
      "conversor de tiempo", "conversor de temperatura", "conversor de presion", "conversor de velocidad",
      "conversor de datos digitales", "conversor de frecuencia", "conversor de angulos", "conversor de energia", "conversor de combustible"
    ],
    implemented: true,
    href: "/herramientas/conversores",
    icon: "Calculator"
  },
  // ---- Calculadoras ----
  {
    slug: "calculadoras",
    name: "Calculadoras cotidianas",
    shortDescription: "Edad, IMC, porcentaje, IVA, descuentos, propinas e interés compuesto.",
    category: "calculadoras",
    keywords: [
      "calculadora de edad", "calculadora de imc", "calculadora de porcentaje", "calculadora de iva",
      "calculadora de descuento", "calculadora de propinas", "calculadora de interes compuesto",
      "calculadora de hipoteca", "calculadora de prestamos", "calculadora de salario", "horas trabajadas"
    ],
    implemented: true,
    href: "/herramientas/calculadoras",
    icon: "Calculator"
  },
  // ---- Productividad ----
  {
    slug: "productividad",
    name: "Cronómetro, temporizador y notas",
    shortDescription: "Cronómetro, cuenta regresiva, temporizador, notas rápidas y lista de tareas.",
    category: "productividad",
    keywords: ["cronometro", "temporizador", "cuenta regresiva", "notas rapidas", "bloc de notas", "lista de tareas", "contador manual"],
    implemented: true,
    href: "/herramientas/productividad",
    icon: "Timer"
  },

  // ---- PDF (roadmap — needs a document-processing backend) ----
  { slug: "pdf-convertir", name: "Convertir PDF", shortDescription: "Imagen a PDF, PDF a JPG, Word a PDF y unir PDFs — todo en tu navegador.", category: "pdf", keywords: ["word a pdf", "excel a pdf", "powerpoint a pdf", "pdf a word", "pdf a excel", "pdf a jpg", "imagen a pdf", "unir pdf", "combinar pdf"], implemented: true, href: "/herramientas/pdf-convertir", icon: "FileText" },
  { slug: "pdf-unir", name: "Unir PDFs", shortDescription: "Combina varios PDF en un único archivo.", category: "pdf", keywords: ["combinar pdf", "mezclar pdf", "juntar pdf"], implemented: true, href: "/herramientas/pdf-convertir", icon: "FileText" },
  { slug: "pdf-separar", name: "Separar PDF", shortDescription: "Divide un PDF en varios archivos.", category: "pdf", keywords: ["dividir pdf", "extraer paginas"], implemented: false, href: "/herramientas/pdf-separar", icon: "FileText" },
  { slug: "pdf-comprimir", name: "Comprimir PDF", shortDescription: "Reduce el peso de un PDF sin perder calidad legible.", category: "pdf", keywords: ["reducir peso pdf", "optimizar pdf"], implemented: false, href: "/herramientas/pdf-comprimir", icon: "FileText" },
  { slug: "pdf-organizar", name: "Rotar, reordenar y eliminar páginas", category: "pdf", shortDescription: "Organiza las páginas de tu PDF.", keywords: ["rotar pdf", "reordenar paginas", "eliminar paginas"], implemented: false, href: "/herramientas/pdf-organizar", icon: "FileText" },
  { slug: "pdf-firmar", name: "Firmar PDF", shortDescription: "Dibujá tu firma y estampala sobre el PDF.", category: "pdf", keywords: ["firmar pdf", "firma manuscrita", "marca de agua pdf"], implemented: true, href: "/herramientas/pdf-convertir", icon: "FileText" },

  // ---- Imágenes (roadmap — several need an AI provider) ----
  { slug: "imagen-fondo", name: "Eliminar fondo", shortDescription: "Quita el fondo de una imagen con un modelo de IA que corre en tu navegador.", category: "imagenes", keywords: ["remove bg", "quitar fondo", "fondo transparente"], implemented: true, href: "/herramientas/imagenes", icon: "Image" },
  { slug: "imagen-comprimir", name: "Comprimir imágenes", shortDescription: "Reduce el peso de tus imágenes ajustando la calidad.", category: "imagenes", keywords: ["optimizar imagen", "reducir peso imagen"], implemented: true, href: "/herramientas/imagenes", icon: "Image" },
  { slug: "imagen-redimensionar", name: "Redimensionar y recortar", shortDescription: "Cambia el tamaño o recorta una imagen arrastrando sobre ella.", category: "imagenes", keywords: ["resize", "crop", "recortar imagen"], implemented: true, href: "/herramientas/imagenes", icon: "Image" },
  { slug: "imagen-convertir", name: "Convertir formato de imagen", shortDescription: "Entre JPG, PNG y WEBP.", category: "imagenes", keywords: ["jpg a png", "png a webp", "convertir imagen"], implemented: true, href: "/herramientas/imagenes", icon: "Image" },
  { slug: "imagen-mejorar", name: "Mejorar calidad con IA", shortDescription: "Aumenta la resolución y nitidez con IA.", category: "imagenes", keywords: ["upscale", "mejorar imagen ia"], implemented: false, href: "/herramientas/imagen-mejorar", icon: "Image" },
  { slug: "imagen-objetos", name: "Eliminar objetos", shortDescription: "Borra objetos no deseados de una foto.", category: "imagenes", keywords: ["remove object", "borrar objeto foto"], implemented: false, href: "/herramientas/imagen-objetos", icon: "Image" },

  // ---- Código de barras ----
  { slug: "codigo-barras", name: "Generador de códigos de barras", shortDescription: "EAN, UPC, Code128, Code39 e ISBN.", category: "codigo-barras", keywords: ["ean", "upc", "code128", "code39", "isbn"], implemented: false, href: "/herramientas/codigo-barras", icon: "Barcode" },

  // ---- Traducción (roadmap — needs a translation provider) ----
  { slug: "traductor", name: "Traductor", shortDescription: "Traduce entre más de 20 idiomas, con detección automática y pronunciación.", category: "traduccion", keywords: ["traducir texto", "detectar idioma", "traductor de idiomas"], implemented: true, href: "/herramientas/traductor", icon: "Languages" },

  // ---- CV (roadmap — needs auth + storage for saved projects) ----
  { slug: "cv", name: "Constructor de currículum", shortDescription: "Dos plantillas (moderna y ATS), foto opcional, exporta a PDF y guarda tu progreso.", category: "cv", keywords: ["crear cv", "curriculum vitae", "resume builder", "cv ats"], implemented: true, href: "/herramientas/cv", icon: "UserSquare" },

  // ---- Email ----
  { slug: "firma-email", name: "Generador de firmas de email", shortDescription: "Creá una firma HTML profesional, con vista previa, y copiala o exportala.", category: "email", keywords: ["firma html", "email signature", "firma de correo"], implemented: true, href: "/herramientas/firma-email", icon: "Mail" },

  // ---- Nuevas: implementadas ----
  { slug: "moneda", name: "Conversor de moneda", shortDescription: "Tasas de cambio en tiempo real entre más de 30 monedas.", category: "conversores", keywords: ["conversor de divisas", "tipo de cambio", "dolar a peso", "euro a dolar", "cotizacion"], implemented: true, href: "/herramientas/moneda", icon: "Calculator" },
  { slug: "ocr", name: "Extraer texto de imágenes (OCR)", shortDescription: "Convierte fotos, capturas o documentos escaneados en texto editable.", category: "imagenes", keywords: ["ocr", "imagen a texto", "extraer texto de foto", "escanear texto"], implemented: true, href: "/herramientas/ocr", icon: "ScanText" },
  { slug: "desarrollo", name: "Kit de herramientas para desarrolladores", shortDescription: "JSON, Base64, URL encode/decode y decodificador de JWT.", category: "desarrollo", keywords: ["formatear json", "json validator", "base64", "decodificar jwt", "url encode", "url decode"], implemented: true, href: "/herramientas/desarrollo", icon: "Code2" },
  { slug: "video", name: "Comprimir y convertir video", shortDescription: "Reduce el peso de un video o convertilo a GIF, directo en tu navegador.", category: "video", keywords: ["comprimir video", "video a gif", "reducir peso video", "convertir video"], implemented: true, href: "/herramientas/video", icon: "Video" },
  { slug: "facturas", name: "Generador de facturas y recibos", shortDescription: "Creá una factura profesional con cálculo automático de IVA y exportala a PDF.", category: "facturas", keywords: ["generador de facturas", "recibo", "invoice generator", "factura pdf"], implemented: true, href: "/herramientas/facturas", icon: "Receipt" },
  { slug: "documentos", name: "Generador de documentos", shortDescription: "Respondé unas preguntas y recibí tu carta de renuncia, reclamo, presentación o nota, lista en PDF y Word.", category: "documentos", keywords: ["carta de renuncia", "carta documento", "reclamo", "descargo", "nota para el colegio", "carta de presentacion", "generador de cartas"], implemented: true, href: "/herramientas/documentos", icon: "FileSignature" },
  { slug: "investigacion", name: "Panel de investigación", shortDescription: "Lanzá de una todas las búsquedas que harías a mano: Reddit, YouTube, precios y comparativas.", category: "investigacion", keywords: ["comparar productos", "opiniones", "reviews", "que aspiradora robot comprar", "vale la pena"], implemented: true, href: "/herramientas/investigacion", icon: "Search" }
];

export const IMPLEMENTED_TOOLS = TOOLS.filter((t) => t.implemented);

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return TOOLS.filter((t) => t.category === category);
}
