import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function MessageChat({ mensajes, proyectoId, onNewMessage }) {
  const { user } = useAuth()
  const [texto, setTexto] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSend(e) {
    e.preventDefault()
    if (!texto.trim()) return
    setSending(true)
    try {
      await api.post('/mensajes/', { contenido: texto, proyecto_id: proyectoId })
      setTexto('')
      onNewMessage()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
        {!mensajes.length && (
          <p className="text-gray-400 text-sm">Aún no hay mensajes.</p>
        )}
        {mensajes.map((msg) => (
          <div key={msg.id} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
            <p className="text-sm text-gray-800">{msg.contenido}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(msg.fecha_envio).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 mt-2">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
