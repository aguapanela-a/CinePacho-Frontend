import React from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  FileBarChart2,
  TrendingUp,
  Popcorn,
  Ticket,
  Building2,
  Users,
} from 'lucide-react'

export default function AdminReports() {

  const stats = [
  {
    title: 'Ventas Totales',
    value: '$48.5M',
    icon: TrendingUp,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    title: 'Boletas Vendidas',
    value: '12.480',
    icon: Ticket,
    color: 'text-magenta',
    bg: 'bg-magenta/10',
  },
  {
    title: 'Snacks Vendidos',
    value: '8.932',
    icon: Popcorn,
    color: 'text-gold',
    bg: 'bg-gold/10',
  },
  {
    title: 'Clientes Atendidos',
    value: '6.210',
    icon: Users,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
]

const topMultiplex = [
  { name: 'Titán', sales: '$15.2M', progress: 90 },
  { name: 'Gran Estación', sales: '$11.8M', progress: 72 },
  { name: 'Unicentro', sales: '$9.4M', progress: 58 },
  { name: 'Plaza Central', sales: '$7.1M', progress: 43 },
]

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-[fadeUp_0.5s_ease-out_forwards]">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest text-white mb-2">
            Reportes y Analítica
          </h1>
          <p className="text-text-secondary text-sm">
            Métricas de rendimiento a nivel nacional.
          </p>
        </div>
      </div>

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
            +12%
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

<div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-[fadeUp_0.7s_ease-out_forwards]">

  <div className="xl:col-span-2 bg-surface/50 border border-border/50 rounded-3xl p-6 backdrop-blur-xl">
    
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-xl font-display tracking-widest uppercase text-white">
          Rendimiento por Sede
        </h2>

        <p className="text-text-secondary text-sm mt-1">
          Comparativo nacional de ventas
        </p>
      </div>

      <div className="w-12 h-12 rounded-2xl bg-magenta/10 border border-magenta/20 flex items-center justify-center">
        <Building2 className="text-magenta" size={22} />
      </div>
    </div>

    <div className="space-y-6">
      {topMultiplex.map((multiplex) => (
        <div key={multiplex.name}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-white font-bold">
                {multiplex.name}
              </p>

              <p className="text-text-secondary text-xs">
                Ventas consolidadas
              </p>
            </div>

            <span className="text-gold font-bold">
              {multiplex.sales}
            </span>
          </div>

          <div className="w-full h-3 bg-carbon rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-magenta to-vinotinto rounded-full"
              style={{ width: `${multiplex.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>

  <div className="bg-surface/50 border border-border/50 rounded-3xl p-6 backdrop-blur-xl">

    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-xl font-display tracking-widest uppercase text-white">
          Estado General
        </h2>

        <p className="text-text-secondary text-sm mt-1">
          Resumen operativo
        </p>
      </div>

      <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
        <FileBarChart2 className="text-gold" size={22} />
      </div>
    </div>

    <div className="space-y-5">

      <div className="bg-carbon border border-border/50 rounded-2xl p-4">
        <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">
          Multiplex activos
        </p>

        <p className="text-3xl font-display text-white">
          12
        </p>
      </div>

      <div className="bg-carbon border border-border/50 rounded-2xl p-4">
        <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">
          Ocupación promedio
        </p>

        <p className="text-3xl font-display text-green-400">
          78%
        </p>
      </div>

      <div className="bg-carbon border border-border/50 rounded-2xl p-4">
        <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">
          Producto más vendido
        </p>

        <p className="text-lg font-bold text-gold">
          Combo Nachos XL
        </p>
      </div>

    </div>
  </div>
</div>
    </AdminLayout>
  )
}
