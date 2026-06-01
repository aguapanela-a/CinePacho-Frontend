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
 * Obtiene todas las sillas de una sala específica para una función.
 * @param {string} roomId - UUID de la sala
 * @param {string} screeningId - UUID de la función
 * @returns {Promise<Array<{ idSeat: string, roomId: string, seatNumber: number, type: string, status: string }>>}
 */
export const getSeatsByRoom = (roomId, screeningId) =>
  apiFetch(`/api/seats/${roomId}/screening/${screeningId}`)

/**
 * Cambia el estado de una silla (bloquea/desbloquea temporalmente) para una función.
 * @param {string} seatId - UUID de la silla
 * @param {string} screeningId - UUID de la función
 */
export const toggleSeatStatus = (seatId, screeningId) =>
  apiFetch(`/api/seats/${seatId}/changeStatus?screeningId=${screeningId}`, { method: 'PUT' })
