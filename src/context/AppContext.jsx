import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext()

/**
 * AppProvider: Gestor de estado global de la aplicación.
 * Centraliza la lógica del carrito de compras y la gestión básica de puntos "Pacho"
 * para evitar el prop-drilling a través de los múltiples componentes.
 */
export function AppProvider({ children }) {
  // Estado principal del carrito (boletas y snacks)
  const [cart, setCart] = useState([])
  
  // Control de visibilidad del Drawer lateral del carrito
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // Estado base de los puntos del usuario activo. 
  // TODO: Conectar esto con la API de usuarios tras agregar la capa de autenticación JWT.
  // Por defecto se inicia en 0 hasta confirmar sesión.
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
      pendingPoints
    }}>
      {children}
    </AppContext.Provider>
  )
}

// Hook personalizado para consumir el contexto global de manera segura y semántica.
export const useApp = () => useContext(AppContext)
