import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { SecurityTools } from "@/components/tools/security-tools";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("seguridad")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <SecurityTools />
      </ToolCardSurface>
    </ToolShell>
  );
}
