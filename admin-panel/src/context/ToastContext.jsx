import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)
const maxToasts = 5

function timeoutByTone(tone) {
  if (tone === 'success') return 2600
  if (tone === 'info') return 3200
  return 4200
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const pushToast = useCallback((tone, message, timeoutMs) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const resolvedTimeout = Number(timeoutMs ?? timeoutByTone(tone))

    setToasts((prev) => [...prev.slice(-(maxToasts - 1)), { id, tone, message }])

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
    }, resolvedTimeout)

    return id
  }, [])

  const value = useMemo(
    () => ({
      toasts,
      pushToast,
      dismissToast,
    }),
    [toasts, pushToast, dismissToast],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider.')
  }

  return context
}
