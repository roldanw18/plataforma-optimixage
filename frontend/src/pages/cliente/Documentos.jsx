import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import api from '../../services/api'

export default function Documentos() {
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: proyectos } = await api.get('/proyectos/mis-proyectos')
        if (!proyectos || proyectos.length === 0) {
          setLoading(false)
          return
        }
        const pid = proyectos[0].id
        const { data } = await api.get(`/documentos/proyecto/${pid}`)
        setDocumentos(data)
      } catch (e) {
        setError('No se pudieron cargar los documentos.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Documentos</h1>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-16" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Documentos</h1>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {documentos.length === 0 && !error && (
        <p className="text-gray-400 text-sm">No hay documentos disponibles.</p>
      )}

      <div className="flex flex-col gap-0">
        {documentos.map((doc, idx) => (
          <div key={doc.id}>
            <div className="bg-white flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  {doc.nombre || doc.titulo || 'Documento'}
                </p>
                {doc.descripcion && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.descripcion}</p>
                )}
              </div>
              {doc.url && (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  Ver
                </a>
              )}
            </div>
            {idx < documentos.length - 1 && (
              <div className="h-px bg-gray-100 mx-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
