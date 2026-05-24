import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Toast from '../components/Toast'
import { ToastContext } from './toastContextObject'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info', action = null) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type, action }])

    setTimeout(() => {
      removeToast(id)
    }, action ? 5000 : 3000)
  }, [removeToast])

  const error = useCallback((message, action) => addToast(message, 'error', action), [addToast])
  const success = useCallback((message, action) => addToast(message, 'success', action), [addToast])
  const info = useCallback((message, action) => addToast(message, 'info', action), [addToast])

  return (
    <ToastContext.Provider value={{ error, success, info }}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div
          className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
          aria-live="polite"
          aria-atomic="false"
        >
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

