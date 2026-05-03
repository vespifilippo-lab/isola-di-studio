import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { useEffect } from 'react'

export type NotificationType = 'error' | 'success' | 'info'

interface NotificationProps {
  message: string
  type: NotificationType
  onClose: () => void
}

export default function Notification({ message, type, onClose }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const colors = {
    error: 'border-red-500/50 bg-red-500/10 text-red-400',
    success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    info: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400'
  }

  const Icons = {
    error: AlertCircle,
    success: CheckCircle2,
    info: CheckCircle2
  }

  const Icon = Icons[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl ${colors[type]}`}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors">
        <X size={14} />
      </button>
    </motion.div>
  )
}
