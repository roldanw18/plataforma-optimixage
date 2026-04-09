import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import DocumentList from '../components/DocumentList'
import MessageChat from '../components/MessageChat'
import api from '../services/api'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [proyecto, setProyecto] = useState(null)
  const [documentos, setDocumentos] = useState([])
  const [mensajes, setMensajes] = useState([])

  useEffect(() => {
    api.get(`/proyectos/${id}`).then((r) => setProyecto(r.data)).catch(() => navigate('/dashboard'))
    loadDocumentos()
    loadMensajes()
  }, [id])

  function loadDocumentos() {
    api.get(`/documentos/proyecto/${id}`).then((r) => setDocumentos(r.data))
  }

  function loadMensajes() {
    api.get(`/mensajes/proyecto/${id}`).then((r) => setMensajes(r.data))
  }

  if (!proyecto) return null

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/dashboard')} className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← Volver al dashboard
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">{proyecto.nombre}</h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Documentos */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Documentos</h2>
            <DocumentList documentos={documentos} />
          </section>

          {/* Mensajes */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Chat del proyecto</h2>
            <MessageChat mensajes={mensajes} proyectoId={id} onNewMessage={loadMensajes} />
          </section>
        </div>
      </main>
    </div>
  )
}
