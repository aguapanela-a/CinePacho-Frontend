import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { confirmStripePayment } from '../services/paymentService'

export default function StripeSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('pending')
  const [errorMessage, setErrorMessage] = useState('')

  // Esta es la ruta frontend de retorno de Stripe.
  // Stripe debe redirigir aquí con success_url = /stripe/success.
  // El pago se confirma llamando al backend exacto: POST /api/checkout/stripe/success.
  // El pagoId se obtiene de la URL o de localStorage, y el checkoutRequest se guarda en localStorage.
  useEffect(() => {
    const confirmPayment = async () => {
      const urlPaymentId = searchParams.get('paymentId')
      const savedPaymentId = localStorage.getItem('cinepacho_payment_id')
      const paymentIdToUse = urlPaymentId || savedPaymentId
      const savedPayload = localStorage.getItem('cinepacho_checkout_payload')

      if (!paymentIdToUse || !savedPayload) {
        setStatus('error')
        setErrorMessage('No se encontró la información de pago para completar la confirmación. Por favor regresa al checkout e intenta de nuevo.')
        return
      }

      try {
        const checkoutRequest = JSON.parse(savedPayload)
        await confirmStripePayment(paymentIdToUse, checkoutRequest)
        localStorage.removeItem('cinepacho_checkout_payload')
        localStorage.removeItem('cinepacho_payment_id')
        setStatus('success')
        navigate('/confirmacion', { replace: true })
      } catch (err) {
        console.error('Error confirming payment:', err)
        setStatus('error')
        setErrorMessage(err?.message || 'Error al confirmar el pago. Intenta nuevamente más tarde.')
      }
    }

    confirmPayment()
  }, [navigate, searchParams])

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-carbon flex flex-col items-center justify-center text-white">
        <Loader2 size={48} className="animate-spin text-green-400 mb-4" />
        <h2 className="text-2xl font-display uppercase tracking-widest">Confirmando Pago...</h2>
        <p className="text-text-secondary mt-2">Por favor espere mientras validamos su pago.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-carbon flex flex-col items-center justify-center text-white px-4">
      <AlertCircle size={48} className="text-red-400 mb-4" />
      <h2 className="text-2xl font-display uppercase tracking-widest">No se pudo confirmar el pago</h2>
      <p className="text-text-secondary mt-2 text-center max-w-md">{errorMessage}</p>
      <button
        onClick={() => navigate('/checkout', { replace: true })}
        className="mt-6 px-6 py-3 bg-magenta rounded-2xl text-white font-bold hover:opacity-90 transition-all"
      >
        Regresar al checkout
      </button>
    </div>
  )
}
