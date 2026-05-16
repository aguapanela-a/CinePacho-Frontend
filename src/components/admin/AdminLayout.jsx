import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-carbon text-text-primary flex relative overflow-hidden">

      {/* Background ambient */}
      <div className="orb-magenta top-0 -left-64 -translate-y-1/2" />
      <div className="orb-gold bottom-0 -right-64 translate-y-1/2" />

      {/* ── Sidebar Desktop ── */}
      <div className="hidden lg:flex relative z-20">
        <AdminSidebar />
      </div>

      {/* ── Sidebar Mobile Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          
          {/* Fondo oscuro */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="relative z-10">
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 relative z-10 overflow-y-auto min-w-0">

        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border/30 bg-surface/80 backdrop-blur-xl sticky top-0 z-30">
          
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-11 h-11 rounded-xl border border-border/50 bg-carbon flex items-center justify-center"
          >
            <Menu size={20} />
          </button>

          <h1 className="font-display tracking-widest uppercase text-sm text-white">
            Admin Panel
          </h1>

          <div className="w-11" />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}