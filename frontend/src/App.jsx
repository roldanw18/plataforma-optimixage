import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './components/layout/MainLayout'
import AdminLayout from './components/layout/AdminLayout'
import Login from './pages/Login'
import Inicio from './pages/cliente/Inicio'
import Documentos from './pages/cliente/Documentos'
import Proceso from './pages/cliente/Proceso'
import Contenido from './pages/cliente/Contenido'
import Contacto from './pages/cliente/Contacto'
import AdminClientes from './pages/admin/Clientes'
import AdminProceso from './pages/admin/Proceso'
import AdminNotificaciones from './pages/admin/Notificaciones'
import AdminContenido from './pages/admin/Contenido'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Client routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/inicio" replace />} />
            <Route path="inicio" element={<Inicio />} />
            <Route path="documentos" element={<Documentos />} />
            <Route path="proceso" element={<Proceso />} />
            <Route path="contenido" element={<Contenido />} />
            <Route path="contacto" element={<Contacto />} />
            <Route path="configuracion" element={<div className="p-8"><h1 className="text-2xl font-bold">Configuración</h1></div>} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/clientes" replace />} />
            <Route path="clientes" element={<AdminClientes />} />
            <Route path="proceso" element={<AdminProceso />} />
            <Route path="notificaciones" element={<AdminNotificaciones />} />
            <Route path="contenido" element={<AdminContenido />} />
            <Route path="equipo" element={<div className="p-8"><h1 className="text-2xl font-bold">Equipo</h1></div>} />
            <Route path="configuracion" element={<div className="p-8"><h1 className="text-2xl font-bold">Configuración</h1></div>} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
