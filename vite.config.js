import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy: redirige las peticiones /api al backend Spring Boot para evitar CORS en desarrollo
    proxy: {
      '/api': {
        target: 'http://localhost:8010',
        changeOrigin: true,
        bypass: (req) => {
          if (req.method === 'GET' && req.url?.startsWith('/api/checkout/stripe/')) {
            return '/index.html'
          }
        },
      },
      // Proxy para los endpoints de administración del backend
      '/admin': {
        target: 'http://localhost:8010',
        changeOrigin: true,
      },
    },
  },
})
