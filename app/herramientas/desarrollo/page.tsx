import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { DevKit } from "@/components/tools/dev-kit";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("desarrollo")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <DevKit />
      </ToolCardSurface>
    </ToolShell>
  );
}
