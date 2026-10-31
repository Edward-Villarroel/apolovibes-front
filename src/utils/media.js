const BASE = import.meta.env.BASE_URL
const API_BASE = import.meta.env.VITE_API_URL || ''

export const mediaPath = (file) => `${BASE}media/${file}`

// Convierte URLs relativas de la API (ej: /api/productos/123/imagen)
// a URLs absolutas apuntando a Render.
export const apiPath = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}
