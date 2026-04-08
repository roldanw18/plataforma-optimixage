import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e, forceAdmin = false) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      const stored = localStorage.getItem('user')
      const user = stored ? JSON.parse(stored) : null
      if (forceAdmin || (user && user.rol && user.rol.nombre === 'Admin')) {
        navigate('/admin/clientes')
      } else {
        navigate('/inicio')
      }
    } catch (err) {
      setError('Credenciales incorrectas. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen">
      {/* LEFT PANEL */}
      <div
        className="flex items-center justify-center"
        style={{ width: '45%', backgroundColor: '#000033' }}
      >
        <img src="/logo2.png" alt="Optimixage" style={{ width: '200px' }} />
      </div>

      {/* RIGHT PANEL */}
      <div
        className="flex items-center justify-center bg-white"
        style={{ width: '55%' }}
      >
        <div className="w-full max-w-sm px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Bienvenido</h1>
          <p className="text-sm text-gray-500 mb-8">Inicia sesión para continuar</p>

          <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-100 border-none outline-none rounded-full px-5 py-3 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-100 border-none outline-none rounded-full px-5 py-3 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />

            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}

            <p className="text-center text-xs text-gray-400 cursor-pointer hover:text-blue-600">
              ¿Olvidaste tu contraseña?
            </p>

            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white rounded-full py-3 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {loading ? 'Cargando...' : 'Iniciar sesión'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={(e) => handleSubmit(e, true)}
                className="flex-1 bg-blue-600 text-white rounded-full py-3 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                Administrador
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
