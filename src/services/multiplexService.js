/**
 * multiplexService.js
 * Servicios para el CRUD completo de Multiplex.
 * Endpoints: /api/multiplexes (lista pública) y /api/admin/multiplexes
 */

import { apiFetch } from './api'

/** GET /api/employees/{multiplexId} - Obtiene todos los empleados de un multiplex específico */
export const getEmployeesByMultiplexId = (multiplexId) =>
  apiFetch(`/api/admin/employees/${multiplexId}`)

/** GET /admin/multiplexes — Lista todos los multiplex */
export const getAllMultiplexes = () =>
  apiFetch('/api/multiplexes')

/** GET /admin/multiplexes/{id} — Obtiene un multiplex con sus salas */
export const getMultiplexById = (id) =>
  apiFetch(`/api/multiplexes/${id}`)

/**
 * POST /admin/multiplexes — Crea un nuevo multiplex
 * @param {{ nameMultiplex, addressMultiplex, cityMultiplex, numberOfRooms, generalSeatPrice, preferentialSeatPrice}} data
 */
export const createMultiplex = (data) =>
  apiFetch('/api/admin/multiplexes', {
    method: 'POST',
    body: JSON.stringify(data),
  })

/**
 * PUT /admin/multiplexes/{id} — Actualiza un multiplex existente
 * @param {string} id
 * @param {{ nameMultiplex, addressMultiplex, cityMultiplex, numberOfRooms, generalSeatPrice, preferentialSeatPrice}} data
 */
export const updateMultiplex = (id, data) =>
  apiFetch(`/api/admin/multiplexes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

/** DELETE /admin/multiplexes/{id} — Elimina un multiplex */
export const deleteMultiplex = (id) =>
  apiFetch(`/api/admin/multiplexes/${id}`, { method: 'DELETE' })
