/**
 * api.js — Capa base de comunicación con el backend
 *
 * Centraliza:
 * - Configuración automática de la URL base
 * - Adjuntar el header Authorization: Bearer <token>
 * - Parsear la respuesta como JSON
 * - Lanzar errores HTTP descriptivos
 */

// Intentamos leer la variable de entorno. 
// Si estamos en Vercel y falla, forzamos la URL de producción de Railway.
let BASE_URL = import.meta.env.VITE_API_URL || '';

if (window.location.hostname.includes('vercel.app') && !BASE_URL) {
  BASE_URL = 'https://back-cinepacho-production.up.railway.app';
}

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
 * @param {string} endpoint - Ruta relativa, ej: '/api/admin/multiplexes'
 * @param {RequestInit} options - Opciones de fetch (method, body, etc.)
 * @returns {Promise<any>} - JSON parseado de la respuesta
 */
export async function apiFetch(endpoint, options = {}) {
  // Aseguramos que el endpoint empiece con / para no romper la concatenación
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  // Log útil para depurar en F12
  console.log(`[apiFetch] Conectando a: ${url}`);

  const response = await fetch(url, {
    ...options,
    headers: getHeaders(options.headers),
  })

  // Respuestas 204 No Content (DELETE exitoso) no tienen body
  if (response.status === 204) return null

  // Intentamos parsear JSON
  const data = await response.json().catch(() => null)

  // Si la respuesta no es 2xx, lanzamos error
  if (!response.ok) {
    const message =
      data?.message || data?.error || `Error ${response.status}: ${response.statusText}`
    const error = new Error(message)
    error.status = response.status
    console.error(`[apiFetch] Error en ${url}:`, message);
    throw error
  }

  return data
}