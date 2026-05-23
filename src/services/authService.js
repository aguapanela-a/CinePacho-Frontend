/**
 * authService.js — Autenticación de clientes (registro, login, verificación)
 */

import { apiFetch } from './api'

/**
 * POST /api/auth/register
 * @param {{ email: string, name: string, password: string, userType?: string }} data
 */
export const register = (data) =>
  apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })

/**
 * POST /api/auth/login
 * @param {{ email: string, password: string }} data
 */
export const login = (data) =>
  apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })

/**
 * GET /api/auth/verify?token=...
 * @param {string} token
 */
export const verifyEmail = (token) =>
  apiFetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
