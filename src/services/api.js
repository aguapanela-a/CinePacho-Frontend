
let BASE_URL = import.meta.env.VITE_API_URL || ''

if (window.location.hostname.includes('vercel.app') && !BASE_URL) {
  BASE_URL = 'https://back-cinepacho-production.up.railway.app'
}

/**
 * Retorna los headers estándar incluyendo el JWT si existe en localStorage.
 * @param {Object} extra - Headers adicionales para fusionar
 * @returns {Object} Headers listos para la petición fetch
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
 * Normaliza de forma segura propiedades de snacks si es necesario.
 * Resuelve la falta de mapeo del backend sin generar mutaciones peligrosas ni bucles infinitos.
 * @param {any} data - Datos crudos provenientes de la respuesta JSON
 * @returns {any} Datos procesados y normalizados
 */
function normalizeData(data) {
  if (!data) return data

  // Caso 1: Es un arreglo directo de snacks (Ej: GET /api/snacks/{multiplexId})
  if (Array.isArray(data) && data.length > 0 && 'idSnack' in data[0]) {
    return data.map(item => normalizeItem(item))
  }

  // Caso 2: Objeto agrupado que contiene una lista de snacks (Ej: SnackByMultiplex structure)
  if (data.snacks && Array.isArray(data.snacks)) {
    return {
      ...data,
      snacks: data.snacks.map(item => normalizeItem(item))
    }
  }

  // Caso 3: Es una lista de objetos agrupadores (Ej: GET /api/admin/snacks agrupados por Multiplex)
  if (Array.isArray(data) && data.length > 0 && data[0].snacks) {
    return data.map(group => ({
      ...group,
      snacks: Array.isArray(group.snacks) ? group.snacks.map(item => normalizeItem(item)) : []
    }))
  }

  // Caso 4: Es un único snack (Ej: GET /api/admin/snacks/{id} o respuestas de PUT)
  return normalizeItem(data)
}

/**
 * Aplica el fallback de puntos de forma segura usando desestructuración.
 * @param {Object} item - Objeto individual a verificar
 */
function normalizeItem(item) {
  if (item && typeof item === 'object' && 'idSnack' in item) {
    return {
      ...item,
      // Si pointsSnack llega nulo o no definido desde el backend, asegura un valor por defecto (5)
      pointsSnack: item.pointsSnack ?? 5 
    }
  }
  return item
}

/**
 * Función centralizada para realizar peticiones HTTP (fetch).
 * @param {string} endpoint - Ruta relativa del recurso, ej: '/api/snacks/1'
 * @param {RequestInit} options - Opciones nativas de fetch (method, body, etc.)
 * @returns {Promise<any>} JSON parseado y sanitizado de la respuesta
 */
export async function apiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${BASE_URL}${cleanEndpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: getHeaders(options.headers),
    })

    // Las respuestas 204 No Content (como un DELETE exitoso) no poseen cuerpo
    if (response.status === 204) return null

    // Intentamos parsear a JSON. Si el cuerpo está vacío o falla, retorna null de forma segura
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      let message =
        data?.message || data?.error || `Error ${response.status}: ${response.statusText}`
        
      if (response.status === 403) {
        message = data?.message || 'Forbidden: no tienes permiso para acceder a este recurso'
      } else if (response.status === 404) {
        message = data?.message || 'No encontrado: el recurso solicitado no existe'
      }
      
      const error = new Error(message)
      error.status = response.status
      console.error(`[apiFetch] Error en ${url}:`, message)
      throw error
    }

    // Intercepta e inyecta las correcciones de datos antes de entregar la respuesta al servicio
    console.log("Datos recibidos del servidor:", data);
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      const networkError = new Error(
        `Network error: no se pudo establecer conexión con el servidor en ${url}`
      )
      networkError.status = 0
      throw networkError
    }
    throw error
  }
}