/**
 * seatService.js
 * Servicio de sillas — Consulta sillas de una sala y cambia su estado.
 *
 * Endpoints:
 *  - GET /api/seats/{roomId} → Retorna todas las sillas con su estado (AVAILABLE, BLOCKED, SOLD)
 *  - PUT /api/seats/{seatId}/changeStatus → Alterna el estado de una silla
 */

import { apiFetch } from './api'

/**
 * Obtiene todas las sillas de una sala específica.
 * @param {string} roomId - UUID de la sala
 * @returns {Promise<Array<{ idSeat: string, roomId: string, seatNumber: number, type: string, status: string }>>}
 */
export const getSeatsByRoom = (roomId) =>
  apiFetch(`/api/seats/${roomId}`)

/**
 * Cambia el estado de una silla (bloquea/desbloquea temporalmente).
 * @param {string} seatId - UUID de la silla
 */
export const toggleSeatStatus = (seatId) =>
  apiFetch(`/api/seats/${seatId}/changeStatus`, { method: 'PUT' })
