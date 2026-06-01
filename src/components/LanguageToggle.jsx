import { Languages } from 'lucide-react'
import { useLanguage } from '../context/useLanguage'

export default function LanguageToggle({ className = '' }) {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 cursor-pointer group hover:bg-surface-light active:scale-95 ${
        language === 'en' 
          ? 'border-magenta/50 bg-magenta/10 text-magenta hover:border-magenta' 
          : 'border-border/50 bg-carbon/80 text-text-secondary hover:text-white'
      } ${className}`}
      title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <Languages 
        size={16} 
        className={`transition-transform duration-500 ${language === 'en' ? 'rotate-180' : 'rotate-0'}`}
      />
      <span className="text-xs font-bold tracking-widest uppercase w-5 text-center">
        {language}
      </span>
    </button>
  )
}

