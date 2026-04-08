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
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contacto</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          {loading && (
            <p className="text-xs text-gray-400 text-center mt-4">Cargando mensajes...</p>
          )}
          {!loading && mensajes.length === 0 && (
            <p className="text-xs text-gray-400 text-center mt-4">No hay mensajes aún. ¡Inicia la conversación!</p>
          )}
          {mensajes.map((msg) => {
            const mine = isMe(msg)
            return (
              <div
                key={msg.id}
                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    mine
                      ? 'text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                  style={mine ? { backgroundColor: '#000033' } : {}}
                >
                  {!mine && msg.usuario?.nombre && (
                    <p className="text-xs font-semibold text-blue-600 mb-0.5">{msg.usuario.nombre}</p>
                  )}
                  <p>{msg.contenido}</p>
                  {msg.created_at && (
                    <p className={`text-xs mt-1 ${mine ? 'text-gray-300' : 'text-gray-400'} text-right`}>
                      {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-gray-100 px-4 py-3">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-gray-100 border-none outline-none rounded-full px-5 py-2.5 text-sm text-gray-800 placeholder-gray-400"
              disabled={sending || !proyectoId}
            />
            <button
              type="submit"
              disabled={sending || !texto.trim() || !proyectoId}
              className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
