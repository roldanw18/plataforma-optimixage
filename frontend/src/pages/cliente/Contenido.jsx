import { Play } from 'lucide-react'

const videos = [
  { id: 1, title: 'Introducción al proceso de digitalización', time: '20:30', desc: 'Conoce los primeros pasos para digitalizar tu empresa.', featured: true },
  { id: 2, title: 'Diagnóstico empresarial', time: '20:30', desc: 'Cómo evaluamos el estado actual de tu negocio.', featured: false },
  { id: 3, title: 'Herramientas digitales clave', time: '20:30', desc: 'Las herramientas que usarás durante el proceso.', featured: false },
  { id: 4, title: 'Capacitación del equipo', time: '20:30', desc: 'Cómo preparar a tu equipo para el cambio.', featured: false },
  { id: 5, title: 'Desarrollo e implementación', time: '20:30', desc: 'La fase de desarrollo de tu solución digital.', featured: false },
  { id: 6, title: 'Entrega y seguimiento', time: '20:30', desc: 'Cómo recibir y mantener tu solución.', featured: false },
]

export default function Contenido() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1.5rem' }}>
        Contenido
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
        }}
      >
        {videos.map((video) => (
          <div
            key={video.id}
            style={{ cursor: 'pointer' }}
          >
            {/* Thumbnail */}
            <div
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                aspectRatio: '16/9',
                backgroundColor: video.featured ? '#0a0a4e' : '#6B7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <button
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '9999px',
                  border: '3px solid white',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Play size={24} color="white" fill="white" style={{ marginLeft: '3px' }} />
              </button>

              <span
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '10px',
                  fontSize: '0.75rem',
                  color: 'white',
                  fontWeight: '500',
                }}
              >
                {video.time}
              </span>
            </div>

            {/* Info */}
            <div style={{ marginTop: '0.75rem' }}>
              <h3 style={{ fontWeight: '600', color: '#0a0a4e', fontSize: '0.875rem', marginBottom: '2px' }}>
                {video.title}
              </h3>
              <p style={{ fontWeight: '700', color: '#0a0a4e', fontSize: '0.875rem' }}>{video.time}</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.8rem', marginTop: '4px' }}>{video.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
