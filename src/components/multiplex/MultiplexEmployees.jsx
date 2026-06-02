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
  Phone,
  Pencil // <-- Añadido para la edición
} from 'lucide-react'

// Asegúrate de que estos nombres y rutas coincidan al 100% con tus archivos de servicios
import { getEmployeesByMultiplexId } from '../../services/multiplexService' 
import { registerEmployee, updateEmployee, deleteEmployee } from '../../services/employeeService'
import { getMultiplexById } from '../../services/multiplexService'
import { useLanguage } from '../../context/LanguageContext'

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
  multiplexId, // <-- REVISA QUE EL PADRE PASE ESTO CORRECTAMENTE
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
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false)
  const [employeeToDismiss, setEmployeeToDismiss] = useState(null)
  const [dismissalCause, setDismissalCause] = useState('')
  const [errorForm, setErrorForm] = useState(null)
  const [creating, setCreating] = useState(false)


  //confirmar borrar empleados
  
  const confirmDeleteEmployee = async () => {
  if (!employeeToDelete) return
  try {
    await deleteEmployee(employeeToDelete.uniqueCode)

    setEmployees(
      employees.filter(
        (employee) => employee.uniqueCode !== employeeToDelete.uniqueCode
      )
    )

    setIsDeleteModalOpen(false)
    setEmployeeToDelete(null)
  } catch (error) {
    console.error('Error eliminando empleado:', error)
    // Opcional: Podrías manejar un alert o estado de error aquí
  }
}
  
  
  //Editar empleados
  
  // AdminEmployees.jsx
  const handleEditEmployee = async () => {
  
    const lockedMultiplexId = multiplexId
  
  
    console.log('Employee to edit:', employeeToEdit)
    console.log('Final Multiplex ID:', multiplexId)
    console.log('EmployeeToEdit fields:', {
      email: employeeToEdit.email,
      name: employeeToEdit.name,
      userType: employeeToEdit.userType,
      indentityCard: employeeToEdit.indentityCard,
      phoneNumber: employeeToEdit.phoneNumber,
      salary: employeeToEdit.salary,
      rol: employeeToEdit.rol,
      startDate: employeeToEdit.startDate,
      multiplexId: employeeToEdit.multiplexId,
    })
  
    if (
      !employeeToEdit.email ||
      !employeeToEdit.name ||
      !employeeToEdit.userType ||
      !employeeToEdit.indentityCard ||
      !employeeToEdit.phoneNumber ||
      !employeeToEdit.salary ||
      !employeeToEdit.rol ||
      !employeeToEdit.startDate ||
      !multiplexId
    ) {
      setErrorForm('Todos los campos son obligatorios')
      return
    }
  
    setCreating(true)
    setErrorForm(null)
  
    try {
      const payload = {
  
        uniqueCode: employeeToEdit.uniqueCode,
        email: employeeToEdit.email,
        name: employeeToEdit.name,
        password: employeeToEdit.password ?? '', // el service lo actualiza, si no cambia envía el actual o maneja en backend
        userType: employeeToEdit.userType,
        indentityCard: employeeToEdit.indentityCard,
        phoneNumber: employeeToEdit.phoneNumber,
        salary: Number(employeeToEdit.salary),
        rol: employeeToEdit.rol,
        startDate: `${employeeToEdit.startDate} 00:00:00`,
        multiplexId: multiplexId,
      }
  
      await updateEmployee(payload)

      await fetchEmployees()
  
      setIsEditModalOpen(false)
      setEmployeeToEdit(null)
    } catch (error) {
      console.error('Error actualizando empleado:', error)
    } finally {
      setCreating(false)  // ← agregar esto
    }
  }
  
  

  // ---- NUEVOS ESTADOS PARA EDICIÓN Y ELIMINACIÓN ----
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [employeeToEdit, setEmployeeToEdit] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)

  const [newEmployee, setNewEmployee] = useState({
    email: '',
    name: '',
    password: '',
    userType: 'EMPLOYEE',
    indentityCard: '',
    phoneNumber: '',
    salary: '',
    rol: '',
    startDate: '',
    multiplexId: ''
  })

  // Carga de empleados optimizada
  const fetchEmployees = useCallback(async () => {
    if (!multiplexId) return
    try {
      setLoading(true)
      console.log(`[API] Solicitando empleados para el multiplex ID: ${multiplexId}`)
      const data = await getEmployeesByMultiplexId(multiplexId)
      console.log('[API] Respuesta de empleados recibida:', data)
      setEmployees(data || [])
    } catch (error) {
      console.error("[ERROR API] Error al cargar empleados:", error)
    } finally {
      setLoading(false)
    }
  }, [multiplexId])

  // Hook de sincronización principal
  useEffect(() => {
    console.log(`[Componente] Renderizado o cambio detectado en multiplexId: "${multiplexId}"`)
    
    if (!multiplexId) {
      console.warn("[Advertencia] multiplexId es undefined o nulo. Las peticiones a la API están bloqueadas.")
      return
    }
    
    // Cargar datos de la sede
    console.log(`[API] Solicitando info del multiplex ID: ${multiplexId}`)
    getMultiplexById(multiplexId)
      .then(data => {
        console.log('[API] Datos del multiplex cargados:', data)
        setMultiplex(data)
      })
      .catch(err => {
        console.error("[ERROR API] Error al obtener multiplex por ID:", err)
        setMultiplex(null)
      })

    fetchEmployees()
  }, [multiplexId, fetchEmployees])

  const handleCreateEmployee = async () => {
    if (
      !newEmployee.email || !newEmployee.name || !newEmployee.password || 
      !newEmployee.userType || !newEmployee.indentityCard || !newEmployee.phoneNumber || 
      !newEmployee.salary || !newEmployee.rol || !newEmployee.startDate || !multiplexId
    ) {
      setErrorForm('Todos los campos son obligatorios')
      return
    }

    setCreating(true)
    setErrorForm(null)

    try {
      const payload = {
        ...newEmployee,
        salary: Number(newEmployee.salary),
        startDate: `${newEmployee.startDate} 00:00:00`,
        multiplexId: multiplexId
      }

      await registerEmployee(payload)
      await fetchEmployees()

      setNewEmployee({
        email: '', name: '', password: '', userType: 'EMPLOYEE',
        indentityCard: '', phoneNumber: '', salary: '', rol: '',
        startDate: '', multiplexId: multiplexId
      })
      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
      setErrorForm(err.message || 'Error al crear empleado')
    } finally {
      setCreating(false)
    }
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(search.toLowerCase()) || 
                          emp.indentityCard?.includes(search)
    const matchesRole = roleFilter === 'Todos' || emp.rol === roleFilter
    return matchesSearch && matchesRole
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
    alert(`Solicitud enviada para: ${employeeToDismiss.name}.`)
    setIsDismissModalOpen(false)
    setEmployeeToDismiss(null)
    setDismissalCause('')
  }

  const rolesDisponibles = canAssignManager 
    ? [{ id: 'MANAGER', name: 'Manager' }, ...ALL_ROLES] 
    : ALL_ROLES

  // Definición segura para evitar fallos con la búsqueda de tu fragmento
  const multiplexes = multiplex ? [multiplex] : []

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
              Sede: {multiplex?.nameMultiplex || (loading ? 'Cargando sede...' : 'No disponible')}
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
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-sm text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-text-secondary">
                    <div className="flex items-center justify-center gap-2 text-magenta">
                      <Loader2 size={18} className="animate-spin" /> Cargando listado de empleados...
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length > 0 ? (
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
                      {emp.startDate ? emp.startDate.split(' ')[0] : 'N/A'}
                    </td>
                    
                    {/* IMPLEMENTACIÓN CORRECTA DE TU SNIPPET (ADAPTADO DE 'employee' A 'emp') */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Employee data:', emp)

                            const currentMultiplex = multiplexes.find(m => m.nameMultiplex === emp.nameMultiplex)
                            setEmployeeToEdit({
                              uniqueCode: emp.uniqueCode,
                              name: emp.name,
                              email: emp.email,
                              phoneNumber: emp.phoneNumber,
                              rol: emp.rol,
                              userType: emp.userType || 'EMPLOYEE',
                              indentityCard: emp.indentityCard,
                              salary: emp.salary,
                              startDate: emp.startDate ? (emp.startDate.includes('T') ? emp.startDate.split('T')[0] : emp.startDate.split(' ')[0]) : '',
                              password: '',
                              multiplexId: currentMultiplex?.idMultiplex || currentMultiplex?.id || '',
                            })
                            console.log('Multiplex encontrado:', currentMultiplex)
                            console.log('IDs disponibles:', multiplexes.map(m => ({ id: m.idMultiplex, name: m.nameMultiplex })))
                            console.log('StartDate original:', emp.startDate)
                            setIsEditModalOpen(true)
                          }}
                          className="w-10 h-10 rounded-xl border border-border/50 hover:border-magenta/40 hover:bg-magenta/10 transition-all flex items-center justify-center text-text-secondary hover:text-white cursor-pointer"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEmployeeToDelete(emp)
                            setIsDeleteModalOpen(true)
                          }}
                          className="w-10 h-10 rounded-xl border border-border/50 hover:border-red-500/40 hover:bg-red-500/10 transition-all flex items-center justify-center text-text-secondary hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-text-secondary">
                    No se encontraron empleados en esta sede.
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
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl border border-border/50 hover:bg-carbon text-white">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-white">
              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">Nombre completo</label>
                <input type="text" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta" placeholder="Juan Pérez" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">Correo</label>
                <input type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta" placeholder="empleado@cinepacho.com" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">Teléfono</label>
                <input type="text" value={newEmployee.phoneNumber} onChange={(e) => setNewEmployee({ ...newEmployee, phoneNumber: e.target.value })} className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta" placeholder="3001234567" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">Cargo</label>
                <select value={newEmployee.rol} onChange={(e) => setNewEmployee({ ...newEmployee, rol: e.target.value })} className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white cursor-pointer">
                  <option value=""></option>
                  {ALL_ROLES.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">Tipo de usuario</label>
                <select value={newEmployee.userType} onChange={(e) => setNewEmployee({ ...newEmployee, userType: e.target.value })} className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white cursor-pointer">
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">Contraseña</label>
                <input type="password" value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta" placeholder="Min. 8 caracteres" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">Cédula</label>
                <input type="text" value={newEmployee.indentityCard} onChange={(e) => setNewEmployee({ ...newEmployee, indentityCard: e.target.value })} className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta" placeholder="Ej: 1010101010" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">Salario ($)</label>
                <input type="number" value={newEmployee.salary} onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })} className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta" placeholder="Ej: 1500000" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">Fecha de Contrato</label>
                <input type="date" value={newEmployee.startDate} onChange={(e) => setNewEmployee({ ...newEmployee, startDate: e.target.value })} className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">Multiplex Asignado</label>
                <select
                  value={multiplexId || ''}
                  disabled
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none text-text-secondary opacity-70 cursor-not-allowed"
                >
                  <option value={multiplexId || ''}>
                    {multiplex?.nameMultiplex || 'Cargando datos del multiplex...'}
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
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all cursor-pointer">Cancelar</button>
              <button onClick={handleCreateEmployee} disabled={creating} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold hover:opacity-90 disabled:opacity-60 cursor-pointer">
                {creating && <Loader2 size={16} className="animate-spin" />} Guardar empleado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Empleado */}
{isEditModalOpen && (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-2xl bg-surface border border-border/50 rounded-3xl p-8 animate-[scaleIn_0.25s_ease-out_forwards]">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display tracking-widest text-white uppercase">
            Editar <span className="gradient-brand">Empleado</span>
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Modificar información del empleado
          </p>
        </div>
        <button
          onClick={() => { setIsEditModalOpen(false); setEmployeeToEdit(null) }}
          className="w-10 h-10 rounded-xl border border-border/50 hover:bg-carbon transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
            Nombre completo
          </label>
          <input
            type="text"
            value={employeeToEdit?.name || ''}
            onChange={(e) => setEmployeeToEdit({ ...employeeToEdit, name: e.target.value })}
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
            value={employeeToEdit?.email || ''}
            onChange={(e) => setEmployeeToEdit({ ...employeeToEdit, email: e.target.value })}
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
            value={employeeToEdit?.phoneNumber || ''}
            onChange={(e) => setEmployeeToEdit({ ...employeeToEdit, phoneNumber: e.target.value })}
            className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
            placeholder="3001234567"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
            Cargo
          </label>
          <select
            value={employeeToEdit?.rol || ''}
            onChange={(e) => setEmployeeToEdit({ ...employeeToEdit, rol: e.target.value })}
            className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
          >
            <option value="">Seleccionar cargo</option>
              {rolesDisponibles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
            Tipo de usuario
          </label>
          <select
            value={employeeToEdit?.userType || 'EMPLOYEE'}
            onChange={(e) => setEmployeeToEdit({ ...employeeToEdit, userType: e.target.value })}
            className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
            disabled={employeeToEdit?.rol === 'MANAGER'}          
          >
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="MANAGER">MANAGER</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
            Nueva contraseña <span className="normal-case font-normal text-text-secondary">(dejar vacío para no cambiar)</span>
          </label>
          <input
            type="password"
            value={employeeToEdit?.password || ''}
            onChange={(e) => setEmployeeToEdit({ ...employeeToEdit, password: e.target.value })}
            className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
            Cédula
          </label>
          <input
            type="text"
            value={employeeToEdit?.indentityCard || ''}
            onChange={(e) => setEmployeeToEdit({ ...employeeToEdit, indentityCard: e.target.value })}
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
            value={employeeToEdit?.salary || ''}
            onChange={(e) => setEmployeeToEdit({ ...employeeToEdit, salary: e.target.value })}
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
            value={employeeToEdit.startDate}
            onChange={(e) => 
              setEmployeeToEdit({ ...employeeToEdit, startDate: e.target.value })
            }
            className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
          />
        </div>

        <div className="md:col-span-2">
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">Multiplex Asignado</label>
                <select
                  value={multiplexId || ''}
                  disabled
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none text-text-secondary opacity-70 cursor-not-allowed"
                >
                  <option value={multiplexId || ''}>
                    {multiplex?.nameMultiplex || 'Cargando datos del multiplex...'}
                  </option>
                </select>
        </div>
      </div>

      {errorForm && (
        <div className="flex items-center gap-2 text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={15} /> {errorForm}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 mt-8">
        <button
          onClick={() => { setIsEditModalOpen(false); setEmployeeToEdit(null) }}
          className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={handleEditEmployee}
          disabled={creating}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-magenta/20 disabled:opacity-60"
        >
          {creating && <Loader2 size={16} className="animate-spin" />}
          Guardar cambios
        </button>
      </div>
    </div>
  </div>
)}


      {/* Modal Confirmar Eliminación */}
    {isDeleteModalOpen && (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-surface border border-border/50 rounded-3xl p-8 animate-[scaleIn_0.25s_ease-out_forwards]">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Trash2 className="text-red-400" size={24} />
        </div>

        <div>
          <h2 className="text-2xl font-display tracking-widest text-white uppercase">
            Confirmar eliminación
          </h2>

          <p className="text-text-secondary text-sm mt-1">
            Esta acción no se puede deshacer
          </p>
        </div>
      </div>

      <div className="bg-carbon border border-border/50 rounded-2xl p-4 mb-8">
        <p className="text-text-secondary text-sm">
          ¿Deseas eliminar al empleado:
        </p>

        <p className="text-white font-bold text-lg mt-2">
          {employeeToDelete?.indentityCard} - {employeeToDelete?.name}?
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => {
            setIsDeleteModalOpen(false)
            setEmployeeToDelete(null)
          }}
          className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all"
        >
          Cancelar
        </button>

        <button
          onClick={confirmDeleteEmployee}
          className="px-6 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg"
        >
          Eliminar empleado
        </button>
      </div>
    </div>
  </div>
  
)}
    </div>
  )
}