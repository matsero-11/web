import { ALL_TOOLS } from "@/lib/tools-registry";

const BASE_URL = "https://metabox-web.vercel.app";
const LAST_MODIFIED = new Date("2026-09-02T00:00:00.000Z");

export default function sitemap() {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...ALL_TOOLS.map((tool) => ({
      url: `${BASE_URL}/herramientas/${tool.id}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    })),
  ];
}
