import { Play } from 'lucide-react'

const videos = [
  { id: 1, title: 'Digitalización', time: '20:30', desc: 'Lorem ipsum dolor sit amet consectetur.', featured: true },
  { id: 2, title: 'Digitalización', time: '20:30', desc: 'Lorem ipsum dolor sit amet consectetur.', featured: false },
  { id: 3, title: 'Digitalización', time: '20:30', desc: 'Lorem ipsum dolor sit amet consectetur.', featured: false },
  { id: 4, title: 'Digitalización', time: '20:30', desc: 'Lorem ipsum dolor sit amet consectetur.', featured: false },
  { id: 5, title: 'Digitalización', time: '20:30', desc: 'Lorem ipsum dolor sit amet consectetur.', featured: false },
  { id: 6, title: 'Digitalización', time: '20:30', desc: 'Lorem ipsum dolor sit amet consectetur.', featured: false },
]

export default function AdminContenido() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1.5rem' }}>
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
          <div key={video.id} style={{ cursor: 'pointer' }}>
            {/* Thumbnail */}
            <div
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                aspectRatio: '16/9',
                backgroundColor: video.featured ? '#0a0a4e' : '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <button
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '9999px',
                  border: '3px solid white',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Play size={22} color="white" fill="white" style={{ marginLeft: '3px' }} />
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
              <h3
                style={{
                  fontWeight: '600',
                  color: '#0a0a4e',
                  fontSize: '0.875rem',
                  marginBottom: '2px',
                }}
              >
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
