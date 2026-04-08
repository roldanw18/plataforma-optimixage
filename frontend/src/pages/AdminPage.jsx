import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'

export default function AdminPage() {
  const [proyectos, setProyectos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    api.get('/proyectos/mis-proyectos').then((r) => setProyectos(r.data))
    api.get('/usuarios/').then((r) => setUsuarios(r.data))
  }, [])

  async function crearProyecto(e) {
    e.preventDefault()
    if (!nuevoNombre.trim()) return
    try {
      const { data } = await api.post('/proyectos/', { nombre: nuevoNombre })
      setProyectos((prev) => [...prev, data])
      setNuevoNombre('')
      setMensaje(`Proyecto "${data.nombre}" creado.`)
    } catch {
      setMensaje('Error al crear el proyecto.')
    }
  }

  async function asignarCliente(proyectoId, clienteId) {
    try {
      await api.put(`/proyectos/${proyectoId}/asignar-cliente`, { cliente_id: clienteId })
      setMensaje('Cliente asignado correctamente.')
      const { data } = await api.get('/proyectos/mis-proyectos')
      setProyectos(data)
    } catch {
      setMensaje('Error al asignar cliente.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel de Administración</h1>

        {mensaje && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-3 mb-6">
            {mensaje}
          </div>
        )}

        {/* Crear proyecto */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Crear Proyecto</h2>
          <form onSubmit={crearProyecto} className="flex gap-3">
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Nombre del proyecto"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Crear
            </button>
          </form>
        </section>

        {/* Asignar clientes */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Asignar Clientes a Proyectos</h2>
          <div className="space-y-3">
            {proyectos.map((p) => (
              <div key={p.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 bg-gray-50">
                <span className="text-sm font-medium text-gray-800">{p.nombre}</span>
                <select
                  defaultValue={p.cliente_id || ''}
                  onChange={(e) => e.target.value && asignarCliente(p.id, e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Sin cliente</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre} ({u.email})</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
