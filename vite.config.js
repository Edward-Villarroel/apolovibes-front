import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Guardia contra el error que dejó la tienda de producción con las cards sin
  // imagen: un build sin VITE_API_URL usa BASE_URL = '/api' y todo (datos y
  // fotos de producto) se pide al dominio del hosting estático, donde no hay
  // API. El valor real vive en .env.production.
  if (mode === 'production' && !env.VITE_API_URL) {
    throw new Error(
      'Falta VITE_API_URL para el build de producción. ' +
        'Definila en .env.production (ej. https://api.apolovibes3d.cl).'
    )
  }

  return {
    plugins: [react()],
    base: '/',
    server: {
      port: 5173,
      proxy: {
        // 127.0.0.1 y no "localhost": en Windows "localhost" resuelve a ::1, el
        // gateway escucha solo en IPv4 y cada /api tardaba ~2s en el proxy.
        '/api': 'http://127.0.0.1:3000'
      }
    }
  }
})
