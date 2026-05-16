import React from 'react'
import { User, Star, ShoppingBag, Clock, Shield, Ticket } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Navigate } from 'react-router-dom'

// Mock Data para el historial
const mockHistory = [
  { id: 'ORD-1029', date: '12 May 2026', items: '2x Boleta General, Combo Mega', total: 67000, points: 10 },
  { id: 'ORD-0984', date: '05 May 2026', items: '1x Boleta Preferencial', total: 15000, points: 10 },
  { id: 'ORD-0850', date: '20 Abr 2026', items: 'Palomitas Grandes', total: 18000, points: 10 },
]

export default function Profile() {
  const { user, basePoints } = useApp()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const POINTS_FOR_REWARD = 100
  const pointsProgress = Math.min((basePoints / POINTS_FOR_REWARD) * 100, 100)

  // Render para Admin/Empleado/Gerente (Perfil Simplificado)
  if (user.userType !== 'BUYER') {
    return (
      <div className="max-w-4xl mx-auto p-8 animate-[fadeUp_0.5s_ease-out_forwards] mt-10">
        <div className="bg-surface/80 border border-border/50 rounded-3xl p-10 backdrop-blur-xl flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-magenta to-vinotinto rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(200,22,122,0.4)] mb-6">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-display text-white mb-2">{user.name}</h1>
          <p className="text-magenta font-bold tracking-widest uppercase text-sm mb-8">
            Perfil de {user.userType === 'ADMIN' ? 'Administrador' : user.userType === 'MANAGER' ? 'Gerente' : 'Cajero'}
          </p>
          <div className="bg-carbon border border-border/50 rounded-2xl p-6 w-full max-w-md">
            <p className="text-text-secondary text-sm">
              Tu cuenta tiene privilegios especiales. Por favor utiliza el panel correspondiente para gestionar el sistema.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Render para Cliente (BUYER)
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 animate-[fadeUp_0.5s_ease-out_forwards]">
      <h1 className="text-4xl font-display uppercase tracking-widest text-white mb-8">
        Mi <span className="gradient-brand">Perfil</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Tarjeta de Usuario y Puntos */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Info del Usuario */}
          <div className="bg-surface/80 border border-border/50 rounded-3xl p-8 backdrop-blur-xl text-center">
            <div className="w-24 h-24 bg-carbon border-2 border-magenta rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-magenta" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
            <p className="text-text-secondary text-sm mb-6">Cliente Cine Pacho</p>
            
            <div className="inline-flex items-center gap-2 bg-magenta/10 border border-magenta/20 text-magenta px-4 py-2 rounded-full font-bold text-sm">
              <Star size={16} />
              Nivel Bronce
            </div>
          </div>

          {/* Tarjeta de Puntos (Tendencia a la Meta) */}
          <div className="bg-gradient-to-br from-gold/20 to-yellow-600/10 border border-gold/30 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Star size={100} />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-gold font-bold uppercase tracking-widest text-sm mb-2">Puntos Acumulados</h3>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-display text-white">{basePoints}</span>
                <span className="text-text-secondary mb-1">pts</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">Progreso Recompensa</span>
                  <span className="text-gold">{basePoints} / {POINTS_FOR_REWARD}</span>
                </div>
                <div className="h-2 w-full bg-carbon rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gold to-yellow-500 transition-all duration-1000 ease-out"
                    style={{ width: `${pointsProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-text-secondary mt-2">
                  ¡Te faltan {Math.max(0, POINTS_FOR_REWARD - basePoints)} puntos para una entrada gratis!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Historial y Actividad */}
        <div className="lg:col-span-2">
          <div className="bg-surface/80 border border-border/50 rounded-3xl p-8 backdrop-blur-xl h-full">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/50">
              <ShoppingBag className="text-magenta" size={24} />
              <h2 className="text-2xl font-display text-white tracking-widest uppercase">
                Historial de Compras
              </h2>
            </div>

            <div className="space-y-4">
              {mockHistory.map((order) => (
                <div 
                  key={order.id}
                  className="bg-carbon border border-border/40 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-magenta/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-magenta/10 rounded-xl flex items-center justify-center shrink-0">
                      <Ticket className="text-magenta" size={20} />
                    </div>
                    <div>
                      <p className="text-white font-bold mb-1">{order.items}</p>
                      <div className="flex items-center gap-3 text-xs text-text-secondary">
                        <span className="flex items-center gap-1"><Clock size={12} /> {order.date}</span>
                        <span>•</span>
                        <span>Orden: {order.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t border-border/50 md:border-0 pt-4 md:pt-0 mt-2 md:mt-0">
                    <span className="text-white font-bold text-lg">
                      ${order.total.toLocaleString('es-CO')}
                    </span>
                    <span className="text-xs font-bold text-gold flex items-center gap-1">
                      <Star size={10} /> +{order.points} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-4 rounded-xl border border-border/50 text-text-secondary font-bold hover:text-white hover:bg-carbon transition-colors">
              Ver todas las compras
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
