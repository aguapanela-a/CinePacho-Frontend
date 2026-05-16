import React from 'react'
import ManagerLayout from '../../components/manager/ManagerLayout'
import MultiplexDashboard from '../../components/multiplex/MultiplexDashboard'
import { useApp } from '../../context/AppContext'

/**
 * ManagerDashboard: Página del dashboard del gerente.
 * Envuelve MultiplexDashboard con el layout del manager,
 * filtrando automáticamente por el multiplex asignado.
 */
export default function ManagerDashboard() {
  const { user } = useApp()

  return (
    <ManagerLayout>
      <MultiplexDashboard multiplexId={user?.multiplexId || 'titan'} />
    </ManagerLayout>
  )
}
