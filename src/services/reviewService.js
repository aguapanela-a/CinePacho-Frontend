/**
 * reviewService.js
 * Servicio de reseñas — Envía evaluaciones de películas y servicio al backend.
 *
 * Endpoints:
 *  - POST /api/{buyerId}/review/movie
 *  - POST /api/{buyerId}/review/service
 *  - GET /api/{buyerId}/review
 */

import { apiFetch } from './api'

/**
 * Envía una reseña de película al backend.
 * @param {string} buyerId - UUID del usuario autenticado
 * @param {{ movieId: number, rating: number, comment: string }} data
 */
export const submitMovieReview = (buyerId, data) =>
  apiFetch(`/api/${buyerId}/review/movie`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

/**
 * Envía una reseña del servicio al backend.
 * @param {string} buyerId - UUID del usuario autenticado
 * @param {{ rating: number, comment: string }} data
 */
export const submitServiceReview = (buyerId, data) =>
  apiFetch(`/api/${buyerId}/review/service`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

/**
 * Obtiene las reseñas del usuario.
 * @param {string} buyerId - UUID del usuario
 */
export const getUserReviews = (buyerId) =>
  apiFetch(`/api/${buyerId}/review`)
