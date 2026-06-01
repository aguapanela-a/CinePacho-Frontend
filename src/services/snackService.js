/**
 * snackService.js — CRUD snacks + catálogo público con fallback local si el API no responde.
 */

import { apiFetch } from './api'

/** GET /api/snacks/{multiplexId} — Lista snacks disponibles para compra (BUYER, EMPLOYEE) */
export const getAllSnacks = async (multiplexId) => {
  if (!multiplexId) {
    console.warn('getAllSnacks: multiplexId es obligatorio')
    return []
  }

  try {
    const data = await apiFetch(`/api/snacks/${multiplexId}`)
    if (Array.isArray(data)) return data
    return []
  } catch {
    return []
  }
}

export const getAdminSnacks = () =>
  apiFetch('/api/admin/snacks')

export const getAdminSnacksByMultiplex = (multiplexId) =>
  apiFetch(`/api/admin/multiplexes/${multiplexId}/snacks`)

export const getSnackById = (id) =>
  apiFetch(`/api/admin/snacks/${id}`)

export const createSnack = (data) =>
  apiFetch('/api/admin/snacks', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateSnack = (id, data) =>
  apiFetch(`/api/admin/snacks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
