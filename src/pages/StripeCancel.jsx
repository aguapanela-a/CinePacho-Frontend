import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

export default function StripeCancel() {
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.removeItem('cinepacho_checkout_payload')
    localStorage.removeItem('cinepacho_payment_id')
    sessionStorage.removeItem('cinepacho_order_snapshot')

    const timer = setTimeout(() => {
      navigate('/checkout', { replace: true })
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-carbon flex flex-col items-center justify-center text-white">
      <AlertCircle size={48} className="text-red-400 mb-4" />
      <h2 className="text-2xl font-display uppercase tracking-widest">Pago Cancelado</h2>
      <p className="text-text-secondary mt-2">El pago no fue completado. Redirigiendo al carrito...</p>
    </div>
  )
}
