import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  Star,
  ShoppingBag,
  Ticket,
  Popcorn,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  User,
  ChevronDown,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const navLinks = [
  { to: '/', label: 'Cartelera', icon: Ticket },
  { to: '/snacks', label: 'Snacks', icon: Popcorn },
  { to: '/compras', label: 'Mis Compras', icon: ShoppingBag },
]

// Puntos necesarios para una entrada gratis (Efecto de Tendencia a la Meta)
const POINTS_FOR_REWARD = 100

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { basePoints, cart, setIsCartOpen, user, logoutUser } = useApp()

  // Cálculo del progreso hacia la siguiente recompensa
  const pointsProgress = Math.min((basePoints / POINTS_FOR_REWARD) * 100, 100)

  const handleLogout = () => {
    logoutUser()
    setUserMenuOpen(false)
    navigate('/')
  }

  /**
   * Genera las iniciales del nombre del usuario para el avatar.
   * Ej: "Juan Pérez" → "JP", "admin" → "AD"
   */
  const getUserInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  /**
   * Texto descriptivo del rol del usuario para el menú.
   */
  const getRoleLabel = (userType) => {
    const labels = {
      ADMIN: 'Administrador',
      MANAGER: 'Gerente',
      EMPLOYEE: 'Cajero',
      BUYER: 'Cliente',
    }
    return labels[userType] || 'Usuario'
  }

  return (
    <nav className="sticky top-0 z-50 bg-carbon/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logotipo de la Marca: Elemento ancla para retorno seguro a la página principal */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Cine Pacho"
              className="w-10 h-10 rounded-xl object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-xl font-bold gradient-text hidden sm:block">
              Cine Pacho
            </span>
          </Link>

          {/* Sistema de Navegación Principal: Enlaces dinámicos con retroalimentación visual de la ruta activa */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                  location.pathname === to
                    ? 'text-magenta bg-magenta/10'
                    : 'text-text-secondary hover:text-white hover:bg-surface-light'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* Agrupación Derecha: Elementos transaccionales (Fidelización, Carrito, Autenticación) */}
          <div className="flex items-center gap-3">
            {/* Distintivo de Fidelización con micro-barra de progreso (Efecto de Tendencia a la Meta) */}
            <div className="hidden md:flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1.5 bg-gold/10 border border-gold/30 text-gold px-3 py-1.5 rounded-full text-sm font-semibold glow-gold">
                <Star size={14} fill="currentColor" />
                <span>{basePoints} PTS</span>
              </div>
              {/* Barra de progreso sutil hacia la recompensa */}
              <div className="w-full h-0.5 bg-border/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-500"
                  style={{ width: `${pointsProgress}%` }}
                />
              </div>
            </div>

            {/* Controles Transaccionales: Botón del Carrito dinámico y sesión de usuario */}
            <div className="hidden md:flex items-center gap-4 border-l border-border/50 pl-4 ml-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-magenta text-white text-[10px] font-bold rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* ── Estado de sesión: Muestra usuario logueado o botones de auth ── */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    {/* Avatar con iniciales */}
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-magenta to-vinotinto flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-magenta/20 group-hover:shadow-magenta/40 transition-shadow">
                      {getUserInitials(user.name)}
                    </div>

                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-bold text-white leading-tight">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">
                        {getRoleLabel(user.userType)}
                      </p>
                    </div>

                    <ChevronDown
                      size={14}
                      className={`text-text-secondary transition-transform duration-200 ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown del usuario */}
                  {userMenuOpen && (
                    <>
                      {/* Overlay invisible para cerrar al clickear fuera */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />

                      <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-[scaleIn_0.15s_ease-out_forwards]">
                        {/* Info del usuario */}
                        <div className="px-4 py-3 border-b border-border/50">
                          <p className="font-bold text-white text-sm truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {getRoleLabel(user.userType)}
                          </p>
                        </div>

                        {/* Acciones según rol */}
                        <div className="p-2">
                          {/* Link a perfil — visible para todos */}
                          <Link
                            to="/perfil"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-text-secondary hover:text-white hover:bg-surface-light transition-all"
                          >
                            <User size={16} />
                            Mi perfil
                          </Link>

                          {/* Acceso discreto al panel admin */}
                          {user.userType === 'ADMIN' && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-magenta hover:bg-magenta/10 transition-all"
                            >
                              <LayoutDashboard size={16} />
                              Panel Admin
                            </Link>
                          )}

                          {/* Acceso discreto al panel gerente */}
                          {user.userType === 'MANAGER' && (
                            <Link
                              to="/manager/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-magenta hover:bg-magenta/10 transition-all"
                            >
                              <LayoutDashboard size={16} />
                              Panel Gerente
                            </Link>
                          )}

                          {/* Acceso al punto de venta para cajeros */}
                          {user.userType === 'EMPLOYEE' && (
                            <Link
                              to="/cajero"
                              onClick={() => setUserMenuOpen(false)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gold hover:bg-gold/10 transition-all"
                            >
                              <Ticket size={16} />
                              Punto de Venta
                            </Link>
                          )}
                        </div>

                        {/* Cerrar sesión */}
                        <div className="p-2 border-t border-border/50">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                          >
                            <LogOut size={16} />
                            Cerrar sesión
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* ── Sin sesión: Botones de Login y Registro ── */
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-magenta transition-colors px-3 py-2 rounded-xl hover:bg-magenta/10"
                  >
                    <LogIn size={16} />
                    Ingresar
                  </Link>
                  <Link
                    to="/registro"
                    className="flex items-center gap-1.5 text-sm bg-gradient-to-r from-magenta via-vinotinto to-gold text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-magenta/30 transition-all duration-300"
                  >
                    <UserPlus size={16} />
                    Registro
                  </Link>
                </div>
              )}
            </div>

            {/* Botón Hamburguesa: Trigger para la navegación adaptativa en dispositivos móviles */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Navegación Adaptativa (Mobile): Menú tipo acordeón desplegable que agrupa todos los enlaces */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-1 bg-carbon/95 backdrop-blur-xl border-b border-border/50">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === to
                  ? 'text-magenta bg-magenta/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}

          <div className="flex items-center gap-1.5 text-gold font-bold bg-gold/10 px-4 py-3 rounded-xl border border-gold/30">
            <Star size={16} fill="currentColor" />
            <span>{basePoints} PTS</span>
          </div>

          {/* Sección de sesión adaptativa para Mobile */}
          <div className="border-t border-border/50 my-2 pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileOpen(false)
                setIsCartOpen(true)
              }}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-surface-light border border-border rounded-xl py-2.5 hover:bg-magenta/10 transition-colors"
            >
              <ShoppingBag size={16} />
              Mi Orden ({cart.length})
            </button>

            {user ? (
              /* ── Mobile: Usuario logueado ── */
              <>
                <div className="bg-surface-light border border-border/50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-magenta to-vinotinto flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {getUserInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">
                      {getRoleLabel(user.userType)}
                    </p>
                  </div>
                </div>

                {user.userType === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 text-sm font-bold text-magenta border border-magenta/30 rounded-xl py-2.5 hover:bg-magenta/10 transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    Panel Admin
                  </Link>
                )}

                {user.userType === 'MANAGER' && (
                  <Link
                    to="/manager/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 text-sm font-bold text-magenta border border-magenta/30 rounded-xl py-2.5 hover:bg-magenta/10 transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    Panel Gerente
                  </Link>
                )}

                {user.userType === 'EMPLOYEE' && (
                  <Link
                    to="/cajero"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 text-sm font-bold text-gold border border-gold/30 rounded-xl py-2.5 hover:bg-gold/10 transition-colors"
                  >
                    <Ticket size={16} />
                    Punto de Venta
                  </Link>
                )}

                <button
                  onClick={() => {
                    setMobileOpen(false)
                    handleLogout()
                  }}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-400 border border-red-500/30 rounded-xl py-2.5 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </>
            ) : (
              /* ── Mobile: Sin sesión ── */
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-magenta border border-magenta/30 rounded-xl py-2.5 hover:bg-magenta/10 transition-colors"
                >
                  <LogIn size={16} />
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-magenta to-gold text-white rounded-xl py-2.5 font-bold"
                >
                  <UserPlus size={16} />
                  Registro
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
