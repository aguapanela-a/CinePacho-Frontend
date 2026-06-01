import { useContext } from 'react'
import { AppContext } from './appContextObject'

export function useApp() {
  return useContext(AppContext)
}
