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
    <div className="flex min-h-screen" style={{ backgroundColor: '#0a0a4e' }}>
      {/* Left side - Brand (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
        <img
          src="/logo2.png"
          alt="Optimixage"
          style={{ width: '280px', height: 'auto' }}
        />
      </div>

      {/* Right side - Login form */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center px-8 min-h-screen"
        style={{
          backgroundColor: '#f5f5f5',
          borderRadius: '60px 0 0 60px',
        }}
      >
        <div className="w-full" style={{ maxWidth: '400px' }}>
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/logo2.png" alt="Optimixage" style={{ width: '80px' }} />
          </div>

          {/* Welcome text */}
          <div className="text-center mb-8">
            <h2
              className="font-bold mb-2"
              style={{ fontSize: '1.875rem', color: '#1a1a4e' }}
            >
              Bienvenido
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              Inicia sesión para continuar
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full focus:ring-2"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#d9d9d9',
                border: 'none',
                borderRadius: '9999px',
                textAlign: 'center',
                color: '#4B5563',
                outline: 'none',
                fontSize: '0.875rem',
              }}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full focus:ring-2"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#d9d9d9',
                border: 'none',
                borderRadius: '9999px',
                textAlign: 'center',
                color: '#4B5563',
                outline: 'none',
                fontSize: '0.875rem',
              }}
            />

            {error && (
              <p style={{ color: '#EF4444', fontSize: '0.75rem', textAlign: 'center' }}>
                {error}
              </p>
            )}

            {/* Forgot password */}
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <a href="#" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4" style={{ paddingTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.5rem 2rem',
                  backgroundColor: '#0099cc',
                  color: 'white',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontSize: '0.875rem',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#007aa3')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#0099cc')}
              >
                {loading ? 'Cargando...' : 'Iniciar sesión'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={(e) => handleSubmit(e, true)}
                style={{
                  padding: '0.5rem 2rem',
                  backgroundColor: '#0099cc',
                  color: 'white',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontSize: '0.875rem',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#007aa3')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#0099cc')}
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
