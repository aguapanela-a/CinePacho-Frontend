import React from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

/**
 * PublicRoute: Guarda para rutas destinadas únicamente a clientes (BUYER) o invitados.
 * Si un empleado, gerente o admin intenta entrar a la vista pública (ej. Home o Cartelera),
 * será redirigido inmediatamente a su panel de control correspondiente.
 */
export default function PublicRoute({ children }) {
  const { user } = useApp()

  if (user) {
    if (user.userType === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (user.userType === 'MANAGER') return <Navigate to="/manager/dashboard" replace />
    if (user.userType === 'EMPLOYEE') return <Navigate to="/cajero" replace />
  }

  // Invitados y BUYER pueden ver la vista
  return children
}
