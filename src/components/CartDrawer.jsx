import { useEffect, useCallback } from 'react'
import { X, Trash2, ShoppingBag, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { useLanguage } from '../context/useLanguage'
import Button from './Button'

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, cartTotal, pendingPoints } = useApp()
  const navigate = useNavigate()
  const { t } = useLanguage()

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

  // Formateador local integrado para evitar dependencias rotas
  const formatCurrency = (value) => value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-500 ${isCartOpen ? 'visible' : 'invisible'}`}>
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={() => setIsCartOpen(false)} 
      />
      
      <aside className={`absolute right-0 top-0 bottom-0 w-full sm:w-[440px] bg-surface border-l border-border/40 shadow-2xl flex flex-col transition-transform duration-500 ease-out z-10 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-border/30 flex items-center justify-between bg-carbon/50">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="text-magenta" size={20} />
            <h2 className="font-display text-xl text-white tracking-widest uppercase">{t('cart.title') || 'Tu Carrito'}</h2>
            <span className="bg-magenta/10 border border-magenta/30 text-magenta text-xs font-bold px-2.5 py-0.5 rounded-full">{cart.length}</span>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="w-9 h-9 rounded-xl border border-border/40 flex items-center justify-center text-text-secondary hover:text-white hover:bg-carbon transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center pb-12">
              <div className="w-16 h-16 rounded-2xl bg-carbon border border-border/30 flex items-center justify-center text-text-secondary/40 mb-4">
                <ShoppingBag size={28} />
              </div>
              <p className="text-white font-bold text-base mb-1">{t('cart.emptyTitle') || 'Tu carrito está vacío'}</p>
              <p className="text-text-secondary text-sm max-w-xs">{t('cart.emptyDesc') || 'Explora la cartelera y confitería para añadir tus productos favoritos.'}</p>
            </div>
          ) : (
            cart.map((item) => {
              return (
                <div key={`${item.id}-${item.type}-${item.showtime || ''}`} className="bg-carbon/50 border border-border/30 rounded-2xl p-4 flex gap-4 relative transition-all duration-300 opacity-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-white text-base truncate pr-6">{item.name}</h3>
                      <button
                        onClick={() => removeFromCart(item.id, item.type, item.showtime)}
                        className="text-text-secondary hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors absolute right-3 top-3 cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="text-xs text-text-secondary font-medium mt-0.5 uppercase tracking-wide">{item.type === 'ticket' ? t('cart.typeTicket') || 'Boleta' : t('cart.typeSnack') || 'Confitería'}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-text-secondary font-bold bg-surface-light px-2 py-1 rounded-md border border-border/40">Cant: {item.qty}</span>
                      <span className="text-white font-bold font-display tracking-wide">{formatCurrency(item.unitPrice * item.qty)}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-border/50 bg-carbon">
            <div className="flex items-center justify-between px-4 py-3 bg-gold/10 border border-gold/30 rounded-xl mb-4">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-gold" fill="currentColor" />
                <span className="text-sm font-bold text-white uppercase tracking-wide">{t('cart.willEarn') || 'Ganarás'}</span>
              </div>
              <span className="text-gold font-display text-xl tracking-widest">+{pendingPoints} {t('common.points') || 'Pts'}</span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-text-secondary font-bold tracking-wide">{t('cart.subtotal') || 'Subtotal'}</span>
              <span className="text-3xl font-display text-white tracking-widest">{formatCurrency(cartTotal)}</span>
            </div>

            <Button
              variant="primary"
              className="w-full shadow-[0_0_20px_rgba(200,22,122,0.3)]"
              onClick={() => { setIsCartOpen(false); navigate('/checkout') }}
            >
              {t('Proceder al Pago') || 'Proceder al Pago'}
            </Button>
          </div>
        )}
      </aside>
    </div>
  )
}
