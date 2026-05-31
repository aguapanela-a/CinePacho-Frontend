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
  })