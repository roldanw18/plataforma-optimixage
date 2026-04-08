import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Contacto() {
  const { user } = useAuth()
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [proyectoId, setProyectoId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: proyectos } = await api.get('/proyectos/mis-proyectos')
        if (!proyectos || proyectos.length === 0) return
        const pid = proyectos[0].id
        setProyectoId(pid)
        const { data } = await api.get(`/mensajes/proyecto/${pid}`)
        setMensajes(data)
      } catch (e) {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
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
      setMensajes((prev) => [...prev, data])
      setTexto('')
    } catch (e) {
      // silently handle
    } finally {
      setSending(false)
    }
  }

  const isMe = (msg) => {
    if (!user) return false
    return msg.usuario_id === user.id || msg.usuario?.id === user.id
  }

  return (
    <div
      style={{
        padding: '2rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0a0a4e', marginBottom: '1.5rem' }}>
        Contacto
      </h1>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #f3f4f6',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Messages area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {loading && (
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem' }}>
              Cargando mensajes...
            </p>
          )}
          {!loading && mensajes.length === 0 && (
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem' }}>
              No hay mensajes aún. ¡Inicia la conversación!
            </p>
          )}

          {mensajes.map((msg) => {
            const mine = isMe(msg)
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: mine ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Received message - with logo avatar */}
                {!mine && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <img
                      src="/logo3.png"
                      alt="Optimixage"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '9999px',
                        objectFit: 'contain',
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        backgroundColor: '#E5E7EB',
                        borderRadius: '18px',
                        borderBottomLeftRadius: '4px',
                        padding: '0.75rem 1rem',
                        maxWidth: '360px',
                      }}
                    >
                      {msg.usuario?.nombre && (
                        <p style={{ fontSize: '0.7rem', fontWeight: '600', color: '#0099cc', marginBottom: '2px' }}>
                          {msg.usuario.nombre}
                        </p>
                      )}
                      <p style={{ color: '#374151', fontSize: '0.875rem' }}>{msg.contenido}</p>
                      {msg.created_at && (
                        <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '4px', textAlign: 'right' }}>
                          {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Sent message */}
                {mine && (
                  <div
                    style={{
                      backgroundColor: '#4a4a4a',
                      borderRadius: '18px',
                      borderBottomRightRadius: '4px',
                      padding: '0.75rem 1rem',
                      maxWidth: '360px',
                    }}
                  >
                    <p style={{ color: 'white', fontSize: '0.875rem' }}>{msg.contenido}</p>
                    {msg.created_at && (
                      <p style={{ fontSize: '0.7rem', color: '#D1D5DB', marginTop: '4px', textAlign: 'right' }}>
                        {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '1rem' }}>
          <form
            onSubmit={handleSend}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: '#F3F4F6',
              borderRadius: '9999px',
              padding: '0.5rem 1rem',
            }}
          >
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={sending || !proyectoId}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.875rem',
                color: '#374151',
              }}
            />
            <button
              type="submit"
              disabled={sending || !texto.trim() || !proyectoId}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '9999px',
                backgroundColor: '#D1D5DB',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: sending || !texto.trim() || !proyectoId ? 'not-allowed' : 'pointer',
                opacity: sending || !texto.trim() || !proyectoId ? 0.5 : 1,
                transition: 'background-color 0.2s',
                flexShrink: 0,
              }}
            >
              <Send size={16} color="#4B5563" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
