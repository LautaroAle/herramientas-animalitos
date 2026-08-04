import type { MetadataRoute } from "next";
import { IMPLEMENTED_TOOLS } from "@/lib/tools-registry";

const SITE_URL = "https://centro-de-herramientas.example.com";

// Only implemented tools are indexed — unimplemented ones render a
// "próximamente" page and shouldn't compete for search ranking yet.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/herramientas`, changeFrequency: "weekly", priority: 0.9 }
  ];

  const uniqueHrefs = Array.from(new Set(IMPLEMENTED_TOOLS.map((tool) => tool.href)));
  const toolRoutes: MetadataRoute.Sitemap = uniqueHrefs.map((href) => ({
    url: `${SITE_URL}${href}`,
    changeFrequency: "monthly",
    priority: 0.8
  }));

  return [...staticRoutes, ...toolRoutes];
}
