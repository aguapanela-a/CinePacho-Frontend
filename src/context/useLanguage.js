import { useContext } from 'react'
import { LanguageContext } from './languageContextObject'

export function useLanguage() {
  return useContext(LanguageContext)
}
