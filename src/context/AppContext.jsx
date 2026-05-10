import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext()

/**
 * AppProvider: Gestor de estado global de la aplicación.
 * Centraliza la lógica del carrito de compras, autenticación JWT
 * y la gestión básica de puntos "Pacho" para evitar el prop-drilling
 * a través de los múltiples componentes.
 */
export function AppProvider({ children }) {
  // Estado principal del carrito (boletas y snacks)
  const [cart, setCart] = useState([])
  
  // Control de visibilidad del Drawer lateral del carrito
  const [isCartOpen, setIsCartOpen] = useState(false)

  // ─── Estado de autenticación ───
  // Se rehidrata desde localStorage para persistir la sesión entre recargas del navegador.
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cinepacho_user')
    return saved ? JSON.parse(saved) : null
  })

  const [token, setToken] = useState(() => localStorage.getItem('cinepacho_token'))

  /**
   * loginUser: Almacena las credenciales del usuario autenticado.
   * Recibe la respuesta directa del backend (AuthResponseDTO):
   *   { token: string, userType: string, name: string }
   */
  const loginUser = (authResponse) => {
    const { token: jwt, userType, name } = authResponse
    const userData = { name, userType }
    
    localStorage.setItem('cinepacho_token', jwt)
    localStorage.setItem('cinepacho_user', JSON.stringify(userData))
    
    setToken(jwt)
    setUser(userData)
  }

  /**
   * logoutUser: Limpia toda la sesión del usuario activo,
   * incluyendo el carrito y los datos persistidos en localStorage.
   */
  const logoutUser = () => {
    localStorage.removeItem('cinepacho_token')
    localStorage.removeItem('cinepacho_user')
    setToken(null)
    setUser(null)
    setCart([])
  }
  
  // Estado base de los puntos del usuario activo.
  // Se inicia en 0 hasta que se obtengan desde el endpoint del perfil del usuario.
  const [basePoints, setBasePoints] = useState(0)

  /**
   * addToCart: Inserta un nuevo elemento (snack o entrada) a la orden.
   * Si el elemento ya existe (mismo id, tipo y función), incrementa su cantidad
   * optimizando el espacio en el carrito en lugar de duplicar registros.
   */
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.type === item.type && i.showtime === item.showtime)
      if (existing) {
        return prev.map((i) => 
          i.id === item.id && i.type === item.type && i.showtime === item.showtime
            ? { ...i, qty: i.qty + 1 }
            : i
        )
      }
      return [...prev, { ...item, qty: 1 }]
    })
    // Forzamos la apertura del Drawer al usuario para feedback inmediato según la Meta de Acción. (Leyes de UX)
    setIsCartOpen(true)
  }

  /**
   * removeFromCart: Elimina de la matriz un elemento usando criterios compuestos
   * para asegurar la remoción exacta (por ej. eliminar los tickets de una función sin tocar otra).
   */
  const removeFromCart = (itemId, itemType, itemShowtime) => {
    setCart((prev) => prev.filter(i => !(i.id === itemId && i.type === itemType && i.showtime === itemShowtime)))
  }

  // Cómputo del subtotal financiero. Extrae solo caracteres numéricos asumiendo formatos tipo "$45.000"
  const cartTotal = cart.reduce((acc, item) => acc + (parseInt(item.price.replace(/\D/g,'')) * item.qty), 0)
  
  // Proyección de puntos "Pacho" que el usuario adquirirá al formalizar esta orden.
  const pendingPoints = cart.reduce((acc, item) => acc + (item.points * item.qty), 0)

  return (
    <AppContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      isCartOpen, 
      setIsCartOpen,
      cartTotal,
      basePoints,
      pendingPoints,
      user,
      token,
      loginUser,
      logoutUser,
    }}>
      {children}
    </AppContext.Provider>
  )
}

// Hook personalizado para consumir el contexto global de manera segura y semántica.
export const useApp = () => useContext(AppContext)
