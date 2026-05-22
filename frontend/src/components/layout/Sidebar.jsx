import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Home, FileText, BarChart2, Play,
  MessageCircle, Settings, LogOut, Info, Bell,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import LanguageSwitcher from '../common/LanguageSwitcher'

const NAV_ITEMS = [
  { icon: Home,          key: 'inicio',          path: '/inicio' },
  { icon: FileText,      key: 'documentos',      path: '/documentos' },
  { icon: BarChart2,     key: 'proceso',         path: '/proceso' },
  { icon: Play,          key: 'contenido',       path: '/contenido' },
  { icon: MessageCircle, key: 'contacto',        path: '/contacto' },
  { icon: Bell,          key: 'notificaciones',  path: '/notificaciones' },
  { icon: Settings,      key: 'configuracion',   path: '/configuracion' },
]

const NOTIF_POLL_MS = 30000

export default function Sidebar() {
  const { logout } = useAuth()
  const { t } = useTranslation()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function refresh() {
      try {
        const { data } = await api.get('/notificaciones/count')
        if (!cancelled) setUnreadCount(data?.no_leidas ?? 0)
      } catch {
        // silently handle
      }
    }
    refresh()
    const id = setInterval(refresh, NOTIF_POLL_MS)
    return () => { cancelled = true; clearInterval(id) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

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
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const showBadge = item.key === 'notificaciones' && unreadCount > 0
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
              {({ isActive }) => (
                <>
                  <Icon size={18} />
                  <span style={{ flex: 1 }}>{t(`nav.${item.key}`)}</span>
                  {showBadge && (
                    <span style={{
                      minWidth: '20px', height: '20px', padding: '0 6px',
                      borderRadius: '9999px',
                      backgroundColor: isActive ? 'white' : '#EF4444',
                      color: isActive ? '#0099cc' : 'white',
                      fontSize: '0.7rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      lineHeight: 1,
                    }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              )}
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
        <div className="flex items-start gap-2 rounded-lg" style={{ padding: '0.75rem 1rem' }}>
          <Info size={14} className="text-gray-400 flex-shrink-0" style={{ marginTop: '2px' }} />
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', lineHeight: '1.4' }}>
            {t('nav.footer_info')}
          </p>
        </div>
      </div>
    </aside>
  )
}
