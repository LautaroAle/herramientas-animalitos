import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { SignatureGenerator } from "@/components/tools/signature-generator";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("firma-email")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <SignatureGenerator />
      </ToolCardSurface>
    </ToolShell>
  );
}
