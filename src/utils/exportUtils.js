/**
 * exportUtils.js
 * Utilidades para exportar reportes a PDF y CSV (Excel-compatible).
 * 
 * Dependencias necesarias:
 *   npm install jspdf jspdf-autotable
 *   
 * NOTA: No se usa 'xlsx' (SheetJS) debido a vulnerabilidades de seguridad
 *       sin fix disponible (GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9).
 *       En su lugar se genera CSV con BOM que Excel abre nativamente.
 */

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const formatCOP = (value) => {
  if (!value || isNaN(value)) return '$0'
  return '$' + Number(value).toLocaleString('es-CO')
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

/* ============================================================
   PDF EXPORTS
   ============================================================ */

/**
 * Exporta el Dashboard General a PDF.
 * @param {Object} data - { kpis, ticketData, endDate, selectedMultiplex }
 */
export function exportDashboardToPDF(data) {
  const { kpis, ticketData, endDate, selectedMultiplex } = data
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14
  let y = 20

  // Header
  doc.setFillColor(200, 22, 122)
  doc.rect(0, 0, pageWidth, 18, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('CINEPACHO — Reporte General', margin, 12)

  y = 28
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Período: ${formatDate(ticketData?.startDate)} — ${formatDate(endDate)}`, margin, y)
  if (selectedMultiplex && selectedMultiplex !== 'all') {
    y += 5
    doc.text(`Sede: ${selectedMultiplex}`, margin, y)
  }

  // KPIs
  y += 10
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Indicadores Principales', margin, y)

  const kpiData = [
    ['Ingresos Totales', formatCOP(kpis?.totalRevenue)],
    ['Ingresos Tickets', formatCOP(kpis?.ticketRevenue)],
    ['Ingresos Snacks', formatCOP(kpis?.snackRevenue)],
    ['Boletas Vendidas', (kpis?.totalTickets || 0).toLocaleString('es-CO')],
    ['Snacks Vendidos', (kpis?.totalSnacks || 0).toLocaleString('es-CO')],
    ['Sedes Activas', String(ticketData?.multiplexes?.length || 0)],
  ]

  autoTable(doc, {
    startY: y + 4,
    head: [['Métrica', 'Valor']],
    body: kpiData,
    theme: 'grid',
    headStyles: { fillColor: [200, 22, 122], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { left: margin, right: margin },
  })

  let finalY = doc.lastAutoTable?.finalY || y + 40
  if (finalY > 250) { doc.addPage(); finalY = 20 }

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalle por Sede', margin, finalY + 10)

  const multiplexRows = ticketData?.multiplexes?.map((mp) => {
    const ticketRev = mp.days?.reduce(
      (sum, d) => sum + d.screenings?.reduce((s, sc) => s + Number(sc.totalAmount || 0), 0), 0
    ) || 0
    const tickets = mp.days?.reduce(
      (sum, d) => sum + d.screenings?.reduce((s, sc) => s + (sc.ticketsQuantity || 0), 0), 0
    ) || 0
    return [mp.multiplexName, formatCOP(ticketRev), tickets.toLocaleString('es-CO')]
  }) || []

  autoTable(doc, {
    startY: finalY + 14,
    head: [['Sede', 'Ingresos Tickets', 'Boletas']],
    body: multiplexRows,
    theme: 'striped',
    headStyles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2 },
    margin: { left: margin, right: margin },
  })

  finalY = doc.lastAutoTable?.finalY || finalY + 40
  if (finalY > 250) { doc.addPage(); finalY = 20 }

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Top Películas', margin, finalY + 10)

  const movieRows = kpis?.topMovies?.map((m) => [m.name, formatCOP(m.amount)]) || []

  autoTable(doc, {
    startY: finalY + 14,
    head: [['Película', 'Recaudación']],
    body: movieRows,
    theme: 'striped',
    headStyles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2 },
    margin: { left: margin, right: margin },
  })

  doc.save(`reporte-general-${endDate}.pdf`)
}

/**
 * Exporta el Reporte de Tickets a PDF.
 * @param {Object} data - { ticketData, endDate, selectedMultiplex }
 */
export function exportTicketsReportToPDF(data) {
  const { ticketData, endDate, selectedMultiplex } = data
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14
  let y = 20

  doc.setFillColor(200, 22, 122)
  doc.rect(0, 0, pageWidth, 18, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('CINEPACHO — Reporte de Ventas Tickets', margin, 12)

  y = 28
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(10)
  doc.text(`Período: ${formatDate(ticketData?.startDate)} — ${formatDate(endDate)}`, margin, y)
  if (selectedMultiplex && selectedMultiplex !== 'all') {
    y += 5
    doc.text(`Sede filtrada: ${selectedMultiplex}`, margin, y)
  }

  const rows = []
  ticketData?.multiplexes?.forEach((mp) => {
    mp.days?.forEach((day) => {
      day.screenings?.forEach((s) => {
        rows.push([
          mp.multiplexName,
          formatDate(day.date),
          s.movieTitle,
          s.ticketsQuantity || 0,
          formatCOP(s.totalAmount),
        ])
      })
    })
  })

  autoTable(doc, {
    startY: y + 10,
    head: [['Sede', 'Fecha', 'Película', 'Boletas', 'Total']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [200, 22, 122], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2 },
    margin: { left: margin, right: margin },
  })

  doc.save(`reporte-tickets-${endDate}.pdf`)
}

/**
 * Exporta el Reporte de Snacks a PDF.
 * @param {Object} data - { snackData, endDate, selectedMultiplex }
 */
export function exportSnacksReportToPDF(data) {
  const { snackData, endDate, selectedMultiplex } = data
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14
  let y = 20

  doc.setFillColor(255, 215, 0)
  doc.rect(0, 0, pageWidth, 18, 'F')
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('CINEPACHO — Reporte de Ventas Snacks', margin, 12)

  y = 28
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(10)
  doc.text(`Período: ${formatDate(snackData?.startDate)} — ${formatDate(endDate)}`, margin, y)
  if (selectedMultiplex && selectedMultiplex !== 'all') {
    y += 5
    doc.text(`Sede filtrada: ${selectedMultiplex}`, margin, y)
  }

  const rows = []
  snackData?.multiplexes?.forEach((mp) => {
    mp.days?.forEach((day) => {
      day.snacks?.forEach((s) => {
        rows.push([
          mp.multiplexName,
          formatDate(day.date),
          s.snackName,
          s.snacksQuantity || 0,
          formatCOP(s.totalAmount),
        ])
      })
    })
  })

  autoTable(doc, {
    startY: y + 10,
    head: [['Sede', 'Fecha', 'Producto', 'Cantidad', 'Total']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [255, 193, 7], textColor: 0, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2 },
    margin: { left: margin, right: margin },
  })

  doc.save(`reporte-snacks-${endDate}.pdf`)
}

/* ============================================================
   CSV EXPORTS (Excel-compatible, sin librerías externas)
   ============================================================ */

/**
 * Convierte un array de objetos a CSV con BOM para UTF-8 y descarga.
 * @param {Array} rows - Array de objetos planos
 * @param {string} fileName - Nombre del archivo sin extensión
 */
export function exportToCSV(rows, fileName) {
  if (!rows || rows.length === 0) return

  const headers = Object.keys(rows[0])
  const escape = (str) => {
    const val = str == null ? '' : String(str)
    if (val.includes(',') || val.includes('"') || val.includes('')) {
      return '"' + val.replace(/"/g, '""') + '"'
    }
    return val
  }

  const csvLines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ]

  const csvContent = '﻿' + csvLines.join('') // BOM + contenido
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${fileName}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Prepara datos del Dashboard para CSV.
 */
export function prepareDashboardCSVData(kpis, ticketData, snackData) {
  const rows = []
  ticketData?.multiplexes?.forEach((mp) => {
    const ticketRev = mp.days?.reduce(
      (sum, d) => sum + d.screenings?.reduce((s, sc) => s + Number(sc.totalAmount || 0), 0), 0
    ) || 0
    const tickets = mp.days?.reduce(
      (sum, d) => sum + d.screenings?.reduce((s, sc) => s + (sc.ticketsQuantity || 0), 0), 0
    ) || 0

    const snackMp = snackData?.multiplexes?.find(
      (s) => s.multiplexId === mp.multiplexId
    )
    const snackRev = snackMp?.days?.reduce(
      (sum, d) => sum + d.snacks?.reduce((s, sn) => s + Number(sn.totalAmount || 0), 0), 0
    ) || 0
    const snackQty = snackMp?.days?.reduce(
      (sum, d) => sum + d.snacks?.reduce((s, sn) => s + (sn.snacksQuantity || 0), 0), 0
    ) || 0

    rows.push({
      Sede: mp.multiplexName,
      'Ingresos Tickets': ticketRev,
      'Ingresos Snacks': snackRev,
      'Total Ingresos': ticketRev + snackRev,
      'Boletas Vendidas': tickets,
      'Unidades Snacks': snackQty,
    })
  })
  return rows
}

/**
 * Prepara datos de Tickets para CSV.
 */
export function prepareTicketsCSVData(ticketData) {
  const rows = []
  ticketData?.multiplexes?.forEach((mp) => {
    mp.days?.forEach((day) => {
      day.screenings?.forEach((s) => {
        rows.push({
          Sede: mp.multiplexName,
          Fecha: day.date,
          'ID Funcion': s.screeningId,
          'ID Pelicula': s.movieId,
          Pelicula: s.movieTitle,
          Boletas: s.ticketsQuantity || 0,
          Total: Number(s.totalAmount || 0),
        })
      })
    })
  })
  return rows
}

/**
 * Prepara datos de Snacks para CSV.
 */
export function prepareSnacksCSVData(snackData) {
  const rows = []
  snackData?.multiplexes?.forEach((mp) => {
    mp.days?.forEach((day) => {
      day.snacks?.forEach((s) => {
        rows.push({
          Sede: mp.multiplexName,
          Fecha: day.date,
          'ID Producto': s.snackId,
          Producto: s.snackName,
          Cantidad: s.snacksQuantity || 0,
          Total: Number(s.totalAmount || 0),
        })
      })
    })
  })
  return rows
}