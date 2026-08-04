"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Wraps the app in a light/dark theme context.
 * Uses `class` strategy so Tailwind's `dark:` variants apply instantly
 * without a flash of the wrong theme (next-themes injects a blocking
 * inline script on the server-rendered HTML).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
