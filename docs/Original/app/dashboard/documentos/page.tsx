"use client"

import Sidebar from "@/components/sidebar"
import { MoreHorizontal } from "lucide-react"

const documentos = [
  {
    id: 1,
    titulo: "Cotización",
    descripcion: "Lorem ipsum dolor sit amet consectetur. Sit leo eget porta at enim quam faucibus dictum. Pharetra quam sagittis odio sed ultrices amet non consequat."
  },
  {
    id: 2,
    titulo: "Acta 1",
    descripcion: "Lorem ipsum dolor sit amet consectetur. Sit leo eget porta at enim quam faucibus dictum. Pharetra quam sagittis odio sed ultrices amet non consequat."
  },
  {
    id: 3,
    titulo: "Requerimientos",
    descripcion: "Lorem ipsum dolor sit amet consectetur. Sit leo eget porta at enim quam faucibus dictum. Pharetra quam sagittis odio sed ultrices amet non consequat."
  },
  {
    id: 4,
    titulo: "Acta 2",
    descripcion: "Lorem ipsum dolor sit amet consectetur. Sit leo eget porta at enim quam faucibus dictum. Pharetra quam sagittis odio sed ultrices amet non consequat."
  },
  {
    id: 5,
    titulo: "Confidencialidad",
    descripcion: "Lorem ipsum dolor sit amet consectetur. Sit leo eget porta at enim quam faucibus dictum. Pharetra quam sagittis odio sed ultrices amet non consequat."
  },
]

export default function DocumentosPage() {
  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <Sidebar />
      
      {/* Main content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1a1a4e] mb-8">Documentos</h1>
        
        <div className="space-y-4">
          {documentos.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white rounded-xl p-6 flex items-start gap-6 shadow-sm"
            >
              {/* Doc Icon */}
              <div className="flex-shrink-0 w-20 h-24 bg-gradient-to-b from-[#4A9BD9] to-[#2E7AB8] rounded-lg flex items-center justify-center relative">
                <div className="absolute top-0 right-0 w-4 h-4 bg-[#3D8AC7]" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
                <span className="text-white font-bold text-lg">DOC</span>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#1a1a4e] mb-2">{doc.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{doc.descripcion}</p>
              </div>
              
              {/* Menu */}
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={24} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
