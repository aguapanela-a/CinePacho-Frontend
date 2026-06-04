// pages/manager/ManagerInventory.jsx
import ManagerLayout from '../../components/manager/ManagerLayout'
import MultiplexInventory from '../../components/multiplex/MultiplexInventory'
import { useApp } from '../../context/useApp'

/**
 * ManagerInventory: El manager puede ver, crear y editar snacks de su sede,
 * pero NO puede eliminarlos.
 */
export default function ManagerInventory() {
  const { user } = useApp()

  return (
    <ManagerLayout>
      <MultiplexInventory
        multiplexId={user?.multiplexId}
        canCreate={true}
        canEdit={true}
        canDelete={true}
      />
    </ManagerLayout>
  )
}