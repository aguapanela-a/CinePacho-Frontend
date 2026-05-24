import ManagerLayout from '../../components/manager/ManagerLayout'
import { TrendingUp, Ticket, Popcorn, Users, Building2 } from 'lucide-react'
import { useApp } from '../../context/useApp'

export default function ManagerReports() {
  // Obtener el nombre del multiplex del usuario logueado
  const { user } = useApp()
  const multiplexName = user?.multiplexId || 'Centro Comercial' // Default si no hay multiplexId

  // Datos de prueba específicos para el multiplex actual
  // En producción, estos vendrían de la API filtrados por multiplexId
  const stats = [
    {
      title: 'Ventas del Mes',
      value: '$4.2M',
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Boletas Vendidas',
      value: '1,840',
      icon: Ticket,
      color: 'text-magenta',
      bg: 'bg-magenta/10',
    },
    {
      title: 'Snacks Vendidos',
      value: '1,250',
      icon: Popcorn,
      color: 'text-gold',
      bg: 'bg-gold/10',
    },
    {
      title: 'Clientes Atendidos',
      value: '980',
      icon: Users,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
  ]

  const dailySales = [
    { day: 'Lun', sales: 120000 },
    { day: 'Mar', sales: 145000 },
    { day: 'Mié', sales: 180000 },
    { day: 'Jue', sales: 165000 },
    { day: 'Vie', sales: 220000 },
    { day: 'Sáb', sales: 350000 },
    { day: 'Dom', sales: 280000 },
  ]

  const topMovies = [
    { title: 'Dune: Parte 2', sales: '$890K', percentage: 85 },
    { title: 'Kung Fu Panda 4', sales: '$650K', percentage: 72 },
    { title: 'Godzilla x Kong', sales: '$520K', percentage: 58 },
  ]

  return (
    <ManagerLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-[fadeUp_0.5s_ease-out_forwards]">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest text-white mb-2">
            Reportes de Sede
          </h1>
          <p className="text-text-secondary text-sm">
            Métricas de rendimiento para <span className="text-magenta font-bold">{multiplexName}</span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8 animate-[fadeUp_0.6s_ease-out_forwards]">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.title}
              className="bg-surface/50 border border-border/50 rounded-3xl p-6 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                  <Icon size={26} className={stat.color} />
                </div>
                <span className="text-xs text-green-400 font-bold">
                  +8%
                </span>
              </div>
              <h3 className="text-text-secondary text-sm mb-2">
                {stat.title}
              </h3>
              <p className="text-3xl font-display text-white">
                {stat.value}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-[fadeUp_0.7s_ease-out_forwards]">
        {/* Daily Sales Chart */}
        <div className="bg-surface/50 border border-border/50 rounded-3xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display tracking-widest uppercase text-white">
                Ventas Diarias
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                Última semana
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-magenta/10 border border-magenta/20 flex items-center justify-center">
              <TrendingUp className="text-magenta" size={22} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <svg width="100%" height="250" viewBox="0 0 600 250" className="bg-carbon/30 rounded-2xl p-4">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="50"
                  y1={30 + i * 40}
                  x2="570"
                  y2={30 + i * 40}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              ))}

              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map((i) => (
                <text
                  key={i}
                  x="40"
                  y={35 + i * 40}
                  fill="#888"
                  fontSize="10"
                  textAnchor="end"
                >
                  ${(4 - i) * 100}K
                </text>
              ))}

              {/* Bars */}
              {dailySales.map((day, i) => {
                const height = (day.sales / 400000) * 160
                const x = 70 + i * 70
                const y = 190 - height
                return (
                  <g key={day.day}>
                    <rect
                      x={x}
                      y={y}
                      width={40}
                      height={height}
                      fill="#C8167A"
                      opacity="0.8"
                      rx="2"
                    />
                    <text
                      x={x + 20}
                      y={210}
                      fill="#fff"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {day.day}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Top Movies */}
        <div className="bg-surface/50 border border-border/50 rounded-3xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display tracking-widest uppercase text-white">
                Películas Top
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                Más vendidas esta semana
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Ticket className="text-gold" size={22} />
            </div>
          </div>

          <div className="space-y-5">
            {topMovies.map((movie) => (
              <div key={movie.title}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-bold">
                      {movie.title}
                    </p>
                    <p className="text-text-secondary text-xs">
                      Ventas acumuladas
                    </p>
                  </div>
                  <span className="text-gold font-bold">
                    {movie.sales}
                  </span>
                </div>
                <div className="w-full h-3 bg-carbon rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-magenta to-vinotinto rounded-full"
                    style={{ width: `${movie.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-surface/50 border border-border/50 rounded-3xl p-6 backdrop-blur-xl animate-[fadeUp_0.8s_ease-out_forwards]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-display tracking-widest uppercase text-white">
              Resumen de Operaciones
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Indicadores clave de rendimiento
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Building2 className="text-cyan-400" size={22} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-carbon border border-border/50 rounded-2xl p-4">
            <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">
              Ocupación Promedio
            </p>
            <p className="text-3xl font-display text-green-400">
              82%
            </p>
          </div>
          <div className="bg-carbon border border-border/50 rounded-2xl p-4">
            <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">
              Ticket Promedio
            </p>
            <p className="text-3xl font-display text-magenta">
              $2.3K
            </p>
          </div>
          <div className="bg-carbon border border-border/50 rounded-2xl p-4">
            <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">
              Salas Activas
            </p>
            <p className="text-3xl font-display text-gold">
              12/15
            </p>
          </div>
          <div className="bg-carbon border border-border/50 rounded-2xl p-4">
            <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">
              Satisfacción
            </p>
            <p className="text-3xl font-display text-cyan-400">
              4.6/5
            </p>
          </div>
        </div>
      </div>
    </ManagerLayout>
  )
}
