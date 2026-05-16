import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Snacks from './pages/Snacks'
import { AppProvider } from './context/AppContext'
import CartDrawer from './components/CartDrawer'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminInventory from './pages/admin/AdminInventory'
import AdminReports from './pages/admin/AdminReports'
import AdminEmployees from './pages/admin/AdminEmployees'
import CashierDashboard from './pages/cajero/CashierDashboard'
import ManagerDashboard from './pages/manager/ManagerDashboard'
import ManagerEmployees from './pages/manager/ManagerEmployees'
import ManagerInventory from './pages/manager/ManagerInventory'
import ManagerReports from './pages/manager/ManagerReports'
import AdminMultiplexList from './pages/admin/AdminMultiplexList'
import AdminMultiplexDetail from './pages/admin/AdminMultiplexDetail'

function AppLayout() {
  const location = useLocation()
  const isAuthPage = ['/login', '/registro'].includes(location.pathname)
  const isAdminPage = location.pathname.startsWith('/admin')
  const isCashierPage = location.pathname.startsWith('/cajero')
  const isManagerPage = location.pathname.startsWith('/manager')

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-body text-text-primary bg-carbon">
      {/* Environmental gradient orbs fixed in the background */}
      <div className="orb-magenta top-0 -left-64 -translate-y-1/2" />
      <div className="orb-gold bottom-0 -right-64 translate-y-1/2" />
      <div className="orb-magenta top-1/2 right-0 translate-x-1/2 -translate-y-1/2 opacity-50" />

      {!isAuthPage && !isAdminPage && !isCashierPage && !isManagerPage && <Navbar />}
      <main className="flex-1 relative z-10 animate-[fadeUp_0.5s_ease-out_forwards]">
        <Routes>
          {/* ── Rutas Públicas ── */}
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/snacks" element={<PublicRoute><Snacks /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/registro" element={<PublicRoute><Register /></PublicRoute>} />

          {/* ── Perfil Universal ── */}
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* ── Rutas Protegidas: Admin (solo ADMIN) ── */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/empleados"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminEmployees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventario"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reportes"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminReports />
              </ProtectedRoute>
            }
          />

          {/* ── Rutas Protegidas: Cajero (solo EMPLOYEE) ── */}
          <Route
            path="/cajero"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <CashierDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Rutas Protegidas: Gerente de Multiplex (solo MANAGER) ── */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/empleados"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <ManagerEmployees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/inventario"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <ManagerInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/reportes"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <ManagerReports />
              </ProtectedRoute>
            }
          />

          {/* ── Rutas Protegidas: Admin Drill-Down a Multiplex (solo ADMIN) ── */}
          <Route
            path="/admin/multiplex"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminMultiplexList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/multiplex/:multiplexId/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminMultiplexDetail section="dashboard" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/multiplex/:multiplexId/empleados"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminMultiplexDetail section="employees" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/multiplex/:multiplexId/inventario"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminMultiplexDetail section="inventory" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/multiplex/:multiplexId/reportes"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminMultiplexDetail section="dashboard" />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isAuthPage && !isAdminPage && !isCashierPage && !isManagerPage && <Footer />}
      
      {/* Global Modals/Drawers */}
      <CartDrawer />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppLayout />
      </Router>
    </AppProvider>
  )
}
