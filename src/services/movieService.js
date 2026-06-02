/**
 * movieService.js
 * Servicios para búsqueda de películas (TMDB), selección y gestión de funciones en CinePacho.
 */

import { apiFetch } from './api'

/**
 * GET cartelera de un multiplex con selectores avanzados
 * /api/movie/multiplex/{multiplexId}/selectors
 * @param {string} multiplexId - ID del multiplex
 * @param {string} query - Texto opcional para filtrar películas
 */
export const getMovieSelectorsByMultiplex = (multiplexId, query = '') => {
  const url = query
    ? `/api/movie/multiplex/${multiplexId}/selectors?query=${encodeURIComponent(query)}`
    : `/api/movie/multiplex/${multiplexId}/selectors`

  return apiFetch(url)
}

/**
 * GET /api/movie/multiplex/{multiplexId}/selectors/{movieId}
 * Obtiene las funciones de una película específica en un multiplex.
 */
export const getMovieSelectorsById = (multiplexId, movieId) =>
  apiFetch(`/api/movie/multiplex/${multiplexId}/selectors/${movieId}`)

/**
 * GET /api/topRatedMovies
 * Obtiene las 10 mejores películas calificadas para la sección pública destacados.
 */
export const getTopRatedMovies = () =>
  apiFetch('/api/topRatedMovies')

/**
 * GET /api/movie/trailer/{movieId}
 * Obtiene el key de YouTube del tráiler de la película.
 */
export const getMovieTrailer = (movieId) =>
  apiFetch(`/api/movie/trailer/${movieId}`)

/**
 * GET /api/movie/multiplex/{multiplexId}
 * Obtiene la cartelera básica de un multiplex para el rol buyer.
 */
export const getMovieListingByMultiplex = (multiplexId) =>
  apiFetch(`/api/movie/multiplex/${multiplexId}`)

/**
 * GET búsqueda de películas en la API externa (TMDB) desde el backend
 * /api/admin/movie/search
 * @param {string} query - Texto de búsqueda
 * @param {number} page - Número de página para la paginación
 */
export const searchMovies = (query, page = 1) => {
  const params = new URLSearchParams({
    query: query?.trim() || '',
    page: String(page),
  })
  return apiFetch(`/api/admin/movie/search?${params.toString()}`)
}

/**
 * POST seleccionar e importar película desde TMDB a la base de datos local
 * /api/admin/movie/select/{movieId}
 */
export const selectMovie = (movieId) =>
  apiFetch(`/api/admin/movie/select/${movieId}`, {
    method: 'POST',
  })

/**
 * POST crear una nueva función (screening) en una sala y horario específicos
 * /api/admin/movie/createScreening
 * @param {Object} data - Datos correspondientes al CreateScreeningDTO (movieId, roomId, dateTime)
 */
export const createScreening = (data) =>
  apiFetch('/api/admin/movie/createScreening', {
    method: 'POST',
    body: JSON.stringify(data),
  })

/**
 * PUT cambiar el estado de una función (ACTIVE, CANCELLED, COMPLETED)
 * /api/admin/movie/changeStatus/{idScreening}
 * @param {string} screeningId - UUID de la función
 * @param {string} status - Nuevo estado de la función (ej. ScreeningStatus enum)
 */
export const updateScreeningStatus = (screeningId, status) =>
  apiFetch(
    `/api/admin/movie/changeStatus/${screeningId}?status=${status}`,
    {
      method: 'PUT',
    }
  )