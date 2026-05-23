import { useEffect, useCallback, useState } from 'react'
import { X, Trash2, ShoppingBag, Star, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Button from './Button'
import { useLanguage } from '../context/LanguageContext'
import { formatCurrency } from '../utils/formatCurrency'
import { useToast } from '../context/ToastContext'

const REMOVE_ANIMATION_MS = 300

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, addToCart, cartTotal, pendingPoints } = useApp()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const toast = useToast()
  const [removingItems, setRemovingItems] = useState(new Set())

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

  const getItemKey = (item, index) =>
    `${item.id}-${item.type}-${item.showtime || 'snack'}-${index}`

  const handleRemove = (item, index) => {
    const itemKey = getItemKey(item, index)
    setRemovingItems((prev) => new Set(prev).add(itemKey))
    setTimeout(() => {
      const removedItem = { ...item }
      removeFromCart(item.id, item.type, item.showtime)
      setRemovingItems((prev) => {
        const next = new Set(prev)
        next.delete(itemKey)
        return next
      })
      toast.info(t('cart.itemRemoved') || 'Elemento eliminado', {
        label: t('common.undo') || 'Deshacer',
        onClick: () => addToCart(removedItem)
      })
    }, REMOVE_ANIMATION_MS)
  }

  if (!isCartOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-carbon/60 backdrop-blur-sm z-[60] animate-[fadeIn_0.3s_ease-out]"
        onClick={() => setIsCartOpen(false)}
      />

      <div 
        role="dialog" 
        aria-modal="true" 
        aria-label="Carrito de compras"
        className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-surface border-l border-border/50 z-[70] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-[slideInRight_0.4s_ease-out]"
      >

        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-carbon/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-magenta/10 rounded-xl text-magenta">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-xl font-display tracking-widest text-white">{t('cart.myOrder')}</h2>
              {cart.length > 0 && (
                <p className="text-xs text-text-secondary">
                  {cart.reduce((acc, item) => acc + item.qty, 0)} {t('cart.items')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-surface-light rounded-full text-text-secondary hover:text-white transition-colors"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary">
              <ShoppingBag size={48} className="mb-6 text-border opacity-50" />
              <p className="font-bold text-white text-lg tracking-wide mb-2">{t('cart.empty')}</p>
              <p className="text-sm mb-8 opacity-70">{t('cart.addItems')}</p>
              <Button
                variant="primary"
                onClick={() => {
                  setIsCartOpen(false)
                  navigate('/')
                }}
                className="flex items-center gap-2"
              >
                {t('cart.continueShopping')} <ArrowRight size={16} />
              </Button>
            </div>
          ) : (
            cart.map((item, index) => {
              const itemKey = getItemKey(item, index)
              const isRemoving = removingItems.has(itemKey)
              return (
                <div
                  key={itemKey}
                  className={`bg-carbon border border-border/50 rounded-2xl p-4 flex gap-4 transition-all duration-300 ${
                    isRemoving
                      ? 'opacity-0 translate-x-4 pointer-events-none'
                      : 'animate-[fadeUp_0.4s_ease-out_forwards]'
                  }`}
                  style={isRemoving ? undefined : { animationDelay: `${index * 0.05}s` }}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/5">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
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
                          <p className="text-xs text-text-secondary mt-0.5">{t('cart.snackLabel')}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(item, index)}
                        disabled={isRemoving}
                        className="text-text-secondary hover:text-red-500 transition-colors p-1"
                        aria-label="Eliminar del carrito"
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
              )
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-border/50 bg-carbon">
            <div className="flex items-center justify-between px-4 py-3 bg-gold/10 border border-gold/30 rounded-xl mb-4">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-gold" fill="currentColor" />
                <span className="text-sm font-bold text-white uppercase tracking-wide">{t('cart.willEarn')}</span>
              </div>
              <span className="text-gold font-display text-xl tracking-widest">+{pendingPoints} {t('common.points')}</span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-text-secondary font-bold tracking-wide">{t('cart.subtotal')}</span>
              <span className="text-3xl font-display text-white tracking-widest">{formatCurrency(cartTotal)}</span>
            </div>

            <Button
              variant="primary"
              className="w-full shadow-[0_0_20px_rgba(200,22,122,0.3)]"
              onClick={() => { setIsCartOpen(false); navigate('/checkout') }}
            >
              {t('cart.checkout')}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
