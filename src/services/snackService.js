/**
 * snackService.js — CRUD snacks + catálogo público con fallback local si el API no responde.
 */

import { apiFetch } from './api'

/** GET /api/snacks — Lista snacks disponibles para compra (BUYER, EMPLOYEE) */
export const getAllSnacks = async () => {
  try {
    const data = await apiFetch('/api/snacks')
    if (Array.isArray(data) && data.length > 0) return data
    return []
  } catch {
    return []
  }
}

/** GET /api/admin/snacks — Lista completa de snacks (ADMIN, MANAGER) */
export const getAdminSnacks = () =>
  apiFetch('/api/admin/snacks')

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
