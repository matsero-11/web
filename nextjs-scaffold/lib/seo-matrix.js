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

// Función auxiliar para generar todas las combinaciones posibles para Next.js
export function generateMatrixPaths(tools) {
  const paths = [];

  tools.forEach((tool) => {
    MATRIX_CONFIG.perfiles.forEach((perfil) => {
      MATRIX_CONFIG.plazos.forEach((plazo) => {
        paths.push({
          toolSlug: tool.slug,
          profileSlug: perfil.slug,
          timeSlug: plazo.slug,
          // Generamos una ruta única amigable para SEO: /aprende/[tool]/[profile]/[time]
          seoSlug: `${tool.slug}-${perfil.slug}-${plazo.slug}`
        });
      });
    });
  });

  return paths;
}

