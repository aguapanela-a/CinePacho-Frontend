/**
 * roomService.js
 * Servicios para la gestión de Salas (Rooms).
 * Endpoints: /api/admin/rooms
 */

import { apiFetch } from './api'

/** GET /api/admin/{multiplexId}/rooms — Obtiene todas las salas de un multiplex */
export const getRoomsByMultiplexId = (multiplexId) =>
  apiFetch(`/api/admin/${multiplexId}/rooms`)

/** @deprecated Usar getRoomsByMultiplexId en su lugar */
export const getAllRooms = () => {
  console.warn('getAllRooms: usa getRoomsByMultiplexId(multiplexId) en su lugar')
  return Promise.resolve([])
}

/** @deprecated Esta función estaba mal implementada. Usa getRoomsByMultiplexId */
export const getRoomById = (multiplexId) => {
  console.warn('getRoomById: usa getRoomsByMultiplexId(multiplexId) en su lugar')
  return getRoomsByMultiplexId(multiplexId)
}

/**
 * POST /api/admin/{multiplexId}/rooms — Crea una sala asociada a un multiplex
 * @param {{ multiplexId: string, numberRoom: number }} data
 */
export const createRoom = ({ multiplexId, numberRoom }) =>
  apiFetch(`/api/admin/${multiplexId}/rooms`, {
    method: 'POST',
    body: JSON.stringify({ numberRoom }),
  })

/** DELETE /api/admin/rooms/{id} — Elimina una sala */
export const deleteRoom = (id) =>
  apiFetch(`/api/admin/rooms/${id}`, { method: 'DELETE' })
