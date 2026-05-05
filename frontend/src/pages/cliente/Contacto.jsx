import { useEffect, useRef, useState, useCallback } from 'react'
import { Send, MessageCircle } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const hoy = new Date()
  const esHoy = d.toDateString() === hoy.toDateString()
  if (esHoy) return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + ' ' +
    d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function Avatar({ nombre, isAdmin }) {
  if (isAdmin) {
    return (
      <img src="/logo3.png" alt="Optimixage"
        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'contain', flexShrink: 0 }} />
    )
  }
  const initial = (nombre || '?')[0].toUpperCase()
  return (
    <div style={{
      width: '32px', height: '32px', borderRadius: '50%', background: '#0a0a4e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: '13px', fontWeight: '700', flexShrink: 0,
    }}>
      {initial}
    </div>
  )
}

export default function Contacto() {
  const { user } = useAuth()
  const [mensajes, setMensajes]     = useState([])
  const [texto, setTexto]           = useState('')
  const [proyectoId, setProyectoId] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [sending, setSending]       = useState(false)
  const bottomRef  = useRef(null)
  const pollRef    = useRef(null)
  const lastIdRef  = useRef(null)

  const cargarMensajes = useCallback(async (pid, silent = false) => {
    try {
      const { data } = await api.get(`/mensajes/proyecto/${pid}`)
      setMensajes(data)
      // marcar como leídos los mensajes que no son míos
      if (data.length > 0) {
        const ultimo = data[data.length - 1]
        if (ultimo.id !== lastIdRef.current) {
          lastIdRef.current = ultimo.id
          api.patch(`/mensajes/proyecto/${pid}/leer`).catch(() => {})
        }
      }
    } catch {
      // silently handle
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    async function init() {
      try {
        const { data: proyectos } = await api.get('/proyectos/mis-proyectos')
        if (!proyectos?.length) { setLoading(false); return }
        const pid = proyectos[0].id
        setProyectoId(pid)
        await cargarMensajes(pid)
        // polling cada 5 segundos
        pollRef.current = setInterval(() => cargarMensajes(pid, true), 5000)
      } catch {
        setLoading(false)
      }
    }
    init()
    return () => clearInterval(pollRef.current)
  }, [cargarMensajes])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function handleSend(e) {
    e.preventDefault()
    if (!texto.trim() || !proyectoId) return
    setSending(true)
    try {
      const { data } = await api.post('/mensajes/', {
        contenido: texto.trim(),
        proyecto_id: proyectoId,
      })
      setMensajes(prev => [...prev, data])
      setTexto('')
    } catch {
      // silently handle
    } finally {
      setSending(false)
    }
  }

  const isMe = (msg) => {
    if (!user) return false
    return String(msg.remitente_id) === String(user.id)
  }

  const hayTexto = texto.trim().length > 0

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        <MessageCircle size={22} color="#0099cc" />
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0a0a4e', lineHeight: 1 }}>
            Contacto
          </h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
            Chat directo con el equipo Optimixage
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: '11px', color: '#6b7280' }}>En línea</span>
        </div>
      </div>

      {/* Chat container */}
      <div style={{
        backgroundColor: 'white', borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6',
        display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0,
      }}>

        {/* Messages area */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          {loading && (
            <p style={{ color: '#9CA3AF', fontSize: '13px', textAlign: 'center', marginTop: '2rem' }}>
              Cargando mensajes...
            </p>
          )}

          {!loading && mensajes.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <MessageCircle size={40} color="#e5e7eb" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#9CA3AF', fontSize: '14px', fontWeight: '600' }}>
                ¡Inicia la conversación!
              </p>
              <p style={{ color: '#d1d5db', fontSize: '12px', marginTop: '4px' }}>
                El equipo Optimixage responderá a la brevedad.
              </p>
            </div>
          )}

          {mensajes.map((msg, i) => {
            const mine    = isMe(msg)
            const isAdmin = msg.remitente_rol === 'Admin'
            // agrupar: mostrar avatar/nombre solo si cambia el remitente
            const prev      = mensajes[i - 1]
            const showMeta  = !prev || prev.remitente_id !== msg.remitente_id

            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>

                {/* Mensaje recibido */}
                {!mine && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', maxWidth: '70%' }}>
                    {showMeta
                      ? <Avatar nombre={msg.remitente_nombre} isAdmin={isAdmin} />
                      : <div style={{ width: '32px', flexShrink: 0 }} />
                    }
                    <div>
                      {showMeta && (
                        <p style={{ fontSize: '11px', fontWeight: '600', color: isAdmin ? '#0099cc' : '#6b7280',
                          marginBottom: '3px', paddingLeft: '4px' }}>
                          {msg.remitente_nombre || 'Optimixage'}
                          {isAdmin && <span style={{ fontSize: '10px', background: '#eff6ff', color: '#2563eb',
                            borderRadius: '999px', padding: '1px 6px', marginLeft: '5px', fontWeight: '700' }}>Admin</span>}
                        </p>
                      )}
                      <div style={{
                        background: '#f3f4f6', borderRadius: '18px',
                        borderBottomLeftRadius: showMeta ? '4px' : '18px',
                        padding: '10px 14px',
                      }}>
                        <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.4' }}>{msg.contenido}</p>
                        <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px', textAlign: 'right' }}>
                          {formatTime(msg.fecha_envio)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mensaje enviado */}
                {mine && (
                  <div style={{ maxWidth: '70%' }}>
                    <div style={{
                      background: '#0a0a4e', borderRadius: '18px',
                      borderBottomRightRadius: '4px', padding: '10px 14px',
                    }}>
                      <p style={{ color: 'white', fontSize: '14px', lineHeight: '1.4' }}>{msg.contenido}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
                        <p style={{ fontSize: '10px', color: '#93c5fd' }}>{formatTime(msg.fecha_envio)}</p>
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

        {/* Input area */}
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '1rem' }}>
          <form onSubmit={handleSend} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#f9fafb', borderRadius: '999px',
            padding: '6px 6px 6px 16px', border: '1px solid #e5e7eb',
          }}>
            <input
              type="text" value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={sending || !proyectoId}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                outline: 'none', fontSize: '14px', color: '#374151',
              }}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
            />
            <button
              type="submit"
              disabled={sending || !hayTexto || !proyectoId}
              style={{
                width: '38px', height: '38px', borderRadius: '50%', border: 'none',
                background: hayTexto && !sending ? '#0099cc' : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: hayTexto && !sending ? 'pointer' : 'not-allowed',
                transition: 'background .2s', flexShrink: 0,
              }}
            >
              <Send size={16} color={hayTexto && !sending ? 'white' : '#9ca3af'} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
