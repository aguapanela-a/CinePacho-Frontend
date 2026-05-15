import React from 'react'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-carbon text-text-primary flex relative overflow-hidden">
      
      {/* Background ambient */}
      <div className="orb-magenta top-0 -left-64 -translate-y-1/2" />
      <div className="orb-gold bottom-0 -right-64 translate-y-1/2" />

      {/* Sidebar */}
      <div className="relative z-20">
        <AdminSidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 relative z-10 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}