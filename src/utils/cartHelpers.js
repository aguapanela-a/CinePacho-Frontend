import { formatCurrency, getUnitPrice } from './formatCurrency'

export function normalizeCartItem(item) {
  const qty = item.qty || 1
  const unitPrice = getUnitPrice(item)
  // Business rule: 10 points per ticket, 5 points per snack
  const points = item.points != null ? item.points : (item.type === 'ticket' || item.type === 'TICKET' ? 10 : 5)

  return {
    ...item,
    qty,
    unitPrice,
    price: formatCurrency(unitPrice),
    points,
  }
}
