import React from 'react'
import {
  Users,
  Ticket,
  Popcorn,
  DollarSign,
  TrendingUp,
} from 'lucide-react'

import AdminLayout from '../../components/admin/AdminLayout'

const stats = [
  {
    title: 'Ventas del día',
    value: '$4.850.000',
    icon: DollarSign,
  },
  {
    title: 'Boletas vendidas',
    value: '428',
    icon: Ticket,
  },
  {
    title: 'Snacks vendidos',
    value: '192',
    icon: Popcorn,
  },
  {
    title: 'Clientes activos',
    value: '1.240',
    icon: Users,
  },
]

export default function AdminDashboard() {
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-10 animate-[fadeUp_0.5s_ease-out_forwards]">
        <h1 className="text-5xl font-display uppercase tracking-widest text-white">
          Panel <span className="gradient-brand">Administrativo</span>
        </h1>

        <p className="text-text-secondary mt-2 text-lg">
          Gestión centralizada de operaciones Cine Pacho
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map(({ title, value, icon: Icon }, index) => (
          <div
            key={title}
            style={{ animationDelay: `${index * 0.08}s` }}
            className="bg-surface/80 border border-border/50 rounded-3xl p-6 backdrop-blur-xl hover:border-magenta/40 transition-all duration-300 hover:shadow-2xl hover:shadow-magenta/10 animate-[fadeUp_0.5s_ease-out_forwards]"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-magenta/10 flex items-center justify-center border border-magenta/20">
                <Icon className="text-magenta" size={28} />
              </div>

              <TrendingUp className="text-gold" size={20} />
            </div>

            <p className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-1">
              {title}
            </p>

            <h2 className="text-4xl font-display text-white tracking-wide">
              {value}
            </h2>
          </div>
        ))}
      </div>

      {/* Tables / activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Últimas ventas */}
        <div className="bg-surface/80 border border-border/50 rounded-3xl p-6 backdrop-blur-xl animate-[fadeUp_0.6s_ease-out_forwards]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-3xl font-display text-white tracking-wider uppercase">
              Últimas Ventas
            </h3>

            <span className="text-xs bg-gold/10 border border-gold/30 text-gold px-3 py-1 rounded-full font-bold">
              Tiempo real
            </span>
          </div>

          <div className="space-y-4">
            {[
              'Combo Mega Cine - $45.000',
              '2 Boletas Preferenciales - $30.000',
              'Nachos + Gaseosa - $18.000',
              'Boleta General - $11.000',
            ].map((sale, i) => (
              <div
                key={i}
                className="bg-carbon border border-border/40 rounded-2xl px-4 py-4 flex items-center justify-between"
              >
                <span className="font-medium text-white">
                  {sale}
                </span>

                <span className="text-xs text-text-secondary">
                  Hace {i + 1} min
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Estado multiplex */}
        <div className="bg-surface/80 border border-border/50 rounded-3xl p-6 backdrop-blur-xl animate-[fadeUp_0.7s_ease-out_forwards]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-3xl font-display text-white tracking-wider uppercase">
              Multiplex
            </h3>

            <span className="text-xs bg-magenta/10 border border-magenta/30 text-magenta px-3 py-1 rounded-full font-bold">
              Operativo
            </span>
          </div>

          <div className="space-y-4">
            {[
              'Titán',
              'Unicentro',
              'Gran Estación',
              'Plaza Central',
              'Embajador',
            ].map((plex, i) => (
              <div
                key={i}
                className="bg-carbon border border-border/40 rounded-2xl px-4 py-4 flex items-center justify-between"
              >
                <span className="font-medium text-white">
                  {plex}
                </span>

                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm text-green-400 font-bold">
                    Activo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}