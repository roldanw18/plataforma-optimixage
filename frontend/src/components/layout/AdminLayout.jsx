import { Navigate, Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.rol && user.rol.nombre !== 'Admin') {
    return <Navigate to="/inicio" replace />
  }

  return (
    <div className="app-container">
      <AdminSidebar />
      <main className="main-content" style={{ backgroundColor: '#f5f5f5' }}>
        <Outlet />
      </main>
    </div>
  )
}
