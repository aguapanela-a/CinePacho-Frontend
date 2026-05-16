import React from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

/**
 * ProtectedRoute: Guarda de rutas basada en autenticación y autorización.
 * Verifica que el usuario tenga sesión activa (JWT) y que su rol
 * coincida con los roles permitidos para acceder a la ruta envuelta.
 *
 * @param {string[]} allowedRoles - Lista de UserType permitidos (e.g. ['ADMIN'])
 * @param {React.ReactNode} children - Componentes hijos a renderizar si autorizado
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, token } = useApp()

  // Sin sesión activa → redirigir al login
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  // Si se especifican roles y el usuario no tiene ninguno de los permitidos → redirigir
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.userType)) {
    if (user.userType === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (user.userType === 'MANAGER') return <Navigate to="/manager/dashboard" replace />
    if (user.userType === 'EMPLOYEE') return <Navigate to="/cajero" replace />
    return <Navigate to="/" replace />
  }

  return children
}
