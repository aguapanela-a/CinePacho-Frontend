import { useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Trash2,
  ShieldAlert,
  X,
} from 'lucide-react'
import { getEmployeesByMultiplex, getMultiplexById } from '../../data/mockMultiplexData'
import { useLanguage } from '../../context/LanguageContext'

const ALL_ROLES = ['Cajero', 'Supervisor', 'Proyeccionista', 'Encargado de Snacks']
const ALL_ROLES_WITH_MANAGER = ['Manager', ...ALL_ROLES]

export default function MultiplexEmployees({
  multiplexId,
  canAssignManager = false,
  canDismiss = false,
  canRequestDismiss = false,
  canAddEmployee = true,
}) {
  const { t } = useLanguage()
  const multiplex = getMultiplexById(multiplexId)
  
  const [employees, setEmployees] = useState(() => getEmployeesByMultiplex(multiplexId))
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Activos')
  
  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false)
  const [employeeToDismiss, setEmployeeToDismiss] = useState(null)
  const [dismissalCause, setDismissalCause] = useState('')

  // Formulario nuevo empleado
  const [newEmp, setNewEmp] = useState({
    name: '',
    role: 'Cajero',
    email: '',
    phone: '',
    documentId: ''
  })

  // Filtrado
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                          emp.documentId.includes(search)
    const matchesRole = roleFilter === 'Todos' || emp.role === roleFilter
    const matchesStatus = statusFilter === 'Todos' || 
                          (statusFilter === 'Activos' && emp.status === 'Activo') ||
                          (statusFilter === 'Inactivos' && emp.status === 'Inactivo')
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleAddEmployee = (e) => {
    e.preventDefault()
    if (!newEmp.name || !newEmp.documentId || !newEmp.email) return

    const created = {
      id: `EMP-${Date.now()}`,
      ...newEmp,
      status: 'Activo',
      hireDate: new Date().toISOString().split('T')[0]
    }

    setEmployees([created, ...employees])
    setIsAddModalOpen(false)
    setNewEmp({ name: '', role: 'Cajero', email: '', phone: '', documentId: '' })
  }

  const handleDirectDismiss = () => {
    setEmployees(employees.map(emp => 
      emp.id === employeeToDismiss.id 
        ? { ...emp, status: 'Inactivo', dismissalReason: dismissalCause } 
        : emp
    ))
    setIsDismissModalOpen(false)
    setEmployeeToDismiss(null)
    setDismissalCause('')
  }

  const handleRequestDismiss = () => {
    alert(`Solicitud de despido enviada a administración central para: ${employeeToDismiss.name}.\nMotivo: ${dismissalCause}`)
    setIsDismissModalOpen(false)
    setEmployeeToDismiss(null)
    setDismissalCause('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/40 border border-border/30 rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-magenta/10 border border-magenta/20 rounded-2xl flex items-center justify-center text-magenta">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-wider text-white">
              {t('admin.employees') || 'Empleados'}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Sede: {multiplex?.name || 'Cargando...'}
            </p>
          </div>
        </div>

        {canAddEmployee && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-magenta to-vinotinto text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-magenta/20 hover:opacity-90 transition-all cursor-pointer text-sm"
          >
            <Plus size={16} />
            Agregar Empleado
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface/20 border border-border/20 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-carbon border border-border/50 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white outline-none focus:border-magenta"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-carbon border border-border/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-magenta cursor-pointer"
        >
          <option value="Todos">Todos los roles</option>
          {(canAssignManager ? ALL_ROLES_WITH_MANAGER : ALL_ROLES).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-carbon border border-border/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-magenta cursor-pointer"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Activos">Solo Activos</option>
          <option value="Inactivos">Solo Inactivos</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-surface/30 border border-border/30 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-carbon/50 text-[11px] font-bold tracking-widest text-text-secondary uppercase">
                <th className="px-6 py-4">Empleado</th>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Fecha Ingreso</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-sm text-text-primary">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-white block">{emp.name}</span>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 ${
                          emp.role === 'Manager' ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-surface-light text-text-secondary border border-border'
                        }`}>
                          {emp.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-text-secondary">
                      {emp.documentId}
                    </td>
                    <td className="px-6 py-4 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <Mail size={12} /> <span className="truncate max-w-[160px]">{emp.email}</span>
                      </div>
                      {emp.phone && (
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <Phone size={12} /> <span>{emp.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-text-secondary">
                      {emp.hireDate}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          emp.status === 'Activo' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {emp.status}
                        </span>

                        {(canDismiss || canRequestDismiss) && emp.status === 'Activo' && (
                          <button
                            type="button"
                            onClick={() => { setEmployeeToDismiss(emp); setIsDismissModalOpen(true) }}
                            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                            title={canDismiss ? 'Despedir' : 'Solicitar Despido'}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-text-secondary">
                    No se encontraron empleados con los filtros activos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar Empleado */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <form onSubmit={handleAddEmployee} className="bg-surface border border-border/80 rounded-3xl w-full max-w-lg p-6 relative z-10 space-y-5 animate-[scaleUp_0.2s_ease-out]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-display text-white tracking-wider">Nuevo Empleado</h2>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-text-secondary hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-text-secondary tracking-widest uppercase block mb-1.5">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={newEmp.name}
                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                    className="w-full bg-carbon border border-border/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-magenta"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-secondary tracking-widest uppercase block mb-1.5">Cédula / Documento</label>
                  <input
                    type="text"
                    required
                    value={newEmp.documentId}
                    onChange={(e) => setNewEmp({ ...newEmp, documentId: e.target.value })}
                    className="w-full bg-carbon border border-border/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-magenta"
                  />
                </div>
              </div>

              {/* Corregido el cierre de la grilla aquí */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-text-secondary tracking-widest uppercase block mb-1.5">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    className="w-full bg-carbon border border-border/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-magenta"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-secondary tracking-widest uppercase block mb-1.5">Teléfono</label>
                  <input
                    type="text"
                    value={newEmp.phone}
                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                    className="w-full bg-carbon border border-border/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-magenta"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-secondary tracking-widest uppercase block mb-1.5">Cargo / Rol</label>
                <select
                  value={newEmp.role}
                  onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                  className="w-full bg-carbon border border-border/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-magenta cursor-pointer"
                >
                  {(canAssignManager ? ALL_ROLES_WITH_MANAGER : ALL_ROLES).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all cursor-pointer text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold transition-all shadow-lg shadow-magenta/20 hover:opacity-90 cursor-pointer text-sm"
              >
                Registrar Empleado
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Despido */}
      {isDismissModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setIsDismissModalOpen(false); setEmployeeToDismiss(null) }} />
          <div className="bg-surface border border-border/80 rounded-3xl w-full max-w-md p-6 relative z-10 space-y-5 animate-[scaleUp_0.2s_ease-out]">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert size={22} />
              <h2 className="text-lg font-bold font-display tracking-wider text-white">
                {canRequestDismiss ? 'Solicitar Despido' : 'Confirmar Despido'}
              </h2>
            </div>
            
            {employeeToDismiss && (
              <>
                <p className="text-sm text-text-primary leading-relaxed">
                  {canRequestDismiss 
                    ? `Vas a enviar una solicitud formal de terminación de contrato para `
                    : `¿Estás seguro de que deseas desvincular inmediatamente de la empresa a `}
                  <span className="font-bold text-white">{employeeToDismiss.name}</span> ({employeeToDismiss.role})?
                </p>

                <div>
                  <label className="text-[10px] font-bold text-text-secondary tracking-widest uppercase block mb-1.5">
                    Justificación / Motivo del Despido
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Escribe detalladamente la causa..."
                    value={dismissalCause}
                    onChange={(e) => setDismissalCause(e.target.value)}
                    className="w-full bg-carbon border border-border/50 rounded-xl px-4 py-3 text-white outline-none focus:border-magenta resize-none text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsDismissModalOpen(false); setEmployeeToDismiss(null); setDismissalCause('') }}
                    className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all cursor-pointer text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={canRequestDismiss ? handleRequestDismiss : handleDirectDismiss}
                    disabled={!dismissalCause.trim()}
                    className={`px-6 py-3 rounded-2xl text-white font-bold transition-all shadow-lg text-sm cursor-pointer ${
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
