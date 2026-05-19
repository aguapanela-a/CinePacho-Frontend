/**
 * snackService.js
 * Servicios para el CRUD de Snacks en el panel de administración.
 * Endpoints: /admin/snacks
 */

import { apiFetch } from './api'

/** GET /admin/snacks — Lista todos los snacks */
export const getAllSnacks = () =>
  apiFetch('/api/admin/snacks')

/** GET /admin/snacks/{id} — Obtiene un snack por ID */
export const getSnackById = (id) =>
  apiFetch(`/api/admin/snacks/${id}`)

/**
 * POST /admin/snacks — Crea un nuevo snack
 * @param {{ nameSnack, descriptionSnack, priceSnack, quantitySnack }} data
 */
export const createSnack = (data) =>
  apiFetch('/api/admin/snacks', {
    method: 'POST',
    body: JSON.stringify(data),
  })

/**
 * PUT /admin/snacks/{id} — Actualiza un snack existente
 * @param {string} id
 * @param {{ nameSnack, descriptionSnack, priceSnack, quantitySnack }} data
 */
export const updateSnack = (id, data) =>
  apiFetch(`/api/admin/snacks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
