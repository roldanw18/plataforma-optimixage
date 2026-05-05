import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import MainLayout from './components/layout/MainLayout'
import AdminLayout from './components/layout/AdminLayout'
import Login from './pages/Login'
import Inicio from './pages/cliente/Inicio'
import Documentos from './pages/cliente/Documentos'
import Proceso from './pages/cliente/Proceso'
import Contenido from './pages/cliente/Contenido'
import Contacto from './pages/cliente/Contacto'
import ConfiguracionCliente from './pages/cliente/Configuracion'
import AdminClientes from './pages/admin/Clientes'
import AdminProceso from './pages/admin/Proceso'
import AdminNotificaciones from './pages/admin/Notificaciones'
import AdminContenido from './pages/admin/Contenido'
import AdminDocumentos from './pages/admin/Documentos'
import AdminMensajes from './pages/admin/Mensajes'
import AdminConfiguracion from './pages/admin/Configuracion'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Client routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/inicio" replace />} />
              <Route path="inicio"        element={<Inicio />} />
              <Route path="documentos"    element={<Documentos />} />
              <Route path="proceso"       element={<Proceso />} />
              <Route path="contenido"     element={<Contenido />} />
              <Route path="contacto"      element={<Contacto />} />
              <Route path="configuracion" element={<ConfiguracionCliente />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/clientes" replace />} />
              <Route path="clientes"       element={<AdminClientes />} />
              <Route path="proceso"        element={<AdminProceso />} />
              <Route path="documentos"     element={<AdminDocumentos />} />
              <Route path="mensajes"       element={<AdminMensajes />} />
              <Route path="notificaciones" element={<AdminNotificaciones />} />
              <Route path="contenido"      element={<AdminContenido />} />
              <Route path="equipo"         element={<div className="p-8"><h1 className="text-2xl font-bold text-[#0a0a4e]">Equipo — Próximamente</h1></div>} />
              <Route path="configuracion"  element={<AdminConfiguracion />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
