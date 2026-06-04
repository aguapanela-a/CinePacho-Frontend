import { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp,
  Ticket,
  Popcorn,
  Calendar,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Filter,
  Building2,
  Film,
  Package,
} from 'lucide-react'
import { generateSalesReport, generateSnackSalesReport } from '../../services/reportService'
import { getAllMultiplexes } from '../../services/multiplexService'
import {
  exportTicketsReportToPDF,
  exportSnacksReportToPDF,
  exportToCSV,
  prepareTicketsCSVData,
  prepareSnacksCSVData,
} from '../../utils/exportUtils'

const formatCOP = (value) => {
  if (!value || isNaN(value)) return '$0'
  return '$' + Number(value).toLocaleString('es-CO')
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

const todayISO = () => new Date().toISOString().split('T')[0]

// Helpers resilientes para propiedades de multiplex
const getMultiplexId = (m) => m?.id || m?.multiplexId || ''
const getMultiplexName = (m) => m?.nameMultiplex || m?.name || m?.multiplexName || 'Sin nombre'

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('tickets')
  const [endDate, setEndDate] = useState(todayISO())
  const [selectedMultiplex, setSelectedMultiplex] = useState('all')
  const [multiplexList, setMultiplexList] = useState([])
  const [ticketData, setTicketData] = useState(null)
  const [snackData, setSnackData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [expandedMultiplex, setExpandedMultiplex] = useState(null)
  const [expandedDay, setExpandedDay] = useState(null)

  useEffect(() => {
    getAllMultiplexes()
      .then((data) => {
        if (Array.isArray(data)) setMultiplexList(data)
        else if (data?.content) setMultiplexList(data.content)
        else if (data?.data) setMultiplexList(data.data)
      })
      .catch(() => setMultiplexList([]))
  }, [])

  const loadReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const [tickets, snacks] = await Promise.all([
        generateSalesReport(endDate),
        generateSnackSalesReport(endDate),
      ])
      setTicketData(tickets)
      setSnackData(snacks)
    } catch (err) {
      setError(err.message || 'Error al cargar los reportes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [endDate])

  const filteredTicketData = useMemo(() => {
    if (!ticketData || selectedMultiplex === 'all') return ticketData
    const filtered = ticketData.multiplexes?.filter(
      (m) => m.multiplexId === selectedMultiplex
    )
    return { ...ticketData, multiplexes: filtered || [] }
  }, [ticketData, selectedMultiplex])

  const filteredSnackData = useMemo(() => {
    if (!snackData || selectedMultiplex === 'all') return snackData
    const filtered = snackData.multiplexes?.filter(
      (m) => m.multiplexId === selectedMultiplex
    )
    return { ...snackData, multiplexes: filtered || [] }
  }, [snackData, selectedMultiplex])

  const toggleMultiplex = (id) => {
    setExpandedMultiplex((prev) => (prev === id ? null : id))
    setExpandedDay(null)
  }

  const toggleDay = (key) => {
    setExpandedDay((prev) => (prev === key ? null : key))
  }

  const ticketSummary = useMemo(() => {
    if (!filteredTicketData) return null
    let totalRevenue = 0
    let totalTickets = 0
    let totalScreenings = 0
    const multiplexes = filteredTicketData.multiplexes?.map((mp) => {
      let mpRevenue = 0
      let mpTickets = 0
      let mpScreenings = 0
      mp.days?.forEach((day) => {
        day.screenings?.forEach((s) => {
          mpRevenue += Number(s.totalAmount || 0)
          mpTickets += s.ticketsQuantity || 0
          mpScreenings += 1
        })
      })
      totalRevenue += mpRevenue
      totalTickets += mpTickets
      totalScreenings += mpScreenings
      return { ...mp, mpRevenue, mpTickets, mpScreenings }
    }) || []
    return { totalRevenue, totalTickets, totalScreenings, multiplexes }
  }, [filteredTicketData])

  const snackSummary = useMemo(() => {
    if (!filteredSnackData) return null
    let totalRevenue = 0
    let totalQuantity = 0
    let totalItems = 0
    const multiplexes = filteredSnackData.multiplexes?.map((mp) => {
      let mpRevenue = 0
      let mpQuantity = 0
      let mpItems = 0
      mp.days?.forEach((day) => {
        day.snacks?.forEach((s) => {
          mpRevenue += Number(s.totalAmount || 0)
          mpQuantity += s.snacksQuantity || 0
          mpItems += 1
        })
      })
      totalRevenue += mpRevenue
      totalQuantity += mpQuantity
      totalItems += mpItems
      return { ...mp, mpRevenue, mpQuantity, mpItems }
    }) || []
    return { totalRevenue, totalQuantity, totalItems, multiplexes }
  }, [filteredSnackData])

  const handleExportPDF = () => {
    if (activeTab === 'tickets' && !filteredTicketData) return
    if (activeTab === 'snacks' && !filteredSnackData) return
    setExporting(true)
    try {
      if (activeTab === 'tickets') {
        exportTicketsReportToPDF({
          ticketData: filteredTicketData,
          endDate,
          selectedMultiplex: selectedMultiplex === 'all' ? 'Todas las sedes' : selectedMultiplex,
        })
      } else {
        exportSnacksReportToPDF({
          snackData: filteredSnackData,
          endDate,
          selectedMultiplex: selectedMultiplex === 'all' ? 'Todas las sedes' : selectedMultiplex,
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setExporting(false)
    }
  }

  const handleExportCSV = () => {
    if (activeTab === 'tickets' && !filteredTicketData) return
    if (activeTab === 'snacks' && !filteredSnackData) return
    setExporting(true)
    try {
      if (activeTab === 'tickets') {
        const rows = prepareTicketsCSVData(filteredTicketData)
        exportToCSV(rows, `reporte-tickets-${endDate}`)
      } else {
        const rows = prepareSnacksCSVData(filteredSnackData)
        exportToCSV(rows, `reporte-snacks-${endDate}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setExporting(false)
    }
  }

  const selectedMultiplexName =
    selectedMultiplex === 'all'
      ? 'Todas las sedes'
      : getMultiplexName(multiplexList.find((m) => getMultiplexId(m) === selectedMultiplex))

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wider text-white">
            Reportes Detallados
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            {ticketData?.startDate && ticketData?.endDate
              ? `${ticketData.startDate} → ${ticketData.endDate} • ${selectedMultiplexName}`
              : 'Análisis específico por sede, día y función.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Fecha */}
          <div className="flex items-center gap-2 bg-surface/50 border border-border/50 rounded-xl px-3 py-2">
            <Calendar size={16} className="text-magenta" />
            <input
              type="date"
              value={endDate}
              max={todayISO()}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-white text-sm outline-none font-mono"
            />
          </div>

          {/* Multiplex */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-surface/50 border border-border/50 rounded-xl px-3 py-2 cursor-pointer hover:border-magenta/40 transition-colors">
              <Filter size={16} className="text-cyan-400" />
              <select
                value={selectedMultiplex}
                onChange={(e) => {
                  setSelectedMultiplex(e.target.value)
                  setExpandedMultiplex(null)
                  setExpandedDay(null)
                }}
                className="bg-transparent text-white text-sm outline-none cursor-pointer appearance-none pr-6"
              >
                <option value="all" className="bg-carbon text-white">Todas las sedes</option>
                {multiplexList.map((m) => (
                  <option key={getMultiplexId(m)} value={getMultiplexId(m)} className="bg-carbon text-white">
                    {getMultiplexName(m)}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="text-text-secondary absolute right-3 pointer-events-none" />
            </div>
          </div>

          {/* Exportar PDF */}
          <button
            onClick={handleExportPDF}
            disabled={exporting || (!ticketSummary && !snackSummary)}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold tracking-wider uppercase hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            PDF
          </button>

          {/* Exportar CSV */}
          <button
            onClick={handleExportCSV}
            disabled={exporting || (!ticketSummary && !snackSummary)}
            className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-bold tracking-wider uppercase hover:bg-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={14} />
            CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-surface/30 border border-border/30 rounded-xl p-1 w-fit">
        <button
          onClick={() => { setActiveTab('tickets'); setExpandedMultiplex(null); setExpandedDay(null) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
            activeTab === 'tickets'
              ? 'bg-magenta/20 text-magenta border border-magenta/30'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <Ticket size={14} />
          Ventas Tickets
        </button>
        <button
          onClick={() => { setActiveTab('snacks'); setExpandedMultiplex(null); setExpandedDay(null) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
            activeTab === 'snacks'
              ? 'bg-gold/20 text-gold border border-gold/30'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <Popcorn size={14} />
          Ventas Snacks
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-400">
          <AlertTriangle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20 text-text-secondary">
          <Loader2 size={32} className="animate-spin mr-3" />
          <span className="text-sm font-medium">Generando reporte...</span>
        </div>
      )}

      {!loading && activeTab === 'tickets' && ticketSummary && (
        <>
          {/* KPIs Tickets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface/40 border border-border/30 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-magenta/10 flex items-center justify-center">
                  <DollarSign size={18} className="text-magenta" />
                </div>
                <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">
                  Ingresos Tickets
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-white">
                {formatCOP(ticketSummary.totalRevenue)}
              </p>
            </div>
            <div className="bg-surface/40 border border-border/30 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Ticket size={18} className="text-cyan-400" />
                </div>
                <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">
                  Boletas Vendidas
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-white">
                {ticketSummary.totalTickets.toLocaleString('es-CO')}
              </p>
            </div>
            <div className="bg-surface/40 border border-border/30 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Film size={18} className="text-green-400" />
                </div>
                <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">
                  Funciones Registradas
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-white">
                {ticketSummary.totalScreenings.toLocaleString('es-CO')}
              </p>
            </div>
          </div>

          {/* Lista expandible por Multiplex */}
          <div className="bg-surface/40 border border-border/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-bold font-display tracking-widest uppercase text-white">
                  Desglose por Sede
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Expande para ver detalle por día y función
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-magenta/10 flex items-center justify-center">
                <Building2 size={20} className="text-magenta" />
              </div>
            </div>

            <div className="space-y-3">
              {ticketSummary.multiplexes.map((mp) => (
                <div
                  key={mp.multiplexId}
                  className="border border-border/30 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleMultiplex(mp.multiplexId)}
                    className="w-full flex items-center justify-between p-4 bg-carbon/40 hover:bg-carbon/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedMultiplex === mp.multiplexId ? (
                        <ChevronDown size={16} className="text-magenta" />
                      ) : (
                        <ChevronRight size={16} className="text-text-secondary" />
                      )}
                      <span className="text-sm font-bold text-white">{mp.multiplexName}</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs">
                      <span className="text-text-secondary">
                        <span className="text-cyan-400 font-bold">{mp.mpTickets}</span> boletas
                      </span>
                      <span className="text-magenta font-bold">
                        {formatCOP(mp.mpRevenue)}
                      </span>
                    </div>
                  </button>

                  {expandedMultiplex === mp.multiplexId && (
                    <div className="p-4 space-y-2 bg-surface/20">
                      {mp.days?.length > 0 ? (
                        mp.days.map((day) => {
                          const dayKey = `${mp.multiplexId}-${day.date}`
                          const dayRevenue = day.screenings?.reduce(
                            (sum, s) => sum + Number(s.totalAmount || 0), 0
                          ) || 0
                          const dayTickets = day.screenings?.reduce(
                            (sum, s) => sum + (s.ticketsQuantity || 0), 0
                          ) || 0
                          return (
                            <div key={day.date} className="border border-border/20 rounded-lg overflow-hidden">
                              <button
                                onClick={() => toggleDay(dayKey)}
                                className="w-full flex items-center justify-between p-3 bg-carbon/30 hover:bg-carbon/50 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  {expandedDay === dayKey ? (
                                    <ChevronDown size={14} className="text-gold" />
                                  ) : (
                                    <ChevronRight size={14} className="text-text-secondary" />
                                  )}
                                  <span className="text-xs font-medium text-white">
                                    {formatDate(day.date)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="text-text-secondary">
                                    {day.screenings?.length || 0} funciones
                                  </span>
                                  <span className="text-cyan-400 font-bold">{dayTickets}</span>
                                  <span className="text-magenta font-bold">
                                    {formatCOP(dayRevenue)}
                                  </span>
                                </div>
                              </button>

                              {expandedDay === dayKey && (
                                <div className="p-3">
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr className="text-[10px] font-bold tracking-widest text-text-secondary uppercase border-b border-border/20">
                                        <th className="pb-2">Película</th>
                                        <th className="pb-2 text-right">Boletas</th>
                                        <th className="pb-2 text-right">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/10 text-xs">
                                      {day.screenings?.map((s) => (
                                        <tr key={s.screeningId} className="hover:bg-white/[0.02]">
                                          <td className="py-2">
                                            <span className="text-white font-medium">{s.movieTitle}</span>
                                            <span className="text-text-secondary text-[10px] block font-mono">
                                              ID: {s.screeningId?.slice(0, 8)}...
                                            </span>
                                          </td>
                                          <td className="py-2 text-right text-cyan-400 font-bold">
                                            {s.ticketsQuantity}
                                          </td>
                                          <td className="py-2 text-right text-magenta font-bold">
                                            {formatCOP(s.totalAmount)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-text-secondary text-xs text-center py-4">
                          No hay funciones registradas para esta sede en el período
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!loading && activeTab === 'snacks' && snackSummary && (
        <>
          {/* KPIs Snacks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface/40 border border-border/30 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                  <DollarSign size={18} className="text-gold" />
                </div>
                <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">
                  Ingresos Snacks
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-white">
                {formatCOP(snackSummary.totalRevenue)}
              </p>
            </div>
            <div className="bg-surface/40 border border-border/30 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Popcorn size={18} className="text-orange-400" />
                </div>
                <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">
                  Unidades Vendidas
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-white">
                {snackSummary.totalQuantity.toLocaleString('es-CO')}
              </p>
            </div>
            <div className="bg-surface/40 border border-border/30 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Package size={18} className="text-purple-400" />
                </div>
                <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">
                  Productos Distintos
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-white">
                {snackSummary.totalItems.toLocaleString('es-CO')}
              </p>
            </div>
          </div>

          {/* Lista expandible por Multiplex Snacks */}
          <div className="bg-surface/40 border border-border/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-bold font-display tracking-widest uppercase text-white">
                  Desglose por Sede — Snacks
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Expande para ver detalle por día y producto
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <Building2 size={20} className="text-gold" />
              </div>
            </div>

            <div className="space-y-3">
              {snackSummary.multiplexes.map((mp) => (
                <div
                  key={mp.multiplexId}
                  className="border border-border/30 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleMultiplex(mp.multiplexId)}
                    className="w-full flex items-center justify-between p-4 bg-carbon/40 hover:bg-carbon/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedMultiplex === mp.multiplexId ? (
                        <ChevronDown size={16} className="text-gold" />
                      ) : (
                        <ChevronRight size={16} className="text-text-secondary" />
                      )}
                      <span className="text-sm font-bold text-white">{mp.multiplexName}</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs">
                      <span className="text-text-secondary">
                        <span className="text-orange-400 font-bold">{mp.mpQuantity}</span> unidades
                      </span>
                      <span className="text-gold font-bold">{formatCOP(mp.mpRevenue)}</span>
                    </div>
                  </button>

                  {expandedMultiplex === mp.multiplexId && (
                    <div className="p-4 space-y-2 bg-surface/20">
                      {mp.days?.length > 0 ? (
                        mp.days.map((day) => {
                          const dayKey = `${mp.multiplexId}-${day.date}`
                          const dayRevenue = day.snacks?.reduce(
                            (sum, s) => sum + Number(s.totalAmount || 0), 0
                          ) || 0
                          const dayQty = day.snacks?.reduce(
                            (sum, s) => sum + (s.snacksQuantity || 0), 0
                          ) || 0
                          return (
                            <div key={day.date} className="border border-border/20 rounded-lg overflow-hidden">
                              <button
                                onClick={() => toggleDay(dayKey)}
                                className="w-full flex items-center justify-between p-3 bg-carbon/30 hover:bg-carbon/50 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  {expandedDay === dayKey ? (
                                    <ChevronDown size={14} className="text-orange-400" />
                                  ) : (
                                    <ChevronRight size={14} className="text-text-secondary" />
                                  )}
                                  <span className="text-xs font-medium text-white">
                                    {formatDate(day.date)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="text-text-secondary">
                                    {day.snacks?.length || 0} productos
                                  </span>
                                  <span className="text-orange-400 font-bold">{dayQty}</span>
                                  <span className="text-gold font-bold">{formatCOP(dayRevenue)}</span>
                                </div>
                              </button>

                              {expandedDay === dayKey && (
                                <div className="p-3">
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr className="text-[10px] font-bold tracking-widest text-text-secondary uppercase border-b border-border/20">
                                        <th className="pb-2">Producto</th>
                                        <th className="pb-2 text-right">Cantidad</th>
                                        <th className="pb-2 text-right">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/10 text-xs">
                                      {day.snacks?.map((s) => (
                                        <tr key={s.snackId} className="hover:bg-white/[0.02]">
                                          <td className="py-2">
                                            <span className="text-white font-medium">{s.snackName}</span>
                                            <span className="text-text-secondary text-[10px] block font-mono">
                                              ID: {s.snackId?.slice(0, 8)}...
                                            </span>
                                          </td>
                                          <td className="py-2 text-right text-orange-400 font-bold">
                                            {s.snacksQuantity}
                                          </td>
                                          <td className="py-2 text-right text-gold font-bold">
                                            {formatCOP(s.totalAmount)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-text-secondary text-xs text-center py-4">
                          No hay ventas de snacks registradas para esta sede
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}