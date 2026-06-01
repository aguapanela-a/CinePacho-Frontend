/**
 * roomService.js
 * Servicios para la gestión de Salas (Rooms).
 * Endpoints: /api/admin/rooms
 */

import { apiFetch } from './api'

/** TODO: Implementar backend /api/admin/rooms */
export const getAllRooms = () => {
  console.warn('getAllRooms: backend /api/admin/rooms no implementado')
  return Promise.resolve([])
}

/** TODO: Implementar backend /api/admin/rooms/{id} */
export const getRoomById = (id) => {
  console.warn('getRoomById: backend /api/admin/rooms/{id} no implementado')
  return Promise.resolve(null)
}

/**
 * POST /api/admin/{multiplexId}/rooms — Crea una sala asociada a un multiplex
 * @param {{ multiplexId: string }} data
 */
export const createRoom = ({ multiplexId }) =>
  apiFetch(`/api/admin/${multiplexId}/rooms`, {
    method: 'POST',
  })

/** DELETE /admin/rooms/{id} — Elimina una sala */
export const deleteRoom = (id) =>
  apiFetch(`/api/admin/rooms/${id}`, { method: 'DELETE' })
