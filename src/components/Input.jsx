import { useState, useId } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export default function Input({
  label,
  icon: Icon,
  error,
  type = 'text',
  className = '',
  id: idProp,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const generatedId = useId()
  const inputId = idProp || generatedId
  const errorId = `${inputId}-error`
  const { t } = useLanguage()
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-bold tracking-wide text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
          />
        )}
        <input
          id={inputId}
          type={inputType}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full bg-carbon border-2 border-border/80 rounded-xl
            px-4 py-3 text-text-primary placeholder-text-secondary/50
            outline-none transition-all duration-300
            focus:border-magenta focus:ring-4 focus:ring-magenta/10
            ${Icon ? 'pl-11' : ''}
            ${isPassword ? 'pr-11' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors p-1"
            aria-label={showPassword ? t('input.hidePassword') : t('input.showPassword')}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <span
          id={errorId}
          role="alert"
          className="text-xs font-bold text-red-500 tracking-wide mt-1 animate-[fadeUp_0.3s_ease-out]"
        >
          {error}
        </span>
      )}
    </div>
  )
}
