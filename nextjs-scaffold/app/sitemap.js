import { ALL_TOOLS } from "@/lib/tools-registry";

const BASE_URL = "https://metabox-web.vercel.app";
const LAST_MODIFIED = new Date("2026-09-02");

export default function sitemap() {
  const toolRoutes = ALL_TOOLS.map((tool) => ({
    url: `${BASE_URL}/herramientas/${tool.id}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...toolRoutes,
  ];
}
