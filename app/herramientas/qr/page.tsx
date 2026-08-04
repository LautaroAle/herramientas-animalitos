import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { QrTools } from "@/components/tools/qr-tools";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("qr")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <QrTools />
      </ToolCardSurface>
    </ToolShell>
  );
}
