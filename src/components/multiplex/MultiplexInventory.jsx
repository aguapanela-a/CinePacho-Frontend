import React, { useState } from 'react'
import {
  Popcorn,
  Search,
  PackagePlus,
  AlertTriangle,
  CheckCircle,
  X,
  Send,
} from 'lucide-react'
import { getInventoryByMultiplex, getMultiplexById, formatCOP } from '../../data/mockMultiplexData'

/**
 * MultiplexInventory: Vista de inventario de un multiplex.
 * Componente compartido con permisos controlados por props.
 *
 * @param {string}  multiplexId  - ID del multiplex
 * @param {boolean} canAddStock   - ¿Puede agregar stock directamente? (solo Admin)
 * @param {boolean} canRequestStock - ¿Puede solicitar stock? (solo Manager)
 */
export default function MultiplexInventory({
  multiplexId,
  canAddStock = false,
  canRequestStock = false,
}) {
  const multiplex = getMultiplexById(multiplexId)
  const [items, setItems] = useState(() => getInventoryByMultiplex(multiplexId))
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('Todos')
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [requestQty, setRequestQty] = useState('')
  const [requestReason, setRequestReason] = useState('')
  const [requestSuccess, setRequestSuccess] = useState(false)

  // Categorías únicas extraídas del inventario
  const categories = ['Todos', ...new Set(items.map((i) => i.category))]

  const filteredItems = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = filterCategory === 'Todos' || item.category === filterCategory
    return matchSearch && matchCategory
  })

  const getStockStatus = (item) => {
    if (item.stock === 0) return { label: 'Agotado', color: 'red' }
    if (item.stock <= item.minStock) return { label: 'Bajo', color: 'yellow' }
    return { label: 'Normal', color: 'green' }
  }

  // ── Solicitar stock (Manager) ──
  const handleRequestStock = () => {
    setRequestSuccess(true)
    setTimeout(() => {
      setIsRequestModalOpen(false)
      setSelectedItem(null)
      setRequestQty('')
      setRequestReason('')
      setRequestSuccess(false)
    }, 2000)
  }

  // ── Agregar stock directo (Admin) ──
  const handleAddStock = () => {
    const qty = parseInt(requestQty)
    if (!qty || qty <= 0) return
    setItems(items.map((i) =>
      i.id === selectedItem.id ? { ...i, stock: i.stock + qty } : i
    ))
    setIsRequestModalOpen(false)
    setSelectedItem(null)
    setRequestQty('')
    setRequestReason('')
  }

  const openStockModal = (item) => {
    setSelectedItem(item)
    setRequestQty('')
    setRequestReason('')
    setRequestSuccess(false)
    setIsRequestModalOpen(true)
  }

  return (
    <div className="space-y-8 animate-[fadeUp_0.4s_ease-out_forwards]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center">
              <Popcorn className="text-gold" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-display tracking-widest text-white uppercase">
                <span className="gradient-brand">Inventario</span>
              </h1>
              <p className="text-text-secondary text-sm mt-1">
                Stock de snacks y productos — {multiplex?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="flex items-center gap-4">
          <div className="bg-surface border border-border/50 rounded-2xl px-4 py-2 text-center">
            <p className="text-xs text-text-secondary font-bold uppercase">Productos</p>
            <p className="text-xl font-display text-white">{items.length}</p>
          </div>
          <div className="bg-surface border border-border/50 rounded-2xl px-4 py-2 text-center">
            <p className="text-xs text-text-secondary font-bold uppercase">Alertas</p>
            <p className="text-xl font-display text-yellow-400">
              {items.filter((i) => i.stock <= i.minStock).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border/50 rounded-3xl p-5 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-carbon border border-border/50 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-magenta transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer border ${
                filterCategory === cat
                  ? 'bg-gradient-to-r from-magenta to-vinotinto text-white border-magenta/50'
                  : 'bg-carbon border-border/50 text-text-secondary hover:text-white hover:border-magenta/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const status = getStockStatus(item)
          const stockPercent = Math.min((item.stock / (item.minStock * 3)) * 100, 100)

          return (
            <div
              key={item.id}
              className={`bg-surface/80 border rounded-3xl p-5 backdrop-blur-xl transition-all duration-300 hover:shadow-xl ${
                status.color === 'red'
                  ? 'border-red-500/30 hover:shadow-red-500/10'
                  : status.color === 'yellow'
                  ? 'border-yellow-500/30 hover:shadow-yellow-500/10'
                  : 'border-border/50 hover:shadow-magenta/10'
              }`}
            >
              {/* Product Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">{item.name}</h3>
                  <p className="text-xs text-text-secondary mt-1">{item.category}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  status.color === 'red'
                    ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                    : status.color === 'yellow'
                    ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                    : 'bg-green-500/15 text-green-400 border border-green-500/20'
                }`}>
                  {status.label}
                </span>
              </div>

              {/* Stock Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-secondary">Stock</span>
                  <span className="font-bold text-white">{item.stock} / {item.minStock * 3}</span>
                </div>
                <div className="w-full h-2 bg-carbon rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      status.color === 'red'
                        ? 'bg-red-500'
                        : status.color === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-gradient-to-r from-green-500 to-green-400'
                    }`}
                    style={{ width: `${stockPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-text-secondary mt-1">
                  Mínimo recomendado: {item.minStock} uds
                </p>
              </div>

              {/* Price + Actions */}
              <div className="flex items-center justify-between">
                <span className="text-gold font-bold text-lg font-display">
                  {formatCOP(item.price)}
                </span>

                {(canRequestStock || canAddStock) && (
                  <button
                    onClick={() => openStockModal(item)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      canAddStock
                        ? 'bg-magenta/10 border border-magenta/30 text-magenta hover:bg-magenta/20'
                        : 'bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20'
                    }`}
                  >
                    {canAddStock ? <PackagePlus size={14} /> : <Send size={14} />}
                    {canAddStock ? 'Agregar' : 'Solicitar'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-secondary">No se encontraron productos.</p>
        </div>
      )}

      {/* ── Modal Solicitar / Agregar Stock ── */}
      {isRequestModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface border border-border/50 rounded-3xl p-8 animate-[scaleIn_0.25s_ease-out_forwards]">
            {requestSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-green-400" />
                </div>
                <h2 className="text-2xl font-display text-white uppercase tracking-widest mb-2">
                  Solicitud Enviada
                </h2>
                <p className="text-text-secondary">
                  El administrador aprobará el reabastecimiento.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-display tracking-widest text-white uppercase">
                      {canAddStock ? 'Agregar' : 'Solicitar'} <span className="gradient-brand">Stock</span>
                    </h2>
                    <p className="text-text-secondary text-sm mt-1">{selectedItem.name}</p>
                  </div>
                  <button
                    onClick={() => setIsRequestModalOpen(false)}
                    className="w-10 h-10 rounded-xl border border-border/50 hover:bg-carbon transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="bg-carbon border border-border/50 rounded-2xl p-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Stock actual:</span>
                    <span className="text-white font-bold">{selectedItem.stock} unidades</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-text-secondary">Mínimo recomendado:</span>
                    <span className="text-yellow-400 font-bold">{selectedItem.minStock} unidades</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={requestQty}
                      onChange={(e) => setRequestQty(e.target.value)}
                      placeholder="Ej: 50"
                      className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-sm"
                    />
                  </div>

                  {canRequestStock && (
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                        Razón de la solicitud
                      </label>
                      <textarea
                        value={requestReason}
                        onChange={(e) => setRequestReason(e.target.value)}
                        placeholder="Ej: Alta demanda este fin de semana..."
                        rows={3}
                        className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta resize-none text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={canAddStock ? handleAddStock : handleRequestStock}
                    disabled={!requestQty || parseInt(requestQty) <= 0}
                    className={`px-6 py-3 rounded-2xl text-white font-bold transition-all shadow-lg cursor-pointer ${
                      requestQty && parseInt(requestQty) > 0
                        ? 'bg-gradient-to-r from-magenta to-vinotinto shadow-magenta/20 hover:opacity-90'
                        : 'bg-border/50 cursor-not-allowed'
                    }`}
                  >
                    {canAddStock ? 'Agregar stock' : 'Enviar solicitud'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
