import { ImageResponse } from 'next/og';
import { ALL_TOOLS } from '@/lib/tools-registry';
import { SEO_METADATA } from '@/lib/seo-metadata';

// Configuración de la imagen OG (Estándar 1200x630)
export const runtime = 'edge';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }) {
  const { slug } = await params;
  const tool = ALL_TOOLS.find((item) => item.slug === slug);
  const meta = SEO_METADATA[tool?.id];

  const title = meta?.title || 'MetaBox · Herramienta Financiera';
  const description = meta?.description || 'Calcula, planifica y optimiza tus finanzas personales de forma instantánea.';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#09090b', // Fondo oscuro tipo zinc-950
          padding: '60px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          border: '4px solid #27272a',
        }}
      >
        {/* Cabecera con Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#a3e635', // Tu verde corporativo lime
              }}
            />
            <span style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.025em', color: '#a3e635' }}>
              MetaBox
            </span>
          </div>
          <span style={{ fontSize: '18px', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Utilidad Profesional
          </span>
        </div>

        {/* Contenido Central: Título y Descripción de la herramienta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1050px' }}>
          <h1
            style={{
              fontSize: '54px',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              margin: 0,
              color: '#ffffff',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: '24px',
              color: '#a1a1aa',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        </div>

        {/* Pie de página */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #27272a', paddingTop: '24px' }}>
          <span style={{ fontSize: '18px', color: '#71717a' }}>metabox-web.vercel.app</span>
          <span style={{ fontSize: '18px', color: '#a3e635', fontWeight: 600 }}>100% Gratis y Local</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
          }
