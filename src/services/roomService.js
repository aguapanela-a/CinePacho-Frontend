/**
 * roomService.js
 * Servicios para la gestión de Salas (Rooms).
 * Endpoints: /api/admin/{multiplexId}/rooms, /api/admin/rooms/{id}
 */

import { apiFetch } from './api'

export const createRoom = (multiplexId) => {
  if (!multiplexId) {
    throw new Error('createRoom: multiplexId es obligatorio')
  }

  return apiFetch(`/api/admin/${multiplexId}/rooms`, {
    method: 'POST',
  })
}

export const deleteRoom = (id) =>
  apiFetch(`/api/admin/rooms/${id}`, { method: 'DELETE' })
