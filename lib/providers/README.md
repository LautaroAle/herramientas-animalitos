# Capa de abstracción de proveedores externos

Las herramientas que dependen de un servicio externo (traducción, conversión
de documentos, IA sobre imágenes) **nunca llaman a ese servicio directamente
desde un componente o una ruta de API**. En su lugar, dependen de una
interfaz TypeScript definida aquí. Esto permite cambiar de proveedor (por
ejemplo, pasar de DeepL a Google Translate, o de remove.bg a un modelo propio)
editando un único archivo de implementación, sin tocar el resto del sistema.

## Convención

```
lib/providers/
  translation-provider.ts   <- interfaz TranslationProvider + tipos
  translation.deepl.ts      <- implementación real (requiere DEEPL_API_KEY)
  pdf-provider.ts           <- interfaz PdfProvider + tipos
  image-ai-provider.ts      <- interfaz ImageAiProvider (remove bg, upscale, ...)
```

Cada implementación real:

1. Lee su credencial desde `process.env` (nunca hardcodeada).
2. Si la variable de entorno falta, lanza un error explícito y accionable
   (`"DEEPL_API_KEY no está configurada. Agrégala en .env.local."`) — nunca
   devuelve datos simulados como si fueran reales.
3. Se selecciona en un único punto de composición (`lib/providers/index.ts`),
   de forma que agregar un segundo proveedor es una rama de `if`, no una
   reescritura.

## Por qué no vienen "implementadas" en este entregable

`traductor`, `pdf-convertir`, `imagen-fondo`, `imagen-mejorar` y `cv` (que
guarda proyectos) requieren credenciales reales de un proveedor externo,
una base de datos provisionada y/o un bucket de almacenamiento — recursos que
solo el equipo del proyecto puede crear y que no deben quedar hardcodeados ni
simulados en el código fuente. Las interfaces de este directorio son el
contrato contra el que se debe programar la UI de esas herramientas; una vez
que exista la cuenta/API key correspondiente, la implementación es un archivo
nuevo que satisface la interfaz — no un cambio de arquitectura.
