import { useEffect, useState } from 'react'
import { AlignJustify, Bell } from 'lucide-react'
import api from '../../services/api'

function AvatarIcon({ nombre, avatarUrl }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={nombre}
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '9999px',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    )
  }
  return (
    <div
      style={{
        width: '52px',
        height: '52px',
        borderRadius: '9999px',
        backgroundColor: '#E5E7EB',
        flexShrink: 0,
      }}
    />
  )
}

export default function AdminNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get('/notificaciones/')
        setNotificaciones(data)
      } catch (e) {
        setError('No se pudieron cargar las notificaciones.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1.5rem' }}>
          Notificaciones
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #f3f4f6',
                height: '72px',
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1.5rem' }}>
        Notificaciones
      </h1>

      {error && (
        <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>
      )}

      {notificaciones.length === 0 && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '0.75rem' }}>
          <Bell size={40} color="#E5E7EB" />
          <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No hay notificaciones.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notificaciones.map((notif, idx) => {
          const isHighlighted = !notif.leida && idx === 0
          return (
            <div
              key={notif.id}
              style={{
                borderRadius: '12px',
                border: isHighlighted ? '1px solid #b3e6f5' : '1px solid #f3f4f6',
                backgroundColor: isHighlighted ? '#e0f5fb' : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.25rem',
                boxShadow: isHighlighted ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                position: 'relative',
                transition: 'box-shadow 0.2s',
              }}
            >
              <AvatarIcon
                nombre={notif.usuario?.nombre || notif.titulo}
                avatarUrl={notif.usuario?.avatar_url}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: '#0a0a4e',
                    marginBottom: '4px',
                  }}
                >
                  {notif.titulo || notif.mensaje?.substring(0, 50) || 'Notificación'}
                </p>
                {(notif.descripcion || notif.mensaje) && (
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: '#6B7280',
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {notif.descripcion || notif.mensaje}
                  </p>
                )}
              </div>

              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  flexShrink: 0,
                  alignSelf: 'flex-start',
                  marginTop: '2px',
                  padding: '2px',
                }}
              >
                <AlignJustify size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
