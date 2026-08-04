import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/lib/tools-registry";

export function ToolShell({
  icon,
  title,
  description,
  children
}: {
  icon: IconName;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-signal-gradient text-white">
          <Icon name={icon} size={22} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold md:text-3xl">{title}</h1>
          <p className="mt-1.5 text-ink-950/60 dark:text-white/60">{description}</p>
        </div>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}

/** Small inline success/error banner, used consistently across every tool. */
export function StatusBanner({ kind, children }: { kind: "success" | "error"; children: ReactNode }) {
  return (
    <p
      role="status"
      className={
        kind === "success"
          ? "rounded-lg bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400"
          : "rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400"
      }
    >
      {children}
    </p>
  );
}

/** Consistent card wrapper for each tool's working area. */
export function ToolCardSurface({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl2 border border-ink-950/8 bg-white p-6 shadow-soft dark:border-white/8 dark:bg-ink-900 dark:shadow-soft-dark">
      {children}
    </div>
  );
}
