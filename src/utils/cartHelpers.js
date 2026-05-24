import { formatCurrency, getUnitPrice } from './formatCurrency'

export function normalizeCartItem(item) {
  const qty = item.qty || 1
  const unitPrice = getUnitPrice(item)
  const points = item.points != null ? item.points : Math.floor(unitPrice / 5000)

  return {
    ...item,
    qty,
    unitPrice,
    price: formatCurrency(unitPrice),
    points,
  }
}
