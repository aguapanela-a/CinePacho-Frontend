/**
 * movieService.js
 * Capa de integración con los endpoints del API Gateway en Spring Boot para películas y salas.
 */

import { apiFetch } from './api'

/**
 * GET cartelera simplificada de un multiplex con filtros opcionales
 * /api/movie/multiplex/{multiplexId}/selectors
 */
export const getMovieSelectorsByMultiplex = (multiplexId, query = '') => {
  const url = query
    ? `/api/movie/multiplex/${multiplexId}/selectors?query=${encodeURIComponent(query)}`
    : `/api/movie/multiplex/${multiplexId}/selectors`

  return apiFetch(url)
}

/**
 * GET detalles y funciones estructuradas de una película específica dentro de un complejo
 * /api/movie/multiplex/{multiplexId}/selectors/{movieId}
 */
export const getMovieSelectorsById = (multiplexId, movieId) =>
  apiFetch(`/api/movie/multiplex/${multiplexId}/selectors/${movieId}`)

/**
 * GET listado global de películas con las calificaciones más altas
 * /api/topRatedMovies
 */
export const getTopRatedMovies = () =>
  apiFetch('/api/topRatedMovies')

/**
 * GET identificador del recurso de video en YouTube para trailers de TMDB
 * /api/movie/trailer/${movieId}
 */
export const getMovieTrailer = (movieId) =>
  apiFetch(`/api/movie/trailer/${movieId}`)

/**
 * GET listado crudo de cartelera para compradores de boletos
 * /api/movie/multiplex/{multiplexId}
 */
export const getMovieListingByMultiplex = (multiplexId) =>
  apiFetch(`/api/movie/multiplex/${multiplexId}`)

/**
 * GET búsqueda de películas directo en el módulo administrativo conectado con TMDB
 * /api/admin/movie/search
 */
export const searchMovies = (query, page = 1) => {
  const params = new URLSearchParams({
    query: query?.trim() || '',
    page: String(page),
  })
  return apiFetch(`/api/admin/movie/search?${params.toString()}`)
}

/**
 * POST selección e indexación de una película externa hacia la base de datos local de la aplicación
 * /api/admin/movie/select/{movieId}
 */
export const selectMovie = (movieId) =>
  apiFetch(`/api/admin/movie/select/${movieId}`, {
    method: 'POST',
  })

/**
 * POST programar y crear una nueva proyección de función cinematográfica
 * /api/admin/movie/createScreening
 */
export const createScreening = (data) =>
  apiFetch('/api/admin/movie/createScreening', {
    method: 'POST',
    body: JSON.stringify(data),
  })