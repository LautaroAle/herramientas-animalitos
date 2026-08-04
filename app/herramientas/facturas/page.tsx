import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { InvoiceGenerator } from "@/components/tools/invoice-generator";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("facturas")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <InvoiceGenerator />
      </ToolCardSurface>
    </ToolShell>
  );
}
