import { createContext, useContext, useState } from 'react'
import { formatCurrency, getUnitPrice } from '../utils/formatCurrency'

const AppContext = createContext()

function normalizeCartItem(item) {
  const qty = item.qty || 1
  const unitPrice = getUnitPrice(item)
  const points = item.points != null ? item.points : Math.floor(unitPrice / 5000)

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
    const { token: jwt, userType, name } = authResponse
    const userData = { name, userType }

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

export const useApp = () => useContext(AppContext)
