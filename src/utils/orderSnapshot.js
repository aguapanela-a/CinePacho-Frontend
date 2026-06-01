const SNAPSHOT_KEY = 'cinepacho_order_snapshot'
const SNAPSHOT_TTL_MS = 30 * 60 * 1000

export function saveOrderSnapshot({ cart, cartTotal, pendingPoints, shippingInfo, buyerEmail }) {
  sessionStorage.setItem(
    SNAPSHOT_KEY,
    JSON.stringify({ cart, cartTotal, pendingPoints, shippingInfo, buyerEmail, at: Date.now() })
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
