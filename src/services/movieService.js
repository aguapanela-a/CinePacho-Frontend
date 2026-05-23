/**
 * movieService.js
 * Servicios para búsqueda de películas (TMDB), selección y gestión de funciones.
 * Endpoints: /admin/search  /admin/movie/**
 */

import { apiFetch } from './api'

/**
 * GET /admin/search?query={text}
 * Búsqueda dinámica de películas vía TMDB desde el backend.
 * @param {string} query - Texto de búsqueda
 */
export const searchMovies = (query) =>
  apiFetch(`/api/admin/search?query=${encodeURIComponent(query)}`)

/**
 * POST /admin/select/{movieId}
 * Registra la selección de una película en el sistema.
 * @param {number} movieId - ID de TMDB
 */
export const selectMovie = (movieId) =>
  apiFetch(`/api/admin/select/${movieId}`, { method: 'POST' })

/**
 * POST /admin/{multiplexName}/createScreening
 * Crea una función (screening) para la película seleccionada.
 * @param {string} multiplexName - Nombre exacto del multiplex
 * @param {{ movieId, roomId, dateTime, price }} data
 */
export const createScreening = (multiplexName, data) =>
  apiFetch(`/api/admin/${encodeURIComponent(multiplexName)}/createScreening`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

/**
 * PUT /admin/{multiplexName}/{idScreening}/status
 * Actualiza el estado de una función.
 * @param {string} multiplexName
 * @param {string} screeningId - UUID de la función
 * @param {'ACTIVE' | 'CANCELLED' | 'COMPLETED'} status
 */
export const updateScreeningStatus = (multiplexName, screeningId, status) =>
  apiFetch(
    `/api/admin/${encodeURIComponent(multiplexName)}/${screeningId}/status?status=${status}`,
    {
      method: 'PUT',
    }
  )
