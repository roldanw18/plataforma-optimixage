import { useEffect, useState } from 'react'
import { MoreVertical } from 'lucide-react'
import api from '../../services/api'

function InitialsAvatar({ nombre }) {
  const initials = nombre
    ? nombre
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?'
  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
      style={{ backgroundColor: '#1865F2' }}
    >
      {initials}
    </div>
  )
}

export default function AdminClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get('/usuarios/')
        const filtered = data.filter(
          (u) => u.rol && (u.rol.nombre === 'Cliente' || u.rol.nombre === 'cliente')
        )
        setClientes(filtered.length > 0 ? filtered : data)
      } catch (e) {
        setError('No se pudieron cargar los clientes.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuestros clientes</h1>
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuestros clientes</h1>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {clientes.length === 0 && !error && (
        <p className="text-gray-400 text-sm">No hay clientes registrados.</p>
      )}

      <div className="grid grid-cols-5 gap-4">
        {clientes.map((cliente) => (
          <div
            key={cliente.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center relative hover:shadow-md transition-shadow cursor-pointer"
          >
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <MoreVertical size={16} />
            </button>

            <div className="mt-3 mb-3">
              {cliente.avatar_url ? (
                <img
                  src={cliente.avatar_url}
                  alt={cliente.nombre}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <InitialsAvatar nombre={cliente.nombre} />
              )}
            </div>

            <p className="text-sm font-semibold text-gray-800 text-center leading-tight">
              {cliente.nombre || cliente.email}
            </p>
            {cliente.empresa && (
              <p className="text-xs text-gray-400 text-center mt-0.5">{cliente.empresa}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
