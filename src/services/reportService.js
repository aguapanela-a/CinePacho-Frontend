/**
 * reportService.js
 * Servicios de reportes administrativos.
 *
 * Los contratos deben respetar exactamente las rutas definidas en el backend.
 */

import { apiFetch } from './api'

/**
 * POST /api/admin/reports/snacks
 * Genera reporte mensual de ventas de snacks hasta la fecha final indicada.
 * @param {string} endDate - Fecha final del reporte en formato YYYY-MM-DD
 */
export const generateSnackSalesReport = (endDate) =>
  apiFetch('/api/admin/reports/snacks', {
    method: 'POST',
    body: JSON.stringify({ endDate }),
  })

/**
 * POST /api/admin/reports/sales
 * Genera reporte mensual de ventas hasta la fecha final indicada.
 * @param {string} endDate - Fecha final del reporte en formato YYYY-MM-DD
 */
export const generateSalesReport = (endDate) =>
  apiFetch('/api/admin/reports/sales', {
    method: 'POST',
    body: JSON.stringify({ endDate }),
  })
