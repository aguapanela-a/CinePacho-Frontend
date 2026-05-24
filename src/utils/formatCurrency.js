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
    // Handle both numeric prices and formatted strings like "$11.000" or "11000"
    const priceValue = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^\d.,]/g, '').replace(',', '.'))
    return Number.isNaN(priceValue) ? 0 : priceValue
  }
  return 0
}

/** Texto formateado del precio unitario */
export function getDisplayPrice(item) {
  return formatCurrency(getUnitPrice(item))
}
