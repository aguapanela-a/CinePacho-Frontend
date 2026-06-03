import { apiFetch } from './api'

/**
 * @param {string} userId - ID del usuario para obtener su historial de órdenes
 * @return {Promise<Array>} - Promesa que resuelve con el historial de órdenes del usuario
 */

export const getOrderHistory = (userId) => {
  return apiFetch(`/api/checkout/billings/user/${userId}`)
}
