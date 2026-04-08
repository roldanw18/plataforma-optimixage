import { Play } from 'lucide-react'

const videos = [
  { id: 1, title: 'Introducción al proceso de digitalización', time: '20:30', desc: 'Conoce los primeros pasos para digitalizar tu empresa.' },
  { id: 2, title: 'Diagnóstico empresarial', time: '20:30', desc: 'Cómo evaluamos el estado actual de tu negocio.' },
  { id: 3, title: 'Herramientas digitales clave', time: '20:30', desc: 'Las herramientas que usarás durante el proceso.' },
  { id: 4, title: 'Capacitación del equipo', time: '20:30', desc: 'Cómo preparar a tu equipo para el cambio.' },
  { id: 5, title: 'Desarrollo e implementación', time: '20:30', desc: 'La fase de desarrollo de tu solución digital.' },
  { id: 6, title: 'Entrega y seguimiento', time: '20:30', desc: 'Cómo recibir y mantener tu solución.' },
]

export default function AdminContenido() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contenido</h1>

      <div className="grid grid-cols-3 gap-5">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          >
            <div
              className="relative flex items-center justify-center bg-gray-800"
              style={{ height: '150px' }}
            >
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <Play size={22} className="text-white ml-1" />
              </div>
              <span className="absolute bottom-2 right-3 text-xs text-white font-medium">
                {video.time}
              </span>
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-gray-800 mb-1">{video.title}</p>
              <p className="text-xs text-gray-500">{video.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
