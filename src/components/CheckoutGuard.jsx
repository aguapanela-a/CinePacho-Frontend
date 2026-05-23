import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const SNAPSHOT_KEY = 'cinepacho_order_snapshot'
const SNAPSHOT_TTL_MS = 30 * 60 * 1000

export function saveOrderSnapshot({ cart, cartTotal, pendingPoints }) {
  sessionStorage.setItem(
    SNAPSHOT_KEY,
    JSON.stringify({ cart, cartTotal, pendingPoints, at: Date.now() })
  )
}

export function loadOrderSnapshot() {
  try {
    const raw = sessionStorage.getItem(SNAPSHOT_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data?.at || Date.now() - data.at > SNAPSHOT_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

export function clearOrderSnapshot() {
  sessionStorage.removeItem(SNAPSHOT_KEY)
}

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
