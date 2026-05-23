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

{/* Reporte 1: Ventas Mensuales por Multiplex */}
<div className="bg-surface/50 border border-border/50 rounded-3xl p-6 backdrop-blur-xl animate-[fadeUp_0.8s_ease-out_forwards]">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-xl font-display tracking-widest uppercase text-white">
        Ventas Mensuales por Multiplex
      </h2>
      <p className="text-text-secondary text-sm mt-1">
        Análisis de ingresos por sede (primer semestre 2026)
      </p>
    </div>
    <div className="w-12 h-12 rounded-2xl bg-magenta/10 border border-magenta/20 flex items-center justify-center">
      <TrendingUp className="text-magenta" size={22} />
    </div>
  </div>

  <div className="overflow-x-auto">
    <svg width="100%" height="350" viewBox="0 0 800 350" className="bg-carbon/30 rounded-2xl p-4">
      {/* Grid lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1="60"
          y1={50 + i * 60}
          x2="760"
          y2={50 + i * 60}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      ))}

      {/* Y-axis labels */}
      {[0, 1, 2, 3, 4].map((i) => (
        <text
          key={i}
          x="50"
          y={55 + i * 60}
          fill="#888"
          fontSize="11"
          textAnchor="end"
        >
          ${(4 - i) * 5}M
        </text>
      ))}

      {/* Bars for each multiplex */}
      {[
        { name: 'Titán', data: [12, 15, 13, 16, 14, 18], color: '#C8167A' },
        { name: 'Gran Estación', data: [8, 10, 9, 11, 10, 12], color: '#FFD700' },
        { name: 'Unicentro', data: [6, 8, 7, 9, 8, 10], color: '#00CED1' },
        { name: 'Plaza Central', data: [4, 5, 5, 6, 5, 7], color: '#FF6B6B' },
      ].map((multiplex, mi) => (
        <g key={multiplex.name}>
          {multiplex.data.map((value, i) => {
            const x = 80 + i * 110 + mi * 25
            const height = (value / 20) * 240
            const y = 290 - height
            return (
              <rect
                key={`${multiplex.name}-${i}`}
                x={x}
                y={y}
                width={20}
                height={height}
                fill={multiplex.color}
                opacity="0.8"
                rx="2"
              />
            )
          })}
        </g>
      ))}

      {/* X-axis labels */}
      {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'].map((month, i) => (
        <text
          key={month}
          x={140 + i * 110}
          y="310"
          fill="#888"
          fontSize="12"
          textAnchor="middle"
        >
          {month}
        </text>
      ))}

      {/* Legend */}
      <g transform="translate(60, 330)">
        {[
          { name: 'Titán', color: '#C8167A' },
          { name: 'Gran Estación', color: '#FFD700' },
          { name: 'Unicentro', color: '#00CED1' },
          { name: 'Plaza Central', color: '#FF6B6B' },
        ].map((legend, i) => (
          <g key={legend.name} transform={`translate(${i * 150}, 0)`}>
            <rect width="15" height="15" fill={legend.color} rx="2" opacity="0.8" />
            <text x="22" y="12" fill="#fff" fontSize="11">
              {legend.name}
            </text>
          </g>
        ))}
      </g>
    </svg>
  </div>
</div>

{/* Reporte 2: Estudio Estadístico Titán - Movilidad de Empleados */}
<div className="bg-surface/50 border border-border/50 rounded-3xl p-6 backdrop-blur-xl animate-[fadeUp_0.9s_ease-out_forwards]">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-xl font-display tracking-widest uppercase text-white">
        Estudio Estadístico Titán — Movilidad de Empleados
      </h2>
      <p className="text-text-secondary text-sm mt-1">
        Análisis de relación entre salario y antigüedad
      </p>
    </div>
    <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
      <Users className="text-gold" size={22} />
    </div>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full min-w-[600px]">
      <thead>
        <tr className="border-b border-border/50">
          <th className="text-left px-4 py-3 text-xs font-bold tracking-widest text-text-secondary uppercase">
            Empleado
          </th>
          <th className="text-left px-4 py-3 text-xs font-bold tracking-widest text-text-secondary uppercase">
            Cargo
          </th>
          <th className="text-left px-4 py-3 text-xs font-bold tracking-widest text-text-secondary uppercase">
            Antigüedad (meses)
          </th>
          <th className="text-left px-4 py-3 text-xs font-bold tracking-widest text-text-secondary uppercase">
            Salario ($)
          </th>
          <th className="text-left px-4 py-3 text-xs font-bold tracking-widest text-text-secondary uppercase">
            Rotaciones
          </th>
        </tr>
      </thead>
      <tbody>
        {[
          { name: 'Laura González', cargo: 'Cajero', antiguedad: 18, salario: 1850000, rotaciones: 2 },
          { name: 'Carlos Ramírez', cargo: 'Director', antiguedad: 36, salario: 3500000, rotaciones: 1 },
          { name: 'María López', cargo: 'Encargado de sala', antiguedad: 24, salario: 2200000, rotaciones: 3 },
          { name: 'Pedro Martínez', cargo: 'Despachador de comida', antiguedad: 12, salario: 1650000, rotaciones: 1 },
          { name: 'Ana Torres', cargo: 'Aseador', antiguedad: 6, salario: 1500000, rotaciones: 0 },
        ].map((emp, i) => (
          <tr key={i} className="border-b border-border/30 hover:bg-carbon/40 transition-colors">
            <td className="px-4 py-3 text-white font-medium">{emp.name}</td>
            <td className="px-4 py-3">
              <span className="text-gold text-sm font-bold">{emp.cargo}</span>
            </td>
            <td className="px-4 py-3 text-text-secondary">{emp.antiguedad} meses</td>
            <td className="px-4 py-3 text-white font-bold">${emp.salario.toLocaleString('es-CO')}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                emp.rotaciones === 0 ? 'bg-red-500/15 text-red-400' : 'bg-green-500/15 text-green-400'
              }`}>
                {emp.rotaciones}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="bg-carbon border border-border/50 rounded-2xl p-4">
      <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">
        Salario Promedio
      </p>
      <p className="text-2xl font-display text-white">
        $2.14M
      </p>
    </div>
    <div className="bg-carbon border border-border/50 rounded-2xl p-4">
      <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">
        Antigüedad Promedio
      </p>
      <p className="text-2xl font-display text-magenta">
        19.2 meses
      </p>
    </div>
    <div className="bg-carbon border border-border/50 rounded-2xl p-4">
      <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">
        Tasa de Rotación
      </p>
      <p className="text-2xl font-display text-gold">
        1.4/año
      </p>
    </div>
  </div>
</div>
    </AdminLayout>
  )
}
