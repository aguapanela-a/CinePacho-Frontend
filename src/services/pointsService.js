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

/**
 * PUT /api/points/admin/mode
 * Actualiza el modo de puntos (admin solamente).
 * @param {boolean} byUnit
 */
export const setPointsMode = (byUnit) =>
  apiFetch(`/api/points/admin/mode?byUnit=${encodeURIComponent(byUnit)}`, {
    method: 'PUT',
  })

/**
 * PUT /api/points/admin/snack/{snackId}/points
 * Actualiza puntos asignados a un snack (admin solamente).
 * @param {string} snackId
 * @param {number} points
 */
export const setSnackPoints = (snackId, points) =>
  apiFetch(`/api/points/admin/snack/${snackId}/points?points=${encodeURIComponent(points)}`, {
    method: 'PUT',
  })

/**
 * PUT /api/points/admin/seat/{seatId}/points
 * Actualiza puntos asignados a una función de silla (admin solamente).
 * @param {string} seatId
 * @param {number} points
 */
export const setSeatPoints = (seatId, points) =>
  apiFetch(`/api/points/admin/seat/${seatId}/points?points=${encodeURIComponent(points)}`, {
    method: 'PUT',
  })
