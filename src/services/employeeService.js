/**
 * employeeService.js
 * Servicios para la gestión de empleados
 */

import { apiFetch } from './api'

/**
 * POST registrar empleado o manager
 * /api/admin/register_employee
 */
export const registerEmployee = (data) =>
  apiFetch('/api/admin/register_employee', {
    method: 'POST',
    body: JSON.stringify(data),
<<<<<<< HEAD
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
=======
  })
>>>>>>> e78fb1fc8227ba85aea4ace98062b7bc17aa41c8
