import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Building2, MapPin, Plus, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  getAllMultiplexes,
  createMultiplex,
  updateMultiplex,
  deleteMultiplex,
} from '../../services/multiplexService'

// ── Formulario vacío reutilizable ──────────────────────────────────────────
const EMPTY_FORM = { nameMultiplex: '', addressMultiplex: '', cityMultiplex: '' }

export default function AdminMultiplexList() {
  // ── Estado principal ───────────────────────────────────────────────────
  const [multiplexList, setMultiplexList] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)

  // ── Estado del modal (create / edit) ──────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId]     = useState(null)   // null = crear, string = editar
  const [form, setForm]               = useState(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)
  const [formError, setFormError]     = useState(null)

  // ── Estado confirmación de borrado ────────────────────────────────────
  const [deletingId, setDeletingId] = useState(null)

  // ── Carga inicial desde el backend ────────────────────────────────────
  const fetchMultiplexes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllMultiplexes()
      setMultiplexList(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadMultiplexes = async () => {
      await fetchMultiplexes()
    }
    loadMultiplexes()
  }, [fetchMultiplexes])

  // ── Abrir modal para crear ─────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setIsModalOpen(true)
  }

  // ── Abrir modal para editar ───────────────────────────────────────────
  const openEdit = (plex, e) => {
    e.preventDefault()           // evita navegar al detalle
    e.stopPropagation()
    setEditingId(plex.idMultiplex)
    setForm({
      nameMultiplex:    plex.nameMultiplex,
      addressMultiplex: plex.addressMultiplex || '',
      cityMultiplex:    plex.cityMultiplex,
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  // ── Guardar (crear o editar) ───────────────────────────────────────────
  const handleSave = async () => {
    const { nameMultiplex, addressMultiplex, cityMultiplex } = form
    if (!nameMultiplex || !addressMultiplex || !cityMultiplex) {
      setFormError('Todos los campos son obligatorios.')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      if (editingId) {
        const updated = await updateMultiplex(editingId, form)
        setMultiplexList(prev => prev.map(p => p.idMultiplex === editingId ? updated : p))
      } else {
        const created = await createMultiplex(form)
        setMultiplexList(prev => [...prev, created])
      }
      setIsModalOpen(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Eliminar ───────────────────────────────────────────────────────────
  const handleDelete = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (deletingId === id) {
      // Segunda pulsación: confirmar borrado
      try {
        await deleteMultiplex(id)
        setMultiplexList(prev => prev.filter(p => p.idMultiplex !== id))
      } catch (err) {
        setError(err.message)
      } finally {
        setDeletingId(null)
      }
    } else {
      setDeletingId(id)
      // Auto-cancelar confirmación después de 3 s
      setTimeout(() => setDeletingId(d => d === id ? null : d), 3000)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      {/* Encabezado */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 animate-[fadeUp_0.5s_ease-out_forwards]">
        <div>
          <h1 className="text-5xl font-display uppercase tracking-widest text-white">
            <span className="gradient-brand">Multiplex</span>
          </h1>
          <p className="text-text-secondary mt-2 text-lg">
            Gestión de sedes a nivel nacional
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-magenta to-vinotinto text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-magenta/20 hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus size={18} />
          Nuevo Multiplex
        </button>
      </div>

      {/* Error de carga */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl px-5 py-4 mb-6">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={fetchMultiplexes} className="ml-auto text-xs underline hover:no-underline">
            Reintentar
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-text-secondary gap-4">
          <Loader2 size={36} className="animate-spin text-magenta" />
          <p className="text-sm">Cargando multiplex...</p>
        </div>
      ) : (
        <>
          {/* Grid de cards */}
          {multiplexList.length === 0 && !error ? (
            <div className="text-center py-24 text-text-secondary">
              <Building2 size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No hay multiplex registrados.</p>
              <button onClick={openCreate} className="mt-4 text-magenta hover:underline text-sm">
                Crear el primero →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {multiplexList.map((plex, index) => (
                <Link
                  key={plex.idMultiplex}
                  to={`/admin/multiplex/${plex.idMultiplex}/dashboard`}
                  style={{ animationDelay: `${index * 0.08}s` }}
                  className="group block bg-surface/80 border border-border/50 rounded-3xl p-6 backdrop-blur-xl hover:border-magenta/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-[fadeUp_0.5s_ease-out_forwards]"
                >
                  {/* Cabecera de la card */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-magenta/20 to-vinotinto/20 flex items-center justify-center border border-magenta/30 group-hover:scale-110 transition-transform">
                      <Building2 className="text-magenta" size={28} />
                    </div>

                    {/* Acciones rápidas */}
                    <div className="flex items-center gap-2">
                      {/* Botón Editar */}
                      <button
                        onClick={(e) => openEdit(plex, e)}
                        className="w-9 h-9 rounded-xl border border-border/50 bg-carbon/50 flex items-center justify-center text-text-secondary hover:text-gold hover:border-gold/40 transition-all"
                        title="Editar multiplex"
                      >
                        <Pencil size={14} />
                      </button>

                      {/* Botón Eliminar (doble click para confirmar) */}
                      <button
                        onClick={(e) => handleDelete(plex.idMultiplex, e)}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all text-xs font-bold ${
                          deletingId === plex.idMultiplex
                            ? 'bg-red-500/20 border-red-500/60 text-red-400 animate-pulse'
                            : 'border-border/50 bg-carbon/50 text-text-secondary hover:text-red-400 hover:border-red-500/40'
                        }`}
                        title={deletingId === plex.idMultiplex ? 'Confirmar eliminación' : 'Eliminar multiplex'}
                      >
                        {deletingId === plex.idMultiplex ? '!' : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Info del multiplex */}
                  <h2 className="text-2xl font-display text-white tracking-wide mb-2">
                    {plex.nameMultiplex}
                  </h2>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <MapPin size={14} className="text-magenta flex-shrink-0" />
                      {plex.addressMultiplex || '—'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Building2 size={14} className="text-gold flex-shrink-0" />
                      {plex.cityMultiplex}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Building2 size={14} className="text-magenta flex-shrink-0" />
                      {plex.rooms?.length ?? 0} sala{plex.rooms?.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="w-full bg-carbon border border-border/50 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-bold text-magenta transition-colors group-hover:bg-magenta/10">
                    Ver detalles
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Modal Crear / Editar ──────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-surface border border-border/50 rounded-3xl p-8 animate-[scaleIn_0.25s_ease-out_forwards]">

            {/* Header del modal */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-display tracking-widest text-white uppercase">
                  {editingId ? 'Editar ' : 'Nuevo '}
                  <span className="gradient-brand">Multiplex</span>
                </h2>
                <p className="text-text-secondary text-sm mt-1">
                  {editingId ? 'Actualizar datos de la sede' : 'Registrar nueva sede del sistema'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-xl border border-border/50 hover:bg-carbon transition-colors text-text-secondary"
              >
                ✕
              </button>
            </div>

            {/* Formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Nombre del multiplex
                </label>
                <input
                  type="text"
                  value={form.nameMultiplex}
                  onChange={(e) => setForm({ ...form, nameMultiplex: e.target.value })}
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white transition-colors"
                  placeholder="Ej: Las Américas"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Dirección
                </label>
                <input
                  type="text"
                  value={form.addressMultiplex}
                  onChange={(e) => setForm({ ...form, addressMultiplex: e.target.value })}
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white transition-colors"
                  placeholder="Av. Boyacá #80-94, Bogotá"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={form.cityMultiplex}
                  onChange={(e) => setForm({ ...form, cityMultiplex: e.target.value })}
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white transition-colors"
                  placeholder="Bogotá"
                />
              </div>
            </div>

            {/* Error de formulario */}
            {formError && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={15} />
                {formError}
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-magenta/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editingId ? 'Guardar cambios' : 'Crear multiplex'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

