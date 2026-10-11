// lib/seo-matrix.js

export const MATRIX_CONFIG = {
  // Perfiles o casos de uso para multiplicar las páginas
  perfiles: [
    { slug: "para-autonomos", nombre: "para Autónomos", desc: "adaptado a la realidad fiscal y de ingresos variables" },
    { slug: "para-principiantes", nombre: "para Principiantes", desc: "explicado paso a paso sin rodeos técnicos" },
    { slug: "para-empresas", nombre: "para Empresas", desc: "enfocado a la optimización de recursos y proyecciones" }
  ],
  
  // Escenarios temporales o variantes de cálculo
  plazos: [
    { slug: "a-5-anos", nombre: "a 5 años", anos: 5 },
    { slug: "a-10-anos", nombre: "a 10 años", anos: 10 },
    { slug: "a-20-anos", nombre: "a 20 años", anos: 20 }
  ]
};

// Función auxiliar para generar de forma segura todas las combinaciones posibles para Next.js
export function generateMatrixPaths(tools) {
  const paths = [];

  if (!Array.isArray(tools)) return paths;

  tools.forEach((tool) => {
    if (!tool || !tool.slug) return;

    MATRIX_CONFIG.perfiles.forEach((perfil) => {
      MATRIX_CONFIG.plazos.forEach((plazo) => {
        const rawSlug = `${tool.slug}-${perfil.slug}-${plazo.slug}`;
        // Limpiamos dobles guiones por seguridad de URL
        const cleanSlug = rawSlug.replace(/-+/g, "-");

        paths.push({
          toolSlug: tool.slug,
          profileSlug: perfil.slug,
          timeSlug: plazo.slug,
          // Generamos una ruta única amigable para SEO: /aprende/[tool]-[profile]-[time]
          seoSlug: cleanSlug
        });
      });
    });
  });

  return paths;
}
