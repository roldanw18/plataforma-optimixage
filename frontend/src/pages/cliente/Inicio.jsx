import { useEffect, useState } from 'react'
import { FileText, Play, Calendar } from 'lucide-react'
import api from '../../services/api'

export default function Inicio() {
  const [proyectoId, setProyectoId] = useState(null)
  const [documentos, setDocumentos] = useState([])
  const [reuniones, setReuniones] = useState([])
  const [hitos, setHitos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: proyectos } = await api.get('/proyectos/mis-proyectos')
        if (!proyectos || proyectos.length === 0) return
        const pid = proyectos[0].id
        setProyectoId(pid)

        const [docsRes, reunRes, procesoRes] = await Promise.allSettled([
          api.get(`/documentos/proyecto/${pid}`),
          api.get(`/reuniones/proyecto/${pid}`),
          api.get(`/proceso/${pid}`),
        ])

        if (docsRes.status === 'fulfilled') setDocumentos(docsRes.value.data.slice(0, 5))
        if (reunRes.status === 'fulfilled') setReuniones(reunRes.value.data)
        if (procesoRes.status === 'fulfilled') setHitos(procesoRes.value.data.etapas || [])
      } catch (e) {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const proximaReunion = reuniones.find((r) => new Date(r.fecha) >= new Date()) || reuniones[0]

  const etapaActual = hitos.find((h) => h.estado === 'activo') || hitos[0]
  const totalHitos = hitos.length || 5
  const hitosCompletados = hitos.filter((h) => h.estado === 'completado').length
  const progreso = totalHitos > 0 ? Math.round(((hitosCompletados + (etapaActual ? 1 : 0)) / totalHitos) * 100) : 20

  const videosPlaceholder = [
    { id: 1, title: 'Introducción al proceso' },
    { id: 2, title: 'Diagnóstico empresarial' },
    { id: 3, title: 'Herramientas digitales' },
  ]

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-gray-400 text-sm">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      {/* SECTION 1: Documentos */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Documentos</h2>
        {documentos.length === 0 ? (
          <p className="text-sm text-gray-400">Sin documentos disponibles.</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {documentos.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center p-4 cursor-pointer hover:shadow-md transition-shadow"
                style={{ minWidth: '120px', maxWidth: '120px' }}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <p className="text-xs font-medium text-gray-700 text-center line-clamp-2">
                  {doc.nombre || doc.titulo || 'Documento'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: Proceso */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Proceso</h2>
        <div className="flex gap-4">
          {/* Left card: progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1">
            <p className="text-xs text-gray-500 font-medium uppercase mb-1">Pyme</p>
            <p className="text-sm font-semibold text-gray-800 mb-4">
              Tu empresa está en la{' '}
              <span className="text-blue-600">
                {etapaActual ? etapaActual.nombre : '2da etapa'}
              </span>{' '}
              de digitalización
            </p>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progreso}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{progreso}% completado</p>
          </div>

          {/* Right card: next meeting */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-5" style={{ minWidth: '220px' }}>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-gray-900">
                {proximaReunion ? new Date(proximaReunion.fecha).getDate() : '--'}
              </span>
              <span className="text-sm text-gray-500 capitalize">
                {proximaReunion
                  ? new Date(proximaReunion.fecha).toLocaleString('es-ES', { month: 'long' })
                  : 'Sin fecha'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Próxima reunión</p>
              <p className="text-sm font-semibold text-gray-800">
                {proximaReunion ? proximaReunion.hora || proximaReunion.titulo || 'Ver detalles' : 'Sin reuniones'}
              </p>
              {proximaReunion && proximaReunion.lugar && (
                <p className="text-xs text-gray-400 mt-1">{proximaReunion.lugar}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Contenido */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Contenido</h2>
        <div className="flex gap-4">
          {videosPlaceholder.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              style={{ minWidth: '200px', maxWidth: '200px' }}
            >
              <div
                className="flex items-center justify-center bg-gray-200"
                style={{ height: '110px' }}
              >
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                  <Play size={18} className="text-gray-700 ml-0.5" />
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-gray-700">{v.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
