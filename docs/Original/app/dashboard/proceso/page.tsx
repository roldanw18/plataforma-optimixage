"use client"

import Sidebar from "@/components/sidebar"
import { MoreHorizontal, User, Search, CheckSquare, GitBranch, CheckCircle } from "lucide-react"

const etapas = [
  { id: 1, nombre: "Primer contacto", icon: User, completada: true, activa: false },
  { id: 2, nombre: "Diagnostico", icon: Search, completada: false, activa: true },
  { id: 3, nombre: "Capacitación", icon: CheckSquare, completada: false, activa: false },
  { id: 4, nombre: "Desarrollo", icon: GitBranch, completada: false, activa: false },
  { id: 5, nombre: "Entrega", icon: CheckCircle, completada: false, activa: false },
]

export default function ProcesoPage() {
  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <Sidebar />
      
      {/* Main content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1a1a4e] mb-8">Proceso</h1>
        
        {/* Proceso Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1a1a4e] mb-1">Proceso</h2>
              <p className="text-gray-500">Tu empresa está en la 2da etapa de digitalización.</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={24} />
            </button>
          </div>
          
          {/* Timeline */}
          <div className="mt-8">
            <div className="flex items-center justify-between relative">
              {etapas.map((etapa, index) => (
                <div key={etapa.id} className="flex flex-col items-center relative z-10">
                  {/* Checkmark for completed */}
                  {etapa.completada && (
                    <div className="absolute -top-6">
                      <CheckCircle size={20} className="text-green-500" />
                    </div>
                  )}
                  
                  {/* Progress bar segment */}
                  <div className="flex items-center w-full">
                    <div 
                      className={`h-3 rounded-full ${
                        etapa.completada 
                          ? "bg-[#0099cc]" 
                          : etapa.activa 
                            ? "bg-[#0099cc]" 
                            : "bg-gray-200"
                      }`}
                      style={{ width: index < etapas.length - 1 ? "120px" : "80px" }}
                    />
                  </div>
                  
                  {/* Label */}
                  <span className="text-sm text-gray-500 mt-3 text-center">{etapa.nombre}</span>
                  
                  {/* Icon */}
                  <etapa.icon size={24} className="text-gray-400 mt-2" />
                </div>
              ))}
              
              {/* Background line */}
              <div className="absolute top-1.5 left-0 right-0 h-3 bg-gray-200 rounded-full -z-0" />
            </div>
          </div>
        </div>
        
        {/* Bottom Cards */}
        <div className="grid grid-cols-2 gap-6">
          {/* Reuniones */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#1a1a4e] mb-4">Reuniones</h3>
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 mb-1">Próxima reunión</p>
                <p className="text-gray-600">Hora: <span className="font-bold">14:00</span></p>
                <p className="text-gray-600">Lugar: <span className="font-bold">Oficina</span></p>
                
                <p className="text-[#1a1a4e] font-bold mt-4">Recordar</p>
                <p className="text-gray-500 text-sm">Llegar 15 min antes.</p>
              </div>
              
              <div className="text-right">
                <span className="text-6xl font-light text-[#1a1a4e]">20</span>
                <p className="text-2xl font-light text-[#1a1a4e]">OCT</p>
              </div>
            </div>
          </div>
          
          {/* Cotización */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#1a1a4e] mb-4">Cotización</h3>
            
            {/* Simple chart representation */}
            <div className="flex items-end justify-center gap-4 h-40">
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-20 border-2 border-green-400 rounded bg-green-50"></div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-28 border-2 border-green-400 rounded bg-green-50"></div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-24 border-2 border-green-400 rounded bg-green-50"></div>
              </div>
            </div>
            <div className="w-full h-1 bg-green-400 mt-2 rounded"></div>
          </div>
        </div>
      </main>
    </div>
  )
}
