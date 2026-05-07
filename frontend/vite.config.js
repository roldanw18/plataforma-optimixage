import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Carga las variables VITE_* desde .env / .env.local. Aceptamos prefijos
// VITE_ y tambien permitimos un override puntual (PORT) para dev.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:8000'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true, // permite acceder desde otra maquina en la red
      port: Number(env.PORT) || 5173,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    preview: {
      port: Number(env.PORT) || 5173,
    },
  }
})
