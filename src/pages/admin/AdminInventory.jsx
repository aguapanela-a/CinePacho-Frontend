import React from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { Popcorn, Plus, Search, Building2 } from 'lucide-react'

// Simular un inventario consolidado global
const globalInventory = [
  { id: 1, item: 'Vaso Gaseosa 500ml', stock: 1540, unit: 'unidades', multiplex: 'Titán' },
  { id: 2, item: 'Vaso Gaseosa 500ml', stock: 850, unit: 'unidades', multiplex: 'Plaza Central' },
  { id: 3, item: 'Maíz Pira (Saco 50kg)', stock: 12, unit: 'sacos', multiplex: 'Titán' },
  { id: 4, item: 'Maíz Pira (Saco 50kg)', stock: 5, unit: 'sacos', multiplex: 'Gran Estación' },
]

export default function AdminInventory() {
  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-[fadeUp_0.5s_ease-out_forwards]">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest text-white mb-2">
            Inventario Global
          </h1>
          <p className="text-text-secondary text-sm">
            Supervisión y distribución de insumos a nivel nacional.
          </p>
        </div>
      </div>

      <div className="bg-surface/50 border border-border/50 rounded-3xl p-8 backdrop-blur-xl animate-[fadeUp_0.6s_ease-out_forwards]">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Buscar insumo..." 
              className="w-full bg-carbon border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-gold outline-none transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-magenta to-vinotinto text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-magenta/20 transition-transform hover:-translate-y-0.5 cursor-pointer">
            <Plus size={16} /> Agregar Insumo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50">
                <th className="py-4 px-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Insumo</th>
                <th className="py-4 px-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Sede</th>
                <th className="py-4 px-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Stock Actual</th>
                <th className="py-4 px-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {globalInventory.map(item => (
                <tr key={item.id} className="hover:bg-carbon/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">{item.item}</td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-2 text-sm text-text-secondary">
                      <Building2 size={14} className="text-magenta" /> {item.multiplex}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gold font-bold">
                    {item.stock} <span className="text-text-secondary text-xs font-normal">{item.unit}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-md text-xs font-bold">
                      Suficiente
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
