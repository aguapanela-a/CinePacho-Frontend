import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'

/**
 * CheckoutForm — Formulario interno que usa los hooks de Stripe.
 * Debe estar dentro de un <Elements> provider (StripeProvider).
 */
function CheckoutForm({ total }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
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
      // Pago exitoso sin redirección externa
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
          <><Loader2 size={20} className="animate-spin" /> Procesando...</>
        ) : (
          <><ShieldCheck size={20} /> Pagar ${total.toLocaleString('es-CO')}</>
        )}
      </button>

      <p className="text-center text-xs text-text-secondary flex items-center justify-center gap-1.5">
        <ShieldCheck size={13} className="text-green-400" />
        Pago seguro con cifrado SSL · Powered by Stripe
      </p>
    </form>
  )
}

// ──────────────────────────────────────────────────────────────────────────────

import StripeProvider from '../components/StripeProvider'
import { createPaymentIntent } from '../services/paymentService'

/**
 * Checkout — Página principal de pago.
 *
 * MODO SIN BACKEND (mientras el endpoint /api/payments/create-intent no exista):
 * Muestra la UI completa del carrito y el formulario de Stripe en estado
 * "pendiente de conexión al backend" con un aviso claro.
 */
export default function Checkout() {
  const { cart, cartTotal } = useApp()
  const navigate = useNavigate()

  const [clientSecret, setClientSecret] = useState(null)
  const [loadingIntent, setLoadingIntent] = useState(true)
  const [intentError, setIntentError] = useState(null)
  const backendReady = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY &&
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY !== 'pk_test_REEMPLAZA_CON_TU_CLAVE_AQUI'

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
          <ArrowLeft size={16} /> Volver
        </button>

        <h1 className="text-4xl font-display uppercase tracking-widest text-white mb-2">
          <span className="gradient-brand">Checkout</span>
        </h1>
        <p className="text-text-secondary mb-10">Revisa tu orden y completa el pago</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Resumen del carrito ─────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-surface/80 border border-border/50 rounded-3xl p-6 backdrop-blur-xl sticky top-8">
              <h2 className="font-display text-xl tracking-widest uppercase text-white mb-6">
                Tu Orden
              </h2>

              {cart.length === 0 ? (
                <p className="text-text-secondary text-sm">El carrito está vacío.</p>
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
                    <span className="font-bold text-white">Total</span>
                    <span className="text-2xl font-display text-gold">
                      ${cartTotal.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Formulario de pago ──────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-surface/80 border border-border/50 rounded-3xl p-8 backdrop-blur-xl">
              <h2 className="font-display text-xl tracking-widest uppercase text-white mb-6">
                Método de Pago
              </h2>

              {/* Estado: sin API key / sin backend */}
              {!backendReady && (
                <div className="space-y-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-2xl px-5 py-4 text-sm">
                    <p className="font-bold flex items-center gap-2 mb-2">
                      <AlertCircle size={16} /> Integración Stripe pendiente
                    </p>

                  </div>

                  {/* Formulario de demostración visual */}
                  <div className="space-y-4 opacity-50 pointer-events-none select-none">
                    <div className="bg-carbon border border-border/50 rounded-2xl px-4 py-4">
                      <p className="text-xs text-text-secondary mb-2 uppercase tracking-widest">Número de tarjeta</p>
                      <p className="text-text-secondary font-mono tracking-widest">•••• •••• •••• ••••</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-carbon border border-border/50 rounded-2xl px-4 py-4">
                        <p className="text-xs text-text-secondary mb-2 uppercase tracking-widest">Vencimiento</p>
                        <p className="text-text-secondary font-mono">MM / AA</p>
                      </div>
                      <div className="bg-carbon border border-border/50 rounded-2xl px-4 py-4">
                        <p className="text-xs text-text-secondary mb-2 uppercase tracking-widest">CVC</p>
                        <p className="text-text-secondary font-mono">•••</p>
                      </div>
                    </div>
                    <button disabled className="w-full py-4 rounded-2xl bg-gradient-to-r from-magenta/50 to-vinotinto/50 text-white font-bold text-lg opacity-60">
                      Pagar ${cartTotal.toLocaleString('es-CO')}
                    </button>
                  </div>
                </div>
              )}

              {/* Estado: cargando PaymentIntent */}
              {backendReady && loadingIntent && (
                <div className="flex items-center justify-center py-16 gap-3 text-text-secondary">
                  <Loader2 size={24} className="animate-spin text-magenta" />
                  <span>Preparando pago seguro...</span>
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
                  <CheckoutForm total={cartTotal} />
                </StripeProvider>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
