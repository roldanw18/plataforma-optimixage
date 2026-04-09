import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import ProjectCard from '../components/ProjectCard'
import api from '../services/api'

export default function DashboardPage() {
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/proyectos/mis-proyectos')
      .then((res) => setProyectos(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mis Proyectos</h1>

        {loading && <p className="text-gray-500">Cargando proyectos...</p>}

        {!loading && proyectos.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            No tienes proyectos asignados aún.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {proyectos.map((p) => (
            <ProjectCard key={p.id} proyecto={p} />
          ))}
        </div>
      </main>
    </div>
  )
}
