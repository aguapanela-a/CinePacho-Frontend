import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  BadgeCheck,
  Building2,
  Trash2,
  Pencil,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { registerEmployee, getEmployees, updateEmployee, deleteEmployee } from '../../services/employeeService'
import { getAllMultiplexes } from '../../services/multiplexService'
import { useApp } from '../../context/useApp'



export default function AdminEmployees() {
  const { user } = useApp()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [employees, setEmployees] = useState([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [employeeToEdit, setEmployeeToEdit] = useState(null)
  const [multiplexes, setMultiplexes] = useState([])
  const [loadingMultiplexes, setLoadingMultiplexes] = useState(false)

  useEffect(() => {
  const loadEmployees = async () => {
    try {
      const data = await getEmployees()
      setEmployees(data)
    } catch (error) {
      console.error('Error cargando empleados:', error)
    }
  }

  loadEmployees()
}, [])

  const [newEmployee, setNewEmployee] = useState({
    email: '',
    name: '',
    password: '',
    userType: '',
    indentityCard: '',
    phoneNumber: '',
    salary: '',
    rol: '',
    startDate: '',
    multiplexId: ''
  })
  const [creating, setCreating] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  const openCreateEmployee = () => {
  const lockedMultiplexId =
    user?.userType === 'MANAGER'
      ? user?.multiplexId
      : ''

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
    multiplexId: lockedMultiplexId || ''
  })

  setErrorForm(null)
  setIsModalOpen(true)
}

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

  

//confirmar borrar empleados

const confirmDeleteEmployee = async () => {
  try {
    await deleteEmployee(employeeToDelete.uniqueCode)

    setEmployees(
      employees.filter(
        (employee) =>
          employee.uniqueCode !== employeeToDelete.uniqueCode
      )
    )

    setIsDeleteModalOpen(false)
    setEmployeeToDelete(null)
  } catch (error) {
    console.error('Error eliminando empleado:', error)
  }
}


//Editar empleados

// AdminEmployees.jsx
const handleEditEmployee = async () => {

  const lockedMultiplexId =
    user?.userType === 'MANAGER'
      ? user?.multiplexId
      : ''

  const finalMultiplexId =
    lockedMultiplexId || employeeToEdit.multiplexId

  console.log('Employee to edit:', employeeToEdit)
  console.log('Final Multiplex ID:', finalMultiplexId)
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
    !finalMultiplexId
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
      multiplexId: employeeToEdit.multiplexId,
    }

    await updateEmployee(payload)

    const data = await getEmployees()
    setEmployees(data)
    setIsEditModalOpen(false)
    setEmployeeToEdit(null)
  } catch (error) {
    console.error('Error actualizando empleado:', error)
  } finally {
    setCreating(false)  // ← agregar esto
  }
}



//Crear empleados
  const handleCreateEmployee = async () => {
  const lockedMultiplexId =
    user?.userType === 'MANAGER'
      ? user?.multiplexId
      : ''

  const finalMultiplexId =
    lockedMultiplexId || newEmployee.multiplexId

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
    !finalMultiplexId
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
      startDate: `${newEmployee.startDate} 00:00:00`, // Convertir a formato ISO
      multiplexId: finalMultiplexId
    }


    console.log('Payload enviado:', payload)

    await registerEmployee(payload)

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
      multiplexId: lockedMultiplexId || ''
    })

    setIsModalOpen(false)
  } catch (err) {
    console.error(err)
    setErrorForm(err.message || 'Error al crear empleado')
  } finally {
    setCreating(false)
  }
}

  return (
     <AdminLayout>
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
                Administración centralizada del personal operativo
              </p>
            </div>
          </div>
        </div>

    <button
      onClick={openCreateEmployee}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-magenta to-vinotinto hover:opacity-90 transition-all text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-magenta/20 cursor-pointer"
        >
        <Plus size={18} />
        Nuevo empleado
    </button>

    </div>

      {/* Search */}
      <div className="bg-surface border border-border/50 rounded-3xl p-5">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
          />

          <input
            type="text"
            placeholder="Buscar empleado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-carbon border border-border/50 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-magenta transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border/50 rounded-3xl overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full min-w-[900px]">
            <thead className="bg-carbon/60 border-b border-border/50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold tracking-widest text-text-secondary uppercase">
                  Empleado
                </th>

                <th className="text-left px-6 py-4 text-xs font-bold tracking-widest text-text-secondary uppercase">
                  Contacto
                </th>

                <th className="text-left px-6 py-4 text-xs font-bold tracking-widest text-text-secondary uppercase">
                  Cargo
                </th>

                <th className="text-left px-6 py-4 text-xs font-bold tracking-widest text-text-secondary uppercase">
                  Multiplex
                </th>

                <th className="text-left px-6 py-4 text-xs font-bold tracking-widest text-text-secondary uppercase">
                  Fecha Contrato
                </th>

                <th className="text-center px-6 py-4 text-xs font-bold tracking-widest text-text-secondary uppercase">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.uniqueCode}
                  className="border-b border-border/30 hover:bg-carbon/40 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-magenta/10 border border-magenta/20 flex items-center justify-center">
                        <Users size={18} className="text-magenta" />
                      </div>

                      <div>
                        <p className="font-bold text-white">
                          {employee.name}
                        </p>

                        <p className="text-xs text-text-secondary">
                          ID #{employee.uniqueCode}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-text-primary">
                        <Mail size={14} className="text-magenta" />
                        {employee.email}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Phone size={14} />
                        {employee.phoneNumber}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold px-3 py-1.5 rounded-full text-sm font-bold">
                      <BadgeCheck size={14} />
                      {employee.rol}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 size={15} className="text-magenta" />
                      {employee.nameMultiplex}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-primary">
                        {employee.startDate ? new Date(employee.startDate).toLocaleDateString('es-CO') : '-'}
                      </span>
                      {/* Alerta: Sin rotar en 3+ meses */}
                      {(() => {
                        const referenceDate = employee.roleUpdateAt
                          ? new Date(employee.roleUpdateAt)
                          : (employee.startDate ? new Date(employee.startDate) : null); // Use startDate if roleUpdateAt is null
                        const threeMonthsAgo = new Date();
                        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

                        if (referenceDate && referenceDate < threeMonthsAgo) {
                          return (
                            <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full">
                              ¡Sin rotar en 3+ meses!
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                    <button
                        // Al abrir el modal de edición
                        onClick={() => {
                      console.log('Employee data:', employee)

                          const multiplex = multiplexes.find(m => m.nameMultiplex === employee.nameMultiplex)
                          setEmployeeToEdit({
                            uniqueCode: employee.uniqueCode,
                            name: employee.name,
                            email: employee.email,
                            phoneNumber: employee.phoneNumber,
                            rol: employee.rol,
                            userType: employee.userType,
                            indentityCard: employee.indentityCard,
                            salary: employee.salary,
                            startDate: employee.startDate ? employee.startDate.split('T')[0] : '',
                            password: '',
                            multiplexId: multiplex?.idMultiplex || multiplex?.id || '',
                          })
                                  console.log('Multiplex encontrado:', multiplex)
                                  console.log('IDs disponibles:', multiplexes.map(m => ({ id: m.idMultiplex, name: m.nameMultiplex })))
                                  console.log('StartDate original:', employee.startDate)
                          setIsEditModalOpen(true)
                        }}
                        className="w-10 h-10 rounded-xl border border-border/50 hover:border-magenta/40 hover:bg-magenta/10 transition-all flex items-center justify-center text-text-secondary hover:text-white"
                        >
                        <Pencil size={16} />
                    </button>

                    <button
                        onClick={() => {
                            setEmployeeToDelete(employee)
                            setIsDeleteModalOpen(true)
                        }}
                        className="w-10 h-10 rounded-xl border border-border/50 hover:border-red-500/40 hover:bg-red-500/10 transition-all flex items-center justify-center text-text-secondary hover:text-red-400"
                        >
                        <Trash2 size={16} />
                    </button>

                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

         {employees.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-text-secondary">
              No se encontraron empleados.
            </p>
          </div>
        )}
      </div>

      {/* Modal Crear Empleado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-surface border border-border/50 rounded-3xl p-8 animate-[scaleIn_0.25s_ease-out_forwards]">

            {/* Header */}
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
                  value={newEmployee.name}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      name: e.target.value,
                    })
                  }
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
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      email: e.target.value,
                    })
                  }
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
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      phoneNumber: e.target.value,
                    })
                  }
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
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      rol: e.target.value,
                    })
                  }
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
                >
                  <option value=""></option>
                  <option value="CASHIER">Cajero</option>
                  <option value="DISPATCHER">Despachador de comida</option>
                  <option value="ROOM_ATTENDANT">Encargado de sala</option>
                  <option value="CLEANER">Aseador</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Tipo de usuario
                </label>
                <select
                  value={newEmployee.userType}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      userType: e.target.value,
                    })
                  }
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
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
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, password: e.target.value })
                  }
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
                  value={newEmployee.indentityCard} // Corrected typo
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, indentityCard: e.target.value }) // Corrected typo
                  }
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
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, salary: e.target.value })
                  }
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
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, startDate: e.target.value })
                  }
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Multiplex
                </label>

                <select
                  value={newEmployee.multiplexId}
                  onChange={(e) => {
                    
                    const selectedId = e.target.value
                    const selected = multiplexes.find((m) => (m.idMultiplex || m.id) === selectedId)
                    setNewEmployee({
                      ...newEmployee,
                      multiplexId: selectedId,
                      multiplexName: selected?.nameMultiplex || '',
                    })
                  }}
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
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
            </div>

            {errorForm && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={15} /> {errorForm}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all"
              >
                Cancelar
              </button>

              <button
                onClick={handleCreateEmployee}
                disabled={creating}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-magenta/20 disabled:opacity-60"
              >
                {creating && <Loader2 size={16} className="animate-spin" />}
                Guardar empleado
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
            <option value="CASHIER">Cajero</option>
            <option value="DISPATCHER">Despachador de comida</option>
            <option value="ROOM_ATTENDANT">Encargado de sala</option>
            <option value="CLEANER">Aseador</option>
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
            disabled={user?.userType === 'MANAGER'}
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
          <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
            Multiplex
          </label>
          <select
            value={employeeToEdit?.multiplexId || ''}
            onChange={(e) => setEmployeeToEdit({ ...employeeToEdit, multiplexId: e.target.value })}
            className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
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
  </AdminLayout>
    
  )
}

