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
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminEmployees from './pages/admin/AdminEmployees'

function AppLayout() {
  const location = useLocation()
  const isAuthPage = ['/login', '/registro'].includes(location.pathname)
  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-body text-text-primary bg-carbon">
      {/* Environmental gradient orbs fixed in the background */}
      <div className="orb-magenta top-0 -left-64 -translate-y-1/2" />
      <div className="orb-gold bottom-0 -right-64 translate-y-1/2" />
      <div className="orb-magenta top-1/2 right-0 translate-x-1/2 -translate-y-1/2 opacity-50" />

      {!isAuthPage && !isAdminPage && <Navbar />}
      <main className="flex-1 relative z-10 animate-[fadeUp_0.5s_ease-out_forwards]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/snacks" element={<Snacks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />

          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/admin/empleados" element={<AdminEmployees />} />

        </Routes>
      </main>
      {!isAuthPage && !isAdminPage && <Footer />}
      
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
