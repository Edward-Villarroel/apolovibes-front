import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RutaNoAdmin({ children }) {
  const { isAdmin, isEmpleado } = useAuth()

  if (isAdmin) return <Navigate to="/admin" replace />
  if (isEmpleado) return <Navigate to="/admin/venta" replace />

  return children
}