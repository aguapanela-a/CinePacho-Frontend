import { useState, useEffect, useCallback } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import MultiplexBanner from '../../components/multiplex/MultiplexBanner'
import MultiplexDashboard from '../../components/multiplex/MultiplexDashboard'
import MultiplexEmployees from '../../components/multiplex/MultiplexEmployees'
import MultiplexInventory from '../../components/multiplex/MultiplexInventory'
import AdminRooms from './AdminRooms'
import { getMultiplexById } from '../../services/multiplexService'
import { Loader2 } from 'lucide-react'

/**
 * AdminMultiplexDetail — Carga el multiplex desde la API real y renderiza
 * la sección correspondiente según el prop `section`.
 */
export default function AdminMultiplexDetail({ section = 'dashboard' }) {
  const { multiplexId } = useParams()
  const [multiplex, setMultiplex] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)

  const fetchMultiplex = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMultiplexById(multiplexId)
      if (!data) { setNotFound(true); return }
      setMultiplex(data)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [multiplexId])

  useEffect(() => {
    const loadMultiplex = async () => {
      await fetchMultiplex()
    }
    loadMultiplex()
  }, [fetchMultiplex])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-40 gap-4 text-text-secondary">
          <Loader2 size={32} className="animate-spin text-magenta" />
          <span>Cargando multiplex...</span>
        </div>
      </AdminLayout>
    )
  }

  if (notFound) return <Navigate to="/admin/multiplex" replace />

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
      case 'salas':
        return (
          <AdminRooms
            multiplexId={multiplex.idMultiplex}
            multiplexName={multiplex.nameMultiplex}
            initialRooms={multiplex.rooms || []}
          />
        )
      default:
        return <MultiplexDashboard multiplexId={multiplexId} />
    }
  }

  return (
    <AdminLayout>
      <MultiplexBanner multiplexName={multiplex.nameMultiplex} />
      {renderSection()}
    </AdminLayout>
  )
}

