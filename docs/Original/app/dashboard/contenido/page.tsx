"use client"

import Sidebar from "@/components/sidebar"
import { Play } from "lucide-react"

const videos = [
  { id: 1, titulo: "Digitalización", duracion: "20:30", descripcion: "Lorem ipsum dolor sit amet consectetur.", destacado: true },
  { id: 2, titulo: "Digitalización", duracion: "20:30", descripcion: "Lorem ipsum dolor sit amet consectetur.", destacado: false },
  { id: 3, titulo: "Digitalización", duracion: "20:30", descripcion: "Lorem ipsum dolor sit amet consectetur.", destacado: false },
  { id: 4, titulo: "Digitalización", duracion: "20:30", descripcion: "Lorem ipsum dolor sit amet consectetur.", destacado: false },
  { id: 5, titulo: "Digitalización", duracion: "20:30", descripcion: "Lorem ipsum dolor sit amet consectetur.", destacado: false },
  { id: 6, titulo: "Digitalización", duracion: "20:30", descripcion: "Lorem ipsum dolor sit amet consectetur.", destacado: false },
]

export default function ContenidoPage() {
  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <Sidebar />
      
      {/* Main content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1a1a4e] mb-8">Contenido</h1>
        
        <div className="grid grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="group cursor-pointer">
              {/* Video Thumbnail */}
              <div 
                className={`relative rounded-xl overflow-hidden aspect-video flex items-center justify-center ${
                  video.destacado ? "bg-[#0a0a4e]" : "bg-gray-300"
                }`}
              >
                <button className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={28} className="text-white ml-1" fill="white" />
                </button>
              </div>
              
              {/* Video Info */}
              <div className="mt-3">
                <h3 className="font-semibold text-[#1a1a4e]">{video.titulo}</h3>
                <p className="text-[#1a1a4e] font-bold">{video.duracion}</p>
                <p className="text-gray-500 text-sm mt-1">{video.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
