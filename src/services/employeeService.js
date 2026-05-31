/**
 * employeeService.js
 * Servicios para la gestión de empleados
 */

import { apiFetch } from './api'

/**
 * POST /admin/register_employee
 * Registra un nuevo empleado en el sistema
 * @param {Object} data - Datos del empleado
 */
export const registerEmployee = (data) =>
  apiFetch('/api/admin/register_employee', {
    method: 'POST',
    body: JSON.stringify(data),
  })

/**
 * PUT /api/checkout/employee/billing/{billingId}/scan
 * Escanea un código QR de una factura
 * @param {string} billingId - ID de la factura
 */
export const scanTicket = (billingId) =>
  apiFetch(`/api/checkout/employee/billing/${billingId}/scan`, {
    method: 'PUT',
  })
