import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { OcrTool } from "@/components/tools/ocr-tool";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("ocr")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <OcrTool />
      </ToolCardSurface>
    </ToolShell>
  );
}
