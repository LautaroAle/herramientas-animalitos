import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { Calculators } from "@/components/tools/calculators";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("calculadoras")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <Calculators />
      </ToolCardSurface>
    </ToolShell>
  );
}
