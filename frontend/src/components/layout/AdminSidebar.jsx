import { NavLink } from 'react-router-dom'
import {
  Users,
  BarChart2,
  Bell,
  Play,
  Users2,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { icon: Users, label: 'Clientes', path: '/admin/clientes' },
  { icon: BarChart2, label: 'Proceso', path: '/admin/proceso' },
  { icon: Bell, label: 'Notificaciones', path: '/admin/notificaciones' },
  { icon: Play, label: 'Contenido', path: '/admin/contenido' },
  { icon: Users2, label: 'Equipo', path: '/admin/equipo' },
  { icon: Settings, label: 'Configuración', path: '/admin/configuracion' },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()

  return (
    <aside
      className="flex flex-col h-screen bg-white border-r border-gray-100"
      style={{ width: '200px', minWidth: '200px' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <img src="/logo3.png" alt="logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
        <span className="font-bold text-sm" style={{ color: '#000033' }}>optimixage</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1 px-1 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom user info */}
      <div className="px-3 py-4 border-t border-gray-100">
        {user && (
          <p className="text-xs text-gray-400 truncate mb-2" title={user.email}>
            {user.email}
          </p>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut size={14} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
