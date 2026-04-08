import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas dentro del Layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="documents" element={<Documents />} />
          
          {/* Vistas futuras del mockup */}
          <Route path="processes" element={<div className="p-8"><h1 className="text-2xl font-bold">Procesos (Próximamente)</h1></div>} />
          <Route path="meetings" element={<div className="p-8"><h1 className="text-2xl font-bold">Reuniones (Próximamente)</h1></div>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
