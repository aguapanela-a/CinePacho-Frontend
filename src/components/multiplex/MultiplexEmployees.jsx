import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Plus,
  Search,
  Mail,
  Trash2,
  ShieldAlert,
  Loader2,
  AlertCircle,
  Phone // Corregido: Importación y nombre correcto del ícono
} from 'lucide-react'

import { getEmployeesByMultiplexId} from '../../services/multiplexService'
import { registerEmployee, updateEmployee, dismissEmployee } from '../../services/employeeService'
import { getMultiplexById } from '../../services/multiplexService'
import { useLanguage } from '../../context/LanguageContext'

// Diccionario para mostrar nombres legibles en la interfaz basándose en lo que viene de la BD
const ROLE_LABELS = {
  CASHIER: 'Cajero',
  DISPATCHER: 'Despachador de comida',
  ROOM_ATTENDANT: 'Encargado de sala',
  CLEANER: 'Aseador',
  MANAGER: 'Manager'
}

const ALL_ROLES = [
  { id: 'CASHIER', name: 'Cajero' },
  { id: 'DISPATCHER', name: 'Despachador de comida' },
  { id: 'ROOM_ATTENDANT', name: 'Encargado de sala' },
  { id: 'CLEANER', name: 'Aseador' }
]

export default function MultiplexEmployees({
  multiplexId,
  canAssignManager = false,
  canDismiss = false,
  canRequestDismiss = false,
  canAddEmployee = true,
}) {
  const { t } = useLanguage()
  const [multiplex, setMultiplex] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Activos')
  
  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false)
  const [employeeToDismiss, setEmployeeToDismiss] = useState(null)
  const [dismissalCause, setDismissalCause] = useState('')
  const [errorForm, setErrorForm] = useState(null)
  const [creating, setCreating] = useState(false)

  const [newEmployee, setNewEmployee] = useState({
    email: '',
    name: '',
    password: '',
    userType: 'EMPLOYEE', // Corregido: Valor por defecto consistente
    indentityCard: '',
    phoneNumber: '',
    salary: '',
    rol: '',
    startDate: '',
    multiplexId: ''
  })

  // Memorizamos la función con useCallback
  const fetchEmployees = useCallback(async () => {
    if (!multiplexId) return
    try {
      Promise.resolve().then(() => setLoading(true))
      const data = await getEmployeesByMultiplexId(multiplexId)
      setEmployees(data)
    } catch (error) {
      console.error("Error al cargar empleados", error)
    } finally {
      setLoading(false)
    }
  }, [multiplexId])

  // Carga inicial y sincronización
  useEffect(() => {
    if (!multiplexId) return
    
    getMultiplexById(multiplexId)
      .then(data => setMultiplex(data))
      .catch(() => setMultiplex(null))

    fetchEmployees()
  }, [multiplexId, fetchEmployees])




  // Crear empleado
  const handleCreateEmployee = async () => {
    if (
      !newEmployee.email ||
      !newEmployee.name ||
      !newEmployee.password ||
      !newEmployee.userType ||
      !newEmployee.indentityCard ||
      !newEmployee.phoneNumber ||
      !newEmployee.salary ||
      !newEmployee.rol ||
      !newEmployee.startDate ||
      !multiplexId
    ) {
      setErrorForm('Todos los campos son obligatorios')
      return
    }

    setCreating(true)
    setErrorForm(null)

    try {
      const payload = {
        email: newEmployee.email,
        name: newEmployee.name,
        password: newEmployee.password,
        userType: newEmployee.userType,
        indentityCard: newEmployee.indentityCard,
        phoneNumber: newEmployee.phoneNumber,
        salary: Number(newEmployee.salary),
        rol: newEmployee.rol,
        startDate: `${newEmployee.startDate} 00:00:00`,
        multiplexId: multiplexId
      }

      await registerEmployee(payload)
      await fetchEmployees() // Recarga la tabla inmediatamente

      setNewEmployee({
        email: '',
        name: '',
        password: '',
        userType: 'EMPLOYEE',
        indentityCard: '',
        phoneNumber: '',
        salary: '',
        rol: '',
        startDate: '',
        multiplexId: multiplexId
      })

      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
      setErrorForm(err.message || 'Error al crear empleado')
    } finally {
      setCreating(false)
    }
  }

  // Filtrado optimizado con mapeo de roles de BD
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                          emp.indentityCard.includes(search)
    const matchesRole = roleFilter === 'Todos' || emp.rol === roleFilter
    const matchesStatus = statusFilter === 'Todos' || 
                          (statusFilter === 'Activos' && emp.status === 'Activo') ||
                          (statusFilter === 'Inactivos' && emp.status === 'Inactivo')
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleDirectDismiss = () => {
    setEmployees(employees.map(emp => 
      emp.indentityCard === employeeToDismiss.indentityCard 
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

  const rolesDisponibles = canAssignManager 
    ? [{ id: 'MANAGER', name: 'Manager' }, ...ALL_ROLES] 
    : ALL_ROLES

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
            onClick={() => setIsModalOpen(true)}
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
          {rolesDisponibles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
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
                  <tr key={emp.indentityCard} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-white block">{emp.name}</span>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 ${
                          emp.rol === 'MANAGER' ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-surface-light text-text-secondary border border-border'
                        }`}>
                          {ROLE_LABELS[emp.rol] || emp.rol}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-text-secondary">
                      {emp.indentityCard}
                    </td>
                    <td className="px-6 py-4 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <Mail size={12} /> <span className="truncate max-w-[160px]">{emp.email}</span>
                      </div>
                      {emp.phoneNumber && (
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <Phone size={12} /> <span>{emp.phoneNumber}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-text-secondary">
                      {emp.startDate ? emp.startDate.split(' ')[0] : 'N/A'} {/* Corregido: Uso de startDate */}
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

      {/* Modal Crear Empleado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-surface border border-border/50 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-display tracking-widest text-white uppercase">
                  Nuevo <span className="gradient-brand">Empleado</span>
                </h2>
                <p className="text-text-secondary text-sm mt-1">
                  Registrar nuevo empleado del sistema
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-xl border border-border/50 hover:bg-carbon text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-white">
              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Correo
                </label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
                  placeholder="empleado@cinepacho.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={newEmployee.phoneNumber}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phoneNumber: e.target.value })}
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
                  placeholder="3001234567"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Cargo
                </label>
                <select
                  value={newEmployee.rol}
                  onChange={(e) => setNewEmployee({ ...newEmployee, rol: e.target.value })}
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white cursor-pointer"
                >
                  <option value=""></option>
                  {ALL_ROLES.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Tipo de usuario
                </label>
                <select
                  value={newEmployee.userType}
                  onChange={(e) => setNewEmployee({ ...newEmployee, userType: e.target.value })}
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white cursor-pointer"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
                  placeholder="Min. 8 caracteres"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Cédula
                </label>
                <input
                  type="text"
                  value={newEmployee.indentityCard}
                  onChange={(e) => setNewEmployee({ ...newEmployee, indentityCard: e.target.value })}
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
                  placeholder="Ej: 1010101010"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Salario ($)
                </label>
                <input
                  type="number"
                  value={newEmployee.salary}
                  onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
                  placeholder="Ej: 1500000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Fecha de Contrato
                </label>
                <input
                  type="date"
                  value={newEmployee.startDate} 
                  onChange={(e) => setNewEmployee({ ...newEmployee, startDate: e.target.value })}
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Multiplex
                </label>
                <select
                  value={multiplexId}
                  disabled
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none text-text-secondary opacity-70 cursor-not-allowed"
                >
                  <option value={multiplexId}>
                    {multiplex?.name || 'Cargando...'}
                  </option>
                </select>
              </div>
            </div>

            {errorForm && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={15} /> {errorForm}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateEmployee}
                disabled={creating}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-magenta/20 disabled:opacity-60 cursor-pointer"
              >
                {creating && <Loader2 size={16} className="animate-spin" />}
                Guardar empleado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Despido */}
      {isDismissModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setIsDismissModalOpen(false); setEmployeeToDismiss(null) }} />
          <div className="bg-surface border border-border/80 rounded-3xl w-full max-w-md p-6 relative z-10 space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert size={22} />
              <h2 className="text-lg font-bold font-display tracking-wider text-white">
                {canRequestDismiss ? 'Solicitar Despido' : 'Confirmar Despido'}
              </h2>
            </div>
            
            {employeeToDismiss && (
              <>
                <p className="text-sm text-text-primary leading-relaxed text-white">
                  {canRequestDismiss 
                    ? `Vas a enviar una solicitud formal de terminación de contrato para `
                    : `¿Estás seguro de que deseas desvincular inmediatamente de la empresa a `}
                  <span className="font-bold text-magenta">{employeeToDismiss.name}</span> ({ROLE_LABELS[employeeToDismiss.rol] || employeeToDismiss.rol})?
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