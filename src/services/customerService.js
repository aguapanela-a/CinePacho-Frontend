/**
 * customerService.js
 * Servicios para la búsqueda y consulta de clientes (BUYER).
 * Usado principalmente desde el panel del cajero (CashierDashboard).
 */

import { apiFetch } from './api'

/**
 * GET /api/admin/customers/search?query={query}
 * Busca un cliente por cédula (CC) o correo electrónico.
 * @param {string} query - CC o email del cliente
 * @returns {Promise<{ id: string, name: string, email: string, cc: string, points: number } | null>}
 */
export const searchCustomerByQuery = async (query) => {
    const data = await apiFetch(
        `/api/admin/customers/search?query=${encodeURIComponent(query)}`
    )
    // El backend puede devolver un objeto directo o un array; normalizamos a objeto o null
    if (Array.isArray(data)) return data[0] ?? null
    return data ?? null
}

/**
 * GET /api/admin/customers/{customerId}
 * Obtiene el detalle completo de un cliente por su UUID.
 * @param {string} customerId - UUID del cliente
 */
export const getCustomerById = (customerId) =>
    apiFetch(`/api/admin/customers/${customerId}`)