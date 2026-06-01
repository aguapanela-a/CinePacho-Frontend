import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Star, Popcorn, Home, Ticket } from 'lucide-react'
import { useApp } from '../context/useApp'
import { useLanguage } from '../context/useLanguage'
import { loadOrderSnapshot, clearOrderSnapshot } from '../utils/orderSnapshot'
import { formatCurrency } from '../utils/formatCurrency'

export default function OrderConfirmation() {
  const { setCart, setBasePoints, pendingPoints: livePoints } = useApp()
  const { t } = useLanguage()
  const [snapshot] = useState(() => loadOrderSnapshot())

  const cart = snapshot?.cart ?? []
  const cartTotal = snapshot?.cartTotal ?? 0
  const pendingPoints = snapshot?.pendingPoints ?? livePoints
  const buyerEmail = snapshot?.buyerEmail
  const shippingInfo = snapshot?.shippingInfo

  useEffect(() => {
    if (pendingPoints > 0) {
      const prev = Number(localStorage.getItem('cinepacho_points')) || 0
      const next = prev + pendingPoints
      localStorage.setItem('cinepacho_points', String(next))
      setBasePoints(next)
    }
    const timer = setTimeout(() => {
      setCart([])
      clearOrderSnapshot()
    }, 800)
    return () => clearTimeout(timer)
  }, [setCart, setBasePoints, pendingPoints])

  return (
    <div className="min-h-screen bg-carbon text-text-primary relative overflow-hidden flex items-center justify-center">
      <div className="orb-magenta top-0 -left-64 -translate-y-1/2" />
      <div className="orb-gold bottom-0 -right-64 translate-y-1/2" />

      <div className="relative z-10 max-w-lg w-full px-4 text-center animate-[fadeUp_0.6s_ease-out_forwards]">
        <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-green-400/10 border border-green-500/30 flex items-center justify-center mb-8 animate-[scaleIn_0.5s_ease-out_forwards]">
          <CheckCircle size={52} className="text-green-400" />
        </div>

        <h1 className="text-4xl font-display uppercase tracking-widest text-white mb-3">
          {t('confirmation.title')}
        </h1>
        <p className="text-text-secondary text-lg mb-8">{t('confirmation.subtitle')}</p>

        {pendingPoints > 0 && (
          <div className="bg-gold/10 border border-gold/30 rounded-2xl px-6 py-4 mb-8 flex items-center justify-center gap-3">
            <Star size={20} fill="currentColor" className="text-gold" />
            <span className="text-gold font-bold text-lg">
              {t('confirmation.pointsEarned', { points: pendingPoints })}
            </span>
          </div>
        )}

        {cart.length > 0 && (
          <>
            {/* Datos del comprador, si existen */}
            {(buyerEmail || shippingInfo?.address) && (
              <div className="bg-surface/80 border border-border/50 rounded-3xl p-6 mb-6 text-left backdrop-blur-xl">
                <h2 className="font-display tracking-widest uppercase text-sm text-text-secondary mb-4">
                  {t('confirmation.customerData') || 'Datos de la compra'}
                </h2>
                {buyerEmail && (
                  <p className="text-sm text-text-secondary mb-2">
                    <span className="font-bold text-white">{t('confirmation.buyerEmail') || 'Correo del comprador'}:</span> {buyerEmail}
                  </p>
                )}
                {shippingInfo?.address && (
                  <>
                    <p className="text-sm text-text-secondary">{shippingInfo.address}</p>
                    <p className="text-sm text-text-secondary">{shippingInfo.city} • {shippingInfo.postalCode}</p>
                    <p className="text-sm text-text-secondary">{shippingInfo.phone}</p>
                  </>
                )}
              </div>
            )}

            {/* Detalles de la Orden */}
            <div className="bg-surface/80 border border-border/50 rounded-3xl p-6 mb-8 text-left backdrop-blur-xl">
              <h2 className="font-display tracking-widest uppercase text-sm text-text-secondary mb-4">
                {t('confirmation.orderDetails')}
              </h2>
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.type}-${item.showtime || ''}`} className="flex justify-between items-center text-sm border-b border-border/30 pb-2 last:border-0">
                    <div>
                      <span className="text-text-secondary">{item.name}</span>
                      {item.type === 'ticket' && (
                        <p className="text-xs text-gold mt-1">{item.showtime}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-white block font-bold">×{item.qty}</span>
                      <span className="text-gold text-sm">{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/50 pt-3 flex justify-between">
                <span className="font-bold text-white">{t('confirmation.totalPaid')}</span>
                <span className="font-display text-xl text-gold">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            {/* Instrucciones QR para Entradas */}
            {cart.some(item => item.type === 'ticket') && (
              <div className="bg-magenta/10 border border-magenta/30 rounded-3xl p-6 mb-8 backdrop-blur-xl">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-magenta/20 rounded-lg">
                    <Ticket size={20} className="text-magenta" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{t('confirmation.ticketInstructions')}</h3>
                    <p className="text-sm text-text-secondary">{t('confirmation.qrInstructions')}</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-text-secondary ml-4 list-decimal">
                  <li>{t('confirmation.step1Qr')}</li>
                  <li>{t('confirmation.step2Qr')}</li>
                  <li>{t('confirmation.step3Qr')}</li>
                  <li>{t('confirmation.step4Qr')}</li>
                </ul>
              </div>
            )}

            {/* Instrucciones de Envío para Snacks */}
            {cart.some(item => item.type === 'snack') && (
              <div className="bg-gold/10 border border-gold/30 rounded-3xl p-6 mb-8 backdrop-blur-xl">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-gold/20 rounded-lg">
                    <Popcorn size={20} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{t('confirmation.snackDelivery')}</h3>
                    <p className="text-sm text-text-secondary">{t('confirmation.deliveryInfo')}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-magenta/20"
          >
            <Home size={18} /> {t('confirmation.backToHome')}
          </Link>
          <Link
            to="/snacks"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-surface transition-all"
          >
            <Popcorn size={18} /> {t('confirmation.moreSnacks')}
          </Link>
        </div>
      </div>
    </div>
  )
}

