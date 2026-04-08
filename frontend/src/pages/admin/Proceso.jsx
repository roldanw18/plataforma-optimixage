import { useEffect, useState } from 'react'
import api from '../../services/api'

function InitialsAvatar({ nombre, size = 10 }) {
  const initials = nombre
    ? nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold text-sm`}
      style={{ backgroundColor: '#1865F2' }}
    >
      {initials}
    </div>
  )
}

const ETAPAS = ['Primer contacto', 'Diagnóstico', 'Capacitación', 'Desarrollo', 'Entrega']

export default function AdminProceso() {
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get('/proyectos/mis-proyectos')
        // For each project, try to get its hitos
        const proyectosConHitos = await Promise.all(
          data.map(async (p) => {
            try {
              const { data: hitos } = await api.get(`/hitos/proyecto/${p.id}`)
              const etapaActual = hitos.find((h) => h.estado === 'en_progreso') || hitos[hitos.length - 1]
              return { ...p, etapaActual: etapaActual?.nombre || 'Diagnóstico' }
            } catch {
              return { ...p, etapaActual: 'Diagnóstico' }
            }
          })
        )
        setProyectos(proyectosConHitos)
      } catch (e) {
        setError('No se pudieron cargar los proyectos.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Group projects by stage
  const grouped = ETAPAS.reduce((acc, etapa) => {
    const filtered = proyectos.filter((p) => {
      const ea = (p.etapaActual || '').toLowerCase()
      return ea.includes(etapa.toLowerCase().split(' ')[0])
    })
    if (filtered.length > 0) {
      acc[etapa] = filtered
    }
    return acc
  }, {})

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Proceso</h1>
        <div className="animate-pulse bg-white rounded-xl h-40 border border-gray-100" />
      </div>
    )
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-gray-900">Proceso</h1>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {Object.keys(grouped).length === 0 && !error && (
        <div>
          {ETAPAS.map((etapa) => (
            <div key={etapa} className="mb-8">
              <h2 className="text-base font-semibold text-gray-700 mb-3">{etapa}</h2>
              <p className="text-sm text-gray-400">Sin proyectos en esta etapa.</p>
            </div>
          ))}
        </div>
      )}

      {Object.entries(grouped).map(([etapa, items]) => (
        <section key={etapa}>
          <h2 className="text-base font-semibold text-gray-700 mb-3">{etapa}</h2>
          <div className="flex flex-wrap gap-4">
            {items.map((proyecto) => (
              <div
                key={proyecto.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-shadow"
                style={{ width: '120px' }}
              >
                {proyecto.cliente?.avatar_url ? (
                  <img
                    src={proyecto.cliente.avatar_url}
                    alt={proyecto.nombre}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <InitialsAvatar nombre={proyecto.nombre || proyecto.cliente?.nombre} size={12} />
                )}
                <p className="text-xs font-medium text-gray-700 text-center leading-tight">
                  {proyecto.nombre || proyecto.cliente?.nombre || 'Proyecto'}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
