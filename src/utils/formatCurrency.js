/** Formato de moneda COP para UI */
export function formatCurrency(amount, locale = 'es-CO') {
  return '$' + Number(amount || 0).toLocaleString(locale)
}

/** Precio unitario numérico desde un ítem del carrito */
export function getUnitPrice(item) {
  if (typeof item?.unitPrice === 'number' && !Number.isNaN(item.unitPrice)) {
    return item.unitPrice
  }
  if (item?.price != null) {
    const parsed = parseInt(String(item.price).replace(/\D/g, ''), 10)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

/** Texto formateado del precio unitario */
export function getDisplayPrice(item) {
  return formatCurrency(getUnitPrice(item))
}
