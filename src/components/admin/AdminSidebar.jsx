import React from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  Popcorn,
  FileBarChart2,
  LogOut,
  ArrowLeft
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const globalLinks = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/admin/empleados',
    label: 'Empleados',
    icon: Users,
  },
  {
    to: '/admin/multiplex',
    label: 'Multiplex',
    icon: Building2,
  },
  {
    to: '/admin/inventario',
    label: 'Inventario',
    icon: Popcorn,
  },
  {
    to: '/admin/reportes',
    label: 'Reportes',
    icon: FileBarChart2,
  },
]

export default function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logoutUser, user } = useApp()

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  // Detect if we are in a multiplex drill-down view
  const match = location.pathname.match(/^\/admin\/multiplex\/([^/]+)\/(.*)$/)
  const isDrillDown = !!match
  const activeMultiplexId = match ? match[1] : null

  const getLinks = () => {
    if (isDrillDown && activeMultiplexId) {
      return [
        { to: `/admin/multiplex/${activeMultiplexId}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
        { to: `/admin/multiplex/${activeMultiplexId}/empleados`, label: 'Empleados', icon: Users },
        { to: `/admin/multiplex/${activeMultiplexId}/inventario`, label: 'Inventario', icon: Popcorn },
        { to: `/admin/multiplex/${activeMultiplexId}/reportes`, label: 'Reportes', icon: FileBarChart2 },
      ]
    }
    return globalLinks
  }

  const linksToRender = getLinks()

  return (
    <aside className="w-[280px] max-w-[85vw] h-screen bg-surface/80 backdrop-blur-2xl border-r border-border/50 p-6 flex flex-col">
      
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
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
            Panel Admin
          </p>
        </div>
      </div>

      {/* Usuario */}
      <div className="bg-carbon border border-border/50 rounded-2xl p-4 mb-8">
        <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">
          Administrador
        </p>

        <h2 className="text-white font-bold text-lg">
          {user?.name || 'Admin'}
        </h2>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-2 flex-1">
        {linksToRender.map(({ to, label, icon: Icon }) => (
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

        {isDrillDown && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <NavLink
              to="/admin/multiplex"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-magenta hover:bg-magenta/10 transition-all duration-300"
            >
              <ArrowLeft size={20} />
              <span>Volver a General</span>
            </NavLink>
          </div>
        )}
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