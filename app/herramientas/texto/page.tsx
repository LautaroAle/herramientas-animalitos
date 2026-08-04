import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { TextTools } from "@/components/tools/text-tools";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("texto")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <TextTools />
      </ToolCardSurface>
    </ToolShell>
  );
}
