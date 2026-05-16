import React from 'react'
import { useParams, Navigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import MultiplexBanner from '../../components/multiplex/MultiplexBanner'
import MultiplexDashboard from '../../components/multiplex/MultiplexDashboard'
import MultiplexEmployees from '../../components/multiplex/MultiplexEmployees'
import MultiplexInventory from '../../components/multiplex/MultiplexInventory'
import { getMultiplexById } from '../../data/mockMultiplexData'

/**
 * AdminMultiplexDetail: Wrapper que renderiza los componentes compartidos
 * de multiplex en modo "Admin Drill-down".
 * 
 * Pasa los permisos elevados al componente hijo correspondiente.
 */
export default function AdminMultiplexDetail({ section = 'dashboard' }) {
  const { multiplexId } = useParams()
  const multiplex = getMultiplexById(multiplexId)

  if (!multiplex) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const renderSection = () => {
    switch (section) {
      case 'dashboard':
        return <MultiplexDashboard multiplexId={multiplexId} />
      case 'employees':
        return (
          <MultiplexEmployees
            multiplexId={multiplexId}
            canAssignManager={true}
            canDismiss={true}
            canRequestDismiss={false}
            canAddEmployee={true}
          />
        )
      case 'inventory':
        return (
          <MultiplexInventory
            multiplexId={multiplexId}
            canAddStock={true}
            canRequestStock={false}
          />
        )
      default:
        return <MultiplexDashboard multiplexId={multiplexId} />
    }
  }

  return (
    <AdminLayout>
      {/* Context Banner */}
      <MultiplexBanner multiplexName={multiplex.name} />
      
      {/* Content */}
      {renderSection()}
    </AdminLayout>
  )
}
