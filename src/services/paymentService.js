/**
 * paymentService.js
 * Servicio de pagos — Stripe.
 *
 * El backend debe exponer POST /api/payments/create-intent
 * que retorne { clientSecret: "pi_xxx_secret_xxx" }.
 *
 * Cuando el backend esté listo, este servicio se conecta sin
 * cambiar nada en los componentes de UI.
 */

import { apiFetch } from './api'

/**
 * Solicita al backend la creación de un PaymentIntent de Stripe.
 * @param {number} amount - Monto en centavos (ej: 5000 = $50.00 USD)
 * @param {string} currency - Código de moneda ISO (default: 'cop')
 * @returns {{ clientSecret: string }}
 */
export const createPaymentIntent = (amount, currency = 'cop') =>
  apiFetch('/api/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify({ amount, currency }),
  })
