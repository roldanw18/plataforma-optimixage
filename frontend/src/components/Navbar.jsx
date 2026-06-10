import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { t } = useTranslation('common')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between shadow">
      <Link to="/dashboard" className="text-lg font-semibold tracking-wide">
        {t('navbar.platform')}
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user?.rol === 'Admin' && (
          <Link to="/admin" className="hover:text-blue-200 transition-colors">
            {t('navbar.admin_panel')}
          </Link>
        )}
        <span className="text-blue-200">{user?.nombre}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-700 px-3 py-1 rounded hover:bg-blue-50 transition-colors font-medium"
        >
          {t('nav.logout')}
        </button>
      </div>
    </nav>
  )
}
