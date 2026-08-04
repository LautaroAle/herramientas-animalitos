import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { CvBuilder } from "@/components/tools/cv-builder";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("cv")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <CvBuilder />
      </ToolCardSurface>
    </ToolShell>
  );
}
