import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { CurrencyConverter } from "@/components/tools/currency-converter";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("moneda")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <CurrencyConverter />
      </ToolCardSurface>
    </ToolShell>
  );
}
