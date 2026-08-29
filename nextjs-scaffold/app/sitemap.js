import { ALL_TOOLS } from "@/lib/tools-registry";

// Cambiar por el dominio real antes de desplegar
const BASE_URL = "https://ejemplo.com";

export default function sitemap() {
  const toolRoutes = ALL_TOOLS.map((t) => ({
    url: `${BASE_URL}/herramientas/${t.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...toolRoutes,
  ];
}
