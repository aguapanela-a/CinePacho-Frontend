import { useState } from 'react'
import {
  Popcorn,
  Search,
  PackagePlus,
  CheckCircle,
  X,
} from 'lucide-react'
import { getInventoryByMultiplex, getMultiplexById, formatCOP } from '../../data/mockMultiplexData'

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

  const categories = ['Todos', ...new Set(items.map(item => item.category))]

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filterCategory === 'Todos' || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const openActionModal = (item) => {
    setSelectedItem(item)
    setRequestQty('')
    setRequestReason('')
    setRequestSuccess(false) // Forzar reinicio del estado del modal
    setIsRequestModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsRequestModalOpen(false)
    setSelectedItem(null)
    setRequestQty('')
    setRequestReason('')
    setRequestSuccess(false) // Limpieza preventiva
  }

  const handleAddStock = () => {
    const qty = parseInt(requestQty)
    if (isNaN(qty) || qty <= 0) return

    setItems(items.map(item => 
      item.id === selectedItem.id 
        ? { ...item, stock: item.stock + qty }
        : item
    ))
    setRequestSuccess(true)
  }

  const handleRequestStock = () => {
    const qty = parseInt(requestQty)
    if (isNaN(qty) || qty <= 0) return
    
    // Simula el envío exitoso
    setRequestSuccess(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface/40 border border-border/30 rounded-3xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-magenta/10 border border-magenta/20 rounded-2xl flex items-center justify-center text-magenta">
          <Popcorn size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display tracking-wider text-white">Inventario de Sede</h1>
          <p className="text-xs text-text-secondary mt-0.5">Sede: {multiplex?.name || 'Cargando...'}</p>
        </div>
      </div>

      {/* Controles de Filtrado */}
      <div className="flex flex-col md:flex-row gap-4 bg-surface/20 border border-border/20 rounded-2xl p-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
          <input
            type="text"
            placeholder="Buscar insumo o snack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-carbon border border-border/50 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white outline-none focus:border-magenta"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {categories.map(cat => (
            <button
              type="button"
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-gradient-to-r from-magenta to-vinotinto text-white shadow-md'
                  : 'bg-carbon text-text-secondary border border-border/50 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const isLowStock = item.stock <= item.minStock
          const isOut = item.stock === 0

          return (
            <div
              key={item.id}
              className={`bg-surface/40 border rounded-2xl p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                isOut 
                  ? 'border-red-500/30 bg-red-500/[0.02]' 
                  : isLowStock 
                    ? 'border-yellow-500/30 bg-yellow-500/[0.01]' 
                    : 'border-border/30'
              }`}
            >
              {/* Alertas Visuales */}
              {isLowStock && (
                <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-bold tracking-wider rounded-bl-xl uppercase ${
                  isOut ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {isOut ? 'Agotado' : 'Stock Crítico'}
                </div>
              )}

              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-text-secondary block mb-1">
                  {item.category}
                </span>
                <h3 className="text-white font-bold text-base leading-snug mb-3">
                  {item.name}
                </h3>

                <div className="grid grid-cols-2 gap-2 bg-carbon/50 border border-white/5 rounded-xl p-3 mb-4">
                  <div>
                    <span className="text-[9px] text-text-secondary uppercase block font-medium">Stock Actual</span>
                    <span className={`text-base font-display tracking-wide font-bold ${
                      isOut ? 'text-red-400' : isLowStock ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {item.stock} <span className="text-xs font-body font-normal text-text-secondary">uds</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-text-secondary uppercase block font-medium">Mínimo Requerido</span>
                    <span className="text-base font-display tracking-wide font-bold text-white">
                      {item.minStock} <span className="text-xs font-body font-normal text-text-secondary">uds</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/20">
                <div>
                  <span className="text-[9px] text-text-secondary uppercase block font-medium">Precio Venta</span>
                  <span className="text-white font-bold text-sm">
                    {item.price > 0 ? formatCOP(item.price) : 'N/A (Insumo)'}
                  </span>
                </div>

                {(canAddStock || canRequestStock) && (
                  <button
                    type="button"
                    onClick={() => openActionModal(item)}
                    className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      canAddStock 
                        ? 'bg-magenta/10 border-magenta/30 text-magenta hover:bg-magenta/20'
                        : 'bg-gold/10 border-gold/30 text-gold hover:bg-gold/20'
                    }`}
                    title={canAddStock ? 'Agregar stock' : 'Solicitar reabastecimiento'}
                  >
                    <PackagePlus size={16} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Reabastecimiento */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="bg-surface border border-border/80 rounded-3xl w-full max-w-md p-6 relative z-10 space-y-5 animate-[scaleUp_0.2s_ease-out]">
            
            {requestSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400">
                  <CheckCircle size={28} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg font-display tracking-wider">
                    {canAddStock ? 'Stock Actualizado' : 'Solicitud Enviada'}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {canAddStock 
                      ? `Se han sumado ${requestQty} unidades a ${selectedItem?.name}.`
                      : `La solicitud por ${requestQty} unidades ha sido radicada al Administrador.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold transition-all shadow-lg cursor-pointer text-sm"
                >
                  Aceptar
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PackagePlus size={20} className={canAddStock ? 'text-magenta' : 'text-gold'} />
                    <h2 className="text-lg font-bold font-display text-white tracking-wider">
                      {canAddStock ? 'Cargar Inventario' : 'Solicitar Stock'}
                    </h2>
                  </div>
                  <button type="button" onClick={handleCloseModal} className="text-text-secondary hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="bg-carbon/40 border border-border/30 rounded-xl p-3 text-xs">
                  <span className="text-text-secondary block">Insumo seleccionado:</span>
                  <span className="text-white font-bold text-sm block mt-0.5">{selectedItem?.name}</span>
                  <span className="text-text-secondary block mt-2">
                    Stock actual: <strong className="text-white">{selectedItem?.stock} uds</strong>
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary tracking-widest uppercase block mb-1.5">
                      Cantidad a ingresar
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ej. 50"
                      value={requestQty}
                      onChange={(e) => setRequestQty(e.target.value)}
                      className="w-full bg-carbon border border-border/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-magenta"
                    />
                  </div>

                  {canRequestStock && (
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary tracking-widest uppercase block mb-1.5">
                        Justificación del pedido
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Motivo (Ej. Alta demanda de fin de semana)"
                        value={requestReason}
                        onChange={(e) => setRequestReason(e.target.value)}
                        className="w-full bg-carbon border border-border/50 rounded-xl px-4 py-3 text-white outline-none focus:border-magenta resize-none text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all cursor-pointer text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (canAddStock) {
                        handleAddStock()
                      } else if (canRequestStock) {
                        handleRequestStock()
                      }
                    }}
                    disabled={!requestQty || parseInt(requestQty) <= 0}
                    className={`px-6 py-3 rounded-2xl text-white font-bold transition-all shadow-lg text-sm cursor-pointer ${
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
