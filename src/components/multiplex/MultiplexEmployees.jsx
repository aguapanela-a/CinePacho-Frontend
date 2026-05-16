import React, { useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  BadgeCheck,
  Trash2,
  Pencil,
  ShieldAlert,
  ArrowUpDown,
  X,
} from 'lucide-react'
import { getEmployeesByMultiplex, getMultiplexById } from '../../data/mockMultiplexData'

/**
 * Roles disponibles en el cine (excluyendo Manager si no tiene permiso)
 */
const ALL_ROLES = ['Cajero', 'Supervisor', 'Proyeccionista', 'Encargado de Snacks']
const ALL_ROLES_WITH_MANAGER = ['Manager', ...ALL_ROLES]

/**
 * MultiplexEmployees: Gestión de empleados de un multiplex específico.
 * Componente compartido con permisos controlados por props.
 *
 * @param {string}  multiplexId      - ID del multiplex
 * @param {boolean} canAssignManager  - ¿Puede promover a Manager? (solo Admin)
 * @param {boolean} canDismiss        - ¿Puede despedir directamente? (solo Admin)
 * @param {boolean} canRequestDismiss - ¿Puede solicitar despido? (solo Manager)
 * @param {boolean} canAddEmployee    - ¿Puede agregar empleados? (Admin y Manager)
 */
export default function MultiplexEmployees({
  multiplexId,
  canAssignManager = false,
  canDismiss = false,
  canRequestDismiss = false,
  canAddEmployee = true,
}) {
  const multiplex = getMultiplexById(multiplexId)
  const [employees, setEmployees] = useState(() => getEmployeesByMultiplex(multiplexId))
  const [search, setSearch] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [employeeToEdit, setEmployeeToEdit] = useState(null)
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false)
  const [employeeToDismiss, setEmployeeToDismiss] = useState(null)
  const [dismissalCause, setDismissalCause] = useState('')
  const [dismissalSuccess, setDismissalSuccess] = useState(false)

  const availableRoles = canAssignManager ? ALL_ROLES_WITH_MANAGER : ALL_ROLES

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.position.toLowerCase().includes(search.toLowerCase())
  )

  // ── Cambiar rol ──
  const handleSaveEdit = () => {
    setEmployees(employees.map((e) =>
      e.id === employeeToEdit.id ? employeeToEdit : e
    ))
    setIsEditModalOpen(false)
    setEmployeeToEdit(null)
  }

  // ── Despido directo (Admin) ──
  const handleDirectDismiss = () => {
    setEmployees(employees.map((e) =>
      e.id === employeeToDismiss.id ? { ...e, status: 'inactive' } : e
    ))
    setIsDismissModalOpen(false)
    setEmployeeToDismiss(null)
    setDismissalCause('')
  }

  // ── Solicitar despido (Manager) ──
  const handleRequestDismiss = () => {
    // En producción esto enviaría un POST al backend
    setDismissalSuccess(true)
    setTimeout(() => {
      setIsDismissModalOpen(false)
      setEmployeeToDismiss(null)
      setDismissalCause('')
      setDismissalSuccess(false)
    }, 2000)
  }

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-500/15 text-green-400 border border-green-500/20',
      inactive: 'bg-red-500/15 text-red-400 border border-red-500/20',
    }
    const labels = { active: 'Activo', inactive: 'Inactivo' }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles.active}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getPositionBadge = (position) => {
    const isManager = position === 'Manager'
    return (
      <div className={`inline-flex items-center gap-2 ${
        isManager
          ? 'bg-magenta/10 border border-magenta/20 text-magenta'
          : 'bg-gold/10 border border-gold/20 text-gold'
      } px-3 py-1.5 rounded-full text-sm font-bold`}>
        <BadgeCheck size={14} />
        {position}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-[fadeUp_0.4s_ease-out_forwards]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-magenta/15 border border-magenta/30 flex items-center justify-center">
              <Users className="text-magenta" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-display tracking-widest text-white uppercase">
                Gestión de <span className="gradient-brand">Empleados</span>
              </h1>
              <p className="text-text-secondary text-sm mt-1">
                Personal de {multiplex?.name || 'Multiplex'}
              </p>
            </div>
          </div>
        </div>

        {canAddEmployee && (
          <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-magenta to-vinotinto hover:opacity-90 transition-all text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-magenta/20 cursor-pointer">
            <Plus size={18} />
            Nuevo empleado
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-surface border border-border/50 rounded-3xl p-5">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o cargo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-carbon border border-border/50 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-magenta transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border/50 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-carbon/60 border-b border-border/50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold tracking-widest text-text-secondary uppercase">Empleado</th>
                <th className="text-left px-6 py-4 text-xs font-bold tracking-widest text-text-secondary uppercase">Contacto</th>
                <th className="text-left px-6 py-4 text-xs font-bold tracking-widest text-text-secondary uppercase">Cargo</th>
                <th className="text-left px-6 py-4 text-xs font-bold tracking-widest text-text-secondary uppercase">Estado</th>
                <th className="text-center px-6 py-4 text-xs font-bold tracking-widest text-text-secondary uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="border-b border-border/30 hover:bg-carbon/40 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-magenta/10 border border-magenta/20 flex items-center justify-center">
                        <Users size={18} className="text-magenta" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{emp.name}</p>
                        <p className="text-xs text-text-secondary">CC {emp.identityCard}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-text-primary">
                        <Mail size={14} className="text-magenta" />
                        {emp.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Phone size={14} />
                        {emp.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">{getPositionBadge(emp.position)}</td>
                  <td className="px-6 py-5">{getStatusBadge(emp.status)}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      {/* Editar rol */}
                      <button
                        onClick={() => { setEmployeeToEdit({ ...emp }); setIsEditModalOpen(true) }}
                        title="Cambiar rol"
                        className="w-10 h-10 rounded-xl border border-border/50 hover:border-magenta/40 hover:bg-magenta/10 transition-all flex items-center justify-center text-text-secondary hover:text-white cursor-pointer"
                      >
                        <ArrowUpDown size={16} />
                      </button>

                      {/* Despido / Solicitud de despido */}
                      {(canDismiss || canRequestDismiss) && emp.position !== 'Manager' && (
                        <button
                          onClick={() => { setEmployeeToDismiss(emp); setIsDismissModalOpen(true) }}
                          title={canDismiss ? 'Despedir' : 'Solicitar despido'}
                          className="w-10 h-10 rounded-xl border border-border/50 hover:border-red-500/40 hover:bg-red-500/10 transition-all flex items-center justify-center text-text-secondary hover:text-red-400 cursor-pointer"
                        >
                          {canRequestDismiss ? <ShieldAlert size={16} /> : <Trash2 size={16} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-text-secondary">No se encontraron empleados.</p>
          </div>
        )}
      </div>

      {/* ── Modal Editar Rol ── */}
      {isEditModalOpen && employeeToEdit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface border border-border/50 rounded-3xl p-8 animate-[scaleIn_0.25s_ease-out_forwards]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-display tracking-widest text-white uppercase">
                  Cambiar <span className="gradient-brand">Rol</span>
                </h2>
                <p className="text-text-secondary text-sm mt-1">{employeeToEdit.name}</p>
              </div>
              <button
                onClick={() => { setIsEditModalOpen(false); setEmployeeToEdit(null) }}
                className="w-10 h-10 rounded-xl border border-border/50 hover:bg-carbon transition-colors flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                Nuevo cargo
              </label>
              <select
                value={employeeToEdit.position}
                onChange={(e) => setEmployeeToEdit({ ...employeeToEdit, position: e.target.value })}
                className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => { setIsEditModalOpen(false); setEmployeeToEdit(null) }}
                className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-magenta/20 cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Despido / Solicitud de Despido ── */}
      {isDismissModalOpen && employeeToDismiss && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface border border-border/50 rounded-3xl p-8 animate-[scaleIn_0.25s_ease-out_forwards]">
            {dismissalSuccess ? (
              /* Confirmación de solicitud enviada */
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert size={28} className="text-green-400" />
                </div>
                <h2 className="text-2xl font-display text-white uppercase tracking-widest mb-2">
                  Solicitud Enviada
                </h2>
                <p className="text-text-secondary">
                  El administrador revisará la solicitud de despido.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    {canRequestDismiss ? <ShieldAlert className="text-yellow-400" size={24} /> : <Trash2 className="text-red-400" size={24} />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-display tracking-widest text-white uppercase">
                      {canRequestDismiss ? 'Solicitar Despido' : 'Confirmar Despido'}
                    </h2>
                    <p className="text-text-secondary text-sm mt-1">
                      {canRequestDismiss
                        ? 'La solicitud debe ser aprobada por el administrador'
                        : 'Esta acción desactivará al empleado'}
                    </p>
                  </div>
                </div>

                <div className="bg-carbon border border-border/50 rounded-2xl p-4 mb-6">
                  <p className="text-text-secondary text-sm">Empleado:</p>
                  <p className="text-white font-bold text-lg mt-1">{employeeToDismiss.name}</p>
                  <p className="text-text-secondary text-sm mt-1">{employeeToDismiss.position} · {employeeToDismiss.email}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                    Causal de despido *
                  </label>
                  <textarea
                    value={dismissalCause}
                    onChange={(e) => setDismissalCause(e.target.value)}
                    placeholder="Describa detalladamente la razón del despido..."
                    rows={4}
                    className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta resize-none text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => { setIsDismissModalOpen(false); setEmployeeToDismiss(null); setDismissalCause('') }}
                    className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={canRequestDismiss ? handleRequestDismiss : handleDirectDismiss}
                    disabled={!dismissalCause.trim()}
                    className={`px-6 py-3 rounded-2xl text-white font-bold transition-all shadow-lg cursor-pointer ${
                      dismissalCause.trim()
                        ? canRequestDismiss
                          ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 shadow-yellow-500/20 hover:opacity-90'
                          : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                        : 'bg-border/50 cursor-not-allowed'
                    }`}
                  >
                    {canRequestDismiss ? 'Enviar solicitud' : 'Despedir empleado'}
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
