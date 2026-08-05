# Centro de Herramientas Gratuitas

Next.js 15 (App Router) + TypeScript + Tailwind CSS. Base de producción para
una plataforma de herramientas gratuitas, con 7 herramientas 100% funcionales
hoy y una arquitectura pensada para sumar el resto sin reescribir nada.

## Instalación

```bash
npm install
cp .env.example .env.local   # solo necesario para las herramientas del roadmap
npm run dev
```

Abrí http://localhost:3000.

## Qué funciona hoy (sin backend, sin API keys)

Todo el procesamiento ocurre en el navegador del usuario — nada se sube a un
servidor, así que no hay costo de infraestructura ni riesgo de privacidad:

| Herramienta | Ruta | Cubre |
|---|---|---|
| Herramientas de texto | `/herramientas/texto` | Contador de palabras/caracteres, mayúsculas/minúsculas/capitalizar, invertir texto, eliminar espacios/saltos, eliminar duplicados, ordenar líneas, Lorem Ipsum |
| Generador de QR | `/herramientas/qr` | Texto/URL, WiFi, contacto (vCard), email, SMS, evento (iCal) — descarga PNG y SVG |
| Contraseñas y hash | `/herramientas/seguridad` | Generador de contraseñas + analizador de fuerza, MD5/SHA-1/SHA-256, UUID v4, tokens seguros |
| Colores | `/herramientas/colores` | HEX ↔ RGB ↔ HSL ↔ CMYK, generador de paletas, checker de contraste WCAG AA/AAA |
| Conversor de unidades | `/herramientas/conversores` | Longitud, peso, temperatura, área, volumen, tiempo, velocidad, datos digitales, ángulos |
| Conversor de moneda | `/herramientas/moneda` | Tasas reales (BCE, vía Frankfurter API) con caché server-side de 30 min |
| Calculadoras | `/herramientas/calculadoras` | Edad, IMC, porcentaje, descuento/IVA, propina, interés compuesto |
| Productividad | `/herramientas/productividad` | Cronómetro, cuenta regresiva, notas rápidas, lista de tareas |
| Conversor de PDF | `/herramientas/pdf-convertir` | Imagen→PDF, PDF→JPG, Word→PDF, unir PDFs, **firmar PDF con firma manuscrita** |
| Herramientas de imágenes | `/herramientas/imagenes` | Comprimir, redimensionar, recortar, convertir formato, **quitar fondo con IA** (modelo real corriendo en el navegador) |
| Extraer texto de imágenes (OCR) | `/herramientas/ocr` | Tesseract.js — foto o captura → texto editable, varios idiomas |
| Kit de desarrolladores | `/herramientas/desarrollo` | Formateador/validador de JSON, Base64, URL encode/decode, decodificador de JWT |
| Comprimir y convertir video | `/herramientas/video` | Compresión con presets de calidad/resolución y conversión a GIF, vía ffmpeg.wasm |
| Facturas y recibos | `/herramientas/facturas` | Ítems, cálculo automático de IVA/subtotal/total, vista previa en vivo, exporta a PDF |
| Traductor | `/herramientas/traductor` | Más de 20 idiomas, detección automática (franc-min, en el navegador), pronunciación (Web Speech API) |
| Firmas de email | `/herramientas/firma-email` | HTML basado en tablas (compatible con Gmail/Outlook), vista previa, copiar como HTML enriquecido, exportar .html y .png |
| Constructor de currículum | `/herramientas/cv` | Plantilla moderna (con foto/color) y plantilla ATS (texto plano, sin columnas), exporta a PDF, autoguardado local + exportar/importar proyecto en .json |
| Generador de documentos | `/herramientas/documentos` | Detección de intención por palabras clave, subida opcional de PDF de referencia con datos auto-detectados, y asistente de preguntas (una a la vez) para carta de renuncia, reclamo formal, descargo, contrato de alquiler simple, carta de presentación y nota para el colegio. Genera PDF y Word. Sin IA: plantillas con lógica condicional, 100% confiable |
| Panel de investigación | `/herramientas/investigacion` | Lanzador de búsquedas ya armadas hacia Reddit, YouTube, Google Shopping y comparativas — sin API externa, no puede romperse |

Cualquier otro slug de herramienta listado en `lib/tools-registry.ts` con
`implemented: false` renderiza automáticamente una página "próximamente" con
un formulario de lista de espera (`/app/api/waitlist`), en vez de un 404 o un
mock que aparenta funcionar.

### Sobre las herramientas de IA/procesamiento pesado

Quitar fondo, OCR y video usan modelos/motores reales (no simulados) que
corren dentro del navegador vía WebAssembly, pero para eso necesitan
descargar sus binarios desde un CDN público la primera vez que se usan. Por
eso `next.config.mjs` permite explícitamente estos tres hosts en la
Content-Security-Policy (`connect-src`/`worker-src`) — nada más:

- `staticimgly.com` — modelo de segmentación de `@imgly/background-removal`
- `cdn.jsdelivr.net` — motor y datos de idioma de `tesseract.js`
- `unpkg.com` — núcleo WebAssembly de `ffmpeg.wasm`

Ninguno es una API paga ni requiere credenciales; son binarios/pesos de
modelo públicos que el navegador del usuario descarga directamente.

## Arquitectura

- **`lib/tools-registry.ts`** — única fuente de verdad para cada herramienta
  (nombre, categoría, ruta, sinónimos de búsqueda, estado). La landing, el
  buscador, `/herramientas`, el sitemap y el footer leen todos de acá.
  Agregar una herramienta nueva es agregar una entrada + su carpeta de ruta.
- **`components/tools/`** — un componente cliente por grupo de herramientas,
  con una interfaz consistente (`ToolShell`, `CopyButton`, `DownloadButton`).
- **`lib/providers/`** — interfaces TypeScript para todo lo que depende de un
  servicio externo (traducción, conversión de PDF, IA sobre imágenes). La UI
  programa contra la interfaz, nunca contra un proveedor concreto — cambiar
  de proveedor es un archivo nuevo, no una reescritura. Ver
  `lib/providers/README.md`.
- **`app/api/waitlist/route.ts`** — ejemplo de ruta API con validación (Zod),
  rate limiting y sin datos hardcodeados.

## Lo que falta para el alcance completo del brief (y por qué)

El brief original pide, además de lo anterior: conversión y edición de PDF,
eliminación de fondo y mejora de imagen con IA, más de 100 idiomas de
traducción, constructor de CV con proyectos guardados, autenticación,
PostgreSQL + Prisma, almacenamiento en Supabase, panel de administración
completo, y monetización (AdSense, planes Pro, afiliados). Ninguna de esas
piezas puede implementarse de verdad sin decisiones y credenciales que solo
el dueño del proyecto puede tomar/crear:

1. **Documentos e imágenes (PDF, quitar fondo, mejorar con IA)** necesitan
   un proveedor real (ConvertAPI/Gotenberg, remove.bg/Clipdrop, etc.) con su
   propia API key y, en varios casos, procesamiento en un servidor (no en el
   navegador). Las interfaces ya existen en `lib/providers/`; falta la
   cuenta del proveedor elegido.
2. **Traducción a 100+ idiomas** necesita una API de traducción (DeepL,
   Google Cloud Translation) — mismo caso.
3. **Auth + base de datos + almacenamiento** (necesarios para el constructor
   de CV, cuentas de usuario, favoritos e historial) requieren provisionar
   PostgreSQL, elegir Clerk o Auth.js, y crear un bucket de Supabase Storage
   — pasos de infraestructura, no de código.
4. **Panel de administración y monetización** dependen de que las piezas
   anteriores (auth, DB, analíticas) ya existan; construirlo antes sería
   una maqueta sin datos reales detrás.

La recomendación es priorizar 1–2 herramientas de la lista de arriba,
conseguir/crear la credencial correspondiente, y las implemento contra la
interfaz ya definida — así cada pieza nueva es real desde el día uno, en vez
de un mock que hay que rehacer después.



Estas dos herramientas se construyeron deliberadamente **sin depender de una IA de pago** (a pedido explícito, para no exponer al dueño del sitio a costos por uso impredecibles):

- **Generador de documentos**: en vez de un chatbot libre, usa plantillas con lógica condicional que yo mismo redacté (`lib/document-templates/`). Es más confiable que un LLM para este caso — cero riesgo de que "invente" algo mal en un documento formal — pero cubre 4 tipos de documento hoy (renuncia, reclamo, presentación, nota de colegio). Agregar uno nuevo (contrato simple, descargo, presupuesto) es escribir un archivo de plantilla nuevo, no tocar el motor.
- **Panel de investigación**: sin LLM no hay forma honesta de generar una "conclusión" redactada — así que en cambio es un lanzador de búsquedas ya armadas (Reddit vía Google, YouTube, Google Shopping, comparativas). Cero APIs externas, cero configuración, no puede romperse por un cambio de política de un tercero.

Si en el futuro se decide sumar una clave de API de un LLM (Anthropic, Google Gemini, etc.), ambas herramientas están armadas para que esa pieza se agregue como una capa adicional sin rehacer la arquitectura.

- TypeScript estricto, sin `any`, sin TODOs ni funciones vacías.
- Tailwind con tokens de diseño propios (ver `tailwind.config.ts`): paleta,
  tipografía (Space Grotesk + Inter + JetBrains Mono), radios y sombras
  consistentes en toda la plataforma.
- Modo claro/oscuro con `next-themes`, sin flash de tema incorrecto.
- Accesibilidad: foco visible, `aria-*` en el buscador y el acordeón de FAQ,
  contraste verificado, navegación completa por teclado, `prefers-reduced-motion`
  respetado.
- Seguridad: cabeceras HTTP (`Content-Security-Policy`, `X-Frame-Options`,
  etc. en `next.config.mjs`), validación con Zod en la única API route,
  rate limiting básico documentado con su límite real (no infinito).
- SEO: metadata por página, Open Graph, Twitter Cards, `sitemap.xml` y
  `robots.txt` generados solo con rutas reales (no se indexan las páginas
  "próximamente").
