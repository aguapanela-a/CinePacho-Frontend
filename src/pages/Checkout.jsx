import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'

/**
 * CheckoutForm — Formulario interno que usa los hooks de Stripe.
 * Debe estar dentro de un <Elements> provider (StripeProvider).
 */
function CheckoutForm({ total, onPaymentSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [processing, setProcessing] = useState(false)
  const [payError, setPayError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setPayError(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Stripe redirige aquí tras el pago 3DS si es necesario
        return_url: `${window.location.origin}/confirmacion`,
      },
      redirect: 'if_required',
    })

    if (error) {
      setPayError(error.message)
      setProcessing(false)
    } else {
      onPaymentSuccess?.()
      navigate('/confirmacion')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />

      {payError && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={15} /> {payError}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-magenta/25 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {processing ? (
          <><Loader2 size={20} className="animate-spin" /> {t('common.processing')}</>
        ) : (
          <><ShieldCheck size={20} /> {t('checkout.pay')} ${total.toLocaleString('es-CO')}</>
        )}
      </button>

      <p className="text-center text-xs text-text-secondary flex items-center justify-center gap-1.5">
        <ShieldCheck size={13} className="text-green-400" />
        {t('checkout.securePayment')}
      </p>
    </form>
  )
}

// ──────────────────────────────────────────────────────────────────────────────

import StripeProvider from '../components/StripeProvider'
import { createPaymentIntent } from '../services/paymentService'
import { saveOrderSnapshot } from '../components/CheckoutGuard'

/**
 * Checkout — Página principal de pago.
 *
 * MODO SIN BACKEND (mientras el endpoint /api/payments/create-intent no exista):
 * Muestra la UI completa del carrito y el formulario de Stripe en estado
 * "pendiente de conexión al backend" con un aviso claro.
 */
export default function Checkout() {
  const { cart, cartTotal, pendingPoints } = useApp()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  })
  const [shippingErrors, setShippingErrors] = useState({})

  const handlePaymentSuccess = () => {
    saveOrderSnapshot({ cart, cartTotal, pendingPoints, shippingInfo })
  }

  const [clientSecret, setClientSecret] = useState(null)
  const [loadingIntent, setLoadingIntent] = useState(true)
  const [intentError, setIntentError] = useState(null)
  const backendReady = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY &&
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY !== 'pk_test_REEMPLAZA_CON_TU_CLAVE_AQUI'

  const validateShipping = () => {
    const errors = {}
    if (!shippingInfo.address.trim()) errors.address = t('checkout.addressRequired')
    if (!shippingInfo.city.trim()) errors.city = t('checkout.cityRequired')
    if (!shippingInfo.postalCode.trim()) errors.postalCode = t('checkout.postalCodeRequired')
    if (!shippingInfo.phone.trim()) errors.phone = t('checkout.phoneRequired')
    setShippingErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleShippingChange = (e) => {
    const { name, value } = e.target
    setShippingInfo(prev => ({ ...prev, [name]: value }))
    if (shippingErrors[name]) {
      setShippingErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  useEffect(() => {
    if (!backendReady) { setLoadingIntent(false); return }

    const initIntent = async () => {
      try {
        // cartTotal en pesos colombianos — Stripe maneja COP en unidades enteras
        const result = await createPaymentIntent(cartTotal)
        setClientSecret(result.clientSecret)
      } catch (err) {
        setIntentError(err.message)
      } finally {
        setLoadingIntent(false)
      }
    }
    initIntent()
  }, [cartTotal, backendReady])

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

          {/* ── Formulario de pago ──────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Dirección de Envío */}
            <div className="bg-surface/80 border border-border/50 rounded-3xl p-6 backdrop-blur-xl">
              <h2 className="font-display text-lg tracking-widest uppercase text-white mb-4">
                {t('checkout.shippingAddress')}
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-bold text-text-secondary block mb-1">
                    {t('checkout.address')}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    placeholder={t('checkout.addressPlaceholder')}
                    className={`w-full bg-carbon border-2 rounded-xl px-4 py-2 text-text-primary placeholder-text-secondary/50 outline-none transition-all ${
                      shippingErrors.address ? 'border-red-500' : 'border-border/80 focus:border-magenta'
                    }`}
                  />
                  {shippingErrors.address && <p className="text-red-500 text-xs mt-1">{shippingErrors.address}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold text-text-secondary block mb-1">
                      {t('checkout.city')}
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleShippingChange}
                      placeholder={t('checkout.cityPlaceholder')}
                      className={`w-full bg-carbon border-2 rounded-xl px-4 py-2 text-text-primary placeholder-text-secondary/50 outline-none transition-all ${
                        shippingErrors.city ? 'border-red-500' : 'border-border/80 focus:border-magenta'
                      }`}
                    />
                    {shippingErrors.city && <p className="text-red-500 text-xs mt-1">{shippingErrors.city}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-bold text-text-secondary block mb-1">
                      {t('checkout.postalCode')}
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={handleShippingChange}
                      placeholder="080001"
                      className={`w-full bg-carbon border-2 rounded-xl px-4 py-2 text-text-primary placeholder-text-secondary/50 outline-none transition-all ${
                        shippingErrors.postalCode ? 'border-red-500' : 'border-border/80 focus:border-magenta'
                      }`}
                    />
                    {shippingErrors.postalCode && <p className="text-red-500 text-xs mt-1">{shippingErrors.postalCode}</p>}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-text-secondary block mb-1">
                    {t('checkout.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleShippingChange}
                    placeholder="+57 300 0000000"
                    className={`w-full bg-carbon border-2 rounded-xl px-4 py-2 text-text-primary placeholder-text-secondary/50 outline-none transition-all ${
                      shippingErrors.phone ? 'border-red-500' : 'border-border/80 focus:border-magenta'
                    }`}
                  />
                  {shippingErrors.phone && <p className="text-red-500 text-xs mt-1">{shippingErrors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Formulario de pago */}
            <div className="bg-surface/80 border border-border/50 rounded-3xl p-8 backdrop-blur-xl">
              <h2 className="font-display text-xl tracking-widest uppercase text-white mb-6">
                {t('checkout.paymentMethod')}
              </h2>

              {/* Estado: sin API key / sin backend */}
              {!backendReady && (
                <div className="space-y-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-2xl px-5 py-4 text-sm">
                    <p className="font-bold flex items-center gap-2 mb-2">
                      <AlertCircle size={16} /> {t('checkout.stripePending')}
                    </p>

                  </div>

                  {/* Formulario de demostración visual */}
                  <div className="space-y-4 opacity-50 pointer-events-none select-none">
                    <div className="bg-carbon border border-border/50 rounded-2xl px-4 py-4">
                      <p className="text-xs text-text-secondary mb-2 uppercase tracking-widest">{t('checkout.cardNumber')}</p>
                      <p className="text-text-secondary font-mono tracking-widest">•••• •••• •••• ••••</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-carbon border border-border/50 rounded-2xl px-4 py-4">
                        <p className="text-xs text-text-secondary mb-2 uppercase tracking-widest">{t('checkout.expiry')}</p>
                        <p className="text-text-secondary font-mono">MM / AA</p>
                      </div>
                      <div className="bg-carbon border border-border/50 rounded-2xl px-4 py-4">
                        <p className="text-xs text-text-secondary mb-2 uppercase tracking-widest">{t('checkout.cvc')}</p>
                        <p className="text-text-secondary font-mono">•••</p>
                      </div>
                    </div>
                    <button disabled className="w-full py-4 rounded-2xl bg-gradient-to-r from-magenta/50 to-vinotinto/50 text-white font-bold text-lg opacity-60">
                      {t('checkout.pay')} ${cartTotal.toLocaleString('es-CO')}
                    </button>
                  </div>
                </div>
              )}

              {/* Estado: cargando PaymentIntent */}
              {backendReady && loadingIntent && (
                <div className="flex items-center justify-center py-16 gap-3 text-text-secondary">
                  <Loader2 size={24} className="animate-spin text-magenta" />
                  <span>{t('checkout.preparingSecurePayment')}</span>
                </div>
              )}

              {/* Estado: error al crear PaymentIntent */}
              {backendReady && intentError && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
                  <AlertCircle size={18} /> {intentError}
                </div>
              )}

              {/* Estado: listo para pagar */}
              {backendReady && clientSecret && (
                <StripeProvider clientSecret={clientSecret}>
                  <CheckoutForm total={cartTotal} onPaymentSuccess={handlePaymentSuccess} />
                </StripeProvider>
              )}
            </div>
            </div>
        </div>
      </div>
    </div>
  )
}
