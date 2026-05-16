import React from 'react'
import { Link } from 'react-router-dom'
import { Building2, MapPin, Users, Plus } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { multiplexes, countActiveEmployees } from '../../data/mockMultiplexData'

export default function AdminMultiplexList() {
  return (
    <AdminLayout>
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 animate-[fadeUp_0.5s_ease-out_forwards]">
        <div>
          <h1 className="text-5xl font-display uppercase tracking-widest text-white">
            <span className="gradient-brand">Multiplex</span>
          </h1>
          <p className="text-text-secondary mt-2 text-lg">
            Gestión de sedes a nivel nacional
          </p>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-magenta to-vinotinto text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-magenta/20 hover:opacity-90 transition-all cursor-pointer">
          <Plus size={18} />
          Nuevo Multiplex
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {multiplexes.map((plex, index) => (
          <Link
            key={plex.id}
            to={`/admin/multiplex/${plex.id}/dashboard`}
            style={{ animationDelay: `${index * 0.08}s` }}
            className="group block bg-surface/80 border border-border/50 rounded-3xl p-6 backdrop-blur-xl hover:border-magenta/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-[fadeUp_0.5s_ease-out_forwards]"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-magenta/20 to-vinotinto/20 flex items-center justify-center border border-magenta/30 group-hover:scale-110 transition-transform">
                <Building2 className="text-magenta" size={28} />
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                plex.status === 'active' 
                  ? 'bg-green-500/15 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/15 text-red-400 border border-red-500/20'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${plex.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                {plex.status === 'active' ? 'Operativo' : 'Inactivo'}
              </div>
            </div>

            <h2 className="text-2xl font-display text-white tracking-wide mb-2">
              {plex.name}
            </h2>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <MapPin size={14} className="text-magenta" />
                {plex.address}
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Building2 size={14} className="text-gold" />
                {plex.salas} salas
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Users size={14} className="text-magenta" />
                {countActiveEmployees(plex.id)} empleados activos
              </div>
            </div>

            <div className="w-full bg-carbon border border-border/50 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-bold text-magenta transition-colors group-hover:bg-magenta/10">
              Ver detalles
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        ))}
      </div>
    </AdminLayout>
  )
}
