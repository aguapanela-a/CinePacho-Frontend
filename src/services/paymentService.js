/**
 * paymentService.js
 * Servicio de pagos — Stripe.
 *
 * El backend debe exponer POST /api/payments/create-intent
 * que retorne { clientSecret: "pi_xxx_secret_xxx" }.
 *
 * Cuando el backend esté listo, este servicio se conecta sin
 * cambiar nada en los componentes de UI.5
 */

import { apiFetch } from './api'

/**
 * Solicita al backend la creación de un PaymentIntent de Stripe.
 * @param {number} amount - Monto en pesos colombianos
 * @param {string} currency - Código de moneda ISO (default: 'cop')
 * @param {Array} seats - Array de objetos con { seatId }
 * @param {Array} snacks - Array de objetos con { snackId, quantity }
 * @returns {{ clientSecret: string }}
 */
export const createCheckoutSession = (
  screeningId,
  seats = [],
  snacks = []
) =>
  apiFetch('/api/checkout/stripe', {
    method: 'POST',
    body: JSON.stringify({
      screeningId,
      seats,
      snacks,
    }),
  })