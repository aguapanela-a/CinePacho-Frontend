import { useState } from 'react'
import { AppContext } from './appContextObject'
import { formatCurrency, getUnitPrice } from '../utils/formatCurrency'

// Normalizar roles que el backend devuelva en diferentes formatos
function normalizeUserType(rawRole) {
  if (!rawRole) return 'BUYER'
  const normalized = rawRole.toUpperCase().trim()
  
  // Mapa de valores comunes a valores esperados
  const roleMap = {
    'ADMIN': 'ADMIN', 'ADMIN_USER': 'ADMIN', 'SYSTEM_ADMIN': 'ADMIN', 'ADMINISTRATOR': 'ADMIN',
    'MANAGER': 'MANAGER', 'MANAGER_USER': 'MANAGER', 'GERENTE': 'MANAGER',
    'EMPLOYEE': 'EMPLOYEE', 'EMPLOYEE_USER': 'EMPLOYEE', 'CAJERO': 'EMPLOYEE', 'CASHIER': 'EMPLOYEE',
    'BUYER': 'BUYER', 'BUYER_USER': 'BUYER', 'CUSTOMER': 'BUYER', 'CLIENTE': 'BUYER',
  }
  
  return roleMap[normalized] || normalized // Si no está en el mapa, devolver como está
}

function normalizeCartItem(item) {
  const qty = item.qty || 1
  // If unitPrice is already provided (from SeatSelector), use it directly
  // Otherwise, calculate it from the price field
  const unitPrice = item.unitPrice || (item.price ? getUnitPrice(item) : 0)
  // Business rule: 10 points per ticket, 5 points per snack
  const points = item.points != null ? item.points : (item.type === 'ticket' || item.type === 'TICKET' ? 10 : 5)

  return {
    ...item,
    qty,
    unitPrice,
    price: formatCurrency(unitPrice),
    points,
  }
}

export function AppProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cinepacho_user')
    return saved ? JSON.parse(saved) : null
  })

  const [token, setToken] = useState(() => localStorage.getItem('cinepacho_token'))

  const loginUser = (authResponse) => {
    const { token: jwt, userType, role, name, multiplexId } = authResponse
    // Si el backend devuelve 'role' en lugar de 'userType', usar 'role'
    const rawRole = userType || role
    const finalUserType = normalizeUserType(rawRole)
    const userData = { name, userType: finalUserType, multiplexId }

    localStorage.setItem('cinepacho_token', jwt)
    localStorage.setItem('cinepacho_user', JSON.stringify(userData))

    setToken(jwt)
    setUser(userData)
  }

  const logoutUser = () => {
    localStorage.removeItem('cinepacho_token')
    localStorage.removeItem('cinepacho_user')
    setToken(null)
    setUser(null)
    setCart([])
  }

  const [basePoints, setBasePoints] = useState(() => {
    const saved = localStorage.getItem('cinepacho_points')
    return saved ? Number(saved) || 0 : 0
  })

  const addToCart = (item) => {
    const normalized = normalizeCartItem(item)
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.id === normalized.id &&
          i.type === normalized.type &&
          i.showtime === normalized.showtime
      )
      const qtyToAdd = normalized.qty

      if (existing) {
        return prev.map((i) =>
          i.id === normalized.id &&
          i.type === normalized.type &&
          i.showtime === normalized.showtime
            ? normalizeCartItem({ ...i, qty: i.qty + qtyToAdd })
            : i
        )
      }
      return [...prev, normalized]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (itemId, itemType, itemShowtime) => {
    setCart((prev) =>
      prev.filter(
        (i) => !(i.id === itemId && i.type === itemType && i.showtime === itemShowtime)
      )
    )
  }

  const cartTotal = cart.reduce((acc, item) => acc + getUnitPrice(item) * item.qty, 0)
  const pendingPoints = cart.reduce((acc, item) => acc + (item.points || 0) * item.qty, 0)

  return (
    <AppContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
        basePoints,
        setBasePoints,
        pendingPoints,
        user,
        token,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
