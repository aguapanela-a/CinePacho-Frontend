import React from 'react'
import ManagerLayout from '../../components/manager/ManagerLayout'
import MultiplexInventory from '../../components/multiplex/MultiplexInventory'
import { useApp } from '../../context/AppContext'

/**
 * ManagerInventory: Página de inventario del gerente.
 * El manager puede ver stock y solicitar reabastecimiento,
 * pero NO puede agregar stock directamente (para evitar acciones ilícitas).
 */
export default function ManagerInventory() {
  const { user } = useApp()

  return (
    <ManagerLayout>
      <MultiplexInventory
        multiplexId={user?.multiplexId || 'titan'}
        canAddStock={false}
        canRequestStock={true}
      />
    </ManagerLayout>
  )
}
