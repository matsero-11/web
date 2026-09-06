import { ALL_TOOLS } from "@/lib/tools-registry";
import { GUIDES } from "@/lib/guides-data"; // Si tienes guías, inclúyelas también

const BASE_URL = "https://metabox-web.vercel.app";
const LAST_MODIFIED = new Date("2026-09-02T00:00:00.000Z");

export default function sitemap() {
  // 1. URLs de las herramientas usando query params
  const toolUrls = ALL_TOOLS
    .filter(tool => tool && typeof tool.id === "string" && tool.id.trim().length > 0)
    .map(tool => ({
      url: `${BASE_URL}/?tool=${encodeURIComponent(tool.id)}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  // 2. URLs de las guías (si las manejas con ?guide= o similar)
  const guideUrls = (GUIDES || []).map(guide => ({
    url: `${BASE_URL}/?guide=${guide.id}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...toolUrls,
    ...guideUrls,
  ];
}

