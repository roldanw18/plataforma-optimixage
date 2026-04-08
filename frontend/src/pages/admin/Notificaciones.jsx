import { useEffect, useState } from 'react'
import { MoreVertical, Bell } from 'lucide-react'
import api from '../../services/api'

function InitialsAvatar({ nombre }) {
  const initials = nombre
    ? nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
      style={{ backgroundColor: '#1865F2' }}
    >
      {initials}
    </div>
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
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Notificaciones</h1>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 h-16 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notificaciones</h1>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {notificaciones.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Bell size={40} className="text-gray-200" />
          <p className="text-gray-400 text-sm">No hay notificaciones.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {notificaciones.map((notif) => (
          <div
            key={notif.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 px-4 py-4 hover:shadow-md transition-shadow"
          >
            {notif.usuario?.avatar_url ? (
              <img
                src={notif.usuario.avatar_url}
                alt={notif.usuario.nombre}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <InitialsAvatar nombre={notif.usuario?.nombre || notif.titulo} />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">
                {notif.titulo || notif.mensaje?.substring(0, 50) || 'Notificación'}
              </p>
              {notif.descripcion || notif.mensaje ? (
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {notif.descripcion || notif.mensaje}
                </p>
              ) : null}
            </div>

            {notif.created_at && (
              <span className="text-xs text-gray-400 flex-shrink-0">
                {new Date(notif.created_at).toLocaleDateString('es-ES')}
              </span>
            )}

            <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <MoreVertical size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
