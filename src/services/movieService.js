/**
 * movieService.js
 * Servicios para búsqueda de películas (TMDB), selección y gestión de funciones.
 */

import { apiFetch } from './api'

/**
 * GET cartelera de un multiplex
 * /api/movie/multiplex/{multiplexId}/selectors
 */
export const getMovieSelectorsByMultiplex = (multiplexId, query = '') => {
  const url = query
    ? `/api/movie/multiplex/${multiplexId}/selectors?query=${encodeURIComponent(query)}`
    : `/api/movie/multiplex/${multiplexId}/selectors`

  return apiFetch(url)
}

/**
 * GET búsqueda de películas (TMDB backend)
 * /api/admin/movie/search
 */
export const searchMovies = (query, page = 1) =>
  apiFetch(
    `/api/admin/movie/search?query=${encodeURIComponent(query)}&page=${page}`
  )

/**
 * POST seleccionar película
 * /api/admin/movie/select/{movieId}
 */
export const selectMovie = (movieId) =>
  apiFetch(`/api/admin/movie/select/${movieId}`, {
    method: 'POST',
  })

/**
 * POST crear función (screening)
 * /api/admin/movie/createScreening
 */
export const createScreening = (data) =>
  apiFetch('/api/admin/movie/createScreening', {
    method: 'POST',
    body: JSON.stringify(data),
  })

/**
 * PUT cambiar estado de función
 * /api/admin/movie/changeStatus/{idScreening}
 */
export const updateScreeningStatus = (screeningId, status) =>
  apiFetch(
    `/api/admin/movie/changeStatus/${screeningId}?status=${status}`,
    {
      method: 'PUT',
    }
  )