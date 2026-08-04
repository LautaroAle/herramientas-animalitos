import type { Metadata } from "next";
import { ToolShell, ToolCardSurface } from "@/components/tools/tool-shell";
import { VideoTools } from "@/components/tools/video-tools";
import { getToolBySlug } from "@/lib/tools-registry";

const tool = getToolBySlug("video")!;

export const metadata: Metadata = { title: tool.name, description: tool.shortDescription };

export default function Page() {
  return (
    <ToolShell icon={tool.icon} title={tool.name} description={tool.shortDescription}>
      <ToolCardSurface>
        <VideoTools />
      </ToolCardSurface>
    </ToolShell>
  );
}
