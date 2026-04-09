import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between shadow">
      <Link to="/dashboard" className="text-lg font-semibold tracking-wide">
        Plataforma de Proyectos
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user?.rol === 'Admin' && (
          <Link to="/admin" className="hover:text-blue-200 transition-colors">
            Panel Admin
          </Link>
        )}
        <span className="text-blue-200">{user?.nombre}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-700 px-3 py-1 rounded hover:bg-blue-50 transition-colors font-medium"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
