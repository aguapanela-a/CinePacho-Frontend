import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CheckCircle, Star, Popcorn, Home, Film } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function OrderConfirmation() {
  const { cart, cartTotal, pendingPoints, setCart } = useApp()
  const navigate = useNavigate()

  // Limpiar el carrito al confirmar el pedido
  useEffect(() => {
    // Pequeño delay para que la animación se vea antes de vaciar
    const t = setTimeout(() => {
      if (typeof setCart === 'function') setCart([])
    }, 800)
    return () => clearTimeout(t)
  }, [setCart])

  return (
    <div className="min-h-screen bg-carbon text-text-primary relative overflow-hidden flex items-center justify-center">
      {/* Ambient orbs */}
      <div className="orb-magenta top-0 -left-64 -translate-y-1/2" />
      <div className="orb-gold bottom-0 -right-64 translate-y-1/2" />

      <div className="relative z-10 max-w-lg w-full px-4 text-center animate-[fadeUp_0.6s_ease-out_forwards]">

        {/* Ícono de éxito animado */}
        <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-green-400/10 border border-green-500/30 flex items-center justify-center mb-8 animate-[scaleIn_0.5s_ease-out_forwards]">
          <CheckCircle size={52} className="text-green-400" />
        </div>

        <h1 className="text-4xl font-display uppercase tracking-widest text-white mb-3">
          ¡<span className="gradient-brand">Pago Exitoso!</span>
        </h1>
        <p className="text-text-secondary text-lg mb-8">
          Tu orden ha sido confirmada. ¡Disfruta la función!
        </p>

        {/* Puntos ganados */}
        {pendingPoints > 0 && (
          <div className="bg-gold/10 border border-gold/30 rounded-2xl px-6 py-4 mb-8 flex items-center justify-center gap-3">
            <Star size={20} fill="currentColor" className="text-gold" />
            <span className="text-gold font-bold text-lg">
              +{pendingPoints} Puntos Pacho ganados
            </span>
          </div>
        )}

        {/* Resumen de la orden */}
        {cart.length > 0 && (
          <div className="bg-surface/80 border border-border/50 rounded-3xl p-6 mb-8 text-left backdrop-blur-xl">
            <h2 className="font-display tracking-widest uppercase text-sm text-text-secondary mb-4">
              Detalle de tu orden
            </h2>
            <div className="space-y-3 mb-4">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-text-secondary">
                    {item.name} <span className="text-white">×{item.qty}</span>
                  </span>
                  <span className="text-gold font-bold">{item.price}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border/50 pt-3 flex justify-between">
              <span className="font-bold text-white">Total pagado</span>
              <span className="font-display text-xl text-gold">
                ${cartTotal.toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-magenta/20"
          >
            <Home size={18} /> Volver al inicio
          </Link>
          <Link
            to="/snacks"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-surface transition-all"
          >
            <Popcorn size={18} /> Más snacks
          </Link>
        </div>
      </div>
    </div>
  )
}
