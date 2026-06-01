/**
 * pointsService.js
 * Servicios para la gestión de puntos (BUYER) y validación de cupones (EMPLOYEE)
 */

import { apiFetch } from './api'

/**
 * GET /api/points
 * Obtiene los puntos actuales y el historial.
 * @returns {Promise<{ pointsNow: number, historyPoints: Array }>}
 */
export const getMyPoints = () =>
  apiFetch('/api/points')

/**
 * POST /api/points/redeem
 * Canjea 100 puntos por un cupón (boleta gratis).
 * @returns {Promise<{ code: string, expirationDate: string }>}
 */
export const redeemPoints = () =>
  apiFetch('/api/points/redeem', { method: 'POST' })

/**
 * POST /api/points/validate
 * Valida un cupón. (Requiere rol EMPLOYEE o MANAGER)
 * @param {string} code - Código del cupón
 */
export const validateVoucher = (code) =>
  apiFetch('/api/points/validate', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
