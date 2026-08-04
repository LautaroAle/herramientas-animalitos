import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { ResearchPanel } from "@/components/tools/research-panel";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("investigacion")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <ResearchPanel />
      </ToolCardSurface>
    </ToolShell>
  );
}
