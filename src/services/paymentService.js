/**
 * paymentService.js
 * Servicio de pagos — Stripe.
 *
 * El backend debe exponer POST /api/checkout/stripe para crear la sesión
 * de checkout y retornar { sessionUrl, paymentId, status }.
 *
 * Stripe Checkout debe configurarse con:
 *   success_url: https://<tu-dominio>/stripe/success
 *   cancel_url:  https://<tu-dominio>/stripe/cancel
 */

import { apiFetch } from './api'

/**
 * Solicita al backend la creación de una sesión de checkout de Stripe.
 * @param {string} screeningId - ID de la función
 * @param {Array} seats - Array de objetos con { seatId }
 * @param {Array} snacks - Array de objetos con { snackId, quantity }
 * @param {string|null} buyerEmail - Correo del comprador final para empleados
 * @returns {{ sessionUrl: string, paymentId?: string, sessionId?: string }}
 */
export const createCheckoutSession = (
  screeningId,
  seats = [],
  snacks = [],
  buyerEmail = null
) => {
  const body = {
    screeningId,
    seats,
    snacks,
    ...(buyerEmail && { buyerEmail }),
  }
  return apiFetch('/api/checkout/stripe', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * POST /api/checkout/stripe/success
 * Confirma el pago en el backend enviando el checkout original y el paymentId.
 * @param {string} paymentId - ID de pago retornado por Stripe
 * @param {Object} checkoutRequest - El objeto que se envió originalmente a createCheckoutSession
 */
export const confirmStripePayment = (paymentId, checkoutRequest) =>
  apiFetch('/api/checkout/stripe/success', {
    method: 'POST',
    body: JSON.stringify({
      paymentId,
      checkoutRequest
    }),
  })