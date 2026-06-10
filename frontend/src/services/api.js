import axios from 'axios'

// En desarrollo (npm run dev) usamos el proxy de Vite => baseURL '/api'.
// En produccion (build estatico tras nginx o vite preview) consumimos
// directamente la variable VITE_API_URL.
//   - Define VITE_API_URL en frontend/.env para apuntar a tu backend.
//   - Si no hay variable, caemos al proxy '/api' (compatible con dev y nginx).
const baseURL = import.meta.env.VITE_API_URL && import.meta.env.PROD
  ? import.meta.env.VITE_API_URL
  : '/api'

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
