/**
 * snackService.js — CRUD snacks + catálogo público con fallback local si el API no responde.
 */

import { apiFetch } from './api'
import { snacksData } from '../data/mockSnacksData'

const mapLocalSnackToApi = (snack) => ({
  idSnack: snack.id,
  nameSnack: snack.name,
  descriptionSnack: snack.description,
  priceSnack: snack.price,
  quantitySnack: 50,
})

const getLocalSnacksCatalog = () => snacksData.map(mapLocalSnackToApi)

/** GET /api/admin/snacks — Lista todos los snacks (fallback a mock local) */
export const getAllSnacks = async () => {
  try {
    const data = await apiFetch('/api/admin/snacks')
    if (Array.isArray(data) && data.length > 0) return data
    return getLocalSnacksCatalog()
  } catch {
    return getLocalSnacksCatalog()
  }
}

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
