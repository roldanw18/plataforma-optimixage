"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Home, 
  FileText, 
  GitBranch, 
  Play, 
  MessageSquare, 
  Settings,
  Info,
  MoreVertical,
  LogOut
} from "lucide-react"

const menuItems = [
  { icon: Home, label: "Inicio", href: "/dashboard", active: true },
  { icon: FileText, label: "Documentos", href: "/dashboard/documentos", active: false },
  { icon: GitBranch, label: "Proceso", href: "/dashboard/proceso", active: false },
  { icon: Play, label: "Contenido", href: "/dashboard/contenido", active: false },
  { icon: MessageSquare, label: "Contacto", href: "/dashboard/contacto", active: false },
  { icon: Settings, label: "Configuración", href: "/dashboard/configuracion", active: false },
]

const documentos = [
  { nombre: "Cotización" },
  { nombre: "Acta 1" },
  { nombre: "Acta 2" },
  { nombre: "Confidencialidad" },
  { nombre: "Requerimientos" },
]

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      {/* Sidebar */}
      <aside className="w-[220px] bg-white flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6">
          <Image
            src="/logo-optimixage.png"
            alt="Optimixage Logo"
            width={150}
            height={40}
            className="w-auto h-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                item.active 
                  ? "bg-[#0099cc] text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Cerrar sesión */}
        <div className="px-3 mb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-4 mx-3 mb-4">
          <div className="flex items-start gap-2 text-gray-400 text-sm">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <p>Lorem ipsum dolor sit amet consectetur.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[220px] p-8">
        {/* Documentos Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0a0a4e] mb-4">Documentos</h2>
          <div className="flex gap-4 flex-wrap">
            {documentos.map((doc, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 w-[140px] flex flex-col items-center border border-gray-100 shadow-sm"
              >
                <div className="relative mb-3">
                  <div className="w-16 h-20 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                    <div className="bg-[#2196F3] text-white text-xs font-bold px-2 py-1 rounded">
                      DOC
                    </div>
                  </div>
                  <button className="absolute -top-1 -right-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <span className="text-sm text-gray-700 text-center">{doc.nombre}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Proceso Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0a0a4e] mb-4">Proceso</h2>
          <div className="flex gap-4 flex-wrap">
            {/* Etapa Card */}
            <div className="bg-white rounded-xl p-5 w-[280px] border border-gray-100 shadow-sm">
              <h3 className="font-bold text-[#0a0a4e] mb-1">Pyme</h3>
              <p className="text-gray-600 text-sm mb-4">
                Tu empresa está en la 2da etapa de digitalización
              </p>
              <div className="flex gap-1">
                <div className="h-2 w-12 bg-[#0099cc] rounded-full"></div>
                <div className="h-2 w-12 bg-[#0099cc] rounded-full"></div>
                <div className="h-2 w-12 bg-gray-200 rounded-full"></div>
                <div className="h-2 w-12 bg-gray-200 rounded-full"></div>
                <div className="h-2 w-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>

            {/* Reunión Card */}
            <div className="bg-white rounded-xl p-5 w-[200px] border border-gray-100 shadow-sm">
              <h3 className="font-bold text-[#0a0a4e] mb-1">Pyme</h3>
              <p className="text-gray-600 text-sm">Próxima reunión</p>
              <p className="text-gray-600 text-sm">
                Hora: <span className="font-bold">14:00</span>
              </p>
              <p className="text-gray-600 text-sm">Lugar: Oficina</p>
            </div>

            {/* Fecha Card */}
            <div className="bg-white rounded-xl p-5 flex items-center gap-4 border border-gray-100 shadow-sm">
              <div className="text-center">
                <span className="text-5xl font-bold text-[#0a0a4e]">20</span>
                <p className="text-xl font-bold text-[#0a0a4e]">OCT</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Próxima reunión</p>
                <p className="text-gray-600 text-sm">
                  Hora: <span className="font-bold">14:00</span>
                </p>
                <p className="text-gray-600 text-sm">Lugar: Oficina</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contenido Section */}
        <section>
          <h2 className="text-xl font-bold text-[#0a0a4e] mb-4">Contenido</h2>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-[#0a0a4e] rounded-xl w-[280px] h-[160px]"></div>
            <div className="bg-[#0a0a4e] rounded-xl w-[280px] h-[160px]"></div>
            <div className="bg-[#0a0a4e] rounded-xl w-[280px] h-[160px]"></div>
          </div>
        </section>
      </main>
    </div>
  )
}
