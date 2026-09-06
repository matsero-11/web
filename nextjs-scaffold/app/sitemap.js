import { ALL_TOOLS } from "@/lib/tools-registry";

const BASE_URL = "https://metabox-web.vercel.app";
const LAST_MODIFIED = new Date();

export default async function sitemap() {
  // Protección por si la lista de herramientas viene vacía o no es un array
  const safeTools = Array.isArray(ALL_TOOLS) ? ALL_TOOLS : [];

  const toolUrls = safeTools
    .filter(tool => tool && typeof tool.id === "string" && tool.id.trim().length > 0)
    .map(tool => ({
      url: `${BASE_URL}/?tool=${encodeURIComponent(tool.id)}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/aviso-legal`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookies`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacidad`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...toolUrls,
  ];
}
