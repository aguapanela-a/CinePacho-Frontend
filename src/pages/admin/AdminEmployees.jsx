import React, { useState } from 'react'
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
} from 'lucide-react'



const initialEmployees = [
  {
    id: 1,
    nombre: 'Laura González',
    correo: 'laura@cinepacho.com',
    telefono: '3001234567',
    cargo: 'Cajero',
    multiplex: 'Titán',
    estado: 'Activo',
  },
  {
    id: 2,
    nombre: 'Carlos Ramírez',
    correo: 'carlos@cinepacho.com',
    telefono: '3119876543',
    cargo: 'Supervisor',
    multiplex: 'Unicentro',
    estado: 'Activo',
  },
  {
    id: 3,
    nombre: 'Ana Torres',
    correo: 'ana@cinepacho.com',
    telefono: '3204567890',
    cargo: 'Cajero',
    multiplex: 'Gran Estación',
    estado: 'Inactivo',
  },
]

export default function AdminEmployees() {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [employees, setEmployees] = useState(initialEmployees)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [employeeToEdit, setEmployeeToEdit] = useState(null)

  const [newEmployee, setNewEmployee] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    cargo: '',
    multiplex: '',
    })

  const filteredEmployees = employees.filter((employee) =>
    employee.nombre.toLowerCase().includes(search.toLowerCase()) ||
    employee.correo.toLowerCase().includes(search.toLowerCase()) ||
    employee.multiplex.toLowerCase().includes(search.toLowerCase())




  )

//Borrar empleados local

 const handleDeleteEmployee = (id) => {
  setEmployees(
    employees.filter((employee) => employee.id !== id)
  )
}

//confirmar borrar empleados

const confirmDeleteEmployee = () => {
  setEmployees(
    employees.filter(
      (employee) => employee.id !== employeeToDelete.id
    )
  )

  setIsDeleteModalOpen(false)
  setEmployeeToDelete(null)
}


//Editar empleados

const handleEditEmployee = () => {
  setEmployees(
    employees.map((employee) =>
      employee.id === employeeToEdit.id
        ? employeeToEdit
        : employee
    )
  )

  setIsEditModalOpen(false)
  setEmployeeToEdit(null)
}



//Crear empleados local

  const handleCreateEmployee = () => {
  if (
    !newEmployee.nombre ||
    !newEmployee.correo ||
    !newEmployee.telefono ||
    !newEmployee.cargo ||
    !newEmployee.multiplex
  ) {
    return
  }


  const employee = {
    id: employees.length + 1,
    ...newEmployee,
    estado: 'Activo',
  }

  setEmployees([...employees, employee])

  setNewEmployee({
    nombre: '',
    correo: '',
    telefono: '',
    cargo: '',
    multiplex: '',
  })



  setIsModalOpen(false)
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
        onClick={() => setIsModalOpen(true)}
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
      <div className="bg-surface border border-border/50 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
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
                  Estado
                </th>

                <th className="text-center px-6 py-4 text-xs font-bold tracking-widest text-text-secondary uppercase">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-border/30 hover:bg-carbon/40 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-magenta/10 border border-magenta/20 flex items-center justify-center">
                        <Users size={18} className="text-magenta" />
                      </div>

                      <div>
                        <p className="font-bold text-white">
                          {employee.nombre}
                        </p>

                        <p className="text-xs text-text-secondary">
                          ID #{employee.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-text-primary">
                        <Mail size={14} className="text-magenta" />
                        {employee.correo}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Phone size={14} />
                        {employee.telefono}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold px-3 py-1.5 rounded-full text-sm font-bold">
                      <BadgeCheck size={14} />
                      {employee.cargo}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 size={15} className="text-magenta" />
                      {employee.multiplex}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        employee.estado === 'Activo'
                          ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                          : 'bg-red-500/15 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {employee.estado}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => {
                            setEmployeeToEdit(employee)
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

         {filteredEmployees.length === 0 && (
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
                  value={newEmployee.nombre}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      nombre: e.target.value,
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
                  value={newEmployee.correo}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      correo: e.target.value,
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
                  value={newEmployee.telefono}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      telefono: e.target.value,
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
                  value={newEmployee.cargo}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      cargo: e.target.value,
                    })
                  }
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
                >
                  <option value="">Seleccionar</option>
                  <option value="Cajero">Cajero</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                  Multiplex
                </label>

                <select
                  value={newEmployee.multiplex}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      multiplex: e.target.value,
                    })
                  }
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
                >
                  <option value="">Seleccionar multiplex</option>
                  <option value="Titán">Titán</option>
                  <option value="Unicentro">Unicentro</option>
                  <option value="Gran Estación">Gran Estación</option>
                  <option value="Embajador">Embajador</option>
                </select>
              </div>
            </div>

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
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-magenta/20"
              >
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
          onClick={() => {
            setIsEditModalOpen(false)
            setEmployeeToEdit(null)
          }}
          className="w-10 h-10 rounded-xl border border-border/50 hover:bg-carbon transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
            Nombre completo
          </label>

          <input
            type="text"
            value={employeeToEdit?.nombre || ''}
            onChange={(e) =>
              setEmployeeToEdit({
                ...employeeToEdit,
                nombre: e.target.value,
              })
            }
            className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
            Correo
          </label>

          <input
            type="email"
            value={employeeToEdit?.correo || ''}
            onChange={(e) =>
              setEmployeeToEdit({
                ...employeeToEdit,
                correo: e.target.value,
              })
            }
            className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
            Teléfono
          </label>

          <input
            type="text"
            value={employeeToEdit?.telefono || ''}
            onChange={(e) =>
              setEmployeeToEdit({
                ...employeeToEdit,
                telefono: e.target.value,
              })
            }
            className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
            Cargo
          </label>

          <select
            value={employeeToEdit?.cargo || ''}
            onChange={(e) =>
              setEmployeeToEdit({
                ...employeeToEdit,
                cargo: e.target.value,
              })
            }
            className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
          >
            <option value="Cajero">Cajero</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
            Multiplex
          </label>

          <select
            value={employeeToEdit?.multiplex || ''}
            onChange={(e) =>
              setEmployeeToEdit({
                ...employeeToEdit,
                multiplex: e.target.value,
              })
            }
            className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta"
          >
            <option value="Titán">Titán</option>
            <option value="Unicentro">Unicentro</option>
            <option value="Gran Estación">Gran Estación</option>
            <option value="Embajador">Embajador</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-8">
        <button
          onClick={() => {
            setIsEditModalOpen(false)
            setEmployeeToEdit(null)
          }}
          className="px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-carbon transition-all"
        >
          Cancelar
        </button>

        <button
          onClick={handleEditEmployee}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-magenta/20"
        >
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
          {employeeToDelete?.nombre}
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