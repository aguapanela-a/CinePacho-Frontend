import React from 'react'

const variants = {
  primary:
    'bg-gradient-to-r from-magenta via-vinotinto to-gold text-white shadow-lg hover:shadow-magenta/40 active:scale-95 border border-white/10',
  secondary:
    'border-2 border-magenta/50 text-magenta hover:bg-magenta/10 hover:border-magenta active:scale-95 shadow-[0_0_15px_rgba(200,22,122,0.1)] hover:shadow-[0_0_20px_rgba(200,22,122,0.3)]',
  gold:
    'bg-gradient-to-r from-gold to-[#F2B657] text-carbon font-bold hover:shadow-lg hover:shadow-gold/40 active:scale-95',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-surface-light active:scale-95',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3 text-lg font-bold',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-2xl font-body relative overflow-hidden group
        transition-all duration-300 ease-out
        cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {/* Optional shimmer effect container can go here if needed per instance */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  )
}
