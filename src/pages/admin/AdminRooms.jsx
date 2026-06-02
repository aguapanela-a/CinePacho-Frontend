import { useState } from 'react'
import {
  DoorOpen, Plus, Trash2, Loader2, AlertCircle,
  Users, Armchair, Star, CheckCircle, XCircle,
} from 'lucide-react'
import { createRoom, deleteRoom } from '../../services/roomService'

/**
 * AdminRooms — Gestión de salas dentro del drill-down de un multiplex.
 * Recibe las salas iniciales desde el response de GET /admin/multiplexes/{id}
 * para evitar una segunda llamada redundante.
 */
export default function AdminRooms({ multiplexId, multiplexName, initialRooms = [] }) {
  const [rooms, setRooms]         = useState(initialRooms)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [roomNumber, setRoomNumber]   = useState('')
  const [saving, setSaving]           = useState(false)
  const [formError, setFormError]     = useState(null)
  const [deletingId, setDeletingId]   = useState(null)
  const [globalError, setGlobalError] = useState(null)

  // ── Crear sala ────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!roomNumber || isNaN(Number(roomNumber)) || Number(roomNumber) < 1) {
      setFormError('Ingresa un número de sala válido (mayor a 0).')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const created = await createRoom({ multiplexId, roomNumber: Number(roomNumber) })
      setRooms(prev => [...prev, created])
      setRoomNumber('')
      setIsModalOpen(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Eliminar sala (doble-tap para confirmar) ───────────────────────────
  const handleDelete = async (id) => {
    if (deletingId === id) {
      try {
        await deleteRoom(id)
        setRooms(prev => prev.filter(r => r.idRoom !== id))
      } catch (err) {
        setGlobalError(err.message)
      } finally {
        setDeletingId(null)
      }
    } else {
      setDeletingId(id)
      setTimeout(() => setDeletingId(d => d === id ? null : d), 3000)
    }
  }

  return (
    <div className="animate-[fadeUp_0.5s_ease-out_forwards]">
      {/* Encabezado de sección */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-display uppercase tracking-widest text-white">
            Salas <span className="gradient-brand">/ Rooms</span>
          </h2>
          <p className="text-text-secondary mt-1 text-sm">
            Gestión de salas del multiplex <span className="text-white font-bold">{multiplexName}</span>
          </p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setFormError(null); setRoomNumber('') }}
          className="flex items-center gap-2 bg-gradient-to-r from-magenta to-vinotinto text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-magenta/20 hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus size={18} />
          Nueva Sala
        </button>
      </div>

      {/* Error global */}
      {globalError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl px-5 py-4 mb-6">
          <AlertCircle size={18} />
          {globalError}
        </div>
      )}

      {/* Lista de salas */}
      {rooms.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <DoorOpen size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">Este multiplex no tiene salas registradas.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-magenta hover:underline text-sm"
          >
            Crear la primera sala →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rooms.map((room, index) => (
            <div
              key={room.idRoom}
              style={{ animationDelay: `${index * 0.07}s` }}
              className="bg-surface/80 border border-border/50 rounded-3xl p-6 backdrop-blur-xl animate-[fadeUp_0.5s_ease-out_forwards] hover:border-gold/30 transition-all duration-300"
            >
              {/* Header de la card de sala */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold/20 to-magenta/10 flex items-center justify-center border border-gold/30">
                    <DoorOpen className="text-gold" size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase tracking-widest">Sala</p>
                    <h3 className="text-2xl font-display text-white">#{room.roomNumber}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Badge activo/inactivo */}
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                    room.isRoomActive
                      ? 'bg-green-500/15 text-green-400 border-green-500/20'
                      : 'bg-red-500/15 text-red-400 border-red-500/20'
                  }`}>
                    {room.isRoomActive
                      ? <><CheckCircle size={11} /> Activa</>
                      : <><XCircle size={11} /> Inactiva</>
                    }
                  </span>

                  {/* Eliminar */}
                  <button
                    onClick={() => handleDelete(room.idRoom)}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all text-xs font-bold ${
                      deletingId === room.idRoom
                        ? 'bg-red-500/20 border-red-500/60 text-red-400 animate-pulse'
                        : 'border-border/50 text-text-secondary hover:text-red-400 hover:border-red-500/40'
                    }`}
                    title={deletingId === room.idRoom ? 'Confirmar eliminación' : 'Eliminar sala'}
                  >
                    {deletingId === room.idRoom ? '!' : <Trash2 size={13} />}
                  </button>
                </div>
              </div>

              {/* Estadísticas de asientos */}
              {room.seats && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-text-secondary">
                      <Armchair size={14} className="text-magenta" />
                      General disponible
                    </span>
                    <span className="font-bold text-white">{room.seats.availableGeneral}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-text-secondary">
                      <Star size={14} className="text-gold" />
                      Preferencial disponible
                    </span>
                    <span className="font-bold text-white">{room.seats.availablePreferential}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-text-secondary">
                      <Users size={14} className="text-magenta" />
                      Total disponible
                    </span>
                    <span className="font-bold text-gold text-base">{room.seats.totalAvailable}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Crear Sala ─────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface border border-border/50 rounded-3xl p-8 animate-[scaleIn_0.25s_ease-out_forwards]">

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-display tracking-widest text-white uppercase">
                  Nueva <span className="gradient-brand">Sala</span>
                </h2>
                <p className="text-text-secondary text-sm mt-1">
                  Sala para <span className="text-white">{multiplexName}</span>
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-xl border border-border/50 hover:bg-carbon transition-colors text-text-secondary"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                Número de sala
              </label>
              <input
                type="number"
                min={1}
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white transition-colors"
                placeholder="Ej: 5"
                autoFocus
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={15} />
                {formError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-magenta/20 disabled:opacity-60"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Crear sala
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

