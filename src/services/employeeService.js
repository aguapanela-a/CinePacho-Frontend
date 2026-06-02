/**
 * employeeService.js
 * Servicios para la gestión de empleados.
 */

import { apiFetch } from './api'

/**
 * POST /api/admin/register_employee
 * Registra un nuevo empleado o manager.
 */
export const getEmployees = () =>
  apiFetch('/api/admin/employees',{
    method: 'GET',
  })




export const registerEmployee = (data) =>
  apiFetch('/api/admin/register_employee', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateEmployee = (data) =>
  apiFetch('/api/admin/update_employee', {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const deleteEmployee = async (id) => {
  await apiFetch(`/api/admin/delete_employee/${id}`, {
    method: 'DELETE',
  })
}

/**
 * PUT /api/checkout/employee/billing/{billingId}/scan
 * Escanea el código QR de una factura para validar la entrada.
 * @param {string} billingId - UUID de la factura
 */
export const scanTicket = (billingId) =>
  apiFetch(`/api/checkout/employee/billing/${billingId}/scan`, {
    method: 'PUT',
  })