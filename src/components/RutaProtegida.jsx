import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RutaProtegida({ children }) {
  const { sesion, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  if (!sesion) return <Navigate to="/login" replace />

  return children
}
