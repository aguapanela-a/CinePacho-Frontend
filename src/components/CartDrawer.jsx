import React, { useEffect, useCallback } from 'react'
import { X, Trash2, ShoppingBag, Star } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from './Button'

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, cartTotal, pendingPoints } = useApp()

  // Cierre con tecla Escape — Ley de Jakob: los usuarios esperan poder cerrar paneles con Esc
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') setIsCartOpen(false)
  }, [setIsCartOpen])

  useEffect(() => {
    if (isCartOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isCartOpen, handleEscape])

  if (!isCartOpen) return null

  // Convierte un valor numérico a moneda local (Pesos Colombianos)
  const formatPrice = (price) => {
    return '$' + price.toLocaleString('es-CO')
  }

  return (
    <>
      {/* Capa de fondo oscuro: Cierra el carrito al hacer clic fuera del área del Drawer */}
      <div
        className="fixed inset-0 bg-carbon/60 backdrop-blur-sm z-[60] animate-[fadeIn_0.3s_ease-out]"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Contenedor principal del menú lateral con animación slide-in */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-surface border-l border-border/50 z-[70] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-[slideInRight_0.4s_ease-out]">

        {/* Cabecera del carrito: Contiene el título, contador de items y la acción rápida de cerrar */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-carbon/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-magenta/10 rounded-xl text-magenta">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-xl font-display tracking-widest text-white">Mi Orden</h2>
              {cart.length > 0 && (
                <p className="text-xs text-text-secondary">
                  {cart.reduce((acc, item) => acc + item.qty, 0)} artículo{cart.reduce((acc, item) => acc + item.qty, 0) !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-surface-light rounded-full text-text-secondary hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenedor con scroll interno para la lista de productos (Tickets y Snacks) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary opacity-70">
              <ShoppingBag size={48} className="mb-4 text-border" />
              <p className="font-medium tracking-wide">Tu orden está vacía</p>
              <p className="text-sm mt-1">¡Agrega boletas o snacks para continuar!</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={`${item.id}-${item.type}-${item.showtime || 'snack'}-${index}`}
                className="bg-carbon border border-border/50 rounded-2xl p-4 flex gap-4 animate-[fadeUp_0.4s_ease-out_forwards]"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/5">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{item.name}</h4>
                      {item.type === 'ticket' && (
                        <p className="text-xs text-text-secondary mt-0.5">
                          {item.showtime} • {item.format}
                        </p>
                      )}
                      {item.type === 'snack' && (
                        <p className="text-xs text-text-secondary mt-0.5">Snack</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.type, item.showtime)}
                      className="text-text-secondary hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-text-secondary text-xs font-bold bg-surface-light px-2 py-0.5 rounded-lg">x{item.qty}</span>
                    <span className="text-gold font-bold font-display tracking-wide">{item.price}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Panel inferior (Footer) con detalles de liquidación y proyecciones de fidelización */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-border/50 bg-carbon">
            {/* Indicador de impacto en fidelización: Muestra cuántos puntos Pacho proyecta el usuario */}
            <div className="flex items-center justify-between px-4 py-3 bg-gold/10 border border-gold/30 rounded-xl mb-4">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-gold" fill="currentColor" />
                <span className="text-sm font-bold text-white uppercase tracking-wide">Sumarás</span>
              </div>
              <span className="text-gold font-display text-xl tracking-widest">+{pendingPoints} PTS</span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-text-secondary font-bold tracking-wide">Subtotal</span>
              <span className="text-3xl font-display text-white tracking-widest">{formatPrice(cartTotal)}</span>
            </div>

            <Button variant="primary" className="w-full shadow-[0_0_20px_rgba(200,22,122,0.3)]">
              Ir a Pagar
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
