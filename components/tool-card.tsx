import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import type { ToolDefinition } from "@/lib/tools-registry";
import { cn } from "@/lib/utils";

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      href={tool.href}
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl2 border border-ink-950/8 dark:border-white/8",
        "bg-white dark:bg-ink-900 p-5 shadow-soft dark:shadow-soft-dark",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-signal-violet/30"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-signal-gradient text-white">
          <Icon name={tool.icon} size={20} strokeWidth={2} />
        </div>
        {tool.implemented ? (
          <ArrowUpRight
            size={18}
            className="text-ink-950/30 dark:text-white/30 transition-all group-hover:text-signal-violet group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-ink-950/5 dark:bg-white/10 px-2 py-1 text-[11px] font-medium text-ink-950/60 dark:text-white/60">
            <Clock size={11} /> Próximamente
          </span>
        )}
      </div>
      <div>
        <h3 className="font-display text-base font-semibold leading-snug">{tool.name}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-950/60 dark:text-white/60">
          {tool.shortDescription}
        </p>
      </div>
    </Link>
  );
}
