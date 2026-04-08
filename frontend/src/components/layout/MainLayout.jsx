import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'

export default function MainLayout() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ backgroundColor: '#f5f5f5' }}>
        <Outlet />
      </main>
    </div>
  )
}
