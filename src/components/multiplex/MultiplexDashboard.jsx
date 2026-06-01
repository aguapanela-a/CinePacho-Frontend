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
  getSalesByMultiplex,
  getLowStockItems,
  countActiveEmployees,
  formatCOP,
} from '../../data/mockMultiplexData'

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

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Mensaje de Bienvenida Corto */}
      <div>
        <h1 className="text-2xl font-bold font-display tracking-wider text-white">
          Resumen Operativo
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Estado actual e indicadores de la sede {multiplex?.name}.
        </p>
      </div>

      {/* Grid de KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            /* CORREGIDO: Se añade key única aquí */
            <div key={stat.title} className="bg-surface/40 border border-border/30 rounded-2xl p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase block">
                  {stat.title}
                </span>
                <span className="text-2xl font-display font-bold text-white tracking-wide block">
                  {stat.value}
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-carbon border border-border/50 flex items-center justify-center text-magenta">
                <Icon size={18} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Alertas de Inventario y Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Inventario Crítico */}
        <div className="lg:col-span-1 bg-surface/30 border border-border/30 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <AlertTriangle size={16} />
              <h2 className="text-sm font-bold font-display tracking-widest uppercase text-white">
                Alertas de Stock
              </h2>
            </div>
            <p className="text-xs text-text-secondary">Insumos por debajo del mínimo.</p>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[280px] pr-1 custom-scrollbar my-2">
            {lowStock.length > 0 ? lowStock.map((item) => (
              <div
                key={item.id}
                className="bg-carbon border border-border/40 rounded-2xl px-4 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={18} className={item.stock === 0 ? 'text-red-400' : 'text-yellow-400'} />
                  <div>
                    <span className="font-medium text-white block text-sm">{item.name}</span>
                    <span className="text-xs text-text-secondary">
                      Mín: {item.minStock} unidades
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-bold ${item.stock === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {item.stock === 0 ? 'AGOTADO' : `${item.stock} uds`}
                </span>
              </div>
            )) : (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Popcorn size={24} className="text-green-400" />
                </div>
                <p className="text-green-400 font-bold text-sm">Todo en orden</p>
                <p className="text-text-secondary text-xs mt-0.5">El inventario base está completo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Últimas Ventas */}
        <div className="lg:col-span-2 bg-surface/30 border border-border/30 rounded-2xl p-5 space-y-4">
          <div>
            <div className="flex items-center gap-2 text-magenta mb-1">
              <TrendingUp size={16} />
              <h2 className="text-sm font-bold font-display tracking-widest uppercase text-white">
                Flujo de Caja Reciente
              </h2>
            </div>
            <p className="text-xs text-text-secondary">Últimas transacciones registradas en el sistema.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-[10px] font-bold tracking-widest text-text-secondary uppercase">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Concepto</th>
                  <th className="pb-3">Método</th>
                  <th className="pb-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-xs text-text-primary">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-white/[0.01]">
                    <td className="py-3 font-mono text-text-secondary">{sale.id}</td>
                    <td className="py-3 font-medium text-white">{sale.concept}</td>
                    <td className="py-3 text-text-secondary">{sale.method}</td>
                    <td className="py-3 text-right font-bold text-magenta">
                      {formatCOP(sale.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}