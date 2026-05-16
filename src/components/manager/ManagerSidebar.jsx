import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Popcorn,
  FileBarChart2,
  LogOut,
  Building2,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getMultiplexById } from '../../data/mockMultiplexData'

const links = [
  { to: '/manager/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/manager/empleados',  label: 'Empleados',  icon: Users },
  { to: '/manager/inventario', label: 'Inventario',  icon: Popcorn },
  { to: '/manager/reportes',   label: 'Reportes',   icon: FileBarChart2 },
]

/**
 * ManagerSidebar: Barra lateral del panel de gerente.
 * Muestra el multiplex asociado como contexto permanente y
 * proporciona navegación a las secciones de gestión de la sede.
 */
export default function ManagerSidebar() {
  const navigate = useNavigate()
  const { logoutUser, user } = useApp()

  // Obtiene los datos del multiplex asignado al manager
  const multiplex = getMultiplexById(user?.multiplexId)

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <aside className="w-72 min-h-screen bg-surface/80 backdrop-blur-2xl border-r border-border/50 p-6 flex flex-col">
      
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <img
          src="/logo.png"
          alt="Cine Pacho"
          className="w-12 h-12 rounded-2xl object-contain"
        />
        <div>
          <h1 className="text-2xl font-display gradient-text">
            Cine Pacho
          </h1>
          <p className="text-xs text-text-secondary font-bold tracking-widest uppercase">
            Gerencia
          </p>
        </div>
      </div>

      {/* Contexto del Multiplex — siempre visible */}
      <div className="bg-gradient-to-br from-magenta/10 to-vinotinto/10 border border-magenta/20 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Building2 size={16} className="text-magenta" />
          <p className="text-xs text-magenta font-bold tracking-widest uppercase">
            Mi Multiplex
          </p>
        </div>
        <h2 className="text-white font-bold text-xl font-display tracking-wider">
          {multiplex?.name || 'Sin asignar'}
        </h2>
        {multiplex?.address && (
          <p className="text-xs text-text-secondary mt-1 truncate">
            {multiplex.address}
          </p>
        )}
      </div>

      {/* Usuario */}
      <div className="bg-carbon border border-border/50 rounded-2xl p-4 mb-8">
        <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">
          Gerente
        </p>
        <h2 className="text-white font-bold text-lg">
          {user?.name || 'Manager'}
        </h2>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-2 flex-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-magenta to-vinotinto text-white shadow-lg shadow-magenta/20'
                  : 'text-text-secondary hover:bg-surface-light hover:text-white'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-8 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all duration-300 rounded-2xl py-3 font-bold cursor-pointer"
      >
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </aside>
  )
}
