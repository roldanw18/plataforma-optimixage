import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Users,
  BarChart2,
  Bell,
  Play,
  Users2,
  Settings,
  LogOut,
  Info,
  FolderOpen,
  MessageCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import LanguageSwitcher from '../common/LanguageSwitcher'

const NAV_ITEMS = [
  { icon: Users,         key: 'clientes',       path: '/admin/clientes' },
  { icon: BarChart2,     key: 'proceso',        path: '/admin/proceso' },
  { icon: FolderOpen,    key: 'documentos',     path: '/admin/documentos' },
  { icon: MessageCircle, key: 'mensajes',       path: '/admin/mensajes' },
  { icon: Bell,          key: 'notificaciones', path: '/admin/notificaciones' },
  { icon: Play,          key: 'contenido',      path: '/admin/contenido' },
  { icon: Users2,        key: 'equipo',         path: '/admin/equipo' },
  { icon: Settings,      key: 'configuracion',  path: '/admin/configuracion' },
]

export default function AdminSidebar() {
  const { logout } = useAuth()
  const { t } = useTranslation()

  return (
    <aside
      className="flex flex-col h-screen bg-white"
      style={{
        width: '220px',
        minWidth: '220px',
        borderRight: '1px solid #f3f4f6',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem 1rem' }}>
        <img
          src="/logo3.png"
          alt="Optimixage"
          style={{ width: '140px', height: 'auto' }}
        />
      </div>

      {/* Nav */}
      <nav className="flex flex-col flex-1" style={{ padding: '0.25rem 0.75rem', gap: '2px' }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
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
              })}
            >
              <Icon size={18} />
              <span>{t(`nav.${item.key}`)}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Language Switcher */}
      <div style={{ padding: '0 0.75rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
        <LanguageSwitcher />
      </div>

      {/* Logout */}
      <div style={{ padding: '0 0.75rem 0.75rem' }}>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full rounded-lg text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-500"
          style={{ padding: '0.75rem 1rem' }}
        >
          <LogOut size={18} />
          <span>{t('nav.logout')}</span>
        </button>
      </div>

      {/* Info footer */}
      <div style={{ padding: '0 0.75rem 1rem' }}>
        <div
          className="flex items-start gap-2 rounded-lg"
          style={{ padding: '0.75rem 1rem' }}
        >
          <Info size={14} className="text-gray-400 flex-shrink-0" style={{ marginTop: '2px' }} />
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', lineHeight: '1.4' }}>
            {t('nav.footer_info')}
          </p>
        </div>
      </div>
    </aside>
  )
}
