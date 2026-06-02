/**
 * snackService.js — CRUD snacks + catálogo público sincronizado con Spring Boot.
 */

import { apiFetch } from './api'

/** * GET /api/snacks/{multiplexId} 
 * ¡PÚBLICO / COMPRADORES! Lista snacks con inventario disponible para la compra.
 * Alínea directo con @GetMapping("/snacks/{multiplexId}") de tu controlador.
 */
export const getAllSnacks = async (multiplexId) => {
  if (!multiplexId) {
    console.warn('getAllSnacks: multiplexId es obligatorio')
    return []
  }

  try {
    // IMPORTANTE: Sin el '/admin' para que no pida rol de administrador
    const data = await apiFetch(`/api/snacks/${multiplexId}`)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error cargando el catálogo público de snacks:', error)
    return []
  }
}

/** * GET /api/admin/snacks 
 * (SOLO ADMIN) Obtiene todos los snacks de la BD central agrupados por multiplex.
 */
export const getAdminSnacks = () =>
  apiFetch('/api/admin/snacks')

/** * GET /api/admin/multiplexes/{multiplexId}/snacks
 * (ADMIN/MANAGER) Lista el inventario completo (con o sin stock) de un multiplex específico.
 */
export const getAdminSnacksByMultiplex = (multiplexId) =>
  apiFetch(`/api/admin/multiplexes/${multiplexId}/snacks`)

/** * GET /api/admin/snacks/{id}
 * (ADMIN) Obtiene un snack por ID para editarlo.
 */
export const getSnackById = (id) =>
  apiFetch(`/api/admin/snacks/${id}`)

/** * POST /api/admin/snacks
 * (ADMIN) Crea un nuevo snack en el sistema.
 */
export const createSnack = (data) =>
  apiFetch('/api/admin/snacks', {
    method: 'POST',
    body: JSON.stringify(data),
  })

/** * PUT /api/admin/snacks/{id}
 * (ADMIN) Actualiza los datos o el inventario de un snack.
 */
export const updateSnack = (id, data) =>
  apiFetch(`/api/admin/snacks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

/** * DELETE /api/admin/snacks/{id}
 * (ADMIN) Elimina un snack del catálogo.
 */
export const deleteSnack = (id) =>
  apiFetch(`/api/admin/snacks/${id}`, {
    method: 'DELETE',
  })