
let BASE_URL = import.meta.env.VITE_API_URL || ''

if (window.location.hostname.includes('vercel.app') && !BASE_URL) {
  BASE_URL = 'https://back-cinepacho-production.up.railway.app'
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
 * Función auxiliar para normalizar recursivamente las propiedades de los snacks,
 * subsanando la falta de mapeo del campo 'pointsSnack' en el backend.
 * @param {any} obj - Objeto o arreglo proveniente de la API
 * @returns {any} - Objeto con los datos de snacks normalizados
 */
function normalizeSnacks(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // Si el objeto actual representa un DTO de Snack (identificado por su idSnack)
  if (Object.prototype.hasOwnProperty.call(obj, 'idSnack')) {
    if (obj.pointsSnack === null || obj.pointsSnack === undefined) {
      obj.pointsSnack = 5 // Valor por defecto seguro para el flujo del frontend
    }
  }

  // Recorremos de manera recursiva en caso de estructuras anidadas o arreglos
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      obj[key] = normalizeSnacks(obj[key])
    }
  }

  return obj
}

/**
 * Función central de fetch.
 * @param {string} endpoint - Ruta relativa, ej: '/api/admin/multiplexes'
 * @param {RequestInit} options - Opciones de fetch (method, body, etc.)
 * @returns {Promise<any>} - JSON parseado de la respuesta
 */
export async function apiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${BASE_URL}${cleanEndpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: getHeaders(options.headers),
    })

    // Respuestas 204 No Content (DELETE exitoso) no tienen body
    if (response.status === 204) return null

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

    // Normalizamos la respuesta antes de retornarla para limpiar los DTOs de snacks
    return normalizeSnacks(data)
  } catch (error) {
    if (error instanceof TypeError) {
      const networkError = new Error(
        `Network error: no se pudo conectar con ${url}`
      )
      networkError.status = 0
      throw networkError
    }
    throw error
  }
}