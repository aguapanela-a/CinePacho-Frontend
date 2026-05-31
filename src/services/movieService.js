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
<<<<<<< HEAD
 * GET /api/movie/multiplex/{multiplexId}/selectors/{movieId}
 * Obtiene las funciones de una película específica en un multiplex.
 */
export const getMovieSelectorsById = (multiplexId, movieId) =>
  apiFetch(`/api/movie/multiplex/${multiplexId}/selectors/${movieId}`)

/**
 * GET /topRatedMovies
 * Obtiene las 10 mejores películas (Público)
 */
export const getTopRatedMovies = () =>
  apiFetch('/topRatedMovies')

/**
 * GET /api/movie/trailer/{movieId}
 * Obtiene el key de YouTube del tráiler de la película.
 */
export const getMovieTrailer = (movieId) =>
  apiFetch(`/api/movie/trailer/${movieId}`)

/**
 * GET /admin/search?query={text}
 * Búsqueda dinámica de películas vía TMDB desde el backend.
 * @param {string} query - Texto de búsqueda
=======
 * GET búsqueda de películas (TMDB backend)
 * /api/admin/movie/search
>>>>>>> e78fb1fc8227ba85aea4ace98062b7bc17aa41c8
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