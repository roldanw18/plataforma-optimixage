import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, CheckCheck, Megaphone, Send, Trash2, Users } from 'lucide-react'
import api from '../../services/api'
import { intlLocale } from '../../utils/locale'
import { notifTitulo, notifContenido, notifTipoLabel } from '../../utils/notif'
import BroadcastModal from './BroadcastModal'

function resolveAvatar(url) {
  if (!url) return null
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url
  return `/api${url}`
}

function AvatarIcon({ nombre, avatarUrl }) {
  const src = resolveAvatar(avatarUrl)
  if (src) {
    return (
      <img src={src} alt={nombre}
        style={{ width: '40px', height: '40px', borderRadius: '9999px', objectFit: 'cover', flexShrink: 0 }} />
    )
  }
  const initials = (nombre || '?').slice(0, 1).toUpperCase()
  return (
    <div style={{
      width: '40px', height: '40px', borderRadius: '9999px',
      backgroundColor: '#E5E7EB', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.85rem', fontWeight: 700, color: '#6B7280',
    }}>
      {initials}
    </div>
  )
}

const TIPO_COLORS = {
  mensaje_nuevo:    { bg: '#dbeafe', color: '#1d4ed8' },
  documento_subido: { bg: '#dcfce7', color: '#15803d' },
  tarea_asignada:   { bg: '#fef9c3', color: '#a16207' },
  anuncio:          { bg: '#ede9fe', color: '#7c3aed' },
}

export default function AdminNotificaciones() {
  const { t, i18n } = useTranslation()
  const lng = i18n.language?.split('-')[0] || 'es'
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [markingAll, setMarkingAll] = useState(false)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [toast, setToast] = useState('')

  async function fetchNotificaciones() {
    try {
      const { data } = await api.get('/notificaciones/todas')
      setNotificaciones(data)
    } catch {
      setError(t('errors.noSePudieron'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotificaciones() }, [])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(id)
  }, [toast])

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
    if (!window.confirm(t('admin.notificaciones.confirmarEliminar'))) return
    try {
      await api.delete(`/notificaciones/${id}`)
      setNotificaciones((prev) => prev.filter((n) => n.id !== id))
    } catch {
      // silently handle
    }
  }

  async function handleEliminarGrupo(refId, e) {
    e.stopPropagation()
    if (!window.confirm(t('admin.notificaciones.confirmarEliminar'))) return
    try {
      await api.delete(`/notificaciones/grupo/${refId}`)
      setNotificaciones((prev) => prev.filter(
        (n) => !(n.referencia_tipo === 'broadcast' && n.referencia_id === refId)
      ))
    } catch {
      // silently handle
    }
  }

  async function handleMarcarLeidaGrupo(refId) {
    const ids = notificaciones
      .filter((n) => n.referencia_tipo === 'broadcast' && n.referencia_id === refId && !n.leida)
      .map((n) => n.id)
    if (ids.length === 0) return
    try {
      await Promise.all(ids.map((id) => api.patch(`/notificaciones/${id}/leer`)))
      setNotificaciones((prev) => prev.map((n) =>
        n.referencia_tipo === 'broadcast' && n.referencia_id === refId ? { ...n, leida: true } : n
      ))
    } catch {
      // silently handle
    }
  }

  // Agrupar broadcasts: las notificaciones con el mismo referencia_id y
  // referencia_tipo='broadcast' se muestran como una única tarjeta.
  const items = useMemo(() => {
    const grupos = new Map()
    const resultado = []
    for (const n of notificaciones) {
      if (n.referencia_tipo === 'broadcast' && n.referencia_id) {
        const key = n.referencia_id
        if (!grupos.has(key)) {
          const entry = { kind: 'group', referencia_id: key, items: [n] }
          grupos.set(key, entry)
          resultado.push(entry)
        } else {
          grupos.get(key).items.push(n)
        }
      } else {
        resultado.push({ kind: 'single', notif: n })
      }
    }
    return resultado
  }, [notificaciones])

  function handleBroadcastSent(count) {
    setToast(t('admin.notificaciones.broadcast.exito', { count }))
    fetchNotificaciones()
  }

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1.5rem' }}>
          {t('admin.notificaciones.titulo')}
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
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e' }}>{t('admin.notificaciones.titulo')}</h1>
          {notificaciones.length > 0 && (
            <span style={{
              backgroundColor: '#f3f4f6', color: '#6B7280',
              fontSize: '0.7rem', fontWeight: 700,
              borderRadius: '9999px', padding: '2px 8px',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <Users size={10} />
              {notificaciones.length}
            </span>
          )}
          {noLeidas > 0 && (
            <span style={{
              backgroundColor: '#EF4444', color: 'white',
              fontSize: '0.7rem', fontWeight: 700,
              borderRadius: '9999px', padding: '2px 8px',
            }}>
              {noLeidas} {t('admin.notificaciones.sinLeer')}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
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
                opacity: markingAll ? 0.6 : 1, transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => !markingAll && (e.currentTarget.style.backgroundColor = '#F3F4F6')}
              onMouseLeave={(e) => !markingAll && (e.currentTarget.style.backgroundColor = 'white')}
            >
              <CheckCheck size={14} />
              {markingAll ? t('admin.notificaciones.marcando') : t('admin.notificaciones.marcarTodas')}
            </button>
          )}
          <button
            onClick={() => setShowBroadcast(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '0.45rem 1rem', backgroundColor: '#0099cc',
              border: 'none', borderRadius: '8px',
              fontSize: '0.8rem', color: 'white', fontWeight: 600, cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0086b3')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0099cc')}
          >
            <Send size={14} />
            {t('admin.notificaciones.nuevoAnuncio')}
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

      {notificaciones.length === 0 && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '0.75rem' }}>
          <Bell size={40} color="#E5E7EB" />
          <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{t('admin.notificaciones.sinNotificaciones')}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map((item) => {
          if (item.kind === 'group') {
            const first = item.items[0]
            const count = item.items.length
            const isUnread = item.items.some((n) => !n.leida)
            const tipoStyle = TIPO_COLORS[first.tipo] ?? { bg: '#f3f4f6', color: '#374151' }
            return (
              <div
                key={`g-${item.referencia_id}`}
                onClick={() => isUnread && handleMarcarLeidaGrupo(item.referencia_id)}
                style={{
                  borderRadius: '12px',
                  border: isUnread ? '1px solid #b3e6f5' : '1px solid #f3f4f6',
                  backgroundColor: isUnread ? '#e0f5fb' : 'white',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.85rem 1.25rem',
                  boxShadow: isUnread ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
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
                  backgroundColor: '#ede9fe', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#7c3aed',
                }}>
                  <Megaphone size={18} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0a0a4e' }}>
                      {notifTitulo(t, first)}
                    </p>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, borderRadius: '9999px',
                      padding: '2px 7px', backgroundColor: tipoStyle.bg, color: tipoStyle.color,
                    }}>
                      {notifTipoLabel(t, first.tipo)}
                    </span>
                    {isUnread && (
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, borderRadius: '9999px',
                        padding: '2px 7px', backgroundColor: '#fef9c3', color: '#a16207',
                      }}>
                        {t('admin.notificaciones.noLeida')}
                      </span>
                    )}
                  </div>
                  {(first.contenido || first.contenido_key) && (
                    <p style={{
                      fontSize: '0.78rem', color: '#6B7280', lineHeight: '1.4',
                      display: '-webkit-box', WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {notifContenido(t, first)}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Users size={10} />
                      {t('admin.notificaciones.destinatarios', { count })}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#D1D5DB' }}>·</span>
                    <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                      {new Date(first.created_at).toLocaleString(intlLocale(lng), {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleEliminarGrupo(item.referencia_id, e)}
                  title={t('admin.notificaciones.eliminar')}
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
          }

          const notif = item.notif
          const isUnread = !notif.leida
          const tipoStyle = TIPO_COLORS[notif.tipo] ?? { bg: '#f3f4f6', color: '#374151' }
          return (
            <div
              key={notif.id}
              onClick={() => isUnread && handleMarcarLeida(notif.id)}
              style={{
                borderRadius: '12px',
                border: isUnread ? '1px solid #b3e6f5' : '1px solid #f3f4f6',
                backgroundColor: isUnread ? '#e0f5fb' : 'white',
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.85rem 1.25rem',
                boxShadow: isUnread ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
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
              <AvatarIcon
                nombre={notif.usuario?.nombre}
                avatarUrl={notif.usuario?.avatar_url}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0a0a4e' }}>
                    {notifTitulo(t, notif)}
                  </p>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, borderRadius: '9999px',
                    padding: '2px 7px', backgroundColor: tipoStyle.bg, color: tipoStyle.color,
                  }}>
                    {notifTipoLabel(t, notif.tipo)}
                  </span>
                  {isUnread && (
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, borderRadius: '9999px',
                      padding: '2px 7px', backgroundColor: '#fef9c3', color: '#a16207',
                    }}>
                      {t('admin.notificaciones.noLeida')}
                    </span>
                  )}
                </div>
                {(notif.contenido || notif.contenido_key) && (
                  <p style={{
                    fontSize: '0.78rem', color: '#6B7280', lineHeight: '1.4',
                    display: '-webkit-box', WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {notifContenido(t, notif)}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                  {notif.usuario?.nombre && (
                    <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                      → {notif.usuario.nombre}
                    </span>
                  )}
                  <span style={{ fontSize: '0.7rem', color: '#D1D5DB' }}>·</span>
                  <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                    {new Date(notif.created_at).toLocaleString(intlLocale(lng), {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => handleEliminar(notif.id, e)}
                title={t('admin.notificaciones.eliminar')}
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

      <BroadcastModal
        open={showBroadcast}
        onClose={() => setShowBroadcast(false)}
        onSent={handleBroadcastSent}
      />

      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          backgroundColor: '#10B981', color: 'white',
          padding: '0.75rem 1.25rem', borderRadius: '10px',
          fontSize: '0.85rem', fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 999,
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
