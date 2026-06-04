import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  Popcorn,
  FileBarChart2,
  LogOut,
  ArrowLeft,
  Film,
  DoorOpen,
  Boxes, // Se añade Boxes para el inventario general
} from 'lucide-react'
import { useApp } from '../../context/useApp'
import { useLanguage } from '../../context/LanguageContext'

export default function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logoutUser, user } = useApp()
  const { t } = useLanguage()

  const handleLogout = () => {
    const shouldSignOut = window.confirm(t('nav.logoutConfirm') || '¿Seguro que deseas cerrar sesión?')
    if (!shouldSignOut) return
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
        { to: `/admin/multiplex/${activeMultiplexId}/dashboard`, label: t('admin.dashboard'),  icon: LayoutDashboard },
        { to: `/admin/multiplex/${activeMultiplexId}/empleados`, label: t('admin.employees'),  icon: Users },
        { to: `/admin/multiplex/${activeMultiplexId}/salas`,     label: t('admin.rooms'),      icon: DoorOpen },
        { to: `/admin/multiplex/${activeMultiplexId}/inventario`,label: t('admin.inventory'), icon: Popcorn },
        { to: `/admin/multiplex/${activeMultiplexId}/reportes`,  label: t('admin.reports'),   icon: FileBarChart2 },
      ]
    }
    return [
      { to: '/admin/dashboard', label: t('admin.dashboard'), icon: LayoutDashboard },
      { to: '/admin/empleados', label: t('admin.employees'), icon: Users },
      { to: '/admin/multiplex', label: t('admin.multiplex'), icon: Building2 },
      { to: '/admin/peliculas', label: t('admin.movies'), icon: Film },
      { to: '/admin/snacks', label: t('admin.snacks'), icon: Popcorn }, // Corregido a Boxes
      { to: '/admin/reportes', label: t('admin.reports'), icon: FileBarChart2 },
    ]
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
            {t('admin.sidebarTitle')}
          </p>
        </div>
      </div>

      {/* Usuario */}
      <div className="bg-carbon border border-border/50 rounded-2xl p-4 mb-8">
        <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">
          {t('roles.ADMIN')}
        </p>

        <h2 className="text-white font-bold text-lg">
          {user?.name || 'Admin'}
        </h2>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar">
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
              <span>{t('admin.backToGeneral')}</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="mt-8 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all duration-300 rounded-2xl py-3 font-bold cursor-pointer"
      >
        <LogOut size={18} />
        {t('admin.logout')}
      </button>
    </aside>
  )
}