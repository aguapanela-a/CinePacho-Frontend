import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('cinepacho_language')
    return saved ? saved : 'es'
  })

  useEffect(() => {
    localStorage.setItem('cinepacho_language', language)
  }, [language])

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es')
  }

  // Función para obtener la traducción por clave (ej. 'nav.billboard')
  const t = (key, params = {}) => {
    const keys = key.split('.')
    let value = translations[language]
    for (const k of keys) {
      value = value?.[k] // Intenta acceder a la propiedad
      if (value === undefined) break // Si no se encuentra, sal del bucle
    }

    // Si no se encontró en el idioma actual, intenta con el español (fallback)
    if (value === undefined) {
      value = translations['es']
      for (const k of keys) {
        value = value?.[k]
        if (value === undefined) break
      }
    }

    // Si aún no se encontró, devuelve la clave original
    if (value === undefined) {
      return key
    }

    // Reemplazar parámetros si los hay (ej. {count: 5})
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return Object.entries(params).reduce((str, [k, v]) => {
        return str.replace(new RegExp(`{${k}}`, 'g'), v)
      }, value)
    }

    return value
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
