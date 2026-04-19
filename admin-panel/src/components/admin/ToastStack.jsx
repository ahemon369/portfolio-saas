import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

function toneStyles(tone) {
  if (tone === 'success') {
    return {
      className: 'toast toast-success',
      icon: <CircleCheck size={16} />,
    }
  }

  if (tone === 'info') {
    return {
      className: 'toast toast-info',
      icon: <Info size={16} />,
    }
  }

  return {
    className: 'toast toast-error',
    icon: <CircleAlert size={16} />,
  }
}

export function ToastStack() {
  const { toasts, dismissToast } = useToast()

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = toneStyles(toast.tone)

          return (
            <motion.button
              key={toast.id}
              type="button"
              onClick={() => dismissToast(toast.id)}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={config.className}
            >
              {config.icon}
              <span>{toast.message}</span>
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
