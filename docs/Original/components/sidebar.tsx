"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  Home, 
  FileText, 
  GitBranch, 
  Play, 
  MessageSquare, 
  Settings,
  Info,
  LogOut
} from "lucide-react"

const menuItems = [
  { icon: Home, label: "Inicio", href: "/dashboard" },
  { icon: FileText, label: "Documentos", href: "/dashboard/documentos" },
  { icon: GitBranch, label: "Proceso", href: "/dashboard/proceso" },
  { icon: Play, label: "Contenido", href: "/dashboard/contenido" },
  { icon: MessageSquare, label: "Contacto", href: "/dashboard/contacto" },
  { icon: Settings, label: "Configuración", href: "/dashboard/configuracion" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <aside className="w-64 bg-white min-h-screen flex flex-col border-r border-gray-100">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo-optimixage.png"
            alt="Optimixage Logo"
            width={150}
            height={40}
            className="h-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#0099cc] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
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
  )
}
