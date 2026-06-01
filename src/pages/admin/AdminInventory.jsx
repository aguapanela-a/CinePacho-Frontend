import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { Plus, Search, Building2 } from 'lucide-react'

// Simular un inventario consolidado global
const initialInventory = [

  { id: 1, item: 'Vaso Gaseosa 500ml', stock: 1540, unit: 'unidades', multiplex: 'Titán' },
  { id: 2, item: 'Vaso Gaseosa 500ml', stock: 850, unit: 'unidades', multiplex: 'Plaza Central' },
  { id: 3, item: 'Maíz Pira (Saco 50kg)', stock: 12, unit: 'sacos', multiplex: 'Titán' },
  { id: 4, item: 'Maíz Pira (Saco 50kg)', stock: 5, unit: 'sacos', multiplex: 'Gran Estación' },
]




export default function AdminInventory() {

const [inventory, setInventory] = useState(initialInventory)
const [search, setSearch] = useState('')
const [isModalOpen, setIsModalOpen] = useState(false)

const [newItem, setNewItem] = useState({
  item: '',
  stock: '',
  unit: '',
  multiplex: '',
})


const filteredInventory = inventory.filter((item) =>
  item.item.toLowerCase().includes(search.toLowerCase()) ||
  item.multiplex.toLowerCase().includes(search.toLowerCase())
)

const handleCreateItem = () => {
  if (
    !newItem.item ||
    !newItem.stock ||
    !newItem.unit ||
    !newItem.multiplex
  ) {
    return
  }

  const item = {
    id: inventory.length + 1,
    item: newItem.item,
    stock: Number(newItem.stock),
    unit: newItem.unit,
    multiplex: newItem.multiplex,
  }

  setInventory([...inventory, item])

  setNewItem({
    item: '',
    stock: '',
    unit: '',
    multiplex: '',
  })

  setIsModalOpen(false)
}



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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-carbon border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-gold outline-none transition-colors"
          />
          </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-magenta to-vinotinto text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-magenta/20 transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
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
              {filteredInventory.map(item => (
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
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-bold border ${
                        item.stock <= 5
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : item.stock <= 15
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          : 'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}
                    >
                      {item.stock <= 5
                        ? 'Crítico'
                        : item.stock <= 15
                        ? 'Bajo'
                        : 'Suficiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {isModalOpen && (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-2xl bg-surface border border-border/50 rounded-3xl p-8 animate-[scaleIn_0.25s_ease-out_forwards]">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display tracking-widest text-white uppercase">
            Nuevo <span className="gradient-brand">Insumo</span>
          </h2>

          <p className="text-text-secondary text-sm mt-1">
            Registrar nuevo insumo para inventario
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(false)}
          className="w-10 h-10 rounded-xl border border-border/50 hover:bg-carbon transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
            Nombre del insumo
          </label>

          <input
            type="text"
            value={newItem.item}
            onChange={(e) =>
              setNewItem({
                ...newItem,
                item: e.target.value,
              })
            }
            className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
            placeholder="Ej: Nachos Grandes"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
            Stock
          </label>

          <input
            type="number"
            value={newItem.stock}
            onChange={(e) =>
              setNewItem({
                ...newItem,
                stock: e.target.value,
              })
            }
            className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
            placeholder="100"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
            Unidad
          </label>

          <input
            type="text"
            value={newItem.unit}
            onChange={(e) =>
              setNewItem({
                ...newItem,
                unit: e.target.value,
              })
            }
            className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
            placeholder="unidades / cajas / sacos"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
            Multiplex
          </label>

          <select
            value={newItem.multiplex}
            onChange={(e) =>
              setNewItem({
                ...newItem,
                multiplex: e.target.value,
              })
            }
            className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
          >
            <option value="">Seleccionar</option>
            <option value="Titán">Titán</option>
            <option value="Unicentro">Unicentro</option>
            <option value="Plaza Central">Plaza Central</option>
            <option value="Gran Estación">Gran Estación</option>
            <option value="Embajador">Embajador</option>
            <option value="Las Américas">Las Américas</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-8">
        <button
          onClick={() => setIsModalOpen(false)}
          className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all"
        >
          Cancelar
        </button>

        <button
          onClick={handleCreateItem}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-magenta/20"
        >
          Guardar insumo
        </button>
      </div>
    </div>
  </div>
)}
    </AdminLayout>
  )
}

