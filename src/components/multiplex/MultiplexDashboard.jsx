import React from 'react'
import {
  Users,
  Ticket,
  Popcorn,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import {
  getMultiplexById,
  getEmployeesByMultiplex,
  getInventoryByMultiplex,
  getSalesByMultiplex,
  getLowStockItems,
  countActiveEmployees,
  formatCOP,
} from '../../data/mockMultiplexData'

/**
 * MultiplexDashboard: Panel de resumen de un multiplex individual.
 * Componente compartido — usado tanto por el Manager como por el Admin en drill-down.
 *
 * @param {string} multiplexId - ID del multiplex a mostrar
 */
export default function MultiplexDashboard({ multiplexId }) {
  const multiplex = getMultiplexById(multiplexId)
  const employeeCount = countActiveEmployees(multiplexId)
  const sales = getSalesByMultiplex(multiplexId)
  const lowStock = getLowStockItems(multiplexId)

  // Stats calculados del multiplex
  const totalSalesAmount = sales.reduce((acc, s) => acc + s.amount, 0)

  const stats = [
    { title: 'Ventas del día', value: formatCOP(totalSalesAmount), icon: DollarSign },
    { title: 'Boletas vendidas', value: '87', icon: Ticket },
    { title: 'Snacks vendidos', value: '42', icon: Popcorn },
    { title: 'Empleados activos', value: String(employeeCount), icon: Users },
  ]

  if (!multiplex) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-secondary text-lg">Multiplex no encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-[fadeUp_0.5s_ease-out_forwards]">
        <h1 className="text-5xl font-display uppercase tracking-widest text-white">
          {multiplex.name}
        </h1>
        <p className="text-text-secondary mt-2 text-lg">
          {multiplex.address} · {multiplex.salas} salas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
            {sales.length > 0 ? sales.map((sale) => (
              <div
                key={sale.id}
                className="bg-carbon border border-border/40 rounded-2xl px-4 py-4 flex items-center justify-between"
              >
                <span className="font-medium text-white">
                  {sale.description} — {formatCOP(sale.amount)}
                </span>
                <span className="text-xs text-text-secondary">
                  {sale.time}
                </span>
              </div>
            )) : (
              <p className="text-text-secondary text-center py-8">
                No hay ventas recientes
              </p>
            )}
          </div>
        </div>

        {/* Alertas de inventario bajo */}
        <div className="bg-surface/80 border border-border/50 rounded-3xl p-6 backdrop-blur-xl animate-[fadeUp_0.7s_ease-out_forwards]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-3xl font-display text-white tracking-wider uppercase">
              Alertas Stock
            </h3>
            {lowStock.length > 0 && (
              <span className="text-xs bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-full font-bold">
                {lowStock.length} alerta{lowStock.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {lowStock.length > 0 ? lowStock.map((item) => (
              <div
                key={item.id}
                className="bg-carbon border border-border/40 rounded-2xl px-4 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={18} className={item.stock === 0 ? 'text-red-400' : 'text-yellow-400'} />
                  <div>
                    <span className="font-medium text-white block">{item.name}</span>
                    <span className="text-xs text-text-secondary">
                      Mín: {item.minStock} unidades
                    </span>
                  </div>
                </div>
                <span className={`text-sm font-bold ${item.stock === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {item.stock === 0 ? 'AGOTADO' : `${item.stock} uds`}
                </span>
              </div>
            )) : (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Popcorn size={24} className="text-green-400" />
                </div>
                <p className="text-green-400 font-bold">Todo en orden</p>
                <p className="text-text-secondary text-sm mt-1">No hay productos con stock bajo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
