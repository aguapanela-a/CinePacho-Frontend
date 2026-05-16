import React from 'react'
import ManagerLayout from '../../components/manager/ManagerLayout'
import { FileBarChart2 } from 'lucide-react'

export default function ManagerReports() {
  return (
    <ManagerLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-[fadeUp_0.5s_ease-out_forwards]">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest text-white mb-2">
            Reportes de Sede
          </h1>
          <p className="text-text-secondary text-sm">
            Métricas de rendimiento locales correspondientes a este multiplex.
          </p>
        </div>
      </div>

      <div className="bg-surface/50 border border-border/50 rounded-3xl p-12 text-center backdrop-blur-xl animate-[fadeUp_0.6s_ease-out_forwards]">
        <div className="w-24 h-24 bg-carbon border border-border/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileBarChart2 size={40} className="text-gold opacity-80" />
        </div>
        
        <h2 className="text-2xl font-display text-white tracking-widest uppercase mb-4">
          Reportes Locales Próximamente
        </h2>
        
        <p className="text-text-secondary max-w-lg mx-auto">
          Esta vista está estructurada para visualizar los gráficos de ventas y métricas únicamente de las operaciones gestionadas por esta sede.
        </p>
      </div>
    </ManagerLayout>
  )
}
