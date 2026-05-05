import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Star, ShoppingBag, Ticket, Popcorn, LogIn, UserPlus } from 'lucide-react'
import { useApp } from '../context/AppContext'

const navLinks = [
  { to: '/', label: 'Cartelera', icon: Ticket },
  { to: '/snacks', label: 'Snacks', icon: Popcorn },
  { to: '/compras', label: 'Mis Compras', icon: ShoppingBag },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { basePoints, cart, setIsCartOpen } = useApp()

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
            {/* Distintivo de Fidelización: Muestra el saldo de puntos "Pacho" del estado global */}
            <div className="hidden md:flex items-center gap-1.5 bg-gold/10 border border-gold/30 text-gold px-3 py-1.5 rounded-full text-sm font-semibold glow-gold">
              <Star size={14} fill="currentColor" />
              <span>{basePoints} PTS</span>
            </div>

            {/* Controles Transaccionales: Botón del Carrito dinámico y Enlaces de Sesión */}
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
          mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
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
                  ? 'text-neon-pink bg-neon-pink/10'
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

          {/* Enlaces de Autenticación Adaptativos para Mobile */}
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
          </div>
        </div>
      </div>
    </nav>
  )
}
