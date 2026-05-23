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
      if (value && value[k]) {
        value = value[k]
      } else {
        // Fallback a español si no encuentra la traducción, o devuelve la clave
        let fallbackValue = translations['es']
        for (const fbK of keys) {
          if (fallbackValue && fallbackValue[fbK]) {
            fallbackValue = fallbackValue[fbK]
          } else {
            return key
          }
        }
        value = fallbackValue
        break
      }
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
