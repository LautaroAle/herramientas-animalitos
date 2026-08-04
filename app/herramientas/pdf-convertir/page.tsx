import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { PdfTools } from "@/components/tools/pdf-tools";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("pdf-convertir")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <PdfTools />
      </ToolCardSurface>
    </ToolShell>
  );
}
