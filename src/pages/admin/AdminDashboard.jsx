import { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp,
  Ticket,
  Popcorn,
  DollarSign,
  Building2,
  Calendar,
  Film,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { generateSalesReport, generateSnackSalesReport } from '../../services/reportService'

const formatCOP = (value) => {
  if (!value || isNaN(value)) return '$0'
  return '$' + Number(value).toLocaleString('es-CO')
}

const todayISO = () => new Date().toISOString().split('T')[0]

export default function AdminDashboard() {
  const [endDate, setEndDate] = useState(todayISO())
  const [ticketData, setTicketData] = useState(null)
  const [snackData, setSnackData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [endDate])

  const kpis = useMemo(() => {
    if (!ticketData || !snackData) return null

    let totalTickets = 0
    let ticketRevenue = 0
    let totalSnacks = 0
    let snackRevenue = 0
    let totalRevenue = 0

    const movieMap = new Map()

    ticketData.multiplexes?.forEach((mp) => {
      mp.days?.forEach((day) => {
        day.screenings?.forEach((s) => {
          totalTickets += s.ticketsQuantity || 0
          const amount = Number(s.totalAmount || 0)
          ticketRevenue += amount
          totalRevenue += amount
          if (movieMap.has(s.movieTitle)) {
            movieMap.set(s.movieTitle, movieMap.get(s.movieTitle) + amount)
          } else {
            movieMap.set(s.movieTitle, amount)
          }
        })
      })
    })

    snackData.multiplexes?.forEach((mp) => {
      mp.days?.forEach((day) => {
        day.snacks?.forEach((s) => {
          totalSnacks += s.snacksQuantity || 0
          const amount = Number(s.totalAmount || 0)
          snackRevenue += amount
          totalRevenue += amount
        })
      })
    })

    const topMovies = Array.from(movieMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }))

    const multiplexStats = ticketData.multiplexes?.map((mp) => {
      let mpRevenue = 0
      let mpTickets = 0
      mp.days?.forEach((day) => {
        day.screenings?.forEach((s) => {
          mpRevenue += Number(s.totalAmount || 0)
          mpTickets += s.ticketsQuantity || 0
        })
      })
      return {
        name: mp.multiplexName,
        revenue: mpRevenue,
        tickets: mpTickets,
      }
    }) || []

    return {
      totalRevenue,
      ticketRevenue,
      snackRevenue,
      totalTickets,
      totalSnacks,
      topMovies,
      multiplexStats,
    }
  }, [ticketData, snackData])

  const chartMax = useMemo(() => {
    if (!kpis) return 1
    const maxRev = Math.max(...kpis.multiplexStats.map((m) => m.revenue), 1)
    return Math.ceil(maxRev * 1.15)
  }, [kpis])

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wider text-white">
            Dashboard General
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Métricas consolidadas de todas las sedes — {ticketData?.startDate} a {ticketData?.endDate}
          </p>
        </div>
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
          <span className="text-sm font-medium">Cargando métricas...</span>
        </div>
      )}

      {!loading && kpis && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Ingresos Totales',
                value: formatCOP(kpis.totalRevenue),
                sub: `Tickets: ${formatCOP(kpis.ticketRevenue)} • Snacks: ${formatCOP(kpis.snackRevenue)}`,
                icon: DollarSign,
                color: 'text-green-400',
                bg: 'bg-green-500/10',
              },
              {
                title: 'Boletas Vendidas',
                value: kpis.totalTickets.toLocaleString('es-CO'),
                sub: 'Total del período',
                icon: Ticket,
                color: 'text-magenta',
                bg: 'bg-magenta/10',
              },
              {
                title: 'Snacks Vendidos',
                value: kpis.totalSnacks.toLocaleString('es-CO'),
                sub: 'Unidades totales',
                icon: Popcorn,
                color: 'text-gold',
                bg: 'bg-gold/10',
              },
              {
                title: 'Sedes Activas',
                value: String(ticketData?.multiplexes?.length || 0),
                sub: 'Con transacciones en el período',
                icon: Building2,
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/10',
              },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.title}
                  className="bg-surface/40 border border-border/30 rounded-2xl p-5 hover:border-magenta/30 transition-colors"
                >
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
            {/* Gráfico por Sede */}
            <div className="lg:col-span-2 bg-surface/40 border border-border/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-bold font-display tracking-widest uppercase text-white">
                    Rendimiento por Sede
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Ingresos por tickets en el período
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-magenta/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-magenta" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <svg
                  viewBox={`0 0 ${Math.max(600, kpis.multiplexStats.length * 100 + 120)} 300`}
                  className="w-full min-w-[500px]"
                  style={{ height: 280 }}
                >
                  {/* Grid */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="80"
                      y1={40 + i * 50}
                      x2={Math.max(600, kpis.multiplexStats.length * 100 + 100)}
                      y2={40 + i * 50}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Y labels */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <text
                      key={i}
                      x="70"
                      y={45 + i * 50}
                      fill="#666"
                      fontSize="10"
                      textAnchor="end"
                    >
                      {formatCOP(Math.round((chartMax / 4) * (4 - i))).replace('$', '')}
                    </text>
                  ))}

                  {/* Bars */}
                  {kpis.multiplexStats.map((mp, i) => {
                    const barHeight = (mp.revenue / chartMax) * 200
                    const x = 100 + i * 100
                    const y = 240 - barHeight
                    return (
                      <g key={mp.name}>
                        <rect
                          x={x}
                          y={y}
                          width={50}
                          height={barHeight}
                          fill="#C8167A"
                          opacity="0.85"
                          rx="4"
                        />
                        <text
                          x={x + 25}
                          y={y - 8}
                          fill="#fff"
                          fontSize="10"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {formatCOP(mp.revenue).replace('$', '')}
                        </text>
                        <text
                          x={x + 25}
                          y="260"
                          fill="#888"
                          fontSize="10"
                          textAnchor="middle"
                        >
                          {mp.name.length > 8 ? mp.name.substring(0, 8) + '...' : mp.name}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>

            {/* Top Películas */}
            <div className="bg-surface/40 border border-border/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-bold font-display tracking-widest uppercase text-white">
                    Top Películas
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Por recaudación de tickets
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Film size={20} className="text-gold" />
                </div>
              </div>

              <div className="space-y-4">
                {kpis.topMovies.length > 0 ? (
                  kpis.topMovies.map((movie, i) => {
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
                  })
                ) : (
                  <p className="text-text-secondary text-xs text-center py-8">
                    No hay datos de películas para este período
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tabla resumen por sede */}
          <div className="bg-surface/40 border border-border/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-bold font-display tracking-widest uppercase text-white">
                  Detalle por Sede
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Tickets y snacks consolidados
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Building2 size={20} className="text-cyan-400" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-[10px] font-bold tracking-widest text-text-secondary uppercase">
                    <th className="pb-3 pl-2">Sede</th>
                    <th className="pb-3 text-right">Ingresos Tickets</th>
                    <th className="pb-3 text-right">Boletas</th>
                    <th className="pb-3 text-right">Ingresos Snacks</th>
                    <th className="pb-3 text-right">Unidades Snacks</th>
                    <th className="pb-3 text-right pr-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs text-text-primary">
                  {ticketData?.multiplexes?.map((mp) => {
                    const mpTicketRev = mp.days?.reduce(
                      (sum, d) =>
                        sum +
                        d.screenings?.reduce((s, sc) => s + Number(sc.totalAmount || 0), 0),
                      0
                    ) || 0
                    const mpTickets = mp.days?.reduce(
                      (sum, d) =>
                        sum + d.screenings?.reduce((s, sc) => s + (sc.ticketsQuantity || 0), 0),
                      0
                    ) || 0

                    const snackMp = snackData?.multiplexes?.find(
                      (s) => s.multiplexId === mp.multiplexId
                    )
                    const mpSnackRev = snackMp?.days?.reduce(
                      (sum, d) =>
                        sum + d.snacks?.reduce((s, sn) => s + Number(sn.totalAmount || 0), 0),
                      0
                    ) || 0
                    const mpSnackQty = snackMp?.days?.reduce(
                      (sum, d) =>
                        sum + d.snacks?.reduce((s, sn) => s + (sn.snacksQuantity || 0), 0),
                      0
                    ) || 0

                    return (
                      <tr key={mp.multiplexId} className="hover:bg-white/[0.02]">
                        <td className="py-3 pl-2 font-medium text-white">{mp.multiplexName}</td>
                        <td className="py-3 text-right text-magenta font-bold">
                          {formatCOP(mpTicketRev)}
                        </td>
                        <td className="py-3 text-right">{mpTickets.toLocaleString('es-CO')}</td>
                        <td className="py-3 text-right text-gold font-bold">
                          {formatCOP(mpSnackRev)}
                        </td>
                        <td className="py-3 text-right">{mpSnackQty.toLocaleString('es-CO')}</td>
                        <td className="py-3 text-right pr-2 text-white font-bold">
                          {formatCOP(mpTicketRev + mpSnackRev)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border/60 text-xs font-bold text-white">
                    <td className="pt-3 pl-2">TOTAL</td>
                    <td className="pt-3 text-right text-magenta">{formatCOP(kpis.ticketRevenue)}</td>
                    <td className="pt-3 text-right">{kpis.totalTickets.toLocaleString('es-CO')}</td>
                    <td className="pt-3 text-right text-gold">{formatCOP(kpis.snackRevenue)}</td>
                    <td className="pt-3 text-right">{kpis.totalSnacks.toLocaleString('es-CO')}</td>
                    <td className="pt-3 text-right pr-2">{formatCOP(kpis.totalRevenue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}