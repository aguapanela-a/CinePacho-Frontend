import React from 'react'
import ManagerLayout from '../../components/manager/ManagerLayout'
import MultiplexEmployees from '../../components/multiplex/MultiplexEmployees'
import { useApp } from '../../context/AppContext'

/**
 * ManagerEmployees: Página de gestión de empleados del gerente.
 * El manager puede cambiar roles (no a Manager) y solicitar despidos,
 * pero no puede despedir directamente ni promover a Manager.
 */
export default function ManagerEmployees() {
  const { user } = useApp()

  return (
    <ManagerLayout>
      <MultiplexEmployees
        multiplexId={user?.multiplexId || 'titan'}
        canAssignManager={false}
        canDismiss={false}
        canRequestDismiss={true}
        canAddEmployee={true}
      />
    </ManagerLayout>
  )
}
