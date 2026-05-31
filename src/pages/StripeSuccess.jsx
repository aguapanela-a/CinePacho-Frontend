import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { confirmStripePayment } from '../services/paymentService'

export default function StripeSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const confirmPayment = async () => {
      const urlPaymentId = searchParams.get('paymentId')
      const savedPaymentId = localStorage.getItem('cinepacho_payment_id')
      const paymentIdToUse = urlPaymentId || savedPaymentId
      
      const savedPayload = localStorage.getItem('cinepacho_checkout_payload')
      
      if (paymentIdToUse && savedPayload) {
        try {
          const checkoutRequest = JSON.parse(savedPayload)
          await confirmStripePayment(paymentIdToUse, checkoutRequest)
          localStorage.removeItem('cinepacho_checkout_payload')
          localStorage.removeItem('cinepacho_payment_id')
        } catch (err) {
          console.error('Error confirming payment:', err)
        }
      }
      
      navigate('/confirmacion', { replace: true })
    }

    const timer = setTimeout(() => confirmPayment(), 1500)
    return () => clearTimeout(timer)
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen bg-carbon flex flex-col items-center justify-center text-white">
      <Loader2 size={48} className="animate-spin text-green-400 mb-4" />
      <h2 className="text-2xl font-display uppercase tracking-widest">Confirmando Pago...</h2>
      <p className="text-text-secondary mt-2">Por favor espere mientras validamos su pago.</p>
    </div>
  )
}
