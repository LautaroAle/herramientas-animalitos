import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { TranslatorTool } from "@/components/tools/translator-tool";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("traductor")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <TranslatorTool />
      </ToolCardSurface>
    </ToolShell>
  );
}
