import { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Ticket,
  Popcorn,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Film,
  Loader2,
  Calendar,
  Download,
  FileSpreadsheet,
} from 'lucide-react'
import { getMultiplexById } from '../../services/multiplexService'
import { getAdminSnacksByMultiplex } from '../../services/snackService'
import { generateSalesReport, generateSnackSalesReport } from '../../services/reportService'
import { exportDashboardToPDF, exportToCSV, prepareDashboardCSVData } from '../../utils/exportUtils'

const formatCOP = (value) => '$' + Number(value || 0).toLocaleString('es-CO')
const todayISO = () => new Date().toISOString().split('T')[0]

export default function MultiplexDashboard({ multiplexId }) {
  const [multiplex, setMultiplex]   = useState(null)
  const [lowStock, setLowStock]     = useState([])
  const [ticketData, setTicketData] = useState(null)
  const [snackData, setSnackData]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [endDate, setEndDate]       = useState(todayISO())
  const [exporting, setExporting]   = useState(false)

  // ── Carga ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!multiplexId) return

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [multiplexData, snacks, tickets, snackReport] = await Promise.all([
          getMultiplexById(multiplexId),
          getAdminSnacksByMultiplex(multiplexId),
          generateSalesReport(endDate),
          generateSnackSalesReport(endDate),
        ])

        setMultiplex(multiplexData)
        setLowStock((snacks || []).filter(item => item.quantitySnack <= 10))

        setTicketData({
          ...tickets,
          multiplexes: tickets?.multiplexes?.filter(m => m.multiplexId === multiplexId) || [],
        })
        setSnackData({
          ...snackReport,
          multiplexes: snackReport?.multiplexes?.filter(m => m.multiplexId === multiplexId) || [],
        })
      } catch (err) {
        setError(err.message || 'Error al cargar datos')
        setMultiplex(null)
        setLowStock([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [multiplexId, endDate])

  // ── KPIs ───────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    if (!ticketData || !snackData) return null

    let ticketRevenue = 0
    let totalTickets  = 0
    let snackRevenue  = 0
    let totalSnacks   = 0
    const movieMap    = new Map()

    ticketData.multiplexes?.forEach(mp => {
      mp.days?.forEach(day => {
        day.screenings?.forEach(s => {
          totalTickets  += s.ticketsQuantity || 0
          const amount   = Number(s.totalAmount || 0)
          ticketRevenue += amount
          movieMap.set(s.movieTitle, (movieMap.get(s.movieTitle) || 0) + amount)
        })
      })
    })

    snackData.multiplexes?.forEach(mp => {
      mp.days?.forEach(day => {
        day.snacks?.forEach(s => {
          totalSnacks  += s.snacksQuantity || 0
          snackRevenue += Number(s.totalAmount || 0)
        })
      })
    })

    const topMovies = Array.from(movieMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }))

    const transactions = []
    ticketData.multiplexes?.forEach(mp => {
      mp.days?.forEach(day => {
        day.screenings?.forEach(s => {
          transactions.push({
            id:      s.screeningId || s.movieTitle,
            concept: s.movieTitle,
            method:  'Taquilla',
            amount:  Number(s.totalAmount || 0),
            qty:     s.ticketsQuantity || 0,
          })
        })
      })
    })

    return {
      totalRevenue: ticketRevenue + snackRevenue,
      ticketRevenue,
      snackRevenue,
      totalTickets,
      totalSnacks,
      topMovies,
      transactions: transactions.slice(0, 8),
    }
  }, [ticketData, snackData])

  // ── Exportar ───────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    if (!kpis || !ticketData) return
    setExporting(true)
    try {
      exportDashboardToPDF({
        kpis,
        ticketData,
        endDate,
        selectedMultiplex: multiplex?.nameMultiplex || 'Sede',
      })
    } catch (e) {
      console.error(e)
    } finally {
      setExporting(false)
    }
  }

  const handleExportCSV = () => {
    if (!kpis || !ticketData || !snackData) return
    setExporting(true)
    try {
      const rows = prepareDashboardCSVData(kpis, ticketData, snackData)
      exportToCSV(rows, `dashboard-${multiplex?.nameMultiplex || 'sede'}-${endDate}`)
    } catch (e) {
      console.error(e)
    } finally {
      setExporting(false)
    }
  }

  // ── Stats cards ────────────────────────────────────────────────────────
  const stats = [
    {
      title: 'Ingresos Totales',
      value: kpis ? formatCOP(kpis.totalRevenue) : '—',
      sub:   kpis ? `Tickets: ${formatCOP(kpis.ticketRevenue)} • Snacks: ${formatCOP(kpis.snackRevenue)}` : 'Cargando...',
      icon:  DollarSign,
      color: 'text-green-400',
      bg:    'bg-green-500/10',
    },
    {
      title: 'Boletas Vendidas',
      value: kpis ? kpis.totalTickets.toLocaleString('es-CO') : '—',
      sub:   'Total del período',
      icon:  Ticket,
      color: 'text-magenta',
      bg:    'bg-magenta/10',
    },
    {
      title: 'Snacks Vendidos',
      value: kpis ? kpis.totalSnacks.toLocaleString('es-CO') : '—',
      sub:   kpis ? `${formatCOP(kpis.snackRevenue)} en ventas` : 'Cargando...',
      icon:  Popcorn,
      color: 'text-gold',
      bg:    'bg-gold/10',
    },
    {
      title: 'Alertas de Stock',
      value: String(lowStock.length),
      sub:   lowStock.length === 0 ? 'Todo en orden' : 'Productos por reponer',
      icon:  AlertTriangle,
      color: lowStock.length === 0 ? 'text-green-400' : 'text-yellow-400',
      bg:    lowStock.length === 0 ? 'bg-green-500/10' : 'bg-yellow-500/10',
    },
  ]

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wider text-white">
            Resumen Operativo
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            {ticketData?.startDate && ticketData?.endDate
              ? `${ticketData.startDate} → ${ticketData.endDate} • ${multiplex?.nameMultiplex || 'Sede'}`
              : `Sede: ${multiplex?.nameMultiplex || 'Cargando...'}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de fecha */}
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

          {/* Exportar PDF */}
          <button
            onClick={handleExportPDF}
            disabled={exporting || !kpis}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold tracking-wider uppercase hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            PDF
          </button>

          {/* Exportar CSV */}
          <button
            onClick={handleExportCSV}
            disabled={exporting || !kpis}
            className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-bold tracking-wider uppercase hover:bg-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={14} />
            CSV
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-400">
          <AlertTriangle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-text-secondary">
          <Loader2 size={32} className="animate-spin mr-3 text-magenta" />
          <span className="text-sm">Cargando métricas...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.title} className="bg-surface/40 border border-border/30 rounded-2xl p-5 hover:border-magenta/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon size={20} className={stat.color} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase block">
                      {stat.title}
                    </span>
                    <span className="text-2xl font-display font-bold text-white tracking-wide block">
                      {stat.value}
                    </span>
                    <span className="text-[10px] text-text-secondary block">{stat.sub}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Alertas de Stock */}
            <div className="lg:col-span-1 bg-surface/30 border border-border/30 rounded-2xl p-5 space-y-4 flex flex-col">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={16} className="text-yellow-500" />
                  <h2 className="text-sm font-bold font-display tracking-widest uppercase text-white">
                    Alertas de Stock
                  </h2>
                </div>
                <p className="text-xs text-text-secondary">Insumos por debajo del mínimo.</p>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto max-h-[280px] pr-1 custom-scrollbar">
                {lowStock.length > 0 ? lowStock.map(item => (
                  <div
                    key={item.idSnack || item.id}
                    className="bg-carbon border border-border/40 rounded-2xl px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={16} className={item.quantitySnack === 0 ? 'text-red-400' : 'text-yellow-400'} />
                      <div>
                        <span className="font-medium text-white block text-sm">{item.nameSnack || item.name}</span>
                        <span className="text-xs text-text-secondary">
                          Stock: {item.quantitySnack ?? item.stock} uds
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${item.quantitySnack === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {item.quantitySnack === 0 ? 'AGOTADO' : `${item.quantitySnack} uds`}
                    </span>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Popcorn size={24} className="text-green-400" />
                    </div>
                    <p className="text-green-400 font-bold text-sm">Todo en orden</p>
                    <p className="text-text-secondary text-xs mt-0.5">El inventario está completo.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Películas */}
            <div className="lg:col-span-2 bg-surface/30 border border-border/30 rounded-2xl p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Film size={16} className="text-gold" />
                  <h2 className="text-sm font-bold font-display tracking-widest uppercase text-white">
                    Top Películas
                  </h2>
                </div>
                <p className="text-xs text-text-secondary">Por recaudación de tickets en el período.</p>
              </div>

              <div className="space-y-4">
                {kpis?.topMovies?.length > 0 ? kpis.topMovies.map((movie, i) => {
                  const maxAmount = kpis.topMovies[0].amount
                  const pct = (movie.amount / maxAmount) * 100
                  return (
                    <div key={movie.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white font-medium truncate max-w-[70%]">
                          {i + 1}. {movie.name}
                        </span>
                        <span className="text-xs text-gold font-bold">
                          {formatCOP(movie.amount)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-carbon rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-magenta to-vinotinto rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-center py-8">
                    <Film size={32} className="mx-auto mb-2 text-text-secondary opacity-30" />
                    <p className="text-text-secondary text-xs">No hay datos de películas para este período.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabla de transacciones */}
          <div className="bg-surface/40 border border-border/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-magenta" />
                  <h2 className="text-sm font-bold font-display tracking-widest uppercase text-white">
                    Flujo de Caja Reciente
                  </h2>
                </div>
                <p className="text-xs text-text-secondary">Últimas funciones con ventas registradas.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-[10px] font-bold tracking-widest text-text-secondary uppercase">
                    <th className="pb-3 pl-2">Película</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3 text-right">Boletas</th>
                    <th className="pb-3 text-right pr-2">Ingresos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs text-text-primary">
                  {kpis?.transactions?.length > 0 ? kpis.transactions.map((tx, i) => (
                    <tr key={i} className="hover:bg-white/[0.01]">
                      <td className="py-3 pl-2 font-medium text-white">{tx.concept}</td>
                      <td className="py-3 text-text-secondary">{tx.method}</td>
                      <td className="py-3 text-right text-text-secondary">{tx.qty}</td>
                      <td className="py-3 text-right font-bold text-magenta pr-2">{formatCOP(tx.amount)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-text-secondary">
                        No hay transacciones disponibles para este período.
                      </td>
                    </tr>
                  )}
                </tbody>
                {kpis?.transactions?.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-border/60 text-xs font-bold text-white">
                      <td className="pt-3 pl-2" colSpan="2">TOTAL</td>
                      <td className="pt-3 text-right">{kpis.totalTickets.toLocaleString('es-CO')}</td>
                      <td className="pt-3 text-right pr-2 text-magenta">{formatCOP(kpis.ticketRevenue)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}