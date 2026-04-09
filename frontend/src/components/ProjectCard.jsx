import { useNavigate } from 'react-router-dom'

export default function ProjectCard({ proyecto }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/proyectos/${proyecto.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
    >
      <h3 className="text-lg font-semibold text-gray-800">{proyecto.nombre}</h3>
      <p className="text-sm text-gray-400 mt-1">ID: {proyecto.id.slice(0, 8)}…</p>
      <span className="inline-block mt-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
        Ver detalle →
      </span>
    </div>
  )
}
