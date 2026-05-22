import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import api from '../../services/api'
import { intlLocale } from '../../utils/locale'

function resolveAvatar(url) {
  if (!url) return null
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url
  return `/api${url}`
}

function TipoTag({ tipo, t }) {
  const map = {
    mensaje_nuevo: { label: t('cliente.notificaciones.tipos.mensaje'), bg: '#dbeafe', color: '#1d4ed8' },
    documento_subido: { label: t('cliente.notificaciones.tipos.documento'), bg: '#dcfce7', color: '#15803d' },
    tarea_asignada: { label: t('cliente.notificaciones.tipos.tarea'), bg: '#fef9c3', color: '#a16207' },
    anuncio: { label: t('cliente.notificaciones.tipos.anuncio'), bg: '#ede9fe', color: '#7c3aed' },
  }
  const style = map[tipo] ?? { label: tipo, bg: '#f3f4f6', color: '#374151' }
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 700, borderRadius: '9999px',
      padding: '2px 8px', backgroundColor: style.bg, color: style.color,
    }}>
      {style.label}
    </span>
  )
}

export default function ClienteNotificaciones() {
  const { t, i18n } = useTranslation()
  const lng = i18n.language?.split('-')[0] || 'es'
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  async function fetchNotificaciones() {
    try {
      const { data } = await api.get('/notificaciones/')
      setNotificaciones(data)
    } catch {
      // silently handle
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

  async function handleEliminar(id, e) {
    e.stopPropagation()
    if (!window.confirm(t('cliente.notificaciones.confirmarEliminar'))) return
    try {
      await api.delete(`/notificaciones/${id}`)
      setNotificaciones((prev) => prev.filter((n) => n.id !== id))
    } catch {
      // silently handle
    }
  }

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0a0a4e', marginBottom: '1.5rem' }}>
          {t('cliente.notificaciones.titulo')}
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
    <div style={{ padding: '2rem', maxWidth: '700px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0a0a4e' }}>
            {t('cliente.notificaciones.titulo')}
          </h1>
          {noLeidas > 0 && (
            <span style={{
              backgroundColor: '#0099cc', color: 'white',
              fontSize: '0.7rem', fontWeight: 700,
              borderRadius: '9999px', padding: '2px 8px',
            }}>
              {noLeidas}
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
              fontSize: '0.8rem', color: '#374151',
              cursor: markingAll ? 'not-allowed' : 'pointer',
              opacity: markingAll ? 0.6 : 1,
            }}
          >
            <CheckCheck size={14} />
            {markingAll ? t('cliente.notificaciones.marcando') : t('cliente.notificaciones.marcarTodas')}
          </button>
        )}
      </div>

      {notificaciones.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '0.75rem' }}>
          <Bell size={40} color="#E5E7EB" />
          <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{t('cliente.notificaciones.sinNotificaciones')}</p>
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
                display: 'flex', alignItems: 'flex-start', gap: '1rem',
                padding: '1rem 1.25rem',
                cursor: isUnread ? 'pointer' : 'default',
                transition: 'background-color 0.2s',
                position: 'relative',
              }}
            >
              {isUnread && (
                <div style={{
                  position: 'absolute', top: '50%', left: '-6px',
                  transform: 'translateY(-50%)',
                  width: '10px', height: '10px',
                  borderRadius: '9999px', backgroundColor: '#0099cc',
                  border: '2px solid white',
                }} />
              )}

              <div style={{
                width: '40px', height: '40px', borderRadius: '9999px',
                backgroundColor: '#E5E7EB', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bell size={16} color="#9CA3AF" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0a0a4e' }}>
                    {notif.titulo}
                  </p>
                  <TipoTag tipo={notif.tipo} t={t} />
                </div>
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
                  {new Date(notif.created_at).toLocaleString(intlLocale(lng), {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>

              <button
                onClick={(e) => handleEliminar(notif.id, e)}
                title={t('cliente.notificaciones.eliminar')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#9CA3AF', flexShrink: 0, padding: '6px',
                  borderRadius: '6px', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#EF4444'
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9CA3AF'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
