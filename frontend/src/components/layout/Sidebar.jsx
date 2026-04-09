import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, FileText, BarChart2, Play,
  MessageCircle, Settings, LogOut, Info,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const navItems = [
  { icon: Home,          label: 'Inicio',         path: '/inicio' },
  { icon: FileText,      label: 'Documentos',      path: '/documentos' },
  { icon: BarChart2,     label: 'Proceso',         path: '/proceso' },
  { icon: Play,          label: 'Contenido',       path: '/contenido' },
  { icon: MessageCircle, label: 'Contacto',        path: '/contacto' },
  { icon: Settings,      label: 'Configuración',   path: '/configuracion' },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function fetchUnread() {
      try {
        const { data } = await api.get('/notificaciones/')
        setUnreadCount(data.filter((n) => !n.leida).length)
      } catch {
        // silently handle
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <aside
      className="flex flex-col h-screen bg-white"
      style={{ width: '220px', minWidth: '220px', borderRight: '1px solid #f3f4f6' }}
    >
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem 1rem' }}>
        <img src="/logo3.png" alt="Optimixage" style={{ width: '140px', height: 'auto' }} />
      </div>

      {/* Nav */}
      <nav className="flex flex-col flex-1" style={{ padding: '0.25rem 0.75rem', gap: '2px' }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isContacto = item.path === '/contacto'
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg font-medium text-sm transition-colors ${
                  isActive ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
              style={({ isActive }) => ({
                padding: '0.75rem 1rem',
                marginBottom: '2px',
                backgroundColor: isActive ? '#0099cc' : undefined,
                position: 'relative',
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {isContacto && unreadCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  backgroundColor: '#EF4444', color: 'white',
                  fontSize: '0.65rem', fontWeight: '700',
                  borderRadius: '9999px', padding: '1px 6px',
                  minWidth: '18px', textAlign: 'center',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0 0.75rem 0.75rem' }}>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full rounded-lg text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-500"
          style={{ padding: '0.75rem 1rem' }}
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>

      {/* Info footer */}
      <div style={{ padding: '0 0.75rem 1rem' }}>
        <div className="flex items-start gap-2 rounded-lg" style={{ padding: '0.75rem 1rem' }}>
          <Info size={14} className="text-gray-400 flex-shrink-0" style={{ marginTop: '2px' }} />
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', lineHeight: '1.4' }}>
            Lorem ipsum dolor sit amet consectetur.
          </p>
        </div>
      </div>
    </aside>
  )
}
