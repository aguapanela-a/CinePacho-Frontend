import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const typeStyles = {
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
  success: 'bg-green-500/10 border-green-500/30 text-green-400',
  info: 'bg-surface border-border/50 text-white',
}

const typeIcons = {
  error: <AlertCircle size={20} className="shrink-0" />,
  success: <CheckCircle2 size={20} className="shrink-0" />,
  info: <Info size={20} className="shrink-0 text-magenta" />,
}

export default function Toast({ toast, onDismiss }) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl pointer-events-auto transition-all animate-[slideInRight_0.3s_ease-out] border backdrop-blur-md
        ${typeStyles[toast.type] || typeStyles.info}
      `}
    >
      {typeIcons[toast.type] || typeIcons.info}
      <div className="flex-1 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{toast.message}</p>
        {toast.action && (
          <button
            onClick={() => {
              toast.action.onClick()
              onDismiss(toast.id)
            }}
            className="text-xs font-bold underline hover:opacity-80 uppercase tracking-wider shrink-0"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0"
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  )
}
