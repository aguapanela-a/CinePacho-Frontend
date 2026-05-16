import React, { useState } from 'react'
import {
  Search, ShoppingCart, Popcorn, Ticket, UserCheck, X, LogOut, CheckCircle, Film, Clock
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { moviesData, showtimes, ticketFormats } from '../../data/mockMoviesData'
import { snacksData } from '../../data/mockSnacksData'

// Mock Clientes
const mockCustomers = [
  { id: 1, name: 'Juan Pérez', email: 'cliente@correo.com', cc: '12345678', points: 150 },
  { id: 2, name: 'María Gómez', email: 'maria@correo.com', cc: '87654321', points: 40 },
]

export default function CashierDashboard() {
  const { user, logoutUser } = useApp()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('tickets') // 'tickets' | 'snacks'
  
  // Cart & Customer
  const [cart, setCart] = useState([])
  const [searchCustomer, setSearchCustomer] = useState('')
  const [activeCustomer, setActiveCustomer] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [wantsPoints, setWantsPoints] = useState(false)
  
  // Ticket Selection Modal
  const [selectedMovie, setSelectedMovie] = useState(null)
  
  // Puntos fijos por compra
  const POINTS_PER_PURCHASE = 10

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id)
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c))
    } else {
      setCart([...cart, { ...item, qty: 1 }])
    }
  }

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie)
  }

  const handleAddTicket = (time, type, price) => {
    const ticketId = `${selectedMovie.id}-${time}-${type}`
    addToCart({
      id: ticketId,
      name: `Boleta ${type} - ${selectedMovie.title} (${time})`,
      price: price,
      type: 'ticket'
    })
    setSelectedMovie(null) // Cerrar modal
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.id !== itemId))
  }

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)

  const handleSearchCustomer = () => {
    const found = mockCustomers.find(c => 
      c.cc === searchCustomer || c.email.toLowerCase() === searchCustomer.toLowerCase()
    )
    if (found) {
      setActiveCustomer(found)
      setSearchCustomer('')
    } else {
      alert('Cliente no encontrado')
    }
  }

  const handleCheckout = () => {
    if (cart.length === 0) return
    setShowSuccess(true)
  }

  const resetPOS = () => {
    setCart([])
    setActiveCustomer(null)
    setWantsPoints(false)
    setShowSuccess(false)
  }

  return (
    <div className="min-h-screen bg-carbon text-white flex flex-col h-screen overflow-hidden">
      {/* ── Navbar del Cajero ── */}
      <header className="h-16 bg-surface border-b border-border/50 flex items-center justify-between px-6 shrink-0 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
            <Ticket size={20} className="text-carbon" />
          </div>
          <div>
            <h1 className="font-display tracking-widest text-lg uppercase text-white leading-none">
              Punto de Venta
            </h1>
            <p className="text-[10px] font-bold tracking-widest text-gold uppercase mt-1">Cine Pacho POS</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold leading-none">{user?.name || 'Cajero'}</p>
            <p className="text-xs text-text-secondary mt-1">Sede: Titán</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-bold transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Catálogo (Izquierda) */}
        <div className="flex-1 overflow-hidden flex flex-col bg-carbon/50">
          
          {/* Tabs */}
          <div className="flex p-6 pb-0 gap-4">
            <button 
              onClick={() => setActiveTab('tickets')}
              className={`flex-1 py-4 rounded-t-2xl font-display tracking-widest uppercase transition-colors flex justify-center items-center gap-2 cursor-pointer ${
                activeTab === 'tickets' ? 'bg-surface border-t border-x border-border/50 text-magenta' : 'bg-transparent text-text-secondary border-b border-border/50 hover:text-white'
              }`}
            >
              <Film size={20} /> Películas
            </button>
            <button 
              onClick={() => setActiveTab('snacks')}
              className={`flex-1 py-4 rounded-t-2xl font-display tracking-widest uppercase transition-colors flex justify-center items-center gap-2 cursor-pointer ${
                activeTab === 'snacks' ? 'bg-surface border-t border-x border-border/50 text-gold' : 'bg-transparent text-text-secondary border-b border-border/50 hover:text-white'
              }`}
            >
              <Popcorn size={20} /> Snacks
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-surface border-t-0 border-border/50">
            {activeTab === 'tickets' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {moviesData.map(movie => (
                  <button
                    key={movie.id}
                    onClick={() => handleSelectMovie(movie)}
                    className="bg-carbon border border-border/50 rounded-2xl overflow-hidden hover:border-magenta/50 hover:shadow-[0_0_15px_rgba(200,22,122,0.3)] transition-all group cursor-pointer text-left flex flex-col"
                  >
                    <div className="aspect-[2/3] overflow-hidden w-full relative">
                      <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-transparent" />
                    </div>
                    <div className="p-4 pt-2">
                      <span className="font-bold text-sm text-white line-clamp-1 group-hover:text-magenta transition-colors">{movie.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'snacks' && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {snacksData.map(snack => (
                  <button
                    key={snack.id}
                    onClick={() => addToCart({ ...snack, type: 'snack' })}
                    className="bg-carbon border border-border/50 rounded-2xl p-5 text-left hover:border-gold/50 hover:bg-gold/5 transition-all group flex flex-col h-32 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Popcorn size={18} className="text-gold" />
                    </div>
                    <span className="font-bold text-sm text-text-primary line-clamp-1">{snack.name}</span>
                    <span className="text-gold font-bold mt-auto">${snack.price.toLocaleString('es-CO')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral derecho (Cliente y Carrito) */}
        <div className="w-96 bg-surface border-l border-border/50 flex flex-col shrink-0">
          {/* Módulo de Cliente */}
          <div className="p-5 border-b border-border/50">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Cliente (Fidelización)</h3>
            
            {activeCustomer ? (
              <div className="bg-carbon border border-green-500/30 rounded-xl p-4 relative">
                <button 
                  onClick={() => setActiveCustomer(null)}
                  className="absolute top-2 right-2 text-text-secondary hover:text-red-400 cursor-pointer"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{activeCustomer.name}</p>
                    <p className="text-xs text-text-secondary">Puntos: <span className="text-gold font-bold">{activeCustomer.points}</span></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="CC o Email..."
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchCustomer()}
                    className="w-full bg-carbon border border-border/50 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-gold transition-colors"
                  />
                </div>
                <button 
                  onClick={handleSearchCustomer}
                  className="bg-gold/10 text-gold hover:bg-gold/20 px-3 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                >
                  Buscar
                </button>
              </div>
            )}
          </div>

          {/* Carrito de Compras POS */}
          <div className="flex-1 overflow-y-auto p-5">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Orden Actual</h3>
            
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-text-secondary">
                <ShoppingCart size={32} className="mb-3 opacity-20" />
                <p className="text-sm">No hay productos en la orden</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="bg-carbon rounded-xl p-3 flex items-center justify-between group">
                    <div className="flex-1 pr-3 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">${item.price.toLocaleString('es-CO')} x {item.qty}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-sm font-bold text-gold">${(item.price * item.qty).toLocaleString('es-CO')}</p>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-text-secondary hover:text-red-400 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Footer */}
          <div className="p-5 border-t border-border/50 bg-carbon/50 mt-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary font-bold uppercase tracking-widest text-sm">Total a pagar</span>
              <span className="text-3xl font-display text-white">${total.toLocaleString('es-CO')}</span>
            </div>
            
            {activeCustomer && cart.length > 0 && (
              <div className="mb-4 bg-gold/10 border border-gold/30 rounded-xl p-4">
                
                <p className="text-xs font-bold text-gold uppercase tracking-widest mb-3">
                  ¿Desea acumular puntos?
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setWantsPoints(true)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      wantsPoints
                        ? 'bg-gold text-carbon'
                        : 'bg-carbon border border-border/50 text-text-secondary hover:text-white'
                    }`}
                  >
                    Sí
                  </button>

                  <button
                    onClick={() => setWantsPoints(false)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      !wantsPoints
                        ? 'bg-red-500 text-white'
                        : 'bg-carbon border border-border/50 text-text-secondary hover:text-white'
                    }`}
                  >
                    No
                  </button>
                </div>

                {wantsPoints && (
                  <p className="text-xs text-gold font-bold mt-3 text-center">
                    🌟 El cliente ganará{' '}
                    <span className="text-white">
                      {POINTS_PER_PURCHASE} puntos
                    </span>
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all shadow-lg ${
                cart.length > 0 
                  ? 'bg-gradient-to-r from-gold to-yellow-600 text-carbon shadow-gold/20 hover:opacity-90 cursor-pointer'
                  : 'bg-border/50 text-text-secondary cursor-not-allowed'
              }`}
            >
              Cobrar e Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal de Selección de Función ── */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-surface border border-border/50 rounded-3xl p-6 relative animate-[scaleIn_0.2s_ease-out_forwards]">
            <button 
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white bg-carbon rounded-full p-1 cursor-pointer transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex gap-6 mb-6">
              <img src={selectedMovie.posterUrl} alt={selectedMovie.title} className="w-24 h-auto rounded-xl object-cover shadow-lg" />
              <div>
                <h2 className="text-2xl font-display text-white uppercase tracking-widest mb-1">{selectedMovie.title}</h2>
                <p className="text-magenta font-bold text-sm">Selecciona una función</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-text-secondary font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Clock size={14} /> Horarios Disponibles
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {showtimes.map(time => (
                    <div key={time} className="bg-carbon border border-border/50 rounded-xl p-3 text-center">
                      <p className="font-bold text-white mb-2">{time}</p>
                      <div className="flex flex-col gap-2">
                        {ticketFormats.map(({ fmt, price }) => (
                          <button 
                            key={`${time}-${fmt}`}
                            onClick={() => handleAddTicket(time, fmt, price)}
                            className="bg-surface hover:bg-magenta/10 border border-border/50 hover:border-magenta/50 text-xs font-bold py-1.5 rounded-lg transition-colors cursor-pointer text-text-primary hover:text-white"
                          >
                            {fmt}: ${(price/1000)}k
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Venta Exitosa ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface border border-border/50 rounded-3xl p-8 text-center animate-[scaleIn_0.2s_ease-out_forwards]">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-display text-white tracking-widest uppercase mb-2">Venta Exitosa</h2>
            <p className="text-text-secondary mb-6">Total cobrado: <strong className="text-white">${total.toLocaleString('es-CO')}</strong></p>
            
            {activeCustomer && wantsPoints && (
              <div className="bg-gold/10 border border-gold/20 rounded-xl p-4 mb-6">
                <p className="text-gold font-bold text-sm mb-1">¡Puntos Asignados!</p>
                <p className="text-white text-xs">Se sumaron {POINTS_PER_PURCHASE} pts a la cuenta de {activeCustomer.name}</p>
              </div>
            )}

            <button 
              onClick={resetPOS}
              className="w-full bg-carbon border border-border/50 hover:border-gold/50 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
            >
              Nueva Venta
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
