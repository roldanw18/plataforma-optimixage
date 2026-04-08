import { createContext, useContext, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  async function login(email, password) {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)

    const { data } = await api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    localStorage.setItem('token', data.access_token)

    const profile = await api.get('/usuarios/me')
    localStorage.setItem('user', JSON.stringify(profile.data))
    setUser(profile.data)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
