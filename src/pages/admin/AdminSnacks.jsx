import { useState, useEffect, useCallback } from 'react'
import { Popcorn, Plus, Pencil, Search, Loader2, AlertCircle, Package } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useApp } from '../../context/useApp'
import { getAdminSnacks, createSnack, updateSnack } from '../../services/snackService'
import { getAllMultiplexes } from '../../services/multiplexService'

const EMPTY_FORM = {
  nameSnack: '',
  descriptionSnack: '',
  priceSnack: '',
  quantitySnack: '',
  pointsSnack: '',
  multiplexId: '',
}

export default function AdminSnacks() {
  const { user } = useApp()
  const [snacks, setSnacks]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [search, setSearch]       = useState('')
  const [multiplexes, setMultiplexes] = useState([])
  const [loadingMultiplexes, setLoadingMultiplexes] = useState(false)

  // ── Modal ──────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId]     = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)
  const [formError, setFormError]     = useState(null)

  // ── Carga inicial ──────────────────────────────────────────────────────
  const fetchSnacks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminSnacks()
      setSnacks(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadSnacks = async () => {
      await fetchSnacks()
    }
    loadSnacks()
  }, [fetchSnacks])

  useEffect(() => {
    const loadMultiplexes = async () => {
      setLoadingMultiplexes(true)
      try {
        const data = await getAllMultiplexes()
        setMultiplexes(Array.isArray(data) ? data : [])
      } catch {
        setMultiplexes([])
      } finally {
        setLoadingMultiplexes(false)
      }
    }
    loadMultiplexes()
  }, [])

  // ── Filtro local de búsqueda ───────────────────────────────────────────
  const filtered = snacks.filter(s =>
    s.nameSnack?.toLowerCase().includes(search.toLowerCase()) ||
    s.descriptionSnack?.toLowerCase().includes(search.toLowerCase())
  )

  // ── Abrir modales ──────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null)
    const lockedMultiplexId = user?.userType === 'MANAGER' ? user?.multiplexId : ''
    setForm({
      ...EMPTY_FORM,
      multiplexId: lockedMultiplexId || '',
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEdit = (snack) => {
    const lockedMultiplexId = user?.userType === 'MANAGER' ? user?.multiplexId : ''
    setEditingId(snack.idSnack)
    setForm({
      nameSnack:        snack.nameSnack,
      descriptionSnack: snack.descriptionSnack,
      priceSnack:       snack.priceSnack,
      quantitySnack:    snack.quantitySnack,
      pointsSnack:      snack.pointsSnack ?? '',
      multiplexId:      snack.multiplexId || lockedMultiplexId || '',
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  // ── Guardar ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const { nameSnack, descriptionSnack, priceSnack, quantitySnack, pointsSnack, multiplexId } = form
    const lockedMultiplexId = user?.userType === 'MANAGER' ? user?.multiplexId : ''
    const finalMultiplexId = lockedMultiplexId || multiplexId

    if (!nameSnack || !priceSnack || !quantitySnack || !finalMultiplexId) {
      setFormError('Nombre, precio, cantidad y multiplex son obligatorios.')
      return
    }
    setSaving(true)
    setFormError(null)
    const payload = {
      nameSnack,
      descriptionSnack,
      priceSnack:    parseFloat(priceSnack),
      quantitySnack: parseInt(quantitySnack),
      multiplexId: finalMultiplexId,
      ...(pointsSnack !== '' && { pointsSnack: parseInt(pointsSnack) }),
    }
    try {
      if (editingId) {
        const updated = await updateSnack(editingId, payload)
        setSnacks(prev => prev.map(s => s.idSnack === editingId ? updated : s))
      } else {
        const created = await createSnack(payload)
        setSnacks(prev => [...prev, created])
      }
      setIsModalOpen(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Helpers de estilo por nivel de stock ───────────────────────────────
  const stockBadge = (qty) => {
    if (qty <= 0) return 'bg-red-500/10 text-red-400 border-red-500/20'
    if (qty <= 10) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    return 'bg-green-500/10 text-green-400 border-green-500/20'
  }
  const stockLabel = (qty) => qty <= 0 ? 'Agotado' : qty <= 10 ? 'Bajo' : 'OK'

  return (
    <AdminLayout>
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-[fadeUp_0.5s_ease-out_forwards]">
        <div>
          <h1 className="text-4xl font-display uppercase tracking-widest text-white">
            <span className="gradient-brand">Snacks</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">Gestión del catálogo de snacks y combos</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-magenta to-vinotinto text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-magenta/20 hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus size={18} /> Nuevo Snack
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl px-5 py-4 mb-6">
          <AlertCircle size={18} /> {error}
          <button onClick={fetchSnacks} className="ml-auto text-xs underline">Reintentar</button>
        </div>
      )}

      {/* Panel de tabla */}
      <div className="bg-surface/50 border border-border/50 rounded-3xl p-6 backdrop-blur-xl animate-[fadeUp_0.6s_ease-out_forwards]">
        {/* Buscador */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Buscar snack..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-carbon border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-gold outline-none transition-colors"
            />
          </div>
          <span className="text-xs text-text-secondary">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-4 text-text-secondary">
            <Loader2 size={28} className="animate-spin text-magenta" />
            <span>Cargando snacks...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-text-secondary">
            <Popcorn size={40} className="mx-auto mb-3 opacity-30" />
            <p>{search ? `Sin resultados para "${search}"` : 'No hay snacks registrados.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50">
                  {['Nombre', 'Descripción', 'Precio', 'Stock', 'Estado', 'Acción'].map(h => (
                    <th key={h} className="py-4 px-4 text-xs font-bold text-text-secondary uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map(snack => (
                  <tr key={snack.idSnack} className="hover:bg-carbon/50 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-magenta/10 border border-magenta/20 flex items-center justify-center">
                          <Popcorn size={16} className="text-magenta" />
                        </div>
                        <span className="font-bold text-white">{snack.nameSnack}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-text-secondary max-w-xs truncate">
                      {snack.descriptionSnack || '—'}
                    </td>
                    <td className="py-4 px-4 font-bold text-gold">
                      ${Number(snack.priceSnack).toLocaleString('es-CO')}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-text-secondary" />
                        <span className="text-white font-bold">{snack.quantitySnack}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${stockBadge(snack.quantitySnack)}`}>
                        {stockLabel(snack.quantitySnack)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => openEdit(snack)}
                        className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-gold border border-border/50 hover:border-gold/40 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Pencil size={12} /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Crear / Editar ─────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface border border-border/50 rounded-3xl p-8 animate-[scaleIn_0.25s_ease-out_forwards]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-display tracking-widest text-white uppercase">
                  {editingId ? 'Editar ' : 'Nuevo '}<span className="gradient-brand">Snack</span>
                </h2>
                <p className="text-text-secondary text-sm mt-1">
                  {editingId ? 'Actualizar datos del producto' : 'Añadir producto al catálogo'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-xl border border-border/50 hover:bg-carbon transition-colors text-text-secondary"
              >✕</button>
            </div>

            <div className="space-y-4">
              {[
                { key: 'nameSnack', label: 'Nombre', placeholder: 'Combo Mega Cine', type: 'text' },
                { key: 'descriptionSnack', label: 'Descripción', placeholder: 'Palomitas + 2 refrescos', type: 'text' },
                { key: 'priceSnack', label: 'Precio ($)', placeholder: '45000', type: 'number' },
                { key: 'quantitySnack', label: 'Cantidad en stock', placeholder: '50', type: 'number' },
                { key: 'pointsSnack', label: 'Puntos por snack', placeholder: '5', type: 'number' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white transition-colors"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                Multiplex
              </label>
              <select
                value={form.multiplexId}
                onChange={(e) => setForm({ ...form, multiplexId: e.target.value })}
                className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white transition-colors"
                disabled={user?.userType === 'MANAGER'}
              >
                <option value="">
                  {loadingMultiplexes ? 'Cargando...' : 'Seleccionar multiplex'}
                </option>
                {multiplexes.map((m) => (
                  <option key={m.idMultiplex || m.id} value={m.idMultiplex || m.id}>
                    {m.nameMultiplex}
                  </option>
                ))}
              </select>
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={15} /> {formError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all"
              >Cancelar</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-magenta/20 disabled:opacity-60"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editingId ? 'Guardar cambios' : 'Crear snack'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

