/**
 * roomService.js
 * Servicios para la gestión de Salas (Rooms).
 * Endpoints: /admin/rooms
 */

import { apiFetch } from './api'

/** GET /admin/rooms — Lista todas las salas */
export const getAllRooms = () =>
  apiFetch('/api/admin/rooms')

/** GET /admin/rooms/{id} — Obtiene una sala con detalle de asientos */
export const getRoomById = (id) =>
  apiFetch(`/api/admin/rooms/${id}`)

/**
 * POST /admin/rooms — Crea una sala asociada a un multiplex
 * @param {{ multiplexId: string, numberRoom: number }} data
 */
export const createRoom = ({ multiplexId, numberRoom }) =>
  apiFetch(`/api/admin/${multiplexId}/rooms`, {
    method: 'POST',
    body: JSON.stringify({
      numberRoom,
    }),
  })

/** DELETE /admin/rooms/{id} — Elimina una sala */
export const deleteRoom = (id) =>
  apiFetch(`/api/admin/rooms/${id}`, { method: 'DELETE' })
