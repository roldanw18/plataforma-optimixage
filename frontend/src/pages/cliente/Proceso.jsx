import { useEffect, useState } from 'react'
import { User, Search, Clipboard, Users, CheckCircle, BarChart2 } from 'lucide-react'
import api from '../../services/api'

const etapasDefault = [
  { key: 'primer_contacto', label: 'Primer contacto', icon: User },
  { key: 'diagnostico', label: 'Diagnóstico', icon: Search },
  { key: 'capacitacion', label: 'Capacitación', icon: Clipboard },
  { key: 'desarrollo', label: 'Desarrollo', icon: Users },
  { key: 'entrega', label: 'Entrega', icon: CheckCircle },
]

export default function Proceso() {
  const [hitos, setHitos] = useState([])
  const [reuniones, setReuniones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: proyectos } = await api.get('/proyectos/mis-proyectos')
        if (!proyectos || proyectos.length === 0) return
        const pid = proyectos[0].id
        const [hitosRes, reunRes] = await Promise.allSettled([
          api.get(`/hitos/proyecto/${pid}`),
          api.get(`/reuniones/proyecto/${pid}`),
        ])
        if (hitosRes.status === 'fulfilled') setHitos(hitosRes.value.data)
        if (reunRes.status === 'fulfilled') setReuniones(reunRes.value.data)
      } catch (e) {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalHitos = hitos.length || etapasDefault.length
  const hitosCompletados = hitos.filter((h) => h.estado === 'completado').length
  const etapaActualIdx = hitos.findIndex((h) => h.estado === 'en_progreso')
  const progreso = totalHitos > 0 ? Math.round((hitosCompletados / totalHitos) * 100) : 20

  const etapaLabel =
    etapaActualIdx >= 0
      ? hitos[etapaActualIdx]?.nombre
      : hitos.length > 0
      ? hitos[hitosCompletados]?.nombre || '1ra'
      : '2da etapa'

  const proximaReunion = reuniones.find((r) => new Date(r.fecha) >= new Date()) || reuniones[0]

  const etapasToShow = hitos.length > 0
    ? hitos.map((h, i) => ({ ...h, icon: etapasDefault[i]?.icon || CheckCircle }))
    : etapasDefault.map((e, i) => ({ ...e, estado: i === 1 ? 'en_progreso' : i < 1 ? 'completado' : 'pendiente' }))

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Proceso</h1>
        <div className="animate-pulse bg-white rounded-xl h-48 border border-gray-100" />
      </div>
    )
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Proceso</h1>

      {/* Main process card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-sm text-gray-500 mb-1">Tu empresa está en la</p>
        <p className="text-lg font-bold text-gray-900 mb-5">
          <span className="text-blue-600">{etapaLabel}</span> de digitalización.
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-3 mb-6">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${progreso}%` }}
          />
        </div>

        {/* Stage indicators */}
        <div className="flex justify-between">
          {etapasToShow.map((etapa, idx) => {
            const Icon = etapa.icon || CheckCircle
            const isCompleted = etapa.estado === 'completado'
            const isCurrent = etapa.estado === 'en_progreso'
            const isPending = !isCompleted && !isCurrent

            return (
              <div key={etapa.key || etapa.id || idx} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted || isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-xs font-medium text-center leading-tight ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {etapa.label || etapa.nombre}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isCompleted || isCurrent ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom cards */}
      <div className="flex gap-4">
        {/* Reuniones card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1">
          <p className="text-xs text-gray-500 font-medium uppercase mb-3">Reuniones</p>
          {proximaReunion ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-gray-900">
                  {new Date(proximaReunion.fecha).getDate()}
                </span>
                <span className="text-sm text-gray-500 capitalize">
                  {new Date(proximaReunion.fecha).toLocaleString('es-ES', { month: 'long' })}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {proximaReunion.titulo || 'Próxima reunión'}
                </p>
                {proximaReunion.hora && (
                  <p className="text-xs text-gray-500 mt-0.5">{proximaReunion.hora}</p>
                )}
                {proximaReunion.lugar && (
                  <p className="text-xs text-gray-500">{proximaReunion.lugar}</p>
                )}
                <p className="text-xs text-blue-500 mt-2 font-medium">
                  Recordar: Llegar 15 min antes
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Sin reuniones próximas.</p>
          )}
        </div>

        {/* Cotización card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col items-center justify-center gap-3">
          <BarChart2 size={40} className="text-gray-300" />
          <p className="text-xs text-gray-500 font-medium uppercase">Cotización</p>
          <p className="text-xs text-gray-400">Próximamente</p>
        </div>
      </div>
    </div>
  )
}
