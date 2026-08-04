import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { ImageTools } from "@/components/tools/image-tools";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("imagen-comprimir")!;

export const metadata: Metadata = {
  title: "Herramientas de imágenes",
  description: "Comprimir, redimensionar, recortar, convertir formato y quitar el fondo de tus imágenes con IA — todo en tu navegador."
};

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title="Herramientas de imágenes" description="Comprimir, redimensionar, recortar, convertir formato y quitar fondo con IA.">
      <ToolCardSurface>
        <ImageTools />
      </ToolCardSurface>
    </ToolShell>
  );
}
