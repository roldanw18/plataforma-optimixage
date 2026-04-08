import { useEffect, useState } from 'react'
import { User, Search, Clipboard, Users, CheckCircle, BarChart2, Calendar, Clock } from 'lucide-react'
import api from '../../services/api'

const ETAPA_ICONS = {
  primer_contacto: User,
  diagnostico: Search,
  capacitacion: Clipboard,
  desarrollo: Users,
  entrega: CheckCircle,
}

export default function Proceso() {
  const [proceso, setProceso] = useState(null)
  const [reuniones, setReuniones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: proyectos } = await api.get('/proyectos/mis-proyectos')
        if (!proyectos || proyectos.length === 0) return
        const pid = proyectos[0].id

        const [procesoRes, reunRes] = await Promise.allSettled([
          api.get(`/proceso/${pid}`),
          api.get(`/reuniones/proyecto/${pid}`),
        ])

        if (procesoRes.status === 'fulfilled') setProceso(procesoRes.value.data)
        if (reunRes.status === 'fulfilled') setReuniones(reunRes.value.data)
      } catch (e) {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const proximaReunion = reuniones.find((r) => new Date(r.fecha) >= new Date()) || reuniones[0]

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Proceso</h1>
        <div className="animate-pulse bg-white rounded-xl h-48 border border-gray-100" />
      </div>
    )
  }

  const etapas = proceso?.etapas || []
  const progreso = proceso?.progreso || 20
  const etapaLabel = proceso?.etapa_label || 'Primer contacto'

  return (
    <div className="p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Proceso</h1>

      {/* Tarjeta principal de proceso */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-gray-500">Proceso</p>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {progreso}%
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-800 mb-5">
          Tu empresa está en la etapa de{' '}
          <span className="text-blue-600">{etapaLabel}</span>.
        </p>

        {/* Barra de progreso */}
        <div className="relative w-full bg-gray-100 rounded-full h-2 mb-8">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progreso}%` }}
          />
        </div>

        {/* Etapas */}
        <div className="flex justify-between">
          {etapas.map((etapa, idx) => {
            const Icon = ETAPA_ICONS[etapa.key] || CheckCircle
            const isCompleted = etapa.estado === 'completado'
            const isCurrent = etapa.estado === 'activo'

            return (
              <div key={etapa.key} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                </div>
                <span
                  className={`text-xs font-medium text-center leading-tight ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {etapa.label}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isCompleted || isCurrent ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Historial de cambios */}
      {proceso?.historial?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">Historial de cambios</p>
          <div className="flex flex-col gap-3">
            {proceso.historial.slice(0, 5).map((h) => (
              <div key={h.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {h.etapa_label || h.etapa}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(h.fecha_inicio).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                    {h.notas && ` — ${h.notas}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tarjetas inferiores */}
      <div className="flex gap-4">
        {/* Reuniones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-4">
            Reuniones
          </p>
          {proximaReunion ? (
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-center min-w-[48px]">
                <span className="text-4xl font-bold text-gray-900 leading-none">
                  {new Date(proximaReunion.fecha).getDate()}
                </span>
                <span className="text-sm text-gray-500 capitalize mt-1">
                  {new Date(proximaReunion.fecha).toLocaleString('es-ES', { month: 'short' })}
                </span>
              </div>
              <div className="border-l border-gray-100 pl-5">
                <p className="text-sm font-semibold text-gray-800">
                  {proximaReunion.titulo || 'Próxima reunión'}
                </p>
                {proximaReunion.fecha && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Clock size={11} />
                    {new Date(proximaReunion.fecha).toLocaleTimeString('es-ES', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}
                {proximaReunion.enlace && (
                  <a
                    href={proximaReunion.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 mt-1 hover:underline block"
                  >
                    Unirse a la reunión
                  </a>
                )}
                <p className="text-xs text-gray-400 mt-2">Recordar: Llegar 15 min antes</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Sin reuniones próximas.</p>
          )}
        </div>

        {/* Cotización */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col items-center justify-center gap-3">
          <BarChart2 size={36} className="text-gray-200" />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cotización</p>
          <p className="text-xs text-gray-400">Próximamente disponible</p>
        </div>
      </div>
    </div>
  )
}
