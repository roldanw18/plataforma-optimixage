"use client"

import { useState } from "react"
import Image from "next/image"
import Sidebar from "@/components/sidebar"
import { Send } from "lucide-react"

const mensajesIniciales = [
  { id: 1, texto: "Hola, ¿cómo puedo ayudarte?", enviado: false },
  { id: 2, texto: "Tengo una consulta sobre mi proceso", enviado: true },
  { id: 3, texto: "Claro, cuéntame más sobre tu consulta", enviado: false },
  { id: 4, texto: "Quiero saber en qué etapa está mi digitalización", enviado: true },
  { id: 5, texto: "Tu empresa está actualmente en la segunda etapa de digitalización", enviado: false },
  { id: 6, texto: "Gracias por la información", enviado: true },
  { id: 7, texto: "De nada, estoy aquí para ayudarte", enviado: false },
]

export default function ContactoPage() {
  const [mensajes, setMensajes] = useState(mensajesIniciales)
  const [nuevoMensaje, setNuevoMensaje] = useState("")

  const enviarMensaje = (e: React.FormEvent) => {
    e.preventDefault()
    if (nuevoMensaje.trim()) {
      setMensajes([...mensajes, { id: mensajes.length + 1, texto: nuevoMensaje, enviado: true }])
      setNuevoMensaje("")
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <Sidebar />
      
      {/* Main content */}
      <main className="flex-1 p-8 flex flex-col">
        <h1 className="text-2xl font-bold text-[#1a1a4e] mb-8">Contacto</h1>
        
        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {mensajes.map((mensaje) => (
              <div
                key={mensaje.id}
                className={`flex ${mensaje.enviado ? "justify-end" : "justify-start"}`}
              >
                {!mensaje.enviado && (
                  <div className="flex items-end gap-2">
                    <Image
                      src="/logo-optimixage.png"
                      alt="Optimixage"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-contain"
                    />
                    <div className="bg-gray-200 rounded-2xl rounded-bl-none px-4 py-3 max-w-md">
                      <p className="text-gray-700">{mensaje.texto}</p>
                    </div>
                  </div>
                )}
                {mensaje.enviado && (
                  <div className="bg-[#4a4a4a] rounded-2xl rounded-br-none px-4 py-3 max-w-md">
                    <p className="text-white">{mensaje.texto}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Input */}
          <form onSubmit={enviarMensaje} className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-transparent outline-none text-gray-700"
              />
              <button 
                type="submit"
                className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
              >
                <Send size={18} className="text-gray-600" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
