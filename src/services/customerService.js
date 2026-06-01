/**
 * customerService.js
 * Servicios para la búsqueda y consulta de clientes (BUYER).
 * Usado principalmente desde el panel del cajero (CashierDashboard).
 */

import { apiFetch } from './api'

/**
 * searchCustomerByQuery
 * No existe un endpoint backend compatible para buscar clientes por query.
 * El frontend usa email manual o datos ya disponibles.
 * @param {string} query - Email o UUID del cliente
 * @returns {Promise<null>}
 */
export const searchCustomerByQuery = async (query) => {
  console.warn('searchCustomerByQuery: no existe endpoint backend para buscar clientes por query')
  return null
}

/**
 * getCustomerById
 * No existe un endpoint backend compatible para obtener cliente por ID.
 * @param {string} customerId - UUID del cliente
 */
export const getCustomerById = async (customerId) => {
  console.warn('getCustomerById: no existe endpoint backend para obtener cliente por ID')
  return null
}
