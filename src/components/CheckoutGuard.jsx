import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { loadOrderSnapshot } from '../utils/orderSnapshot'

/**
 * @param {boolean} requireSnapshot - true en /confirmacion (tras pago)
 */
export default function CheckoutGuard({ children, requireSnapshot = false }) {
  const { cart } = useApp()
  const location = useLocation()

  if (requireSnapshot) {
    const snapshot = loadOrderSnapshot()
    if (!snapshot?.cart?.length) {
      return <Navigate to="/" replace state={{ from: location.pathname }} />
    }
    return children
  }

  if (cart.length === 0) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return children
}

