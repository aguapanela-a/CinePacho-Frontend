/**
 * api.js — Capa base de comunicación con el backend
 *
 * Centraliza:
 *  - Adjuntar el header Authorization: Bearer <token> en cada petición
 *  - Parsear la respuesta como JSON
 *  - Lanzar errores HTTP descriptivos para que los servicios los capturen
 */

const BASE_URL = '' // Vite proxy redirige /admin → localhost:8010

/**
 * Retorna los headers estándar incluyendo el JWT si existe en localStorage.
 */
function getHeaders(extra = {}) {
  const token = localStorage.getItem('cinepacho_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

/**
 * Función central de fetch.
 * @param {string} endpoint - Ruta relativa, ej: '/admin/multiplexes'
 * @param {RequestInit} options - Opciones de fetch (method, body, etc.)
 * @returns {Promise<any>} - JSON parseado de la respuesta
 */
export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: getHeaders(options.headers),
  })

  // Respuestas 204 No Content (DELETE exitoso) no tienen body
  if (response.status === 204) return null

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      data?.message || data?.error || `Error ${response.status}: ${response.statusText}`
    throw new Error(message)
  }

  return data
}
