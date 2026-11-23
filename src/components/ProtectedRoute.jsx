import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, roles = ['admin'] }) {
  const { user, isAdmin } = useAuth()

  const permitido =
    roles.includes(user?.rol) || (roles.includes('admin') && isAdmin)

  if (!permitido) {
    const destino = user?.rol === 'empleado' ? '/admin/venta' : '/'
    return <Navigate to={destino} replace />
  }

  return children
}