/**
 * reportService.js
 * Servicios de reportes administrativos.
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

/**
 * GET /api/admin/reports/sales/{multiplexId}?endDate=YYYY-MM-DD
 * Reporte de ventas de tickets para un multiplex específico.
 */
export const getSalesReportByMultiplex = (multiplexId, endDate) =>
  apiFetch(`/api/admin/reports/sales/${multiplexId}?endDate=${endDate}`, {
    method: 'GET',
  })

/**
 * GET /api/admin/reports/snacks/{multiplexId}/monthly?endDate=YYYY-MM-DD
 * Reporte de ventas de snacks para un multiplex específico.
 */
export const getSnackSalesReportByMultiplex = (multiplexId, endDate) =>
  apiFetch(`/api/admin/reports/snacks/${multiplexId}/monthly?endDate=${endDate}`, {
    method: 'GET',
  })