import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { DocumentWizard } from "@/components/tools/document-wizard";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("documentos")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <DocumentWizard />
      </ToolCardSurface>
    </ToolShell>
  );
}
