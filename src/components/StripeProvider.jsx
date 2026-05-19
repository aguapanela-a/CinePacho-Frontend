/**
 * StripeProvider.jsx
 * Envuelve la app con el contexto de Stripe Elements.
 * La clave pública se lee desde las variables de entorno de Vite.
 */

import React from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

// Carga la instancia de Stripe una sola vez (singleton)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

const STRIPE_APPEARANCE = {
  theme: 'night',
  variables: {
    colorPrimary:    '#e91e8c',
    colorBackground: '#1a1a2e',
    colorText:       '#ffffff',
    colorDanger:     '#ef4444',
    fontFamily:      'Inter, sans-serif',
    borderRadius:    '16px',
  },
}

/**
 * @param {{ clientSecret: string, children: React.ReactNode }} props
 */
export default function StripeProvider({ clientSecret, children }) {
  const options = {
    clientSecret,
    appearance: STRIPE_APPEARANCE,
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}
