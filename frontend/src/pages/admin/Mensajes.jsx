import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, MessageCircle, Circle } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { intlLocale } from '../../utils/locale'

function formatTime(iso, lng) {
  if (!iso) return ''
  const d = new Date(iso)
  const hoy = new Date()
  const localeId = intlLocale(lng)
  if (d.toDateString() === hoy.toDateString())
    return d.toLocaleTimeString(localeId, { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString(localeId, { day: '2-digit', month: 'short' }) + ' ' +
    d.toLocaleTimeString(localeId, { hour: '2-digit', minute: '2-digit' })
}

export default function AdminMensajes() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const lng = i18n.language?.split('-')[0] || 'es'
  const [proyectos, setProyectos]         = useState([])
  const [proyectoSel, setProyectoSel]     = useState(null)
  const [mensajes, setMensajes]           = useState([])
  const [texto, setTexto]                 = useState('')
  const [sending, setSending]             = useState(false)
  const [loadingMsgs, setLoadingMsgs]     = useState(false)
  const [noLeidos, setNoLeidos]           = useState({})
  const bottomRef = useRef(null)
  const pollRef   = useRef(null)

  // Cargar proyectos al inicio
  useEffect(() => {
    api.get('/proyectos/admin/todos')
      .catch(() => api.get('/proyectos/mis-proyectos'))
      .then(({ data }) => {
        setProyectos(data)
        if (data.length > 0) seleccionarProyecto(data[0])
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarMensajes = useCallback(async (pid, silent = false) => {
    if (!silent) setLoadingMsgs(true)
    try {
      const { data } = await api.get(`/mensajes/proyecto/${pid}`)
      setMensajes(data)
      // contar no leídos de clientes
      const noLeido = data.filter(m => !m.leido && m.remitente_rol !== 'Admin').length
      setNoLeidos(prev => ({ ...prev, [pid]: noLeido }))
      // marcar como leídos
      if (noLeido > 0) api.patch(`/mensajes/proyecto/${pid}/leer`).catch(() => {})
    } catch { /* silently */ }
    finally { if (!silent) setLoadingMsgs(false) }
  }, [])

  function seleccionarProyecto(p) {
    setProyectoSel(p)
    clearInterval(pollRef.current)
    cargarMensajes(p.id)
    pollRef.current = setInterval(() => cargarMensajes(p.id, true), 5000)
  }

  useEffect(() => () => clearInterval(pollRef.current), [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function handleSend(e) {
    e.preventDefault()
    if (!texto.trim() || !proyectoSel) return
    setSending(true)
    try {
      const { data } = await api.post('/mensajes/', {
        contenido: texto.trim(),
        proyecto_id: proyectoSel.id,
      })
      setMensajes(prev => [...prev, data])
      setTexto('')
    } catch { /* silently */ }
    finally { setSending(false) }
  }

  const isMe = (msg) => String(msg.remitente_id) === String(user?.id)
  const hayTexto = texto.trim().length > 0

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        <MessageCircle size={22} color="#0099cc" />
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', lineHeight: 1 }}>
            {t('admin.mensajes.titulo')}
          </h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
            {t('admin.mensajes.descripcion')}
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '260px 1fr',
        gap: '16px', flex: 1, minHeight: 0,
      }}>

        {/* ── LISTA DE PROYECTOS ─────────────────────── */}
        <div style={{
          background: 'white', borderRadius: '12px', border: '1px solid #f3f4f6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af',
              textTransform: 'uppercase', letterSpacing: '.5px' }}>
              {t('admin.mensajes.proyectos')}
            </p>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {proyectos.length === 0 && (
              <p style={{ padding: '16px', fontSize: '13px', color: '#9ca3af' }}>{t('admin.mensajes.sinProyectos')}</p>
            )}
            {proyectos.map(p => {
              const activo  = proyectoSel?.id === p.id
              const noLeido = noLeidos[p.id] || 0
              return (
                <button key={p.id} onClick={() => seleccionarProyecto(p)} style={{
                  width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                  padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                  background: activo ? '#eff6ff' : 'transparent',
                  borderLeft: activo ? '3px solid #0099cc' : '3px solid transparent',
                  transition: 'background .15s',
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: activo ? '#0099cc' : '#e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: activo ? 'white' : '#6b7280', fontSize: '14px', fontWeight: '700', flexShrink: 0,
                  }}>
                    {(p.nombre || '?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '13px', fontWeight: activo ? '700' : '500',
                      color: activo ? '#0a0a4e' : '#374151',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{p.nombre}</p>
                    {p.cliente?.nombre && (
                      <p style={{ fontSize: '11px', color: '#9ca3af',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.cliente.nombre}
                      </p>
                    )}
                  </div>
                  {noLeido > 0 && (
                    <span style={{
                      background: '#ef4444', color: 'white', borderRadius: '999px',
                      fontSize: '10px', fontWeight: '700', padding: '2px 6px', flexShrink: 0,
                    }}>{noLeido}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── CHAT ──────────────────────────────────── */}
        <div style={{
          background: 'white', borderRadius: '12px', border: '1px solid #f3f4f6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0,
        }}>

          {/* Chat header */}
          {proyectoSel && (
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid #f3f4f6',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', background: '#0099cc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '14px', fontWeight: '700', flexShrink: 0,
              }}>
                {(proyectoSel.nombre || '?')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a4e',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {proyectoSel.nombre}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {proyectoSel.cliente?.nombre && (
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#0099cc' }}>
                      {proyectoSel.cliente.nombre}
                    </span>
                  )}
                  {proyectoSel.cliente?.nombre && (
                    <span style={{ fontSize: '11px', color: '#d1d5db' }}>·</span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Circle size={7} color="#22c55e" fill="#22c55e" />
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{t('admin.mensajes.activo')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            {!proyectoSel && (
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <MessageCircle size={40} color="#e5e7eb" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>{t('admin.mensajes.seleccionar')}</p>
              </div>
            )}

            {proyectoSel && loadingMsgs && (
              <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', marginTop: '2rem' }}>
                {t('admin.mensajes.cargando')}
              </p>
            )}

            {proyectoSel && !loadingMsgs && mensajes.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <p style={{ color: '#9ca3af', fontSize: '14px', fontWeight: '600' }}>{t('admin.mensajes.sinMensajes')}</p>
                <p style={{ color: '#d1d5db', fontSize: '12px', marginTop: '4px' }}>
                  {t('admin.mensajes.sinMensajesDesc')}
                </p>
              </div>
            )}

            {mensajes.map((msg, i) => {
              const mine   = isMe(msg)
              const prev   = mensajes[i - 1]
              const showMeta = !prev || prev.remitente_id !== msg.remitente_id

              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>

                  {!mine && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', maxWidth: '70%' }}>
                      {showMeta ? (
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '50%', background: '#e5e7eb',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: '700', color: '#374151', flexShrink: 0,
                        }}>
                          {(msg.remitente_nombre || '?')[0].toUpperCase()}
                        </div>
                      ) : (
                        <div style={{ width: '30px', flexShrink: 0 }} />
                      )}
                      <div>
                        {showMeta && (
                          <p style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280',
                            marginBottom: '3px', paddingLeft: '4px' }}>
                            {msg.remitente_nombre || t('admin.mensajes.cliente')}
                          </p>
                        )}
                        <div style={{
                          background: '#f3f4f6', borderRadius: '18px',
                          borderBottomLeftRadius: showMeta ? '4px' : '18px', padding: '10px 14px',
                        }}>
                          <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.4' }}>{msg.contenido}</p>
                          <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px', textAlign: 'right' }}>
                            {formatTime(msg.fecha_envio, lng)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {mine && (
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{
                        background: '#0a0a4e', borderRadius: '18px',
                        borderBottomRightRadius: '4px', padding: '10px 14px',
                      }}>
                        <p style={{ color: 'white', fontSize: '14px', lineHeight: '1.4' }}>{msg.contenido}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
                          <p style={{ fontSize: '10px', color: '#93c5fd' }}>{formatTime(msg.fecha_envio, lng)}</p>
                          {msg.leido && <span style={{ fontSize: '10px', color: '#93c5fd' }}>✓✓</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {proyectoSel && (
            <div style={{ borderTop: '1px solid #f3f4f6', padding: '1rem' }}>
              <form onSubmit={handleSend} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: '#f9fafb', borderRadius: '999px',
                padding: '6px 6px 6px 16px', border: '1px solid #e5e7eb',
              }}>
                <input
                  type="text" value={texto}
                  onChange={e => setTexto(e.target.value)}
                  placeholder={t('admin.mensajes.responder')}
                  disabled={sending}
                  style={{
                    flex: 1, background: 'transparent', border: 'none',
                    outline: 'none', fontSize: '14px', color: '#374151',
                  }}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
                />
                <button type="submit" disabled={sending || !hayTexto} style={{
                  width: '38px', height: '38px', borderRadius: '50%', border: 'none',
                  background: hayTexto && !sending ? '#0099cc' : '#e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: hayTexto && !sending ? 'pointer' : 'not-allowed',
                  transition: 'background .2s', flexShrink: 0,
                }}>
                  <Send size={16} color={hayTexto && !sending ? 'white' : '#9ca3af'} />
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
