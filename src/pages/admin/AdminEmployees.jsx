import React, { useState } from 'react'
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

const employeesMock = [
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

  const filteredEmployees = employeesMock.filter((employee) =>
    employee.nombre.toLowerCase().includes(search.toLowerCase()) ||
    employee.correo.toLowerCase().includes(search.toLowerCase()) ||
    employee.multiplex.toLowerCase().includes(search.toLowerCase())
  )

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
                Administración centralizada del personal operativo
              </p>
            </div>
          </div>
        </div>

        <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-magenta to-vinotinto hover:opacity-90 transition-all text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-magenta/20 cursor-pointer">
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
                      <button className="w-10 h-10 rounded-xl border border-border/50 hover:border-magenta/40 hover:bg-magenta/10 transition-all flex items-center justify-center text-text-secondary hover:text-white">
                        <Pencil size={16} />
                      </button>

                      <button className="w-10 h-10 rounded-xl border border-border/50 hover:border-red-500/40 hover:bg-red-500/10 transition-all flex items-center justify-center text-text-secondary hover:text-red-400">
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
    </div>
  )
}