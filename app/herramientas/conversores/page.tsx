import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { UnitConverter } from "@/components/tools/unit-converter";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("conversores")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <UnitConverter />
      </ToolCardSurface>
    </ToolShell>
  );
}
