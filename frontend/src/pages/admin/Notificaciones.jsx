import { useEffect, useState } from 'react'
import { AlignJustify, Bell, CheckCheck } from 'lucide-react'
import api from '../../services/api'

function AvatarIcon({ nombre, avatarUrl }) {
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={nombre}
        style={{ width: '52px', height: '52px', borderRadius: '9999px', objectFit: 'cover', flexShrink: 0 }} />
    )
  }
  return (
    <div style={{ width: '52px', height: '52px', borderRadius: '9999px', backgroundColor: '#E5E7EB', flexShrink: 0 }} />
  )
}

export default function AdminNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [markingAll, setMarkingAll] = useState(false)

  async function fetchNotificaciones() {
    try {
      const { data } = await api.get('/notificaciones/')
      setNotificaciones(data)
    } catch {
      setError('No se pudieron cargar las notificaciones.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotificaciones() }, [])

  async function handleMarcarLeida(id) {
    try {
      await api.patch(`/notificaciones/${id}/leer`)
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      )
    } catch {
      // silently handle
    }
  }

  async function handleMarcarTodas() {
    setMarkingAll(true)
    try {
      await api.patch('/notificaciones/leer-todas')
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
    } catch {
      // silently handle
    } finally {
      setMarkingAll(false)
    }
  }

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1.5rem' }}>
          Notificaciones
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f3f4f6', height: '72px' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e' }}>Notificaciones</h1>
          {noLeidas > 0 && (
            <span style={{
              backgroundColor: '#0099cc', color: 'white',
              fontSize: '0.7rem', fontWeight: '700',
              borderRadius: '9999px', padding: '2px 8px',
            }}>
              {noLeidas} nueva{noLeidas !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {noLeidas > 0 && (
          <button
            onClick={handleMarcarTodas}
            disabled={markingAll}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '0.45rem 1rem', backgroundColor: 'white',
              border: '1px solid #E5E7EB', borderRadius: '8px',
              fontSize: '0.8rem', color: '#374151', cursor: markingAll ? 'not-allowed' : 'pointer',
              opacity: markingAll ? 0.6 : 1, transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => !markingAll && (e.currentTarget.style.backgroundColor = '#F3F4F6')}
            onMouseLeave={(e) => !markingAll && (e.currentTarget.style.backgroundColor = 'white')}
          >
            <CheckCheck size={14} />
            {markingAll ? 'Marcando…' : 'Marcar todas como leídas'}
          </button>
        )}
      </div>

      {error && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

      {notificaciones.length === 0 && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '0.75rem' }}>
          <Bell size={40} color="#E5E7EB" />
          <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No hay notificaciones.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notificaciones.map((notif) => {
          const isUnread = !notif.leida
          return (
            <div
              key={notif.id}
              onClick={() => isUnread && handleMarcarLeida(notif.id)}
              style={{
                borderRadius: '12px',
                border: isUnread ? '1px solid #b3e6f5' : '1px solid #f3f4f6',
                backgroundColor: isUnread ? '#e0f5fb' : 'white',
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem',
                boxShadow: isUnread ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                cursor: isUnread ? 'pointer' : 'default',
                transition: 'background-color 0.2s',
                position: 'relative',
              }}
            >
              {/* Punto de no leído */}
              {isUnread && (
                <div style={{
                  position: 'absolute', top: '50%', left: '-6px',
                  transform: 'translateY(-50%)',
                  width: '10px', height: '10px',
                  borderRadius: '9999px', backgroundColor: '#0099cc',
                  border: '2px solid white',
                }} />
              )}

              <AvatarIcon
                nombre={notif.usuario?.nombre || notif.titulo}
                avatarUrl={notif.usuario?.avatar_url}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '4px' }}>
                  {notif.titulo}
                </p>
                {notif.contenido && (
                  <p style={{
                    fontSize: '0.8rem', color: '#6B7280', lineHeight: '1.5',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {notif.contenido}
                  </p>
                )}
                <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '4px' }}>
                  {new Date(notif.created_at).toLocaleString('es-ES', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>

              <button
                onClick={(e) => e.stopPropagation()}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', flexShrink: 0, alignSelf: 'flex-start', marginTop: '2px', padding: '2px' }}
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
