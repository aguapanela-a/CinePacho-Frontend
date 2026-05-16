import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2 } from 'lucide-react'

/**
 * MultiplexBanner: Banner contextual que indica al admin qué multiplex está viendo.
 * Solo se renderiza en el drill-down del admin, no en la vista del manager.
 *
 * @param {string} multiplexName - Nombre del multiplex activo
 */
export default function MultiplexBanner({ multiplexName }) {
  return (
    <div className="bg-gradient-to-r from-magenta/10 via-vinotinto/10 to-gold/5 border border-magenta/20 rounded-2xl px-5 py-3 mb-8 flex items-center justify-between animate-[fadeUp_0.3s_ease-out_forwards]">
      <div className="flex items-center gap-3">
        <Building2 size={18} className="text-magenta" />
        <span className="text-sm text-text-secondary font-bold">
          Viendo multiplex:
        </span>
        <span className="text-white font-bold font-display text-lg tracking-wider">
          {multiplexName}
        </span>
      </div>

      <Link
        to="/admin/multiplex"
        className="flex items-center gap-2 text-sm font-bold text-magenta hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Volver al Panel General
      </Link>
    </div>
  )
}
