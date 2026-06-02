import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { useApp } from '../context/useApp'
import { useLanguage } from '../context/useLanguage'

import { createCheckoutSession } from '../services/paymentService'
import { saveOrderSnapshot } from '../utils/orderSnapshot'

/**
 * Función auxiliar para mapear el carrito al formato requerido por el backend.
 * Extrae screeningId del primer ticket, y los seatIds y snacks reales.
 */
function mapCartToPaymentData(cart, defaultMultiplexId = null) {
  const seats = []
  const snacksMap = new Map()
  let screeningId = null

  cart.forEach((item) => {
    if (item.type === 'ticket') {
      // Usar el screeningId real del backend almacenado en el item
      if (!screeningId && item.screeningId) {
        screeningId = item.screeningId
      }
      // Usar los seatIds reales (UUIDs del backend) si existen
      if (Array.isArray(item.seatIds) && item.seatIds.length > 0) {
        item.seatIds.forEach((seatId) => seats.push({ seatId }))
      }
    } else if (item.type === 'snack') {
      const snackMultiplexId = item.multiplexId || defaultMultiplexId
      if (snacksMap.has(item.id)) {
        const existing = snacksMap.get(item.id)
        existing.quantity += item.qty
      } else {
        snacksMap.set(item.id, {
          snackId: item.id,
          quantity: item.qty,
          ...(snackMultiplexId ? { multiplexId: snackMultiplexId } : {}),
        })
      }
    }
  })

  return {
    screeningId,
    seats,
    snacks: Array.from(snacksMap.values()),
  }
}

/**
 * Checkout — Página principal de pago.
 *
 * Usa la ruta backend real /api/checkout/stripe para crear la sesión de Stripe.
 */
export default function Checkout() {
  const { cart, cartTotal, pendingPoints, user } = useApp()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const isEmployeeOrManager = user?.userType === 'EMPLOYEE' || user?.userType === 'MANAGER'

  const [buyerEmail, setBuyerEmail] = useState('')

  const [isProcessing, setIsProcessing] = useState(false)
  const [intentError, setIntentError] = useState(null)

  const handlePay = async () => {
    if (cart.length === 0) return
    setIsProcessing(true)
    setIntentError(null)

    try {
      const defaultMultiplexId = user?.multiplexId || import.meta.env.VITE_DEFAULT_MULTIPLEX_ID
      const paymentData = mapCartToPaymentData(cart, defaultMultiplexId)
      const buyerEmailToSend = isEmployeeOrManager ? buyerEmail.trim() : null

      if (!paymentData.screeningId) {
        setIntentError('No se encontró la función de la compra. Por favor revisa el carrito.')
        setIsProcessing(false)
        return
      }

      const ticketQuantity = cart
        .filter(item => item.type === 'ticket')
        .reduce((count, item) => count + (item.qty || 0), 0)
      if (ticketQuantity > 0 && paymentData.seats.length !== ticketQuantity) {
        setIntentError('Debes seleccionar asientos para todas las boletas antes de pagar.')
        setIsProcessing(false)
        return
      }

      if (isEmployeeOrManager && !buyerEmailToSend) {
        setIntentError('Debe ingresar el correo del comprador final antes de cobrar.')
        setIsProcessing(false)
        return
      }

      const result = await createCheckoutSession(
        paymentData.screeningId,
        paymentData.seats,
        paymentData.snacks,
        buyerEmailToSend
      )

      const checkoutPayload = {
        ...paymentData,
        ...(buyerEmailToSend ? { buyerEmail: buyerEmailToSend } : {}),
      }

      if (result.sessionUrl) {
        localStorage.setItem('cinepacho_checkout_payload', JSON.stringify(checkoutPayload))
        if (result.paymentId) {
          localStorage.setItem('cinepacho_payment_id', result.paymentId)
        }
        saveOrderSnapshot({ cart, cartTotal, pendingPoints, buyerEmail: buyerEmailToSend })
        window.location.href = result.sessionUrl // Redirige al Hosted Checkout de Stripe
      } else {
        setIntentError('Error: No se recibió la URL de Stripe')
        setIsProcessing(false)
      }
    } catch (err) {
      setIntentError(err.message)
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-carbon text-text-primary relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb-magenta top-0 -left-64 -translate-y-1/2" />
      <div className="orb-gold bottom-0 -right-64 translate-y-1/2" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft size={16} /> {t('common.back')}
        </button>

        <h1 className="text-4xl font-display uppercase tracking-widest text-white mb-2">
          <span className="gradient-brand">{t('checkout.title')}</span>
        </h1>
        <p className="text-text-secondary mb-10">{t('checkout.subtitle')}</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Resumen del carrito ─────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-surface/80 border border-border/50 rounded-3xl p-6 backdrop-blur-xl sticky top-8">
              <h2 className="font-display text-xl tracking-widest uppercase text-white mb-6">
                {t('checkout.yourOrder')}
              </h2>

              {cart.length === 0 ? (
                <p className="text-text-secondary text-sm">{t('cart.empty')}</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-border/30 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{item.name}</p>
                        {item.showtime && (
                          <p className="text-text-secondary text-xs truncate">{item.showtime}</p>
                        )}
                        <p className="text-text-secondary text-xs">x{item.qty}</p>
                      </div>
                      <span className="text-gold font-bold text-sm whitespace-nowrap">{item.price}</span>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                    <span className="font-bold text-white">{t('checkout.total')}</span>
                    <span className="text-2xl font-display text-gold">
                      ${cartTotal.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Panel de pago ───────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-surface/80 border border-border/50 rounded-3xl p-8 backdrop-blur-xl">
              <h2 className="font-display text-xl tracking-widest uppercase text-white mb-6">
                {t('checkout.paymentMethod')}
              </h2>

              {/* Estado: error al crear Checkout Session */}
              {intentError && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 mb-4">
                  <AlertCircle size={18} /> {intentError}
                </div>
              )}

              {isEmployeeOrManager && (
                <div className="mb-6">
                  <label className="text-sm font-bold text-text-secondary block mb-2">
                    {t('checkout.buyerEmailLabel') || 'Correo del comprador final'}
                  </label>
                  <input
                    type="email"
                    name="buyerEmail"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="cliente@correo.com"
                    className="w-full bg-carbon border-2 rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary/50 outline-none transition-all border-border/80 focus:border-magenta"
                  />
                  <p className="text-xs text-text-secondary mt-2">
                    {t('checkout.buyerEmailHelp') || 'Este correo es obligatorio para cobros realizados por cajeros o empleados.'}
                  </p>
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={isProcessing || cart.length === 0}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-magenta/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <><Loader2 size={20} className="animate-spin" /> {t('common.processing')}</>
                ) : (
                  <><ShieldCheck size={20} /> {t('checkout.pay')} ${cartTotal.toLocaleString('es-CO')}</>
                )}
              </button>
              <p className="text-center text-xs text-text-secondary flex items-center justify-center gap-1.5 mt-4">
                <ShieldCheck size={13} className="text-green-400" />
                {t('checkout.securePayment')} (Stripe Checkout)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


