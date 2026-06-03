/**
 * movieService.js
 * Servicios para búsqueda de películas (TMDB), selección y gestión de funciones en CinePacho.
 */

import { apiFetch } from './api'

/**
 * GET cartelera de un multiplex con selectores avanzados
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
 * Refactorizado para ser resiliente ante errores 400/404.
 */
export const getMovieSelectorsById = async (multiplexId, movieId) => {
  try {
    const data = await apiFetch(`/api/movie/multiplex/${multiplexId}/selectors/${movieId}`)
    return data
  } catch (error) {
    console.warn(`[movieService] No se encontraron funciones para ${movieId} en el multiplex ${multiplexId}.`)
    // Retornamos un objeto vacío estructurado para evitar que el componente rompa
    return { screenings: [], movieInfo: null }
  }
}

/**
 * GET /api/topRatedMovies
 */
export const getTopRatedMovies = () =>
  apiFetch('/api/topRatedMovies')

/**
 * GET /api/movie/trailer/{movieId}
 */
export const getMovieTrailer = async (movieId) => {
  try {
    return await apiFetch(`/api/movie/trailer/${movieId}`)
  } catch (error) {
    return null
  }
}

/**
 * GET /api/movie/multiplex/{multiplexId}
 */
export const getMovieListingByMultiplex = (multiplexId) =>
  apiFetch(`/api/movie/multiplex/${multiplexId}`)

/**
 * GET búsqueda de películas en la API externa (TMDB) desde el backend
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
 */
export const selectMovie = (movieId) =>
  apiFetch(`/api/admin/movie/select/${movieId}`, {
    method: 'POST',
  })

/**
 * POST crear una nueva función (screening)
 */
export const createScreening = (data) =>
  apiFetch('/api/admin/movie/createScreening', {
    method: 'POST',
    body: JSON.stringify(data),
  })

/**
 * PUT cambiar el estado de una función (ACTIVE, CANCELLED, COMPLETED)
 */
export const updateScreeningStatus = (screeningId, status) =>
  apiFetch(
    `/api/admin/movie/changeStatus/${screeningId}?status=${status}`,
    {
      method: 'PUT',
    }
  )